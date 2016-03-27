
VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'datagramas', 'cloud'],
    'visualization_name': 'datagramas.wordcloud',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'dataframe': None,
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
        'color': None,
        'text': None,
        'font_opacity': 1.0,
    },
    'attributes': {
        'font_size': {'value': 18, 'min': 8, 'max': 64, 'scale': 'sqrt'},
    },
    'colorables': {
        'font_color': {'value': 'grey', 'palette': None, 'scale': None, 'legend': False}
    }
}