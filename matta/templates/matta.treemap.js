

{% if categories %}
    var categories = {{ categories }};
    var color = d3.scale.category20b().domain(d3.keys(categories));
{% else %}
    var color = d3.scale.category20c();
{% endif %}

var target_angle = Math.atan2(1.0 / {{ ratio }}, 1.0);
console.log('target angle', target_angle);

{% if fit_labels %}
    var font_scale = d3.scale.linear().domain([width * height * 0.05, width * height]).range([{{ font_size}}, 120]).clamp(true);
    var font_ratio = d3.scale.linear().domain([0, target_angle]).range([80, 8]).clamp(true);

    var calc_fontsize = function(d) {
        var angle = Math.atan2(d.dy, d.dx);
        var diff = 1.0 - Math.abs(angle - target_angle);
        
        var ratio_size = font_ratio(Math.abs(angle - target_angle));
        var diag_size = font_scale(d.dy * d.dx);
        return ((0.9 * diag_size) + (0.1 * ratio_size));
    };

    var adapt_fontsize = function(node, target_fs, target_w, target_h) {
        var width = node.scrollWidth;
        var height = node.scrollHeight;
        console.log(node, target_fs, height, target_h);
        var ratio = target_h / height;
        d3.select(node).style("font-size", (target_fs * Math.sqrt(ratio)) + "px")
    };
{% else %}
    var calc_fontsize = d3.functor({{ font_size }});
{% endif %}

var treemap = d3.layout.treemap()
    .size([width, height])
    .value(function(d) { return d.size; })
    .children(function(d) { return d.children; })
    .padding({{ padding }})
    .ratio({{ ratio }})
    .mode("{{ treemap_mode }}")
    .sticky(true);
    
var cell = container.datum(json)
    .selectAll("div.node")
    .data(treemap.nodes, function(d) { return d.name; });

cell.enter()
    .append("div")
    .each(function(d) {
        var node = d3.select(this);

        var node_tweet = node.append("div")
            .attr("class", "node-text");
    })
    .style("background", function(d) { return d.children ? color(d.name) : null; })
    .style("font-size", function(d) { return calc_fontsize(d) + "px"; });

cell.selectAll("div.node-text").call(matta.labeler());
    
cell.attr("class", function(d) {
        var base_class = "node node-depth-" + d.depth;
        if (d.dx < d.dy) {
            base_class += ' tall-node';
        } else {
            base_class += ' wide-node';
        }

        if (d.dx < 100 || d.dy < 100) {
            base_class += ' small-node';
        }
        return base_class;
    })
    .style("left", function(d) { return d.x + "px"; })
    .style("top", function(d) { return d.y + "px"; })
    .style("width", function(d) { return Math.max(0, d.dx - (2 * {{ border }})) + "px"; })
    .style("height", function(d) { return Math.max(0, d.dy - (2 * {{ border }})) + "px"; })
    {% if fit_labels %}
    .each(function(d) {
        adapt_fontsize(this, calc_fontsize(d), d.dx, d.dy);
    })
    {% endif %}
    ;




