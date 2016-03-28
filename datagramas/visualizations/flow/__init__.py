import networkx as nx

VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'datagramas', 'sankey'],
    'visualization_name': 'datagramas.flow',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'graph': None,
    },
    'options': {
        'horizontal': False,
        'background_color': None,
        'link_color_legend_enabled': False,
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 150, 'top': 10, 'right': 150, 'bottom': 10},
        'font_size': 10,
        'layout_iterations': 64,
        'link_opacity': 0.95,
        'node_opacity': 0.85,
        'node_width': 15,
        'node_padding': 10,
        'node_label': 'name',
        'link_weight': 'weight',
    },
    'colorables': {
        'node_color': {'value': 'steelblue', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None},
        'link_color': {'value': '#efefef', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None},
    }
}


def PROCESS_CONFIG(config):
    if config['data']['graph'] is not None:
        graph = config['data']['graph']

        if type(graph) not in (nx.DiGraph, nx.MultiDiGraph, nx.OrderedDiGraph, nx.OrderedMultiDiGraph):
            raise Exception('Flow needs a directed networkx graph as input data.')