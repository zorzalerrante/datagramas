VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.circlepack',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'tree': None,
    },
    'options': {
        'background_color': None,
        'fit_labels': False,
        'events': ['node_click']
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'node_padding': 0,
        'node_value': 'value',
        'node_opacity': 0.25,
        'node_color': 'rgb(31, 119, 180)',
        'node_children': 'children',
        'node_id': 'id',
        'node_label': None,
        'font_size': 14,
        'node_border': 1,
        'node_border_color': 'rgb(31, 119, 180)',
        'sticky': True,
        'label_leaves_only': True
    },
}
