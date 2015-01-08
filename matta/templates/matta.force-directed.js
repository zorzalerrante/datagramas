matta.prepare_graph(json);
var graph_g = container.append('g').attr('class', 'graph-layer')
    //.attr('transform', 'translate(' + [-width * 0.5, -height * 0.5] + ')');

var force = force_directed()
    .width(width)
    .height(height)
    .gravity({{ force_gravity }})
    .charge({{ force_charge }})
    .node_radius({{ node_radius }})
    .link_distance({{ link_distance }})
    .painter(function(sel) {
        sel.each(function(d) {
            d3.select(this).append('circle')
                .attr('r', {{ node_radius }})
                .attr('cx', {{ node_radius }})
                .attr('cy', {{ node_radius }});
                
            d3.select(this).append('text')
                .attr('class', 'node-label')
                .attr('x', {{ node_radius }})
                .attr('y', {{ node_radius }})
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('font-size', {{ font_size }});
        });
    });
    
console.log(force);
{% if links %}
    force.draw_links(true);
{% else %}
    force.draw_links(false);
{% endif %}

{% if avoid_collisions %}
    force.collision_detection(true);
{% else %}
    force.collision_detection(false);
{% endif %}
    
graph_g.datum(json)
    .call(force)

graph_g.selectAll('.node')
    .call(matta.styler('fill', 'color'));

graph_g.selectAll('line.link')
    .call(matta.styler('stroke', 'color'))
    .call(matta.styler('stroke-opacity', 'weight'));

graph_g.selectAll('g.node text.node-label').call(matta.labeler());
graph_g.selectAll('g.node circle').call(matta.styler('fill', 'color'));