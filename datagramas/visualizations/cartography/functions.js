var set_mark_position = function(mark) {
    {% if not options.leaflet %}
    var projected = _projection([datagramas.get(mark, _mark_position[1]), datagramas.get(mark, _mark_position[0])]);
    {% else %}
    var point = _map.latLngToLayerPoint(new _L.LatLng(datagramas.get(mark, _mark_position[0]), datagramas.get(mark, _mark_position[1])));
    var projected = [point.x, point.y];
    {% endif %}
    auxiliary.mark_positions.set(datagramas.get(mark, _mark_index), projected);
    console.log('mark positions', auxiliary.mark_positions);
};

var update_mark_positions = function() {
    if (auxiliary.mark_positions === null) {
        auxiliary.mark_positions = d3.map();
    }

    // since we will use feature names, we compute positions
    if (_mark_feature_name !== null) {
        auxiliary.geometry.features.forEach(function(d) {
            var feat_id = datagramas.get(d, _feature_id);
            {% if not options.leaflet %}
            if (!auxiliary.mark_positions.has(feat_id)) {
                auxiliary.mark_positions.set(feat_id, path.centroid(d));
            }
            {% else %}
            // leaflet requires to always update the position after a view reset
            auxiliary.mark_positions.set(feat_id, path.centroid(d));
            {% endif %}
        });
    } else {
        if (_data_mark_dataframe !== null) {
            _data_mark_dataframe.map(set_mark_position);
        } else {
            auxiliary.mark_positions = d3.map();
        }
    }
};

var filter_non_valid_marks = function() {
    var marks = _data_mark_dataframe == null ? [] : _data_mark_dataframe.filter(function(d) {
        if (_mark_feature_name !== null) {
            return auxiliary.available_feature_ids.has(datagramas.get(d, _mark_feature_name));
        }

        if (_mark_position !== null) {
            return d.hasOwnProperty(_mark_position[0]) && d.hasOwnProperty(_mark_position[1]);
        }

        return false;
    });

    _data_mark_dataframe = marks;
};

var draw_marks = function() {
    _mark_ratio_update_scale_func(_data_mark_dataframe);
    _mark_color_update_scale_func(_data_mark_dataframe);

    var mark = mark_g.selectAll('circle.mark')
        .data(_data_mark_dataframe, function(d) {
            return datagramas.get(d, _mark_index);
        });

    mark.enter()
        .append('circle')
        .classed('mark', true)
        .each(function(d) {
            if (_mark_feature_name === null) {
                update_mark_positions(d);
            }
        })
        .attr({'r': 0});

    mark.exit()
        .each(function(d) {
            if (_mark_feature_name === null) {
                auxiliary.mark_positions.remove(datagramas.get(d, _mark_index));
            }
        })
        .transition()
        .delay(_mark_transition_delay)
        .attr({'r': 0})
        .remove();

    mark.each(function(d) {
        var position_id = _mark_feature_name === null ? datagramas.get(d, _mark_index) : datagramas.get(d, _mark_feature_name);
        var position = auxiliary.mark_positions.get(position_id);
        d3.select(this).attr({
            'cx': position[0],
            'cy': position[1],
            'fill': _mark_color
        });
    }).on('click', function(d, i) {
        dispatch.mark_click.apply(this, arguments);
    });

    mark.transition()
        .delay(_mark_transition_delay)
        .attr({
            'r': _mark_ratio,
            'opacity': _mark_opacity,
            'stroke-width': _mark_stroke_width,
            'stroke': _mark_stroke
        });

    if (_mark_sort_by_ratio === true) {
        mark.sort(function (a, b) {
            return d3.descending(_mark_ratio(a), _mark_ratio(b));
        });
    }
};

