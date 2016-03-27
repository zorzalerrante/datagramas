
// we do this because the d3-sankey layout has hardcoded the value variable.
matta.prepare_graph(_data_graph);

_data_graph.links.forEach(function(d) {
    d.value = matta.get(d, _link_weight);
});

_node_color_update_scale_func(_data_graph.nodes);
_link_color_update_scale_func(_data_graph.links);

{% if options.horizontal %}
    var sankey_width = _height - _padding.left - _padding.right;
    var sankey_height = _width - _padding.top - _padding.bottom;

    if (sankey_width >= _height) {
        sankey_width = _height;
    }

    if (sankey_height >= _width) {
        sankey_height = _width;
    }
    var sankey_transform = "translate(" + _width + ")rotate(90)";
{% else %}
    var sankey_width = _width - _padding.left - _padding.right;
    var sankey_height = _height - _padding.top - _padding.bottom;
    var sankey_transform = "translate(0,0)";
{% endif %}

var sankey_svg;
var links_g;
var nodes_g;

if (!container.select('g.d3-sankey-root').empty()) {
    sankey_svg = container.select('g.d3-sankey-root');
} else {
    sankey_svg = container.append('g').attr('transform', sankey_transform).classed('d3-sankey-root', true);
}

if (!sankey_svg.select('g.d3-sankey-links').empty()) {
    links_g = sankey_svg.select('g.d3-sankey-links');
} else {
    links_g = sankey_svg.append('g').classed('d3-sankey-links', true);
}

if (!sankey_svg.select('g.d3-sankey-nodes').empty()) {
    nodes_g = sankey_svg.select('g.d3-sankey-nodes');
} else {
    nodes_g = sankey_svg.append('g').classed('d3-sankey-nodes', true);
}

var scale_container;

if (!container.select('g.color-legend').empty()) {
    scale_container = container.select('g.color-legend');
} else {
    scale_container = container.append('g').classed('color-legend legend', true);
}

var layout = sankey()
    .nodeWidth(_node_width)
    .nodePadding(_node_padding)
    .size([sankey_width, sankey_height]);

var sankey_path = layout.link();

layout
    .nodes(_data_graph.nodes)
    .links(_data_graph.links)
    .layout(_layout_iterations);

var link = links_g.selectAll("path.link")
    .data(_data_graph.links);
    
link.enter().append("path")
    .attr("class", "link");

link.exit()
    .remove();

link.style({
        'stroke-width': function(d){ return Math.max(1, d.dy); },
        'opacity': _link_opacity,
        'stroke': _link_color,
        'fill': 'none'
    })
    .sort(function(a, b){ return b.dy - a.dy; });

link.attr("d", sankey_path);
link.style('stroke', _link_color);

var node = nodes_g.selectAll("g.node")
    .data(_data_graph.nodes);
    
node.enter().append("g")
    .attr("class", "node");

node.exit().remove();

node.attr("transform", function(d){  return "translate(" + d.x + "," + d.y + ")"; });

node.append("rect")
    .attr("height", function(d){ return d.dy; })
    .attr("width", layout.nodeWidth())
    .style({
        "stroke": function(d){ return d3.rgb(d.color).darker(2); },
        'fill': _node_color,
        'fill-opacity': _node_opacity
    });

node.append("text")
    .attr("x", -6)
    .attr("y", function(d){ return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .attr('font-size', _font_size)
    .text(function(d) { return matta.get(d, _node_label); })
    .filter(function(d){ return d.x > sankey_width / 2; })
    .attr("x", 6 + layout.nodeWidth())
    .attr("text-anchor", "start");

