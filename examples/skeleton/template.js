var x = d3.scale.ordinal()
    .rangeRoundBands([0, _vis_width], .1);

var y = d3.scale.linear()
    .range([_vis_height, 0]);

if (_y_label == null) {
    _y_label = _y;
}

x.domain(_data_dataframe.map(function(d) { return d[_x]; }));
y.domain([0, d3.max(_data_dataframe, function(d) { return d[_y]; })]);

{% if options.x_axis %}
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    container.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + _vis_height + ")")
        .call(xAxis);
{% endif %}

{% if options.y_axis %}
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    if (_y_axis_ticks != null) {
        yAxis.ticks(_y_axis_ticks);
    }

    var y_label = container.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text");

    if (_rotate_label) {
        y_label.attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");
    } else {
        y_label
        .attr("y", 6)
            .attr('x', 12)
        .attr("dy", ".71em")
        .style("text-anchor", "start");
    }

    y_label.text(_y_label);
{% endif %}

_bar_color_update_scale_func(_data_dataframe);

var bar = container.selectAll(".bar")
    .data(_data_dataframe);

bar.enter().append('rect').classed('bar', true);

bar.exit().remove();

bar.attr("x", function(d) { return x(d[_x]); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d[_y]); })
    .attr("height", function(d) { return _vis_height - y(d[_y]); })
    .attr('fill', _bar_color);