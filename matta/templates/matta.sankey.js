
var sankey_margin = {
    left: {{ label_margins }},
    top: 3,
    right: {{ label_margins }},
    bottom: 3
};

json.links.forEach(function(d) {
    if (!d.hasOwnProperty('value')) {
        d.value = d.weight;
    }
});

var container_width = {{ width }} 


var width = {{ width }};
var height = {{ height }};

var sankey_width = width - sankey_margin.left - sankey_margin.right;
var sankey_height = height - sankey_margin.top - sankey_margin.bottom;

var longest = Math.max(width, height);

{% if horizontal %}
    var svg_height = width;
    var svg_width = height;
    var draw_horizontal = true;
{% else %}
    var svg_width = width;
    var svg_height = height;  
    var draw_horizontal = false;
{% endif %}

var ratio = svg_width * 1.0 / svg_height;

if (draw_horizontal) {
    var sankey_transform = "translate(" + height + ")rotate(90)translate(" + sankey_margin.left + "," + sankey_margin.top + ")";
} else {
    var sankey_transform = "translate(" + sankey_margin.left + "," + sankey_margin.top + ")";
}

var sankey_svg = container.append('g')
    .attr('transform', sankey_transform);


var layout = sankey()
    .nodeWidth({{ node_width }})
    .nodePadding({{ node_padding }})
    .size([sankey_width, sankey_height]);

var sankey_path = layout.link();

layout
    .nodes(json.nodes)
    .links(json.links)
    .layout({{ layout_iterations }});

var link = sankey_svg.append("g").selectAll(".link")
    .data(json.links)
    
link.enter().append("path")
    .attr("class", "link")
    .style("stroke-width", function(d){ return Math.max(1, d.dy); })
    .sort(function(a, b){ return b.dy - a.dy; });

link.attr("d", sankey_path);
link.call(matta.styler('stroke', 'color'))
    .call(matta.styler('stroke-opacity', 'opacity'));


var node = sankey_svg.append("g").selectAll(".node")
    .data(json.nodes)
    
node.enter().append("g")
    .attr("class", "node")
    
node.attr("transform", function(d){  return "translate(" + d.x + "," + d.y + ")"; });

node.append("rect")
    .attr("height", function(d){ return d.dy; })
    .attr("width", layout.nodeWidth())
    .style("stroke", function(d){ return d3.rgb(d.color).darker(2); });
    
node.call(matta.styler('fill', 'color'));

node.append("text")
    .attr("x", -6)
    .attr("y", function(d){ return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .filter(function(d){ return d.x > sankey_width / 2; })
    .attr("x", 6 + layout.nodeWidth())
    .attr("text-anchor", "start");
    
node.selectAll("text").call(matta.labeler())
console.log('end');


