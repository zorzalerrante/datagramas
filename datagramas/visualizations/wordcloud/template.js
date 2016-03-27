
var statusText = container.append('text').attr('class', "wordcloud-status").attr('y', 10);

var complete = 0;
var max = _data_dataframe.length;
var vis = container.append("g").attr("transform", "translate(" + [_vis_width >> 1, _vis_height >> 1] + ")");

_font_size_update_scale_func(_data_dataframe);
_font_color_update_scale_func(_data_dataframe);

var color_map = d3.map();

_data_dataframe.forEach(function(d) {
    console.log('d', d, matta.get(d, _text), _font_color(d));
    color_map.set(matta.get(d, _text), _font_color(d));
});

console.log('color map', color_map);

var layout = cloud()
    .size([_vis_width, _vis_height])
    .font(_typeface)
    .fontWeight(_font_weight)
    .fontSize(_font_size)
    .text(function(d) { return matta.get(d, _text); })
    .rotate(_rotation)
    .on("word", function(d) { return statusText.text(++complete + "/" + max); })
    .on("end", function(words, bounds) {
        cloud_draw(vis, words, bounds);
    });

statusText.style("display", null);
layout.stop().words(_data_dataframe).start();
