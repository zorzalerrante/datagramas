var fn_collide = function(node) {
    var nx1, nx2, ny1, ny2, r;
    r = _node_ratio(node) + _node_padding;
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
            r2 = r + _node_ratio(quad.point);

            if (l < r2) {
                l = (l - r2) / l * 0.5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
};