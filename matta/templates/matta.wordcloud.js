
var color = d3.scale.category20();
var _name = function(d) { return d[0]; };
var _count = function(d) { return d[1]; };
var _color = function(d) { return color(_name(d)); };

{% if scaling_type == 'log' %}
    var fontSize = d3.scale.log().range([{{ min_size }}, {{ max_size }}]);
{% elif scaling_type == 'sqrt' %}
    var fontSize = d3.scale.sqrt().range([{{ min_size }}, {{ max_size }}]);
{% else %}
    var fontSize = d3.scale.linear().range([{{ min_size }}, {{ max_size }}]);
{% endif %}


var statusText = svg.append('text').attr('class', "wordcloud-status").attr('y', 10);

var complete = 0;
var max = json.length;

var cloud_draw = function(words, bounds) {
    statusText.style("display", "none");
    var scale = bounds ? Math.min(
        width / Math.abs(bounds[1].x - width / 2),
        width / Math.abs(bounds[0].x - width / 2),
        height / Math.abs(bounds[1].y - height / 2),
        height / Math.abs(bounds[0].y - height / 2)) / 2 : 1;

    var text = vis.selectAll("text")
        .data(words, function(d) { return d.text; });

    text.transition()
        .duration(1000)
        .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
        .style("font-size", function(d) { return d.size + "px"; });

    text.enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
        .style("font-size", function(d) { return d.size + "px"; })
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);

    text.style("font-family", function(d){ return d.font; })
        .style("fill", function(d){ return color(d.text); })
        .text(function(d){ return d.text; });
};
        
var vis = svg.append("g").attr("transform", "translate(" + [width >> 1, height >> 1] + ")");

var layout = wordcloud()
    .timeInterval({{ time_interval }})
    .size([width, height])
    .font("{{ font }}")
    .fontSize(function(d) { return fontSize(_count(d)); })
    .text(_name)
    .rotate({{ rotate }})
    .on("word", function(d) { return statusText.text(++complete + "/" + max); })
    .on("end", function(d, b) { return cloud_draw(d, b); });

fontSize.domain(d3.extent(json, _count));
console.log(fontSize.domain(), fontSize.range());
statusText.style("display", null);
layout.stop().words(data).start();


