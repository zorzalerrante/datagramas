
var map_width = _width;
var map_height = _height;

var map_container = null;
var threshold_container;
var path_g;
var projection;
var carto_obj;

var geometry = null;

if (_data_geometry != null) {
    console.log('data geom', _data_geometry.objects);
    console.log('feat name', _feature_name);
    if (_feature_name == null) {
        _feature_name = d3.keys(_data_geometry.objects)[0];
    }
    console.log('feat name', _feature_name);
    geometry = topojson.feature(_data_geometry, _data_geometry.objects[_feature_name]);
    console.log('geometry', geometry);
} else {
    // kaboom
    return;
}

var available_ids = d3.set();
geometry.features.forEach(function(d) {
    available_ids.add(d[_feature_id]);
});

console.log('available ids', available_ids);

var path = d3.geo.path();
var threshold_legend = null;
var threshold = null;

if (_area_color_scale != null) {
    threshold_legend = matta.color_thresholds()
        .extent(_area_color_scale.extent)
        .width(_area_legend_width)
        .height(_area_legend_height)
        .title(_area_legend_title != null ? _area_legend_title : _area_value);

    threshold = d3.scale.threshold()
        .domain(_area_color_scale.domain)
        .range(_area_color_scale.range);

    console.log('threshold', threshold.range(), threshold.domain());
}

var draw_topojson = function() {
    console.log('map container', map_container);
    var p = path_g.selectAll('path')
        .data(geometry.features, function(d, i) { return d[_feature_id]; });

    p.enter()
        .append('path')
        .attr('d', carto_obj.path);

    p.exit()
        .remove();

    p.attr({
            'fill': _fill_color,
            'stroke': _path_stroke,
            'opacity': _path_opacity,
            'stroke-width': _path_stroke_width
        });

    p.transition()
        .delay(_area_transition_delay)
        .attr('d', carto_obj.path);

    console.log('label', _label);
    if (_label != null) {
        var label = map_container.selectAll('text').data(geometry.features, function(d, i) { return d[_feature_id]; });

        label.enter()
            .append('text')
            .attr({
                'x': function(d) { return carto_obj.path.centroid(d)[0]; },
                'y': function(d) { return carto_obj.path.centroid(d)[1]; },
            });

        label.attr({
                'font-size': _label_font_size,
                'fill': _label,
                'text-anchor': 'middle'
            })
            .text(function(d) { return d[_feature_id]; });

        label.transition()
            .delay(_area_transition_delay)
            .attr({
                'x': function(d) { return carto_obj.path.centroid(d)[0]; },
                'y': function(d) { return carto_obj.path.centroid(d)[1]; },
            })
            .text(function(d) { return d[_feature_id]; });
    }


    console.log('dataframe', _data_area_dataframe);

    if (_data_area_dataframe != null && _area_color_scale != null){

        var area_colors = d3.map();
        _data_area_dataframe.forEach(function(d) {
            if (_area_value != null && d.hasOwnProperty(_area_value)) {
                area_colors.set(d[_area_feature_name], threshold(d[_area_value]));
            }
        });

        console.log('area colors', area_colors);

        p.each(function(d) {
            if (area_colors.has(d[_feature_id])) {
                d3.select(this).attr({
                    'fill': area_colors.get(d[_feature_id]),
                    'opacity': _area_opacity
                });
            }
        });
        console.log('threshold', threshold);

        threshold_container.data([threshold]).call(threshold_legend);

    }
};

!function() {
    map_container = container;
    if (_area_color_scale != null) {
        map_height -= _area_legend_height + 50;
        threshold_legend.position({x: (map_width - _area_legend_width) * 0.5, y: map_height });
    }


    path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    if (!container.select('g.threshold-legend').empty()) {
        threshold_container = container.select('g.threshold-legend');
    } else {
        threshold_container = container.append('g').classed('threshold-legend', true);
    }
    console.log('threshold_container', threshold_container);

    projection = d3.geo.mercator()
        .center([0,0])
        .scale(1)
        .translate([0, 0]);

    path.projection(projection);

    var st = matta.fit_projection(map_width, map_height, path.bounds(geometry));
    projection.scale(st[0]).translate(st[1]);

    // le carto
    var area_carto_values = d3.map();
    _data_area_dataframe.forEach(function(d) {
        if (_cartogram_value != null && d.hasOwnProperty(_cartogram_value)) {
            area_carto_values.set(d[_area_feature_name], d[_cartogram_value]);
        }
    });
    console.log('area dataframe values', area_carto_values);

    carto_obj = cartogram()
        .projection(projection)
        .value(function(d) {
            console.log('feature id', d[_feature_id], area_carto_values.has(d[_feature_id]), 'value', area_carto_values.get(d[_feature_id]));
            return area_carto_values.has(d[_feature_id]) ? area_carto_values.get(d[_feature_id]) : _na_value;
        });

    //topojson.feature(_data_geometry, _data_geometry.objects[_feature_name])
    geometry = carto_obj(_data_geometry, _data_geometry.objects[_feature_name].geometries);
    console.log('carto geometry', geometry);

    draw_topojson();
}();
