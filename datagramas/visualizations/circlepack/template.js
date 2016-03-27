
var diameter = Math.min(_vis_width, _vis_height),
    format = d3.format(",d");

var pack = d3.layout.pack()
    .size([diameter - 4, diameter - 4])
    .value(function(d) { return d[_node_value]; });

var node = container.datum(_data_tree).selectAll('.node')
    .data(pack.nodes);

node.enter().append('g').each(function(d) {
    var self = d3.select(this);
    self.append('circle');
    self.append('text');
});

node.attr('class', function(d) { return d.children ? "node node-depth-" + d.depth  : "node-leaf node node-depth-" + d.depth; })
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

node.selectAll('circle')
    .attr({
        'r': function(d) { return d.r - _node_padding; },
        'fill-opacity': _node_opacity,
        'fill': _node_color,
        'stroke-width': _node_border,
        'stroke': _node_border_color
    }).on('click', function(d, i) {
        _dispatcher.node_click.apply(this, arguments);
    });


node.selectAll('text').call(datagramas.labeler(_node_label));
