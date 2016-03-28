define('datagramas', ['d3', 'legend', 'd3-tip'], function(d3, legend, tip) {
    "use strict";

    var datagramas = {};

    // we wrap d3-legend and d3-tip
    datagramas.legend = legend;
    datagramas.tip = tip;

    datagramas.add_css = function(url) {
        d3.select('head').append('link').attr({rel: 'stylesheet', href: url});
    };

    datagramas.move_to_front = function(selection) {
        /**
         * Makes all elements in the selection to be on front (over) other elements in the same group.
         *
         * Source: https://gist.github.com/trtg/3922684
         */
        selection.each(function(){
            this.parentNode.appendChild(this);
        });
    };

    datagramas.prepare_graph = function(graph) {
        /**
         * Sets the expected structure by d3.js on a NetworkX graph.
         */
        if (graph.hasOwnProperty('__datagramas_prepared__') && graph['__datagramas_prepared__'] == true) {
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
        if (graph.hasOwnProperty('graph') && Array.isArray(graph.graph)) {
            graph.graph.forEach(function (d) {
                graph[d[0]] = d[1];
            });
        }

        graph['__datagramas_prepared__'] = true;
        console.log('prepared graph', graph);
    };

    datagramas.scale = function(name) {
        /**
         * Helper function to build scales.
         * In this way, in python we can define scales by name ('linear', 'sqrt', 'log') or exponent (e.g., 0.5).
         */
        if (d3.scale.hasOwnProperty(name)) {
            return d3.scale[name]();
        }

        return d3.scale.pow().exponent(name);
    };

    datagramas.fit_projection = function(width, height, bounding_box) {
        /**
         * Given width and height, and a bounding box, returns the projection parameters to fit the box into the screen.
         * Based on http://bl.ocks.org/mbostock/4573883
         */
        var b = bounding_box;
        var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
        return [s, t];
    };

    datagramas.get = function(obj, path) {
        /**
         * Given a path to an object member (e.g., 'parent.name'), return the object if it exists, null otherwise.
         */
        if (path === null) {
            return null;
        }

        if (typeof(path) === 'number') {
            return obj[path];
        }

        var current = obj;
        var properties = path.split('.');

        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            if (!current.hasOwnProperty(property)) {
                current = null;
                break;
            }

            current = current[property];
        }
        return current;
    };

    datagramas.text_color = function(color) {
        /**
         * Given a color, return a suitable text color.
         * Function extracted from the D3 Plus library at http://d3plus.org/
         */
        var b, g, r, rgbColor, yiq;
        rgbColor = d3.rgb(color);
        r = rgbColor.r;
        g = rgbColor.g;
        b = rgbColor.b;
        yiq = (r * 299 + g * 587 + b * 114) / 1000;
        if (yiq >= 128) {
            return "#444444";
        } else {
            return "#f7f7f7";
        }
    };

    datagramas.to_time_string = function(timedelta) {
        /**
         * Given a timedelta serialized as the number of seconds, returns a string with 'HH:MM:SS' format.
         */
        var duration = moment.duration(timedelta, 'seconds');
        var hours = '' + duration.hours();
        if (hours.length == 1) {
            hours = '0' + hours;
        }
        var minutes = '' + duration.minutes();
        if (minutes.length == 1) {
            minutes = '0' + minutes;
        }

        var seconds = '' + duration.seconds();
        if (seconds.length == 1) {
            seconds = '0' + seconds;
        }
        return hours + ':' + minutes + ':' + seconds;
    };

    datagramas.generate_uuid = function() {
        /**
         * Generates a random unique string.
         *
         * Source: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
         */
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    return datagramas;
});