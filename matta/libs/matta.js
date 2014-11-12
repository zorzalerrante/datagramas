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

        var symbol_legend = function(sel) {
            console.log('selection', sel);
            sel.each(function(d) {
                console.log('sel each', this, d);
                var range = d.range();
                var domain = d.domain()
                var scale_size = range[1] * 2.05;
                var ticks = d.ticks(4).filter(function(tick) { return tick > 0; });
                var max_r = d(d3.max(ticks));

                d3.select(this).attr('transform', 'translate(' + (position.x - 0.5 * max_r) + ',' + (position.y - max_r - 10) + ')');

                console.log('ticks', ticks);

                var symbol = d3.select(this).selectAll('circle.symbol-legend')
                    .data(ticks);

                symbol.enter()
                    .append('circle')
                    .classed('symbol-legend', true);

                symbol.attr({
                        cx: 0.0,
                        cy: function(tick) { return max_r - d(tick); },
                        r: function(tick) { return d(tick); },
                        fill: '#afafaf',
                        'stroke': '#444',
                        'stroke-width': 1,
                        'opacity': 0.75
                    });

                symbol.exit()
                    .transition()
                    .delay(100)
                    .attr('r', 0)
                    .remove();

                symbol.sort(function(a, b) { return d3.descending(a, b); });

                var label = d3.select(this).selectAll('text.legend-label')
                    .data(ticks);

                label.enter()
                    .append('text')
                    .classed('legend-label', true);

                label.attr({
                    x: 0.0 + max_r + 10,
                    y: function(tick) { return max_r - 2.0 * d(tick); },
                    dy: '0.35em',
                    })
                    .text(function(d) { return d; });

                label.exit()
                    .remove();

                var line = d3.select(this).selectAll('line.symbol-tick')
                    .data(ticks);

                line.enter()
                    .append('line')
                    .classed('symbol-tick', true);

                line.attr({
                        x1: 0.0,
                        x2: 0.0 + max_r + 8,
                        y1: function(tick) { return max_r - 2.0 * d(tick); },
                        y2: function(tick) { return max_r - 2.0 * d(tick); },
                    }).style({
                        'stroke': '#444',
                        'stroke-width': 1,
                        'opacity': 0.75,
                    });

                line.exit()
                    .remove();

                //d3.select(this).call(axis);
            });
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