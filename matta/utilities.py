import networkx as nx

def graph_from_dataframe(df, src_col, dst_col, edge_col='weight', src_label_format=None, dst_label_format=None,
                         edge_attrs=None):
    graph = nx.DiGraph()

    col_name_map = dict(zip(df.columns, range(1, df.columns.shape[0] + 1)))

    src_idx = col_name_map[src_col]
    dst_idx = col_name_map[dst_col]
    if edge_col is not None:
        edge_idx = col_name_map[edge_col]
    else:
        edge_idx = None

    if src_label_format is None:
        src_label_format = lambda x: x

    if dst_label_format is None:
        dst_label_format = lambda x: x

    for row in df.itertuples(index=True):
        if edge_idx and row[edge_idx] <= 0.0:
            continue

        src = src_label_format(row[src_idx])
        dst = dst_label_format(row[dst_idx])

        if not graph.has_node(src):
            graph.add_node(src)
        if not graph.has_node(dst):
            graph.add_node(dst)
            
        if edge_idx:
            e_attrs = {'weight' : float(row[edge_idx])}
        else:
            e_attrs = {}

        if callable(edge_attrs):
            e_attrs.update(edge_attrs(src_idx, dst_idx, row))
            
        #print src, dst, e_attrs
        graph.add_edge(src, dst, **e_attrs)

    return graph