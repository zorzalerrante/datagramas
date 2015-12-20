
VISUALIZATION_CONFIG = {
    'requirements': ['d3', 'matta', 'topojson'],
    'visualization_name': 'matta.cartography',
    'figure_id': None,
    'container_type': 'div',
    'data': {
        'geojson': None,
        'geometry': None,
        'area_dataframe': None,
        'mark_dataframe': None,
        'graph': None
    },
    'options': {
        'leaflet': False,
        'background_color': False,
        'graph_bundle_links': False
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
        'feature_id': 'id',
        'label': None,
        'label_font_size': 10,
        'label_color': 'black',
        'path_opacity': 1.0,
        'path_stroke': 'gray',
        'path_stroke_width': 1.0,
        # the feature name used in TopoJSON. autodetected if None.
        'feature_name': None,
        'area_index': 'index',
        'area_feature_name': None,
        'area_transition_delay': 0,
        # we use 'index' instead of 'id' because we usually serialize after calling the reset_index() method of a DataFrame.
        'mark_index': 'index',
        'mark_feature_name': None,
        'mark_position': ['lat', 'lon'],
        'mark_opacity': 0.8,
        'mark_stroke': 'gray',
        'mark_stroke_width': 1,
        'mark_sort_by_ratio': True,
        'mark_transition_delay': 0,
        # graph over the map
        'graph_feature_name': None,
        'graph_position': ['lat', 'lon'],
        'force_edge_step_size': 0.0015,
        'force_edge_compatibility_threshold': 0.75,
        'force_edge_bundling_stiffness': 0.1,
        'force_edge_cycles': 6,
        'force_edge_iterations': 30,
        # leaflet
        'leaflet_default_zoom': 11,
        'leaflet_center': None,
        'bounding_box': None,
        'leaflet_map_link': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        'leaflet_tile_layer': 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    },
    'attributes': {
        'area_opacity': {'min': 0.25, 'max': 1.0, 'value': None, 'scale': None, 'legend': False},
        'link_width': {'min': 0.01, 'max': 1.0, 'value': None, 'scale': None, 'legend': False},
        'link_opacity': {'min': 0.25, 'max': 1.0, 'value': None, 'scale': None, 'legend': False},
        'mark_ratio': {'min': 0, 'max': 20, 'value': None, 'scale': None, 'legend': False}
    },
    'colorables': {
        'fill_color': {'value': None, 'palette': None, 'scale': None, 'n_colors': None, 'legend': False},
        'area_color': {'value': None, 'palette': None, 'scale': None, 'n_colors': None, 'legend': False},
        'link_color': {'value': 'steelblue', 'palette': None, 'scale': None, 'n_colors': None, 'legend': False},
        'mark_color': {'value': 'purple', 'palette': None, 'scale': None, 'n_colors': None, 'legend': False}
    },
    'read_only': {
        # leaflet variables
        'L',
        'map',
        # the map projection. this could be used to add other things on top of the visualization.
        'projection',
        # here we save the geometry specified - it can be either GeoJSON or TopoJSON.
        'geometry'
    },
    'auxiliary': {
        # a set to save mark positions. since there are two possible sources of positions, we need to do this.
        'mark_positions',
        # the list of available features from the geometry source.
        'available_feature_ids',
        # the list of colors per area
        'area_colors'
    }
}

def PROCESS_CONFIG(config):
    if config['options']['leaflet'] is True:
        config['container_type'] = 'div'
        config['requirements'].append('leaflet')
    else:
        config['container_type'] = 'svg'
    if config['options']['graph_bundle_links'] is True:
        config['requirements'].append('force_edge_bundling')
