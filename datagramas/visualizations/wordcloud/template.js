var complete = 0;
var max = _data_dataframe.length;
var vis = container.append("g").attr("transform", "translate(" + [_vis_width >> 1, _vis_height >> 1] + ")");

_font_size_update_scale_func(_data_dataframe);
_font_color_update_scale_func(_data_dataframe);

var color_map = d3.map();

_data_dataframe.forEach(function(d) {
    console.log('d', d, datagramas.get(d, _text), _font_color(d));
    color_map.set(datagramas.get(d, _text), _font_color(d));
});

console.log('color map', color_map);

var layout = cloud()
    .size([_vis_width, _vis_height])
    .font(_typeface)
    .fontWeight(_font_weight)
    .fontSize(_font_size)
    .text(function(d) { return datagramas.get(d, _text); })
    .rotate(_rotation)
    .on("end", function(words, bounds) {
        cloud_draw(vis, words, bounds);
    });

layout.stop().words(_data_dataframe).start();
