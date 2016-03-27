
var map_width = _width;
var map_height = _height;

var map_container = null;
var path_g;
var mark_g;
var graph_g;

console.log(__data__, _data_geometry);
if (_data_geometry !== null && typeof _data_geometry === 'object') {
    if (_feature_name === null) {
        _feature_name = d3.keys(_data_geometry.objects)[0];
    }

    auxiliary.geometry = topojson.feature(_data_geometry, _data_geometry.objects[_feature_name]);
} else if (_data_geojson !== null && typeof _data_geojson === 'object') {
    auxiliary.geometry = _data_geojson;
} else {
    // kaboom
    throw 'No valid geography found.';
}

auxiliary.available_feature_ids = d3.set();

auxiliary.geometry.features.forEach(function(d) {
    auxiliary.available_feature_ids.add(matta.get(d, _feature_id));
});

var path = d3.geo.path().pointRadius(5);

{% if options.leaflet %}
    // code adapted from https://github.com/mbostock/bost.ocks.org/blob/gh-pages/mike/leaflet/index.html#L131-171
    if (_L == null) {
        _L = leaflet;
    }

    var map_initialized = false;
    var map_svg;
    var overlay_svg;

    if (container.select('div.leaflet-map-pane').empty()) {
        _map = _L.map(container.node()).setView([0, 0], 12);
        container.node()['__leaflet_map__'] = _map;
        _L.tileLayer(_leaflet_tile_layer, {attribution: _leaflet_map_link}).addTo(_map);
        map_initialized = true;
        map_svg = d3.select(_map.getPanes().overlayPane).append('svg');
        map_container = map_svg.append('g').attr('class', 'leaflet-zoom-hide');
    } else {
        _map = container.node()['__leaflet_map__'];
        map_svg = d3.select(_map.getPanes().overlayPane).select('svg');
        map_container = map_svg.select('g.leaflet-zoom-hide');
    }

    if (!container.select('div.leaflet-top.leaflet-left').select('svg.overlay').empty()) {
        overlay_svg = container.select('div.leaflet-top.leaflet-left').select('svg.overlay');
    } else {
        overlay_svg = container.select('div.leaflet-top.leaflet-left')
            .append('svg').classed('overlay', true)
            .attr({'width': _width, 'height': _height})
            .style({'z-index': 1000, 'position': 'absolute', 'top': 0, 'left': 0});
    }

    setup_containers();

    _projection = d3.geo.transform({
        point: function(x, y) {
            var point = _map.latLngToLayerPoint(new _L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
    });

    // Reposition the SVG to cover the features.
    var reset = function() {
        var bounds = path.bounds(auxiliary.geometry),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        map_svg.attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        map_container.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        //console.log('zoom', _map.getZoom(), _map.getMaxZoom());
        update_mark_positions();
        draw_topojson();
    };

    path.projection(d3.geo.transform());

    var map_bounds = path.bounds(auxiliary.geometry);
    path.projection(_projection);
    console.log('bounds', map_bounds);

    if (map_initialized) {
        if (_bounding_box) {
            _map.fitBounds(_bounding_box.map(function(d) { return d.reverse(); }));
        } else {
            _map.fitBounds(map_bounds.map(function(d) { return d.reverse(); }));
        }
    }

    if (!overlay_svg.select('g.{{ visualization_name }}-legends').empty()) {
        container_legends = overlay_svg.select('g.{{ visualization_name }}-legends');
    } else {
        container_legends = overlay_svg.append('g').classed('{{ visualization_name }}-legends', true);
    }

    _map.on("viewreset", reset);
    filter_non_valid_marks();
    update_mark_positions();
    reset();
{% else %}
    map_container = container;

    setup_containers();

    path.projection(_projection);

    console.log(path.bounds(auxiliary.geometry));

    if (_fit_projection) {
        var st = matta.fit_projection(map_width, map_height, path.bounds(auxiliary.geometry));
        console.log(path.bounds(auxiliary.geometry));
        _projection.scale(st[0]).translate(st[1]);
        console.log(path.bounds(auxiliary.geometry));
    }

    filter_non_valid_marks();
    update_mark_positions();
    draw_topojson();
{% endif %}
