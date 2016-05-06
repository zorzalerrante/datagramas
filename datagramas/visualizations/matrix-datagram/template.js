datagramas.prepare_graph(_data_graph);

var matrix = new Array(_data_graph.nodes.length);

//Agrega la propiedad index a cada nodo con el valor del indice.
_data_graph.nodes.forEach(function(node, i) {
    node[_index_name] = i;
    matrix[i] = new Array(_data_graph.nodes.length);
});

// Insertar valores a la matriz. El valor de un elemento de la matriz es un objeto link.
_data_graph.links.forEach(function(link) {
    var src_index = datagramas.get(link.source, _index_name);
    var dst_index = datagramas.get(link.target, _index_name);

    matrix[src_index][dst_index] = link;
    
    if (!_data_graph.directed) { //Cuando el grafo no es dirigido se duplica el valor del elemento de la matriz con la dirección opuesta.
        var other = {};
        var k;

        for (k in link) {
            if (link.hasOwnProperty(k)) {
                other[k] = link[k];
            }
        }

        other.source = link.target;
        other.target = link.source;

        matrix[dst_index][src_index] = other;
    }
});

//Si se entrega un valor como parámetro a las casillas que no tienen valor desde el grafo.
if (_na_value !== null){
    d3.range(0, _data_graph.nodes.length).forEach(function(i) {
        d3.range(0, _data_graph.nodes.length).forEach(function(j) {
            if (matrix[i][j] == undefined) {                
                matrix[i][j] = {};
                datagramas.set(matrix[i][j], _item_color_value, _na_value);              
            }
            else{
                var existe_propiedad = datagramas.get(matrix[i][j],_item_color_value );
                if(existe_propiedad == null){ //No existe la propiedad en el enlace entonces se crea
                    datagramas.set(matrix[i][j], _item_color_value, _na_value);
                }
            }
            
        });
    });
}

//En el caso de querer color normalizado por fila // EDU: hice que la norma calculada fuese parametrizable. color relativo es un número así que color relativo puede ser mayor a 0
if (_row_normalization_exponent > 0) {
    normalize(matrix);
}

var proxy_links = [];
matrix.forEach(function(row) {
    row.forEach(function(d) {
        proxy_links.push(d);
    });
});

//Recorrer los nombres nodos y por cada uno agregar un text en container
_data_graph.nodes.forEach(function(node, i) {
        container.append('text').attr("class", "text_hidden")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .text(function() {
            return datagramas.get(_data_graph.nodes[i], _node_label);
        })
        .style("visibility","hidden");
});

//Ajustar verticalmente y horizontalmente la matriz, respecto a los textos.
var etiquetas = container.selectAll('.text_hidden');
var anchos = [];

etiquetas.each(function(d) {
    anchos.push(this.getBBox().width);
});

var max_ancho_texto = d3.max(anchos);

var height_matriz = _vis_height - max_ancho_texto - 35;
var y = d3.scale.ordinal().rangeBands([0, height_matriz]);
 
var width_matriz = _vis_width - max_ancho_texto - 35;
var x = d3.scale.ordinal().rangeBands([0, width_matriz]);

var container_vis;
if (container.select('g').empty()) {
    container_vis = container.append("g");
    container_vis.attr("transform", "translate(" + (max_ancho_texto+35) + ", " + (max_ancho_texto+35) + ")");
} else{
    container_vis = container.select("g");
}


// ahora el atributo que tiene los valores es un parámetro opcional
_item_color_update_scale_func(proxy_links, _row_normalization_exponent > 0 ? _normalized_value_name : _item_color_value);
_column_color_update_scale_func(_data_graph.nodes);


x.domain(d3.range(_data_graph.nodes.length).sort(function(a, b) {
    return d3.ascending(datagramas.get(_data_graph.nodes[a], _order_by), datagramas.get(_data_graph.nodes[b], _order_by));
}));

y.domain(d3.range(_data_graph.nodes.length).sort(function(a, b) {
    return d3.ascending(datagramas.get(_data_graph.nodes[a], _order_by), datagramas.get(_data_graph.nodes[b], _order_by));
}));

