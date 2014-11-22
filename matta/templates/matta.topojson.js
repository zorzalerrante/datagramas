var map_width = width;
var map_height = height;

var geometry = topojson.feature(json, json.objects['{{ feature_name }}']);
console.log('geometry', geometry);

var available_ids = d3.set();
geometry.features.forEach(function(d) {
    available_ids.add(d['{{ feature_id }}']);
});

console.log('available ids', available_ids);

var path = d3.geo.path();

{% if legend %}
var legend_container;
var legend = matta.symbol_legend()
    .position({x: 20 + {{ symbol_max_ratio }}, y: height - 20 });
{% endif %}

{% if property_color and area_color_thresholds %}
    var area_color_thresholds = {{ area_color_thresholds }};

    var threshold_container;
    var threshold_legend = matta.color_thresholds()
        .extent(area_color_thresholds['extent'])
        .width(area_color_thresholds['width'])
        .height(area_color_thresholds['height'])
        .title(area_color_thresholds['title']);

    {% if leaflet %}
        threshold_legend.position({x: map_width - area_color_thresholds['width'] - 20, y: 20})
    {% else %}
        map_height -= area_color_thresholds['height'] + 50;
        threshold_legend.position({x: (map_width - area_color_thresholds['width']) * 0.5, y: map_height })
    {% endif %}

    var threshold = d3.scale.threshold()
        .domain(area_color_thresholds['domain'])
        .range(area_color_thresholds['colors']);
    var property_color = '{{ property_color }}';
    var area_colors = d3.map();
    console.log('area colors', area_color_thresholds);
    console.log('threshold', threshold, threshold.domain());
{% endif %}

var draw_topojson = function() {
    console.log('map container', map_container);
    var p = path_g.selectAll('path')
        .data(geometry.features, function(d, i) { return d['{{ feature_id }}']; });

    p.enter()
        .append('path');

    p.exit()
        .remove();

    {% if fill_color %}
    var fill_color = '{{ fill_color }}';
    {% else %}
    var fill_color = 'none';
    {% endif %}

    p.attr({
            'd': path,
            'fill': fill_color,
            'stroke': '{{ path_stroke }}',
            'opacity': {{ path_opacity }},
            'stroke-width': {{ path_stroke_width }}
        });


    {% if label %}
    var label = map_container.selectAll('text').data(geometry.features, function(d, i) { return d['{{ feature_id }}']; });

    label.enter()
        .append('text');

    label.attr({
            'x': function(d) { return path.centroid(d)[0]; },
            'y': function(d) { return path.centroid(d)[1]; },
            'font-size': 6,
            'fill': 'black',
        })
        .text(function(d) { return d.properties['{{ label }}']; });
    {% endif %}

    {% if feature_data %}
        var property_id = '{{ property_name }}';
        var symbols = {{ feature_data }}.filter(function(d) { console.log(d, d[property_id], available_ids.has(d[property_id])); return available_ids.has(d[property_id]); });
        console.log('symbols', symbols);
        {% if property_color and area_color_thresholds %}

            symbols.forEach(function(d) {
                if (d.hasOwnProperty(property_color)) {
                    area_colors.set(d[property_id], threshold(d[property_color]));
                }
            });

            p.each(function(d) {
                if (area_colors.has(d['{{ feature_id }}'])) {
                    d3.select(this).attr({
                        'fill': area_colors.get(d['{{ feature_id }}']),
                        'opacity': {{ area_opacity }}
                    });
                }
            });
            console.log('threshold', threshold);
            {% if area_color_legend %}
                threshold_container.data([threshold]).call(threshold_legend);
            {% endif %}
        {% endif %}

        {% if property_value %}
            var property_value = '{{ property_value }}';

            var symbol_positions = d3.map();

            geometry.features.forEach(function(d) {
                symbol_positions.set(d['{{ feature_id }}'], path.centroid(d));
            });

            console.log('positions', symbol_positions);

            var symbol_scale = d3.scale.{{ symbol_scale }}()
                .range([{{ symbol_min_ratio }}, {{ symbol_max_ratio }}])
                .domain(d3.extent(symbols, function(d) { return d[property_value]; }));

            console.log('symbol scale', symbol_scale.domain(), symbol_scale.range());

            {% if legend %}
            var legend_g = null;

            if (legend_container.select('g.axis').empty()) {
                legend_g = legend_container.append('g').classed('axis', true);
            } else {
                legend_g = legend_container.select('g.axis');
            }

            legend_g.data([symbol_scale]).call(legend);
            {% endif %}

            var symbol_g = map_container.select('g.symbols');
            if (symbol_g.empty()) {
                symbol_g = map_container.append('g').attr('class', 'symbols');
            }

            var symbol = symbol_g.selectAll('circle.symbol')
                .data(symbols, function(d) { console.log('symbol', d); return d[property_id]; });

            symbol.enter()
                .append('circle')
                .attr('class', 'symbol');

            symbol.exit()
                .remove();

            symbol.attr({
                'cx': function(d) { return symbol_positions.get(d[property_id])[0]; },
                'cy': function(d) { return symbol_positions.get(d[property_id])[1]; },
                'r': function(d) { return symbol_scale(d[property_value]); },
                {% if symbol_color_property %}
                'fill': function(d) { return d['{{ symbol_color_property }}']; },
                {% elif symbol_color %}
                'fill': '{{ symbol_color }}',
                {% else %}
                'fill': 'none',
                {% endif %}
                'opacity': {{ symbol_opacity }},
                'stroke-width': {{ symbol_stroke_width }},
                'stroke': '{{ symbol_stroke }}',
            });

            symbol.sort(function(a, b) {
               return d3.descending(a[property_value], b[property_value]);
            });
        {% endif %}
    {% endif %}
};

