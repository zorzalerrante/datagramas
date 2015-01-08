define("force_directed", ["d3"], function(d3) {

  var matta_force_directed = function() {
    var charge, clamp_to_viewport, collide, collision_detection, color, force, force_directed, gravity, height, link_distance, link_strength, node_radius, painter, svg, use_links, width, node_padding;
    collide = function(node) {
      var nx1, nx2, ny1, ny2, r;
      r = node_radius + node_padding;
      nx1 = node.x - r;
      nx2 = node.x + r;
      ny1 = node.y - r;
      ny2 = node.y + r;
      return function(quad, x1, y1, x2, y2) {
        var l, r2, x, y;
        if (quad.point && quad.point !== node) {
          x = node.x - quad.point.x;
          y = node.y - quad.point.y;
          l = Math.sqrt(x * x + y * y);
          r2 = r + node_radius;
          if (l < r2) {
            l = (l - r2) / l * .5;
            node.x -= x *= l;
            node.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      };
    };
    width = 1024;
    height = 768;
    charge = -80;
    link_distance = 300;
    node_padding = 10;
    node_radius = 24;
    collision_detection = false;
    clamp_to_viewport = false;
    use_links = false;
    gravity = 0.1;
    painter = null;
    color = d3.scale.category20();
    force = d3.layout.force().charge(charge).linkDistance(function(a) {
      if (a.hasOwnProperty('distance')) {
        return a.distance;
      }
      return link_distance;
    }).linkStrength(function(a) {
      if (a.hasOwnProperty('weight')) {
        return a.weight;
      }
      return 1.0;
    }).size([width, height]).gravity(gravity);
    svg = null;
    force_directed = function(selection) {
      return selection.each(function(graph) {
        var id_map, link, link_g, node, node_g, node_map;
        svg = d3.select(this);
        id_map = {};
        node_map = {};
        force.nodes(graph.nodes);
                            
        if (use_links) {
          force.links(graph.links);
        }
        
        link_g = svg.append('g').attr('class', 'links');
        link = link_g.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link").style("stroke-width", function(d) {
          return 1;
        });
        node_g = svg.append('g').attr('class', 'nodes');
        node = node_g.selectAll("g.node").data(graph.nodes).enter().append('g').attr('class', 'node');
        if (painter) {
          node.call(painter);
        }
        force.on("tick", function(e) {
          var q;
          if (collision_detection) {
            q = d3.geom.quadtree(graph.nodes);
            graph.nodes.forEach(function(n, i) {
              return q.visit(collide(n));
            });
          }
          if (clamp_to_viewport) {
            graph.nodes.forEach(function(n, i) {
              n.x = Math.max(node_radius, Math.min(width - node_radius, n.x));
              return n.y = Math.max(n.r, Math.min(height - node_radius, n.y));
            });
          }
          if (use_links) {
            link.attr("x1", function(d) {
              return d.source.x;
            }).attr("y1", function(d) {
              return d.source.y;
            }).attr("x2", function(d) {
              return d.target.x;
            }).attr("y2", function(d) {
              return d.target.y;
            });
          } else {
            link.attr("x1", function(d) {
              return node_map[d.source].x;
            }).attr("y1", function(d) {
              return node_map[d.source].y;
            }).attr("x2", function(d) {
              return node_map[d.target].x;
            }).attr("y2", function(d) {
              return node_map[d.target].y;
            });
          }
          node.attr("transform", function(d) {
            return "translate(" + (d.x - node_radius) + ", " + (d.y - node_radius) + ")";
          });
        });
        
        force.start();
      });
    };
    force_directed.force = function() {
      return force;
    };
    force_directed.painter = function(_) {
      if (!arguments.length) {
        return painter;
      }
      painter = _;
      return force_directed;
    };
    force_directed.clamp_to_viewport = function(_) {
      if (!arguments.length) {
        return clamp_to_viewport;
      }
      clamp_to_viewport = _;
      return force_directed;
    };
    force_directed.collision_detection = function(_) {
      if (!arguments.length) {
        return collision_detection;
      }
      collision_detection = _;
      return force_directed;
    };
    force_directed.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      width = _;
      force.size([width, height]);
      return force_directed;
    };
    force_directed.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      height = _;
      force.size([width, height]);
      return force_directed;
    };
    force_directed.node_radius = function(_) {
      if (!arguments.length) {
        return node_radius;
      }
      node_radius = _;
      return force_directed;
    };
    force_directed.draw_links = function(_) {
      if (!arguments.length) {
        return use_links;
      }
      use_links = _;
    };
    force_directed.charge = function(_) {
      if (!arguments.length) {
        return charge;
      }
      charge = _;
      force.charge(charge);
      return force_directed;
    };
    force_directed.gravity = function(_) {
      if (!arguments.length) {
        return gravity;
      }
      gravity = _;
      force.gravity(gravity);
      return force_directed;
    };
    force_directed.link_distance = function(_) {
      if (!arguments.length) {
        return link_distance;
      }
      link_distance = _;
      return force_directed;
    };
    return force_directed;
  };

  return matta_force_directed;

});
