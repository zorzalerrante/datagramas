from scipy.constants import golden_ratio

VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'datagramas'],
    'visualization_name': 'datagramas.treemap',
    'figure_id': None,
    'container_type': 'div',
    'data': {
        'tree': None,
    },
    'options': {
        'background_color': None,
        'fit_labels': False,
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'target_ratio': golden_ratio,
        'node_padding': 0,
        'mode': 'squarify',
        'node_value': 'value',
        'node_children': 'children',
        'node_id': 'id',
        'node_label': None,
        'font_size': 12,
        'node_border': 1,
        'border_color': '#777',
        'sticky': True,
        'label_leaves_only': True,
        # < 0: paint only leaves.
        'color_level': -1,
    },
    'colorables': {
        'node_color': {'value': 'parent.name', 'scale': 'ordinal', 'palette': 'husl', 'n_colors': 15, 'legend': False}
    }
}