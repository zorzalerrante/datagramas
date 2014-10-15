define("matta", ["d3"], function(d3) {
    var matta = {};

    matta.add_css = function(url) {
        d3.select('head').append('link').attr({rel: 'stylesheet', href: url});
    };

    // sets style attr only if the property exists in every object in the selection.
    matta.styler = function(attr, property) {
        return function(sel) {
            sel.each(function(d) {
                if (d.hasOwnProperty(property)) {
                    d3.select(this).style(attr, d[property]);
                }
            });
        };
    };
    
    matta.labeler = function() {
        return function(sel) {
            sel.each(function(d) {
                if (d.hasOwnProperty('label')) {
                    d3.select(this).text(d.label);
                } else if (d.hasOwnProperty('name')) {
                    d3.select(this).text(d.name);
                } else if (d.hasOwnProperty('id')) {
                    d3.select(this).text(d.id);
                }
            });
        };
    };
    
    matta.prepare_graph = function(graph) {
        var node_map = d3.map();

        graph.nodes.forEach(function(d) {
            node_map.set(d.id, d);
        });
        
        graph.nodes.forEach(function(d) {
            if (d.parent != null) {
                d.parent = node_map.get(d.parent);
            }
        });

        graph.links.forEach(function(d) {
            d.source = graph.nodes[d.source];
            d.target = graph.nodes[d.target];
        });

    // graph attributes
        graph.graph.forEach(function(d) {
            graph[d[0]] = d[1];
        });

        console.log('prepared graph', graph);
    };
    
    // from Mike Bostock
    matta.fit_projection = function(width, height, bounding_box) {
        var b = bounding_box;
        var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        return [s, t];
    };

    // legends and labels
    matta.symbol_legend = function() {
        var position = {x: 0, y: 0};
        var width = 300;
        var scale = d3.scale.pow().exponent(1).range([0, width]);

        var axis = d3.svg.axis()
            .orient('bottom')
            .scale(scale)
            .tickSize(5);

        var symbol_legend = function(sel) {
            console.log('selection', sel);
            sel.each(function(d) {
                console.log('sel each', this, d);
                var range = d.range();
                var domain = d.domain()
                var scale_size = range[1] * 2.05;
                d3.select(this).attr('transform', 'translate(' + (position.x - 0.5 * width) + ',' + (position.y) + ')');

                var ticks = d.ticks(4);
                //axis.ticks(4);

                scale.domain(domain);
                console.log('ticks', ticks);
                axis.tickValues(ticks);

                var symbol = d3.select(this).selectAll('circle.symbol-legend')
                    .data(ticks);

                symbol.enter()
                    .append('circle')
                    .classed('symbol-legend', true);

                symbol.attr({
                        cx: scale,
                        cy: -scale_size * 0.5,
                        r: function(tick) { return d(tick); },
                        fill: '#afafaf',
                        stroke: '#444',
                        'stroke-width': 1,
                        'opacity': 0.75
                    });

                symbol.exit()
                    .transition()
                    .delay(100)
                    .attr('r', 0)
                    .remove();

                d3.select(this).call(axis);
            });
        };

        symbol_legend.width = function(_) {
            if (arguments.length) {
                width = _;
                scale.range([0, width]);
                return symbol_legend;
            }
            return width;
        };

        symbol_legend.position = function(_) {
            if (arguments.length) {
                position = _;
                return symbol_legend;
            }
            return position;
        };

        return symbol_legend;
    };
    
    return matta;
});