
/**
 * {% if author_comment %}{{ author_comment }}{% endif %}
 * {{ visualization_name }} was scaffolded using Datagramas - https://github.com/carnby/datagramas
 * Variables that start with an underscore (_) are passed as arguments in Python.
 * Variables that start with _data are data parameters of the visualization, and expected to be given as datum.
 *
 * For instance, d3.select('#figure').datum({'graph': a_json_graph, 'dataframe': a_json_dataframe}).call(visualization)
 * will fill the variables _data_graph and _data_dataframe.
 *
 */

var datagram_{{ visualization_name }} = function() {
    "use strict";

    var __fill_data__ = function(__data__) {
        // {{ __data_variables__ }}
        {% for var_name in __data_variables__ %}
            if (__data__.hasOwnProperty('{{ var_name }}')) {
                func_{{ visualization_name }}.{{ var_name }}(__data__.{{ var_name }});
            } else {
                func_{{ visualization_name }}.{{ var_name }}(null);
            }
        {% endfor %}
    };

    {% if event_names %}
        var dispatch = d3.dispatch('{{ event_names|join('\', \'') }}');
    {% endif %}

    var func_{{ visualization_name }} = function (selection) {
        var _vis_width = _width - _padding.left - _padding.right;
        var _vis_height = _height - _padding.top - _padding.bottom;

        {% if objects %}
        // if any object is null, we initialize it here
        {% for var_name, var_value in objects.items() %}
        if (_{{ var_name }} === null) {
            _{{ var_name }} = {{ var_value }};
        }
        {% endfor %}
        {% endif %}

        selection.each(function(__data__) {
            __fill_data__(__data__);

            var figure = null;
            var container = null;
            var figure_dom_element = this;
            var container_legends = null;
            var visualization_defs = null;

            {% if events %}
            {% for var_name, var_value in events.items() %}
            //console.log('{{ var_name }}', {{ var_value }})
            dispatch.on('{{ var_name }}', {{ var_value }});
            {% endfor %}
            {% endif %}

            if (d3.select(this).select('{{ container_type }}.{{ visualization_name }}-container').empty()) {
                {% if container_type == 'svg' %}
                    var svg = d3.select(this).append('svg')
                        .attr('width', _width)
                        .attr('height', _height)
                        .attr('class', '{{ visualization_name }}-container');

                    {% if options.background_color %}
                        svg.append('rect')
                            .attr('width', _width)
                            .attr('height', _height)
                            .attr('fill', '{{ options.background_color }}');
                    {% endif %}

                    container = svg.append('g')
                        .classed('{{ visualization_name }}-container', true)
                        .attr('transform', 'translate(' + _padding.left + ',' + _padding.top + ')');

                    figure = svg;

                    container_legends = svg.append('g')
                        .classed('{{ visualization_name }}-legends', true)
                        .attr('transform', 'translate(' + _padding.left + ',' + _padding.top + ')');

                    visualization_defs = container.append('defs');

                {% elif container_type == 'div' %}
                    // NOTE: a vis. of this kind should manage the legends container (which should be an svg) by itself.
                    var div = d3.select(this).append('div')
                        .style({
                            {% if not options.skip_figure_size %}
                            'width': _width + 'px',
                            'height': _height + 'px',
                            {% endif %}
                            'position': 'relative',
                            'display': 'block'
                        })
                        .classed('{{ visualization_name }}-container', true);

                    {% if options.background_color %}
                        div.style('background', '{{ options.background_color }}');
                    {% endif %}

                    container = div;
                    figure = div;

                {% else %}
                    //console.log('unsupported container type!');
                    return;
                {% endif %}
            } else {
                container = d3.select(this).select('{{ container_type }}.{{ visualization_name }}-container');
                {% if container_type == 'svg' %}
                container_legends = container.select('g.{{ visualization_name }}-legends');
                {% endif %}
            }

            dispatch.datagram_start.apply(container.node());

            {% if functions_js %}{{ functions_js }}{% endif %}
            {% if visualization_js %}{{ visualization_js }}{% endif %}

            {% if container_type == 'svg' %}
            datagramas.draw_legends(active_legends, container_legends, _width, _height);
            {% endif %}

            dispatch.datagram_end.apply(container.node());
        });
    };

    {% for var_name in __data_variables__ %}
        var _data_{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            //console.log('DATA {{ var_name }}', arguments);
            if (arguments.length) {
                _data_{{ var_name }} = __;
                //console.log('SET DATA {{ var_name }}', _data_{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _data_{{ var_name }};
        };
    {% endfor %}

    var active_legends = [];

    {% include 'base.attributes.js' %}
    {% include 'base.colorables.js' %}

    {% if read_only %}
    {% for var_name in read_only %}
        var _{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function() {
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if variables %}
    {% for var_name, var_value in variables.items() %}
        var _{{ var_name }} = {{ var_value }};
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            if (arguments.length) {
                _{{ var_name }} = __;
                //console.log('set {{ var_name }}', _{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if objects %}
    {% for var_name in objects.keys() %}
        var _{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            if (arguments.length) {
                _{{ var_name }} = __;
                //console.log('set object {{ var_name }}', _{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    var auxiliary = {};

    {% if auxiliary %}
    {% for var_name in auxiliary %}
        auxiliary.{{ var_name }} = null;
    {% endfor %}
    {% endif %}

    {% if event_names %}
        {% for event in event_names %}
            d3.rebind(func_{{ visualization_name }}, dispatch, '{{ event }}');
        {% endfor %}
        d3.rebind(func_{{ visualization_name }}, dispatch, 'on');
    {% endif %}

    return func_{{ visualization_name }};
};
