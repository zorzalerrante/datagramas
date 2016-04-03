import networkx as nx


def dataframe_to_geojson_points(df, lat_col='lat', lon_col='lon', idx_col=None, properties_fn=None):
    """
    Creates a GeoJSon structure with a point for each row of the DataFrame.

    :param df:
    :param lat_col: latitude column (y)
    :param lon_col: longitude column (x)
    :return: GeoJSON list of points.
    """
    geojson = {
        'type': 'FeatureCollection',
        'features': []
    }

    for idx, row in df.iterrows():
        feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [row[lon_col], row[lat_col]]
            },
            'properties': {
                'id': idx if idx_col is None else row[idx_col]
            },
            'id': idx if idx_col is None else row[idx_col]
        }

        if callable(properties_fn):
            feature['properties'].update(properties_fn(idx, row))

        geojson['features'].append(feature)

    return geojson


def dataframe_to_graph(df, src_col, dst_col, edge_col='weight', src_label_format=None, dst_label_format=None,
                       node_attrs=None, edge_attrs=None):
    """
    Generates a NetworkX graph from a long-form pandas DataFrame.

    :param df: the source dataframe. It has to be long-form (1 row per observation).
    :param src_col: the column used as source for edges.
    :param dst_col: the column used as target for edges.
    :param edge_col: the column used as edge weight -- (default: 'weight')
    :param src_label_format: a function that runs over the edge source (e.g., to add a suffix or prefix to the name)
    :param dst_label_format: a function that runs over the edge target (e.g., to add a suffix or prefix to the name)
    :param edge_attrs: a function that runs over the edge source (e.g., to add a suffix or prefix to the name)
    :return:
    """
    graph = nx.DiGraph()

    if src_label_format is None:
        src_label_format = lambda x: x

    if dst_label_format is None:
        dst_label_format = lambda x: x

    for idx, row in df.iterrows():
        if edge_col and row[edge_col] <= 0.0:
            continue

        src = src_label_format(row[src_col])
        dst = dst_label_format(row[dst_col])

        if not graph.has_node(src):
            attrs = node_attrs(row[src_col], row, 'source') if callable(node_attrs) else None
            graph.add_node(src, attr_dict=attrs)
        if not graph.has_node(dst):
            attrs = node_attrs(row[dst_col], row, 'target') if callable(node_attrs) else None
            graph.add_node(dst, attr_dict=attrs)
            
        if edge_col:
            e_attrs = {'weight': float(row[edge_col])}
        else:
            e_attrs = {}

        if edge_attrs and callable(edge_attrs):
            attrs = edge_attrs(row[src_col], row[dst_col], row)
            if attrs:
                e_attrs.update(attrs)
        elif edge_attrs:
            e_attrs.update({k: row[k] for k in edge_attrs})

        graph.add_edge(src, dst, **e_attrs)

    return graph