{% if leaflet %}
    // code adapted from https://github.com/mbostock/bost.ocks.org/blob/gh-pages/mike/leaflet/index.html#L131-171
    var L = leaflet;
    var map;
    var map_initialized = false;
    var map_svg;
    var map_container;

    if (container.select('div.leaflet-map-pane').empty()) {
        map = L.map(container.node()).setView([0, 0], 12);
        container.node()['__leaflet_map__'] = map;
        var mapLink = '{{ leaflet_map_link }}';
        L.tileLayer('{{ leaflet_tile_layer }}', {attribution: '&copy; ' + mapLink + ' Contributors'}).addTo(map);
        map_initialized = true;
        map_svg = d3.select(map.getPanes().overlayPane).append('svg');
        map_container = map_svg.append('g').attr('class', 'leaflet-zoom-hide');
    } else {
        map = container.node()['__leaflet_map__'];
        map_svg = d3.select(map.getPanes().overlayPane).select('svg');
        map_container = map_svg.select('g.leaflet-zoom-hide');
    }

    var path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    var projection = d3.geo.transform({point: function(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
    });

    console.log('projection', projection);
    // Reposition the SVG to cover the features.
    var reset = function() {
        var bounds = path.bounds(geometry),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        map_svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        map_container.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        console.log('zoom', map.getZoom(), map.getMaxZoom());
        draw_topojson();
    };

    path.projection(d3.geo.transform());
    var map_bounds = path.bounds(geometry);
    path.projection(projection);
    console.log('bounds', map_bounds);

    if (map_initialized) {
        map.fitBounds(map_bounds.map(function(d) { return d.reverse(); }));
    }

    {% if legend or (property_color and area_color_thresholds) %}
        if (!container.select('div.leaflet-top.leaflet-left svg.legend').empty()) {
            legend_container = container.select('div.leaflet-top.leaflet-left').select('svg.legend');
        } else {
            legend_container = container.select('div.leaflet-top.leaflet-left')
                .append('svg').classed('legend', true)
                .attr({'width': width, 'height': height})
                .style({'z-index': 1100, 'position': 'absolute', 'top': 0, 'left': 0});
        }

        {% if property_color and area_color_thresholds %}
            if (!legend_container.select('g.threshold-legend').empty()) {
                threshold_container = legend_container.select('g.threshold-legend');
            } else {
                threshold_container = legend_container.append('g').classed('threshold-legend legend', true);
            }
        {% endif %}
    {% endif %}

    map.on("viewreset", reset);
    reset();
{% else %}
    var map_container = container;

    var path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    {% if legend %}
    if (!container.select('g.symbol-legend').empty()) {
        legend_container = container.select('g.symbol-legend');
    } else {
        legend_container = container.append('g').classed('symbol-legend legend', true);
    }
    console.log('legend_container', legend_container);
    {% endif %}

    {% if property_color and area_color_thresholds %}
    if (!container.select('g.threshold-legend').empty()) {
        threshold_container = container.select('g.threshold-legend');
    } else {
        threshold_container = container.append('g').classed('threshold-legend legend', true);
    }
    console.log('threshold_container', threshold_container);
    {% endif %}

    var projection = d3.geo.mercator()
        .center([0,0])
        .scale(1)
        .translate([0, 0]);

    path.projection(projection);

    var st = matta.fit_projection(map_width, map_height, path.bounds(geometry));
    projection.scale(st[0]).translate(st[1]);
    draw_topojson();
{% endif %}