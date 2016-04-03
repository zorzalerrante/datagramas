import networkx as nx


VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'datagramas'],
    'visualization_name': 'datagramas.circlepack',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'tree': None,
    },
    'options': {
        'background_color': None,
        'fit_labels': False,
        'allowed_events': ['node_selection_enter', 'node_selection_exit', 'node_click']
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'node_padding': 0,
        'node_value': 'value',
        'node_opacity': 0.25,
        'node_children': 'children',
        'node_id': 'id',
        'node_label': None,
        'font_size': 14,
        'node_border': 1,
        'node_border_color': 'rgb(31, 119, 180)',
        'label_leaves_only': True,
        # < 0: paint only leaves.
        'color_level': -1,
    },
    'colorables': {
        'node_color': {'value': 'parent.id', 'scale': 'ordinal', 'palette': 'husl', 'n_colors': 15, 'legend': False}
    },
    'events': {
        'node_click': None,
        'node_selection_enter': None,
        'node_selection_exit': None
    }
}


def PROCESS_CONFIG(config):
    if config['data']['tree'] is not None:
        tree = config['data']['tree']

        if type(tree) not in (nx.DiGraph, nx.MultiDiGraph, nx.OrderedDiGraph, nx.OrderedMultiDiGraph):
            raise Exception('Circle Pack needs a directed networkx graph as input data.')

        if not nx.is_arborescence(tree):
            raise Exception('Circle Pack needs a tree as input.')

        if 'root' not in tree.graph:
            raise Exception('Circle Pack needs a \'root\' attribute in the graph.')