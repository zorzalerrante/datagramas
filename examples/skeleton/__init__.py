
VISUALIZATION_CONFIG = {
    'requirements': ['matta', 'd3'],
    'visualization_name': 'barchart',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'dataframe': None,
    },
    'options': {
        'background_color': None,
        'x_axis': True,
        'y_axis': True,
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 30, 'top': 20, 'right': 30, 'bottom': 30},
        'x': 'x',
        'y': 'y',
        'y_axis_ticks': 10,
        'y_label': None,
        'rotate_label': True,
    },
    'colorables': {
        'bar_color': {'value': 'steelblue', 'palette': None, 'scale': None, 'legend': False}
    }
}