var dist_text_rectinf = 5; //Distancia horizontal entre el texto (por fila) y el rect de color que informa sector
var dist_rectinf_matrix = 10; //Distancia horizontal entre rect de color que informa sector y matriz
var dist_text_matrix = dist_text_rectinf + _node_info_length + dist_rectinf_matrix; //Distancia horizontal entre el texto y la matriz.

var row = container_vis.selectAll(".row")
    .data(matrix);

row.enter().append("g")
   .attr("class", "row")
   .attr("transform", function(d, i) {
       return "translate(0," + y(i) + ")";
   });

var tran = container_vis.transition().duration(_transition_duration);

tran.selectAll(".row")
    .delay(function(d, i) {
        return x(i) * 4;
    })
    .attr("transform", function(d, i) {
        return "translate(0," + y(i) + ")";
    })
    .selectAll(".cell")
        .delay(function(d, j) {
            return x(j) * 4;
        })
        .attr("x", function(d, j) {
            return x(j);
        });

row.each(draw_row);

row.each(function(d, i) {

    var l = d3.select(this).selectAll('line').data([1]);

    l.enter().append("line");

    l.style("stroke", _grid_color)
        .attr("x2", width_matriz);

    l.exit().remove();

    var t = d3.select(this).selectAll('text').data([1]);

    t.enter().append('text');

    t.attr("x", -dist_text_matrix)
        .attr("y", y.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "end")
        .attr('font-size', _label_font_size)
        .text(function() {
            return datagramas.get(_data_graph.nodes[i], _node_label);
        });        

    //Para crea la columna informativa al lado de los textos 
    var column_inf = d3.select(this).selectAll(".col_inf").data([1]);

    column_inf.enter().append('rect').attr("class", "col_inf");

    column_inf.attr("x", -(_node_info_length + dist_rectinf_matrix))
        .attr("y", 0)
        .attr("width",  _node_info_length)
        .attr("height", y.rangeBand()-2)
        .attr("fill", function(){
            return _column_color(_data_graph.nodes[i]);
        });

    t.exit().remove();
});

row.exit().remove();

var column = container_vis.selectAll(".column")
    .data(matrix);

//Cuando se crean por primera vez los elementos .column
column.enter().append("g")
    .attr("class", "column")
    .attr("transform", function(d, i) {
        return "translate(" + x(i) + ")rotate(-90)";
    });

tran.selectAll(".column")
    .delay(function(d, i) { return x(i) * 4; })
    .attr("transform", function(d, i) {
        return "translate(" + x(i) + ")rotate(-90)";
    });


column.each(function(d, i) {
    var l = d3.select(this).selectAll('line').data([1]);

    l.enter().append("line");

    l.style("stroke", _grid_color)
     .attr("x1", - height_matriz);

    l.exit().remove();

    var t = d3.select(this).selectAll('text').data([1]);

    t.enter().append("text");

    t.attr("x", dist_text_matrix)
        .attr("y", x.rangeBand() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .attr('font-size', _label_font_size)
        .text(function() {
            return datagramas.get(_data_graph.nodes[i], _node_label);
        });
    
    //Para crear la fila informativa al lado de los textos 
    var fila_inf = d3.select(this).selectAll('.fila_inf').data([1]);

    fila_inf.enter().append('rect').attr("class", "fila_inf");

    fila_inf.attr("x", dist_rectinf_matrix)
        .attr("y", 0)
        .attr("width",  _node_info_length)
        .attr("height", x.rangeBand()-2)
        .attr("fill", function(){
            return _column_color(_data_graph.nodes[i]);
        });

    t.exit().remove();
});

column.exit().remove();


//Selecciona todas las celdas de la matriz para colorearlas.
container_vis.selectAll('.row')
    .selectAll("rect.cell")
    .attr("fill", function(d) {
        if (d === undefined) {
            return _na_color;
        }

        return datagramas.get(d,_item_color_value) !== null ? cell_color(d) : _na_color;
    });

