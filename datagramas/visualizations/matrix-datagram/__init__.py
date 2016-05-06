

VISUALIZATION_CONFIG = {
    'authors': 'Morin Roa and Eduardo Graells, based on code by Mike Bostock',
    'requirements': ['d3', 'datagramas'],
    'visualization_name': 'datagramas.matrix',
    'figure_id': None,
    'container_type': 'svg', 
    'data': {
        'graph': None,
    },
    'options': {
        'background_color': None,
        'allowed_events': ['node_click', 'cell_click']
    },
    'variables': {
        'order_by': 'id',
        'width': 960,
        'height': 960,
        'padding': {'left': 100, 'top': 100, 'right': 100, 'bottom': 50},
        'node_label': 'id',
        'na_value': None,
        'na_color': None,
        'row_normalization_exponent': 0,
        'normalized_value_name': 'normalized_weight',
        'grid_color': 'white',
        'index_name': 'index',
        'norm_epsilon': 0.00000001,
        'transition_duration': 1000,
        'label_font_size': 12,
        'node_info_length': 10
    },
    'colorables': {
        'item_color': {'value': 'grey', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None},
        'column_color': {'value': 'grey', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None}
    }
}