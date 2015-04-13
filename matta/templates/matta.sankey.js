
// we do this because the sankey layout has hardcoded the value variable.
_data_graph.links.forEach(function(d) {
    d.value = d[_link_weight];
});

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

if (_link_color_scale_range) {
    sankey_height -= 50;
}

var sankey_svg;
var links_g;
var nodes_g;

if (!container.select('g.sankey-root').empty()) {
    sankey_svg = container.select('g.sankey-root');
} else {
    sankey_svg = container.append('g').attr('transform', sankey_transform).classed('sankey-root', true);
}

if (!sankey_svg.select('g.sankey-links').empty()) {
    links_g = sankey_svg.select('g.sankey-links');
} else {
    links_g = sankey_svg.append('g').classed('sankey-links', true);
}

if (!sankey_svg.select('g.sankey-nodes').empty()) {
    nodes_g = sankey_svg.select('g.sankey-nodes');
} else {
    nodes_g = sankey_svg.append('g').classed('sankey-nodes', true);
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
    .data(_data_graph.links)
    
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
link.call(matta.styler('stroke', 'color'));

if (_link_color_scale_range) {
    var scale_container;

    if (!container.select('g.threshold-legend').empty()) {
        scale_container = container.select('g.threshold-legend');
    } else {
        scale_container = container.append('g').classed('threshold-legend legend', true);
    }

    var threshold_legend = matta.color_thresholds()
        .extent(_link_color_scale_extent)
        .width(_link_color_scale_width)
        .height(_link_color_scale_height)
        .title(_link_color_scale_title);

    threshold_legend.position({x: (_width - _link_color_scale_width) * 0.5, y: _height - 50});

    var threshold = d3.scale.threshold()
        .domain(_link_color_scale_domain)
        .range(_link_color_scale_range);

    scale_container.data([threshold]).call(threshold_legend);
    link.style('stroke', function(d) { return threshold(d[_link_color_variable]); });
}

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
    
node.call(matta.styler('fill', 'color'));

node.append("text")
    .attr("x", -6)
    .attr("y", function(d){ return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .attr('font-size', _font_size)
    .filter(function(d){ return d.x > sankey_width / 2; })
    .attr("x", 6 + layout.nodeWidth())
    .attr("text-anchor", "start");

node.selectAll('text').call(matta.labeler(_node_label));