{% if attributes %}
{% for var_name, var_values in attributes.items() %}
    var _{{ var_name }} = null;
    var _{{ var_name }}_scale = null;
    var _{{ var_name }}_scale_locked = false;
    var _{{ var_name }}_update_scale_func = d3.functor(null);
    var _{{ var_name }}_show_legend = {{ var_values.legend }};
    var _{{ var_name }}_legend = null;
    var _{{ var_name }}_legend_container = null;

    func_{{ visualization_name }}.{{ var_name }}_scale_locked = function(__) {
        /**
         * If {{ var_name }}'s scale is locked, then {{ visualization_name }} will not automatically update it
         * before rendering. Useful to set the scale parameters from outside, or to maintain
         * coherent scaling between succesive renderings.
         */
        if (arguments.length) {
            _{{ var_name }}_scale_locked = __;
            console.log('set {{ var_name }}_scale_locked', _{{ var_name }}_scale_locked);
            return func_{{ visualization_name }};
        }
        return _{{ var_name }}_scale_locked;
    };

    func_{{ visualization_name }}.{{ var_name }}_scale = function() {
        /**
         * Returns the scale for {{ var_name }}.
         */
        return _{{ var_name }}_scale;
    };

    // {{ var_values }}
    // TODO: create get/setters for these variables
    var _{{ var_name }}_scale_type = {{ var_values.scale }};
    var _{{ var_name }}_min = {{ var_values.min }};
    var _{{ var_name }}_max = {{ var_values.max }};
    var _{{ var_name }}_value = {{ var_values.value }};

    if (typeof(_{{ var_name }}_value) !== 'string') {
        console.log('{{ var_name }} using a functor', _{{ var_name }}_value);
        _{{ var_name }} = d3.functor(_{{ var_name }}_value !== null ? _{{ var_name }}_value : _{{ var_name }}_max);
    } else {
        _{{ var_name }}_scale = datagramas.scale(_{{ var_name }}_scale_type);
        _{{ var_name }}_scale.range([_{{ var_name }}_min, _{{ var_name }}_max]);

        _{{ var_name }} = function(d) {
            //console.log('_{{ var_name }}', d, _{{ var_name }}_value, _{{ var_name }}_scale(datagramas.get(d, _{{ var_name }}_value)));
            return _{{ var_name }}_scale(datagramas.get(d, _{{ var_name }}_value));
        };

        _{{ var_name }}_update_scale_func = function(data) {
            if (_{{ var_name }}_scale_locked) {
                return;
            }

            _{{ var_name }}_scale.range([_{{ var_name }}_min, _{{ var_name }}_max]);
            _{{ var_name }}_scale.domain(d3.extent(data, function(d) {
                return datagramas.get(d, _{{ var_name }}_value);
                })
            );
        };

        if (_{{ var_name }}_show_legend) {
            _{{ var_name }}_legend = d3.legend.size()
                    .scale(_{{ var_name }}_scale)
                    // TODO: these should be parameterizable
                    .shape('circle')
                    .shapePadding(15)
                    .labelOffset(20)
                    //.labelFormat(d3.format('.3f'))
                    .title(_{{ var_name }}_value);

            _{{ var_name }}_legend['variable'] = '{{ var_name }}';
            console.log('{{ var_name }} legend', _{{ var_name }}_legend);
            active_legends.push(_{{ var_name }}_legend);
        }
    }

    //console.log('{{ var_name }}', _{{ var_name }});
{% endfor %}
{% endif %}