var draw_graph = function() {
    if (!_data_graph.hasOwnProperty('__datagramas_prepared__') || _data_graph['__datagramas_prepared__'] == false) {
        datagramas.prepare_graph(_data_graph);
    }

    _link_width_update_scale_func(_data_graph.links);
    _link_opacity_update_scale_func(_data_graph.links);
    _link_color_update_scale_func(_data_graph.links);

    var node_positions = d3.map();

    if (_graph_feature_name) {
        auxiliary.geometry.features.forEach(function(d) {
            var centroid = path.centroid(d);
            node_positions.set(datagramas.get(d, _graph_feature_name), centroid);
        });
    } else {
        _data_graph.nodes.forEach(function (d) {
            var projected = null;
            {% if not options.leaflet %}
            projected = _projection([d[_graph_position][1], d[_graph_position][0]]);
            {% else %}
            var point = _map.latLngToLayerPoint(new _L.LatLng(d[_graph_position][0], d[_graph_position][1]));
            projected = [point.x, point.y];
            {% endif %}
            node_positions.set(d.id, projected);
        });
    }

    var node = graph_g.selectAll('circle.graph_node')
        .data(_data_graph.nodes.filter(function(d) {
            return _graph_feature_name !== null ? node_positions.has(datagramas.get(d, _graph_feature_name)) : node_positions.has(d.id);
            }), function(d) { return d.id; });

    node.enter()
        .append('circle')
        .attr({
            'class': 'graph_node',
            'r': 2,
            'fill': 'black',
            'opacity': 0.5
        });

    node.attr({
        'cx': function(d) { return node_positions.get(_graph_feature_name? d[_graph_feature_name] : d.id)[0]; },
        'cy': function(d) { return node_positions.get(_graph_feature_name? d[_graph_feature_name] : d.id)[1]; }
    });

    node.exit().remove();

    var line = d3.svg.line()
        .x(function(d) {
            return node_positions.get(_graph_feature_name? d[_graph_feature_name] : d.id)[0];
        })
        .y(function(d) {
            return node_positions.get(_graph_feature_name? d[_graph_feature_name] : d.id)[1];
        });

    {% if options.graph_bundle_links %}
        if (!_data_graph.hasOwnProperty('bundled')) {
            // NOTE: the bundling library requires x and y members in each node
            _data_graph.nodes.forEach(function(d) {
                var pos;
                if (_graph_feature_name) {
                    {% if not options.leaflet %}
                    pos = node_positions.get(d[_graph_feature_name]);
                    pos = _projection.invert(pos);
                    d.x = pos[1];
                    d.y = pos[0];
                    {% else %}
                    pos = node_positions.get(d[_graph_feature_name]);
                    pos = _map.layerPointToLatLng(new _L.Point(pos[0], pos[1]));
                    d.x = pos.lng;
                    d.y = pos.lat;
                    {% endif %}
                } else {
                    pos = node_positions.get(d.id);
                    d.x = pos[0];
                    d.y = pos[1];
                }
            });

            var fbundling = force_edge_bundling()
                .step_size(_force_edge_step_size)
                .compatibility_threshold(_force_edge_compatibility_threshold)
                .bundling_stiffness(_force_edge_bundling_stiffness)
                .cycles(_force_edge_cycles)
                .iterations(_force_edge_iterations)
                .nodes(_data_graph.nodes)
                .edges(_data_graph.links);

            _data_graph.bundled = fbundling();
        }

        _data_graph.bundled.forEach(function(bundle, i) {
            bundle.forEach(function(p) {
                var projected;
                {% if not options.leaflet %}
                projected = _projection([p.y, p.x]);
                {% else %}
                var point = _map.latLngToLayerPoint(new _L.LatLng(p.y, p.x));
                projected = [point.x, point.y];
                {% endif %}
                p.screen_x = projected[0];
                p.screen_y = projected[1];
            });
        });

        line.interpolate('linear');

        var bundled_line = d3.svg.line()
            .x(function(d) { return d.screen_x; })
            .y(function(d) { return d.screen_y; });

        var link = graph_g.selectAll('path.link')
                .data(_data_graph.bundled);

        link.enter()
            .append('path')
            .classed('link', true);

        link.attr({
            'd': bundled_line,
            'stroke': function(d) { return _link_color(d.__graph_edge__); },
            'fill': 'none',
            'stroke-width': function(d) { return _link_width(d.__graph_edge__); },
            'opacity': function(d) { return _link_opacity(d.__graph_edge__); }
        });
        console.log('number of links', _data_graph.links.length);

    {% else %}
        var link = graph_g.selectAll('path.link')
            .data(_data_graph.links);

        link.enter()
            .append('path')
            .classed('link', true);

        link.attr({
            'd': function(d) {
                var parts = [d.source, d.target];
                //console.log('parts', parts);
                return line(parts);
            },
            'stroke': _link_color,
            'fill': 'none',
            'opacity': _link_opacity,
            'stroke-width': _link_width
        });
    {% endif %}

    link.exit().remove();
};

