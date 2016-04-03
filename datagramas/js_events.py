from .js_utils import JSCode
from cytoolz import valmap
import jinja2


def d3_identity_func():
    return JSCode('function(__val__) { return __val__; }')


def tooltip_events(click_event, tooltip_content):
    """
    Helper functions that, given a click event name, displays a tooltip with the specified content.

    :param click_event: string - name of the click event. Example: 'area_click'
    :param tooltip_content: dict {column_name -> column_format} - names of a datum properties to be included in the tooltip.
    :return: a dictionary with JSCode instances, to be used as the 'events' parameter of a visualization module.
    """
    events = {}

    code = jinja2.Template('''
    function() {
            console.log(svg);
            auxiliary.tip = datagramas.tip()
                .attr('class', 'd3-tip')
                .parent(svg.node().parentNode)
                .html(function(d) {
                    console.log('tip', d);
                    var tooltip_content = '<dl>';
                    {% for key, f in tooltip_content.items() %}
                    tooltip_content += '<dt>{{ key }}</dt><dd>' + {{ f }}(datagramas.get(d, '{{ key }}')) + '</dd>';
                    {% endfor %}
                    tooltip_content += '</dl>';
                    return tooltip_content;
                });
                console.log('this', this);
            d3.select(this).call(auxiliary.tip);
            auxiliary.current_tip = null;
         }
    ''').render(tooltip_content=tooltip_content)

    events['datagram_start'] = JSCode(code)

    # this event is the same in all cases.
    events[click_event] = JSCode('''
        function(d) {
            if (auxiliary.current_tip !== null) {
                if (auxiliary.current_tip !== d) {
                    auxiliary.tip.hide(auxiliary.current_tip);
                    auxiliary.current_tip = null;
                } else {
                    console.log('repeated tip');
                    auxiliary.current_tip = null;
                    auxiliary.tip.hide(d);
                    return;
                }
            }
            auxiliary.tip.show(d, container)
            auxiliary.current_tip = d;
        }
    ''')

    return events