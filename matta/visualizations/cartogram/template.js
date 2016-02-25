
var map_width = _width;
var map_height = _height;

var map_container = null;
var path_g;
var carto_obj;

var geometry = null;
console.log('cartogram', cartogram);
if (_data_geometry != null) {
    console.log('data geom', _data_geometry.objects);
    console.log('feat name', _feature_name);
    if (_feature_name == null) {
        _feature_name = d3.keys(_data_geometry.objects)[0];
    }
    console.log('feat name', _feature_name);
    geometry = topojson.feature(_data_geometry, _data_geometry.objects[_feature_name]);
    auxiliary.original_geometry = geometry;
    console.log('geometry', geometry);
} else {
    // kaboom
    throw 'Cartogram needs a TopoJSON topology.';
}

var available_ids = d3.set();
geometry.features.forEach(function(d) {
    available_ids.add(matta.get(d, _feature_id));
});

console.log('available ids', available_ids);

auxiliary.path = d3.geo.path();

var draw_topojson = function() {
    console.log('map container', map_container);
    var p = path_g.selectAll('path')
        .data(geometry.features, function(d) { return matta.get(d, _feature_id); });

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
                'y': function(d) { return carto_obj.path.centroid(d)[1]; }
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
                'y': function(d) { return carto_obj.path.centroid(d)[1]; }
            })
            .text(function(d) { return d[_feature_id]; });
    }

    auxiliary.area_colors = d3.map();
    _data_area_dataframe.forEach(function(d) {
        auxiliary.area_colors.set(matta.get(d, _area_feature_name), _area_color(d));
    });

    console.log('area colors', auxiliary.area_colors);

    p.each(function(d) {
        if (auxiliary.area_colors.has(matta.get(d, _feature_id))) {
            d3.select(this).attr({
                'fill': auxiliary.area_colors.get(matta.get(d, _feature_id)),
                'opacity': _area_opacity
            });
        }
    });

};

!function() {
    map_container = container;

    path_g = map_container.select('g.geo-paths');

    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    auxiliary.projection = d3.geo.mercator()
        .center([0,0])
        .scale(1)
        .translate([0, 0])
        .precision(0);

    auxiliary.path.projection(auxiliary.projection);

    var st = matta.fit_projection(map_width, map_height, auxiliary.path.bounds(geometry));
    auxiliary.projection.scale(st[0]).translate(st[1]);

    // le carto
    auxiliary.area_carto_values = d3.map();
    _data_area_dataframe.forEach(function(d) {
        if (matta.get(d, _area_value) !== null) {
            auxiliary.area_carto_values.set(matta.get(d, _area_feature_name), matta.get(d, _area_value));
        }
    });
    console.log('area dataframe values', auxiliary.area_carto_values);

    carto_obj = cartogram()
        .projection(auxiliary.projection)
        .value(function(d) {
            var id = matta.get(d, _feature_id);
            console.log('feature id', d[_feature_id], auxiliary.area_carto_values.has(d[_feature_id]), 'value', auxiliary.area_carto_values.get(d[_feature_id]));
            return auxiliary.area_carto_values.has(id) ? auxiliary.area_carto_values.get(id) : _na_value;
        });

    //topojson.feature(_data_geometry, _data_geometry.objects[_feature_name])
    geometry = carto_obj(_data_geometry, _data_geometry.objects[_feature_name].geometries);
    console.log('carto geometry', geometry);

    _area_color_update_scale_func(_data_area_dataframe);
    draw_topojson();
}();
