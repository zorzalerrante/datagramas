

VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta', 'topojson', 'cartogram'],
    'visualization_name': 'matta.cartogram',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'geometry': None,
        'area_dataframe': None,
    },
    'options': {
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'feature_id': 'id',
        'label': True,
        'path_opacity': 1.0,
        'path_stroke': 'gray',
        'path_stroke_width': 1.0,
        'fill_color': 'none',
        'area_value': 'value',
        'area_feature_name': 'id',
        'area_opacity': 0.75,
        'area_transition_delay': 0,
        'feature_name': None,
        'label_font_size': 10,
        'label_color': 'black',
        'bounding_box': None,
        'na_value': 0.000001
    },
    'colorables': {
        'area_color': {'value': None, 'palette': None, 'scale': None, 'n_colors': None, 'legend': False},
    },
    'auxiliary': {
        'path',
        'projection',
        'original_geometry',
        'area_colors',
        'area_carto_values'
    }
}