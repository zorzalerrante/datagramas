VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.force',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'graph': None,
    },
    'options': {
        'background_color': None,
        'use_webcola': True
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 30, 'top': 30, 'right': 30, 'bottom': 30},
        'force_gravity': 0.1,
        'force_charge': -30,
        'link_distance': 150,
        'link_strength': 1,
        'charge_distance': 1000,
        'friction': 0.9,
        'font_size': 10,
        'node_id': 'id',
        'node_labels': True,
        'theta': 0.8,
        'alpha': 0.1,
        'node_padding': 4,
        'avoid_collisions': True,
        'clamp_to_viewport': False,
    },
    'attributes': {
        'node_ratio': {'min': 8, 'max': 16, 'value': None, 'scale': 'linear'},
        'link_opacity': {'min': 0.5, 'max': 1.0, 'value': None, 'scale': 'linear'},
        'link_width': {'min': 0.5, 'max': 1.0, 'value': None, 'scale': 'linear'},
    },
    'colorables': {
        'node_color': {'value': 'steelblue', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None},
        'link_color': {'value': 'grey', 'palette': None, 'scale': None, 'legend': False, 'n_colors': None}
    },
}

def PROCESS_CONFIG(config):
    if config['options']['use_webcola'] == True:
        config['requirements'].append('cola')