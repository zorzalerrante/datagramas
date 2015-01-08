{% if define_js_module %}
define("{{ visualization_name }}", ["{{ requirements|join('", "') }}"], function ({{ requirements|join(', ') }}) {
    {% include 'base.js' %}
    return mod_{{ visualization_name }};
});
{% else %}
{% include 'base.js' %}
{% endif %}