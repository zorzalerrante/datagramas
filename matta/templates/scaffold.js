
define("{{ visualization_name }}", ["{{ requirements|join('", "') }}"], function ({{ requirements|join(', ') }}) {
    {% include 'base.js' %}
    return mod_{{ visualization_name }};
});