
/**
 * mod_{{ visualization_name }} was scaffolded using matta - https://github.com/carnby/matta
 * Variables that start with an underscore (_) are passed as arguments in Python.
 * Variables that start with _data are data parameters of the visualization, and expected to be given as datum.
 *
 * For instance, d3.select('#figure').datum({'graph': a_json_graph, 'dataframe': a_json_dataframe}).call(visualization)
 * will fill the variables _data_graph and _data_dataframe.
 */

var matta_{{ visualization_name }} = function() {
    var __fill_data__ = function(__data__) {
        {% for var_name in __data_variables__ %}
            func_{{ visualization_name }}.{{ var_name }}(__data__.{{ var_name }});
        {% endfor %}
    };

    {% if options.events %}
        var _dispatcher = d3.dispatch('{{ options.events|join('\', \'') }}');
    {% endif %}

    var func_{{ visualization_name }} = function (selection) {
        console.log('selection', selection);

        var _vis_width = _width - _padding.left - _padding.right;
        var _vis_height = _height - _padding.top - _padding.bottom;

        selection.each(function(__data__) {
            __fill_data__(__data__);

            var container = null;
            var figure_dom_element = this;

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

                {% elif container_type == 'div' %}
                    var div = d3.select(this).append('div')
                        .style({
                            'width': _width + 'px',
                            'height': _height + 'px',
                            'position': 'relative',
                            'display': 'block'
                        })
                        .classed('{{ visualization_name }}-container', true);

                    {% if options.background_color %}
                        div.style('background', '{{ options.background_color }}');
                    {% endif %}

                    container = div;

                {% else %}
                    console.log('unsupported container type!');
                    return;
                {% endif %}
            } else {
                container = d3.select(this).select('{{ container_type }}.{{ visualization_name }}-container');
            }

            console.log('container', container.node());

            {% if visualization_js %}
                {{ visualization_js }}
            {% endif %}

        });
    };

    {% for var_name in __data_variables__ %}
        var _data_{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            if (arguments.length) {
                _data_{{ var_name }} = __;
                console.log('DATA {{ var_name }}', _data_{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _data_{{ var_name }};
        };
    {% endfor %}

    {% if variables %}
    {% for var_name, var_value in variables.items() %}
        var _{{ var_name }} = {{ var_value }};
        func_{{ visualization_name }}.{{ var_name }} = function(__) {
            if (arguments.length) {
                _{{ var_name }} = __;
                console.log('set {{ var_name }}', _{{ var_name }});
                return func_{{ visualization_name }};
            }
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if read_only %}
    {% for var_name in read_only %}
        var _{{ var_name }} = null;
        func_{{ visualization_name }}.{{ var_name }} = function() {
            return _{{ var_name }};
        };
    {% endfor %}
    {% endif %}

    {% if options.events %}
        return d3.rebind(func_{{ visualization_name }}, _dispatcher, 'on');
    {% else %}
        return func_{{ visualization_name }};
    {% endif %}
};