var update_area_colors = function() {
    if (auxiliary.area_colors === null) {
        auxiliary.area_colors = d3.map();
    }

    if (_data_area_dataframe !== null) {
        _data_area_dataframe.forEach(function (d) {
            var feature_id = datagramas.get(d, _area_feature_name);

            // we add a pointer to the dataframe row to access it later.
            console.log('update', d, feature_id);
            if (auxiliary.available_feature_ids.has(feature_id)) {
                var properties = auxiliary.available_feature_ids.get(feature_id);
                properties['properties']['__dataframe_row__'] = d;

                var color = _area_color(d);
                if (color !== null) {
                    auxiliary.area_colors.set(feature_id, color);
                }
            }
        });
    } else {
        auxiliary.area_colors = d3.map();
    }

    console.log('area colors', auxiliary.area_colors);
};

/**
 * @param {selection} p - The selection of area paths from the geography.
 */
var draw_areas = function(p) {
    _area_color_update_scale_func(_data_area_dataframe);
    update_area_colors();

    p.each(function(d) {
        if (auxiliary.area_colors.has(datagramas.get(d, _feature_id))) {
            d3.select(this)
                .classed('has-area-color', true)
                .transition()
                .delay(_area_transition_delay)
                .attr({
                    'fill': auxiliary.area_colors.get(datagramas.get(d, _feature_id)),
                    'opacity': _area_opacity
                });

            d3.select(this).on('click', function(d, i) {
                    dispatch.area_click.apply(this, [d.properties.__dataframe_row__, i, d]);
                });
        } else {
            d3.select(this)
                .classed('has-area-color', false)
                .transition()
                .delay(_area_transition_delay)
                .attr(_area_na_color !== null ? {
                    'fill': _area_na_color,
                    'opacity': _area_opacity
                } : {'display': 'none'});

            d3.select(this).on('click', null);
        }
    });
};

var draw_topojson = function() {
    if (_graticule) {
        if (visualization_defs.selectAll('path.border-sphere').empty()) {
            auxiliary.graticule_border_id = datagramas.generate_uuid();

            visualization_defs.append('path')
                .datum({type: 'Sphere'})
                .attr('id', auxiliary.graticule_border_id)
                .attr('d', path);

            visualization_defs.append('clipPath')
                .attr('id', 'clip')
                .append('use')
                .attr('xlink:href', '#' + auxiliary.graticule_border_id);
        }

        var border = path_g.selectAll('use.stroke').data([1]);

        border.enter()
            .append('use')
            .attr('class', 'graticule-stroke')
            .attr('xlink:href', '#' + auxiliary.graticule_border_id);

        var graticule = d3.geo.graticule()
            .step(_graticule_step);

        var lines = path_g.selectAll('path.graticule')
            .data([graticule()]);

        lines.enter()
            .append('path').classed('graticule', true);

        lines.attr('d', path);

        lines.exit()
            .remove();
    }

    var p = path_g.selectAll('path.feature')
        .data(auxiliary.geometry.features, function(d) {
            //console.log(d, datagramas.get(d, _feature_id));
            return datagramas.get(d, _feature_id);
        });

    p.enter()
        .append('path')
        .classed('feature', true)
        .attr({
            'fill': function(d) {
                return _data_area_dataframe !== null? null : _fill_color(d);
            },
            'stroke': _path_stroke,
            'opacity': _path_opacity,
            'stroke-width': _path_stroke_width
        });

    p.exit()
        .remove();

    p.attr({
        'd': path
    });

    if (_label !== null) {
        var label = map_container.selectAll('text')
            .data(auxiliary.geometry.features, function(d, i) { return datagramas.get(d, _feature_id); });

        label.enter()
            .append('text');

        label.attr({
                'x': function(d) { return path.centroid(d)[0]; },
                'y': function(d) { return path.centroid(d)[1]; },
                'font-size': _label_font_size,
                'text-anchor': 'middle'
            })
            .text(function(d) { return datagramas.get(d, _label); });
    }

    if (_data_area_dataframe !== null){
        draw_areas(p);
    }

    if (_data_mark_dataframe !== null) {
        draw_marks();
    }

    if (_data_graph !== null && typeof _data_graph === 'object') {
        draw_graph();
    }

    {% if leaflet %}
    datagramas.draw_legends(active_legends, container_legends, _vis_width, _vis_height);
    {% endif %}
};

var setup_containers = function() {
    path_g = map_container.select('g.geo-paths');
    if (path_g.empty()) {
        path_g = map_container.append('g').attr('class', 'geo-paths');
    }

    graph_g = map_container.select('g.graph');
    if (graph_g.empty()) {
        graph_g = map_container.append('g').attr('class', 'graph');
    }

    mark_g = map_container.select('g.marks');
    if (mark_g.empty()) {
        mark_g = map_container.append('g').attr('class', 'marks');
    }
};