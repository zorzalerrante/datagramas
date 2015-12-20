
VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta', 'cloud'],
    'visualization_name': 'matta.wordcloud',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'items': None,
    },
    'options': {
        'background_color': None,
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'typeface': 'Arial',
        'font_weight': 'normal',
        'rotation': 0.0,
        #'color_scale_width': 150,
        #'color_scale_height': 8,
        'color': None,
        'text': 0,
        'font_opacity': 1.0,
    },
    'attributes': {
        'font_size': {'value': 1, 'min': 8, 'max': 64, 'scale': 'sqrt'},
    },
    'colorables': {
        'font_color': {'value': 1, 'palette': None, 'scale': None, 'legend': False}
    }
}