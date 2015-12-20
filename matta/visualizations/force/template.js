

matta.prepare_graph(_data_graph);
_node_ratio_update_scale_func(_data_graph.nodes);
_node_color_update_scale_func(_data_graph.nodes);

{% if options.use_webcola %}

// we need this to avoid overlaps
_data_graph.nodes.forEach(function(d) {
    d.width = _node_ratio(d) * 2 + _node_padding;
    d.height = _node_ratio(d) * 2 + _node_padding;
});

console.log(cola);
var force = cola.d3adaptor()
    .linkDistance(_link_distance)
    .size([_vis_width, _vis_height])
    .avoidOverlaps(_avoid_collisions);
{% else %}
var force = d3.layout.force()
    .friction(_friction)
    .theta(_theta)
    .alpha(_alpha)
    .charge(_force_charge)
    .chargeDistance(_charge_distance)
    .linkDistance(_link_distance)
    .linkStrength(_link_strength)
    .size([_width - _padding.left - _padding.right, _height - _padding.top - _padding.bottom])
    .gravity(_force_gravity);
{% endif %}

force.nodes(_data_graph.nodes)
    .links(_data_graph.links);

var node_g, link_g;

if (!container.select('g.links').empty()) {
    link_g = container.select('g.links');
} else {
    link_g = container.append('g').classed('links', true);
}

if (!container.select('g.nodes').empty()) {
    node_g = container.select('g.nodes');
} else {
    node_g = container.append('g').classed('nodes', true);
}

var node = node_g.selectAll("g.node")
    .data(_data_graph.nodes, function(d, i) { return d[_node_id]; });

node.enter()
    .append('g')
    .attr('class', 'node')
    .each(function(d) {
        //console.log('node enter', d, _node_ratio(d));
        var ratio = _node_ratio(d);
        d3.select(this).append('circle')
            .attr('r', ratio)
            .attr('cx', ratio)
            .attr('cy', ratio)
            .attr('stroke', 'grey')
            .attr('stroke-width', 2)
            .attr('fill', _node_color);

        if (_node_labels == true) {
            d3.select(this).append('text')
                .attr('class', 'node-label')
                .attr('x', ratio)
                .attr('y', ratio)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-size', _font_size)
                .attr('fill', 'black')
                .text(d[_node_id]);
        }
    });

node.exit()
    .remove();

var link = link_g.selectAll("line.link")
    .data(_data_graph.links, function(d, i) { return d.source[_node_id] + '-' + d.target[_node_id]; });

link.enter()
    .append("line")
    .classed('link', true)
    .style({
        "stroke-width": 1,
        'stroke': '#999'
    });

link.exit()
    .remove();

link_g.selectAll('line.link')
    .call(matta.styler('stroke', 'color'))
    .call(matta.styler('stroke-opacity', 'weight'));


console.log('force', force);



force.on("tick", function(e) {
    {% if not options.use_webcola %}
    if (_avoid_collisions) {
        var q = d3.geom.quadtree(_data_graph.nodes);
        _data_graph.nodes.forEach(function(n, i) {
            return q.visit(fn_collide(n));
        });
    }
    if (_clamp_to_viewport) {
        _data_graph.nodes.forEach(function(n, i) {
            var ratio = _node_ratio(n);
            n.x = Math.max(ratio, Math.min(_width - _padding.left - _padding.right - ratio, n.x));
            n.y = Math.max(ratio, Math.min(_height - _padding.top - _padding.bottom - ratio, n.y));
        });
    }
    {% endif %}

    link
        .attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });

    node.attr("transform", function(d) {
        return "translate(" + (d.x - _node_ratio(d)) + ", " + (d.y - _node_ratio(d)) + ")";
    });
});


force.start();