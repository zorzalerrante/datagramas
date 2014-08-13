
matta.prepare_graph(json);

{% if background_tiles %}
    var rand_bowel = function(d) {
        return ["a", "b", "c"][(d[0] * 31 + d[1]) % {{ n_tile_alternatives }}];
    };
    
    var tile_url = function(d) {
        return "http://" + (rand_bowel(d)) + "." + "{{ tile_base_url }}" + "/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
    };

    var image_layer = svg.append('g').attr('class', 'image-layer');
    var tiler = tile()
        .zoomDelta((window.devicePixelRatio || 1) - .5)
        .size([width, height]);
        
    console.log('tiler', image_layer, tiler());
{% endif %}

var graph_g = svg.append('g').attr('class', 'graph-layer');

var line = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; });

var projection = d3.geo.mercator().center([0, 0]).scale(1)
    .translate([width * 0.5, height * 0.5]);

projection.center(json.centroid.slice(0).reverse());

var b = json.bounding_box.map(function(d) { return projection([d[1], d[0]]); });
console.log('bbox', json.bounding_box, b);

var s = matta.fit_projection(width, height, b)[0];
projection.scale(s);
console.log('projection', projection.scale(), projection.translate());

{% if background_tiles %}
    tiler.scale(projection.scale() * 2.0 * Math.PI)
        .translate(projection([0, 0]));
    
    var bg_tiles = tiler();
    console.log('bg_tiles', bg_tiles);
    
    var img = image_layer.selectAll("image.tile")
        .data(bg_tiles);
        
    img.enter()
        .append("image")
        .attr('class', 'tile')
        .attr("xlink:href", tile_url)
        .attr('opacity', {{ tile_opacity }})
        .attr("width", Math.round(bg_tiles.scale))
        .attr("height", Math.round(bg_tiles.scale))
        .attr("x", function(d) {
            return Math.round((d[0] + bg_tiles.translate[0]) * bg_tiles.scale);
        })
        .attr("y", function(d) {
            return Math.round((d[1] + bg_tiles.translate[1]) * bg_tiles.scale);
        });
{% endif %}

json.nodes.forEach(function(d) {
    var xy = projection([d.longitude, d.latitude]);
    d.x = xy[0];
    d.y = xy[1];
});

var node = graph_g.selectAll('circle.node')
    .data(json.nodes.filter(function(d) { return d.leaf; }));

node.enter()
    .append('circle')
    .attr({class: 'node', r: 1.5, fill: 'black', opacity: 0.5})
    .each(function(d) {
        d3.select(this).attr({cx: d.x, cy: d.y});
    });

//return;
{% if links %}
    {% if bundle_links %}
        var bundle = d3.layout.bundle();
        
        line.interpolate("bundle")
            .tension({{ tension }});
            
        var links = bundle(json.links);
        console.log(links);
    
        var link = graph_g.selectAll('path')
                .data(links);

        link.enter()
                .append('path')
                .attr('d', line);
    {% elif force_bundle_links %}
        var fbundling = force_edge_bundling()
            .step_size({{ force_edge_step_size }})
            .compatibility_threshold({{ force_edge_compatibility_threshold }})
            .bundling_stiffness({{ force_edge_bundling_stiffness }})
            .cycles({{ force_edge_cycles }})
            .iterations({{ force_edge_iterations }})
            .nodes(json.nodes)
            .edges(json.links);
            
        var links = fbundling();     
        
        line.interpolate("linear");
        console.log(links);
        var link = graph_g.selectAll('path')
                .data(links);
                
        link.enter()
                .append('path')
                .attr('d', line);
    {% else %}
        var link = graph_g.selectAll('path')
            .data(json.links);
            
        link.enter()
            .append('path')
            .attr('d', function(d) {
                var parts = [d.source, d.target];
                console.log('link', d);
                return line(parts);
            });
    {% endif %}
    
        link.attr({stroke: 'steelblue', opacity: {{ link_opacity }}, fill: 'none'});
        
{% endif %}

var centroids = graph_g.selectAll('circle.centroid')
        .data(json.nodes.filter(function(d) { return d.depth == 1; }))
        .enter()
        .append('circle')
        .attr({class: 'node', r: 3.0, fill: 'red', opacity: 0.5})
        .each(function(d) {
            d3.select(this).attr({cx: d.x, cy: d.y});
        });
        
var root = graph_g.selectAll('circle.centroid')
        .data(json.nodes.filter(function(d) { return d.depth == 0; }))
        .enter()
        .append('circle')
        .attr({class: 'node', r: 5.0, fill: 'green', opacity: 0.5})
        .each(function(d) {
            d3.select(this).attr({cx: d.x, cy: d.y});
            console.log('root', d);
        });
        

