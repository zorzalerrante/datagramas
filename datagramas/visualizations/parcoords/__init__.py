VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.parcoords',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'dataframe': None,
    },
    'options': {
        'background_color': None,
        'events': ['click']
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 30, 'top': 30, 'right': 30, 'bottom': 30},
        'line_opacity': 0.75,
        'exclude': [],
        'line_stroke_width': 1.0,
        'labels': None
    },
}

def PROCESS_CONFIG(options):
    #print options
    options['variables']['columns'] = [c for c in options['data']['dataframe'].columns.tolist() if not c in options['variables']['exclude']]
