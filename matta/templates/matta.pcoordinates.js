
function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
};

// Returns the path for a given data point.
var path = function(d, i) {
    var points = dimensions.map(function(p) {
        return [position(p), y[p](d[p])];
    });
    return line(points);
};

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function(p) {
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


var m = [30, 10, 10, 10],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2];

var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground,
    _idx;

{% if categories %}
    var categories = {{ categories }};
    var color_scale = d3.scale.category10()
        .domain(d3.set(d3.values(categories)).values());
    var color = function(d, i) {
        return color_scale(categories[i]);
    };
{% else %}
    var color = d3.functor('steelblue');
{% endif %}

var pc_g = container.append("g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");


console.log('data', json);
var dimensions = {{ columns }};
console.log('dimensions', dimensions);

_idx = {};
dimensions.forEach(function(d, i) {
    _idx[d] = i;
});

dimensions.forEach(function(d, i) {
    y[d] = d3.scale.linear().domain(d3.extent(json, function(p) {
        return p[d];
    })).range([h, 0]);

    console.log('y', d, y[d].domain());
});

console.log('y', y);


// Extract the list of dimensions and create a scale for each.
x.domain(dimensions);

console.log('x', x.domain(), x.range());


// Add blue foreground lines for focus.
foreground = pc_g.append("svg:g")
    .attr("class", "foreground")
.selectAll("path")
    .data(json)
.enter().append("svg:path")
    .attr("d", path)
.attr('opacity', {{ opacity }})
.attr('stroke', color)
.attr('stroke-width', {{ stroke_width }})
.attr('fill', 'none');

// Add a group element for each dimension.
var g = pc_g.selectAll(".dimension")
    .data(dimensions)
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
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
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
    .each(function(d, i) { d3.select(this).call(axis.scale(y[d])); })
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
    })
.selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);







