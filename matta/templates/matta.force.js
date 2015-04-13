
var fn_ratio;

if (_node_value == null) {
    fn_ratio = typeof _node_ratio == 'number' ? d3.functor(_node_ratio) : function (d) {
        return d[_node_ratio];
    };
} else {
    var scale = matta.scale(_node_scale)
        .domain(d3.extent(_data_graph.nodes, function(d) { return d[_node_value]; }))
        .range([_node_min_ratio, _node_max_ratio]);

    fn_ratio = function(d) { return scale(d[_node_value]); };
}

var fn_collide = function(node) {
    var nx1, nx2, ny1, ny2, r;
    r = fn_ratio(node) + _node_padding;
    nx1 = node.x - r;
    nx2 = node.x + r;
    ny1 = node.y - r;
    ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        var l, r2, x, y;
        if (quad.point && quad.point !== node) {
            x = node.x - quad.point.x;
            y = node.y - quad.point.y;
            l = Math.sqrt(x * x + y * y);
            r2 = r + fn_ratio(quad.point);

            if (l < r2) {
                l = (l - r2) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
};

matta.prepare_graph(_data_graph);

var force = d3.layout.force()
    .friction(_friction)
    .theta(_theta)
    .alpha(_alpha)
    .charge(_force_charge)
    .chargeDistance(_charge_distance)
    .linkDistance(_link_distance)
    .linkStrength(_link_strength)
    .size([_width - _padding.left - _padding.right, _height - _padding.top - _padding.bottom])
    .gravity(_force_gravity)
    .nodes(_data_graph.nodes)
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
        console.log('node enter', d, fn_ratio(d));
        var ratio = fn_ratio(d);
        d3.select(this).append('circle')
            .attr('r', ratio)
            .attr('cx', ratio)
            .attr('cy', ratio)
            .attr('stroke', 'grey')
            .attr('stroke-width', 2)
            .attr('fill', d['color']);

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
    if (_avoid_collisions) {
        var q = d3.geom.quadtree(_data_graph.nodes);
        _data_graph.nodes.forEach(function(n, i) {
            return q.visit(fn_collide(n));
        });
    }
    if (_clamp_to_viewport) {
        _data_graph.nodes.forEach(function(n, i) {
            var ratio = fn_ratio(n);
            n.x = Math.max(ratio, Math.min(_width - _padding.left - _padding.right - ratio, n.x));
            n.y = Math.max(ratio, Math.min(_height - _padding.top - _padding.bottom - ratio, n.y));
        });
    }

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
        return "translate(" + (d.x - fn_ratio(d)) + ", " + (d.y - fn_ratio(d)) + ")";
    });
});


force.start();