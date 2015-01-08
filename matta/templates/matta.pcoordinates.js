
function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
};

// Returns the path for a given data point.
var path = function(d, i) {
    var points = _columns.map(function(p) {
        return [position(p), y[p](d[p])];
    });
    return line(points);
};

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = _columns.filter(function(p) {
        return !y[p].brush.empty();
    });

    var extents = actives.map(function(p) {
        return y[p].brush.extent();
    });

    console.log('actives', actives, extents);

    foreground.style("display", function(d) {
    return actives.every(function(p, i) {
            console.log(d, p, i);
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });
};


var w = _width - _padding.left - _padding.right;
var h = _height - _padding.top - _padding.bottom;

var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground,
    _idx = {};


var color = d3.functor('steelblue');

var pc_g = container.append("g");

_columns.forEach(function(d, i) {
    _idx[d] = i;
});

_columns.forEach(function(d, i) {
    y[d] = d3.scale.linear().domain(d3.extent(_data_dataframe, function(p) {
        return p[d];
    })).range([h, 0]);

    console.log('y', d, y[d].domain());
});

console.log('y', y);


// Extract the list of dimensions and create a scale for each.
x.domain(_columns);

console.log('x', x.domain(), x.range());


// Add blue foreground lines for focus.
foreground = pc_g.append("svg:g")
    .attr("class", "foreground")
.selectAll("path")
    .data(_data_dataframe)
.enter().append("svg:path")
    .attr("d", path)
.attr('opacity', _line_opacity)
.attr('stroke', color)
.attr('stroke-width', _line_stroke_width)
.attr('fill', 'none');

// Add a group element for each dimension.
var g = pc_g.selectAll(".dimension")
    .data(_columns)
.enter().append("svg:g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .call(d3.behavior.drag()
        .on("dragstart", function(d) {
            dragging[d] = this.__origin__ = x(d);
            //background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
            dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
            foreground.attr("d", path);
            _columns.sort(function(a, b) { return position(a) - position(b); });
            x.domain(_columns);
            g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
            delete this.__origin__;
            delete dragging[d];
            d3.select(this).attr("transform", "translate(" + x(d) + ")");
            foreground.attr("d", path);

        })
    );

// Add an axis and title.
g.append("svg:g")
    .attr("class", "axis")
    .each(function(d, i) {
        d3.select(this).call(axis.scale(y[d]));
        d3.select(this).selectAll('line').style({'display': 'block', 'stroke': '#000', 'fill': 'none', 'shape-rendering': 'crispEdges'});
        d3.select(this).selectAll('path').style({'display': 'block', 'stroke': '#000', 'fill': 'none', 'shape-rendering': 'crispEdges'});
    })
.append("svg:text")
    .attr("text-anchor", "middle")
    .attr("y", -9)
    .text(String);

// Add and store a brush for each axis.
g.append("svg:g")
    .attr("class", "brush")
    .each(function(d, i) {
        d3.select(this)
            .call(y[d].brush = d3.svg.brush().y(y[d])
                .on("brush", brush)
            );
        d3.select(this).select('.extent').style({
          'fill-opacity': 0.3,
          'stroke': '#fff',
          'shape-rendering': 'crispEdges'
        });
    })
.selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);







