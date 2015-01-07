
var color = d3.scale.category20();

var fn_name = function(d) {
    return d[0];
};

var fn_count = function(d) {
    return d[1];
};

var fn_color = function(d) {
    return color(_name(d));
};

var fontSize = matta.scale(_font_scale)
    .range([_min_font_size, _max_font_size]);

var statusText = container.append('text').attr('class', "wordcloud-status").attr('y', 10);

var complete = 0;
var max = _data_items.length;

var cloud_draw = function(words, bounds) {
    statusText.style("display", "none");
    var scale = bounds ? Math.min(
        _width / Math.abs(bounds[1].x - _width / 2),
        _width / Math.abs(bounds[0].x - _width / 2),
        _height / Math.abs(bounds[1].y - _height / 2),
        _height / Math.abs(bounds[0].y - _height / 2)) / 2 : 1;

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
        .style("opacity", _font_opacity);

    text.style("font-family", function(d){ return d.font; })
        .style("fill", function(d){ return color(d.text); })
        .text(function(d){ return d.text; });
};
        
var vis = container.append("g").attr("transform", "translate(" + [_width >> 1, _height >> 1] + ")");

var layout = wordcloud()
    //.timeInterval({{ time_interval }})
    .size([_width - _padding.left - _padding.right, _height - _padding.top - _padding.bottom])
    .font(_typeface)
    .fontSize(function(d) { return fontSize(fn_count(d)); })
    .text(fn_name)
    .rotate(_rotation)
    .on("word", function(d) { return statusText.text(++complete + "/" + max); })
    .on("end", function(d, b) { return cloud_draw(d, b); });

fontSize.domain(d3.extent(_data_items, fn_count));
console.log('scale', fontSize.domain(), fontSize.range());
statusText.style("display", null);
layout.stop().words(_data_items).start();


