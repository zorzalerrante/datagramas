
var normalize = function(matrix) {
    matrix.forEach(function(row) {
        var norm = 0;
        row.forEach(function(d) {
            var abs_value = Math.abs(datagramas.get(d, _item_color_value));
            norm += Math.pow(abs_value, _row_normalization_exponent);
        });

        norm = Math.pow(norm, 1 / _row_normalization_exponent);

        row.forEach(function (d) {
            d[_normalized_value_name] = norm > _norm_epsilon ? datagramas.get(d, _item_color_value) / norm : 0.0;
        });
    });
};

var draw_row = function(row) {
    var cell = d3.select(this).selectAll(".cell")
        .data(row);

    cell.enter().append("rect")
        .attr("class", "cell")
        .attr("x", function (d, j) {
            return x(j);
        })
        .attr("width", x.rangeBand())
        .attr("height", y.rangeBand());

    cell.exit().remove();
};

var cell_color = function(d) {
    return _row_normalization_exponent !== null && _row_normalization_exponent ?
        _item_color(d, _normalized_value_name) : _item_color(d);
};