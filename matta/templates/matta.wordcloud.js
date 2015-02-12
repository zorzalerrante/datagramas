

var fn_name = function(d) {
    return d[0];
};

var fn_count = function(d) {
    return d[1];
};

var color_scale = null;
if (_color_scale_domain != null) {
    color_scale = d3.scale.threshold()
        .domain(_color_scale_domain)
        .range(_color_scale_range);
} else {
    color_scale = d3.scale.category20b();
}

console.log('color scale', color_scale.range(), _color_scale_domain, _color_scale_range);

var fn_color = function(d) {
    /**
     * If a color scale is specified, and the datum has at least three members, then we use the color scale.
     * Otherwise we assume that the third member is a color.
     * If there are only two members, we pick a random color based on the word itself.
     */
    if (_color_scale_domain != null) {
        return color_scale(d.length > 2 ? d[2] : d[1]);
    }
    return d.length > 2 ? d[2] : color_scale(d[0]);
};

var color_map = d3.map();
console.log('color map', color_map);

_data_items.forEach(function(d) {
    color_map.set(d[0], fn_color(d));
});

var fontSize = matta.scale(_font_scale)
    .range([_min_font_size, _max_font_size]);

var statusText = container.append('text').attr('class', "wordcloud-status").attr('y', 10);

var complete = 0;
var max = _data_items.length;

var cloud_draw = function(words, bounds) {
    statusText.style("display", "none");
    var scale = bounds ? Math.min(
        _vis_width / Math.abs(bounds[1].x - _vis_width / 2),
        _vis_width / Math.abs(bounds[0].x - _vis_width / 2),
        _vis_height / Math.abs(bounds[1].y - _vis_height / 2),
        _vis_height / Math.abs(bounds[0].y - _vis_height / 2)) / 2 : 1;

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
        .style("font-weight", _font_weight)
        .style("fill", function(d){ return color_map.get(d.text); })
        .text(function(d){ return d.text; });
};
        
var vis = container.append("g").attr("transform", "translate(" + [_vis_width >> 1, _vis_height >> 1] + ")");

var layout = wordcloud()
    .size([_vis_width, _vis_height])
    .font(_typeface)
    .fontWeight(_font_weight)
    .fontSize(function(d) { return fontSize(fn_count(d)); })
    .text(fn_name)
    .rotate(_rotation)
    .on("word", function(d) { return statusText.text(++complete + "/" + max); })
    .on("end", function(d, b) { return cloud_draw(d, b); });

fontSize.domain(d3.extent(_data_items, fn_count));
console.log('scale', fontSize.domain(), fontSize.range());
statusText.style("display", null);
layout.stop().words(_data_items).start();


console.log('DONE 2')