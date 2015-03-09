define("matta", ["d3"], function(d3) {
    "use strict";

    var matta = {};

    matta.add_css = function(url) {
        d3.select('head').append('link').attr({rel: 'stylesheet', href: url});
    };

    matta.move_to_front = function(selection) {
        /**
         * Makes all elements in the selection to be on front (over) other elements in the same group.
         *
         * Source: https://gist.github.com/trtg/3922684
         */
        selection.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    matta.styler = function(attr, property) {
        /**
         * Sets style attr only if the property exists in every object in the selection.
         */
        return function(sel) {
            sel.each(function(d) {
                if (d.hasOwnProperty(property)) {
                    d3.select(this).style(attr, d[property]);
                }
            });
        };
    };
    
    matta.labeler = function(property_name) {
        /**
         * Fills a text element using several predefined properties, or the specified property_name if needed.
         */
        return function(sel) {
            sel.each(function(d) {
                if (property_name !== null && d.hasOwnProperty(property_name)) {
                    d3.select(this).text(d[property_name]);
                } else if (d.hasOwnProperty('label')) {
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
        /**
         * Sets the expected structure on a NetworkX graph.
         */
        if (graph.hasOwnProperty('__matta_prepared__') && graph['__matta_prepared__'] == true) {
            return;
        }

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

        graph['__matta_prepared__'] = true;
        console.log('prepared graph', graph);
    };

    matta.scale = function(name) {
        /**
         * Helper function to build scales.
         * In this way, in python we can define scales by name ('linear', 'sqrt', 'log') or exponent (e.g., 0.5).
         */
        if (d3.scale.hasOwnProperty(name)) {
            return d3.scale[name]();
        }

        return d3.scale.pow().exponent(name);
    };

    matta.fit_projection = function(width, height, bounding_box) {
        /**
         * Given width and height, and a bounding box, returns the projection parameters to fit the box into the screen.
         * Based on http://bl.ocks.org/mbostock/4573883
         */
        var b = bounding_box;
        var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        return [s, t];
    };

    matta.symbol_legend = function() {
        /**
         * Displays a symbol legend for bubble charts.
         */
        var position = {x: 0, y: 0};
        var width = 300;

        var symbol_legend = function(sel) {
            console.log('selection', sel);
            sel.each(function(d) {
                var g;
                if (!d3.select(this).select('g.axis.symbol-legend').empty()) {
                    g = d3.select(this).select('g.axis.symbol-legend');
                } else {
                    g = d3.select(this).append('g')
                        .classed('axis symbol-legend', true);
                }

                var range = d.range();
                var domain = d.domain()
                var scale_size = range[1] * 2.05;
                var ticks = d.ticks(4).filter(function(tick) { return tick > 0; });
                var max_r = d(d3.max(ticks));

                g.attr('transform', 'translate(' + (position.x - 0.5 * max_r) + ',' + (position.y - max_r - 10) + ')');

                console.log('ticks', ticks);

                var symbol = g.selectAll('circle.symbol-legend')
                    .data(ticks);

                symbol.enter()
                    .append('circle')
                    .classed('symbol-legend ', true);

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

                var label = g.selectAll('text.legend-label')
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

                var line = g.selectAll('line.symbol-tick')
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

    matta.color_thresholds = function(){
        /**
         * Displays a threshold legend.
         * Based on http://bl.ocks.org/mbostock/4573883
         */
        var threshold_width = 200;
        var threshold_height = 8;
        var threshold_position = {x: 0, y: 0};
        var extent = [0, 1];
        var title = null;
        var tick_size = 13;
        var font_size = 11;

        var color_thresholds = function(sel) {
            sel.each(function(color_scale) {
                console.log('threshold scale', color_scale, d3.select(this));
                var g;

                if (!d3.select(this).select('g.axis.threshold-legend').empty()) {
                    g = d3.select(this).select('g.axis.threshold-legend');
                } else {
                    g = d3.select(this).append('g')
                        .classed('axis threshold-legend', true);
                }

                g.attr('transform', 'translate(' + threshold_position.x + ',' + (threshold_position.y + 6 + font_size) + ')');

                var x = d3.scale.linear()
                    .domain([extent[0], extent[extent.length - 1]])
                    .range([0, threshold_width]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickSize(tick_size)
                    .tickValues(color_scale.domain());
                    //.tickFormat(function(d) { return d === .5 ? formatPercent(d) : formatNumber(100 * d); });

                g.selectAll("rect")
                    .data(color_scale.range().map(function(color) {
                      var d = color_scale.invertExtent(color);
                      if (d[0] == null) d[0] = x.domain()[0];
                      if (d[1] == null) d[1] = x.domain()[1];
                      return d;
                    }))
                  .enter().append("rect")
                    .attr("height", threshold_height)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                    .style("fill", function(d) { return color_scale(d[0]); });

                g.call(xAxis).append("text")
                    .attr({
                        'class': 'caption',
                        'y': -6,
                        'font-size': font_size
                    })
                    .text(title);
            });
        };

        color_thresholds.position = function(_) {
            if (arguments.length) {
                threshold_position = _;
                return color_thresholds;
            }
            return threshold_position;
        };

        color_thresholds.extent = function(_) {
            if (arguments.length) {
                extent = _;
                return color_thresholds;
            }
            return extent;
        };

        color_thresholds.width = function(_) {
            if (arguments.length) {
                threshold_width = _;
                return color_thresholds;
            }
            return threshold_width;
        };

        color_thresholds.height = function(_) {
            if (arguments.length) {
                threshold_height = _;
                return color_thresholds;
            }
            return threshold_height;
        };

        color_thresholds.title = function(_) {
            if (arguments.length) {
                title = _;
                return color_thresholds;
            }
            return title;
        };

        return color_thresholds;
    };
    
    return matta;
});