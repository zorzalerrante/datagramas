from sketch import build_sketch, _dump_json
from IPython.display import HTML
from scipy.constants import golden_ratio

__version__ = '0.9.2'

def init_javascript(path='/static/custom/matta'):
    '''
    Returns the Javascript code needed to load matta libraries.

    In the IPython notebook this is loaded automatically by adding the output
    of this function to custom.js script.
    '''
    paths = {
        'd3': '{0}/d3.v3.min'.format(path),
        'wordcloud': '{0}/d3.layout.cloud'.format(path),
        'tile': '{0}/d3.geo.tile'.format(path),
        'sankey': '{0}/d3.sankey'.format(path),
        'matta': '{0}/matta'.format(path),
        'force_directed': '{0}/matta.force-directed'.format(path),
        'force_edge_bundling': '{0}/d3.ForceEdgeBundling'.format(path),
        'topojson': '{0}/topojson'.format(path),
        'leaflet': '{0}/leaflet-0.7.3/leaflet-src'.format(path),
        'colajs': '{0}/cola.v3.min'.format(path)
    }

    template = '''
<script>
$(document).ready(function() {{
    if (!require.defined('matta')) {{
        require.config({{
          paths: {0}
        }});

        require(['matta'], function(matta) {{
            matta.add_css('{1}');
        }});
    }}
}});
</script>
<span class="label label-info">matta</span> Javascript code added.
        '''.format(_dump_json(paths), path  + '/matta.css')

    return HTML(template)

def dump_data(data, json_name):
    with open(json_name, 'w') as f:
        f.write(_dump_json(data))

# Visualizations

## Sankey Diagram
__sankey_args = {
    'requirements': ['d3', 'matta', 'sankey'],
    'visualization_name': 'matta.sankey',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'graph': None,
    },
    'options': {
        'horizontal': False,
        'background_color': None,
    },
    'variables': {
        'width': 960,
        'height': 500,
        'padding': {'left': 150, 'top': 10, 'right': 150, 'bottom': 10},
        'font_size': 10,
        'layout_iterations': 64,
        'link_opacity': 0.95,
        'node_opacity': 0.85,
        'node_color': 'steelblue',
        'node_width': 15,
        'node_padding': 10,
        'node_label': 'name',
        'link_color': '#efefef',
        'link_weight': 'weight',
        'link_color_scale_width': 150,
        'link_color_scale_height': 8,
        'link_color_scale_extent': None,
        'link_color_scale_title': None,
        'link_color_scale_domain': None,
        'link_color_scale_range': None,
        'link_color_variable': None,
    },
}

sankey = build_sketch(__sankey_args)


## Maps using TopoJSON

__topojson_args = {
    'requirements': ['d3', 'matta', 'topojson'],
    'visualization_name': 'matta.topojson',
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
        'legend': True,
        'path_opacity': 1.0,
        'path_stroke': 'gray',
        'path_stroke_width': 1.0,
        'fill_color': 'none',
        'area_feature_name': None,
        'area_value': None,
        'area_color_legend': True,
        'area_opacity': 0.75,
        'area_color_scale_width': 150,
        'area_color_scale_height': 8,
        'area_color_scale_extent': [0.0, 1.0],
        'area_color_scale_domain': None,
        'area_color_scale_title': None,
        'area_color_scale_range': None,
        'mark_value': None,
        'mark_scale': 0.5,
        'mark_feature_name': None,
        'mark_position': ['lat', 'lon'],
        'mark_color': None,
        'mark_color_property': None,
        'mark_opacity': 0.8,
        'mark_stroke': 'gray',
        'mark_stroke_width': 1,
        'mark_min_ratio': 0,
        'mark_max_ratio': 20,
        'feature_name': None,
        'label_font_size': 10,
        'label_color': 'black',
        'leaflet_default_zoom': 11,
        'leaflet_center': None,
        'bounding_box': None,
        'leaflet_map_link': "&copy; OpenStreetMap Contributors",
        'leaflet_tile_layer': 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'force_edge_step_size': 0.0015,
        'force_edge_compatibility_threshold': 0.75,
        'force_edge_bundling_stiffness': 0.1,
        'force_edge_cycles': 6,
        'force_edge_iterations': 30,
        'link_color': 'steelblue',
        'link_opacity': 0.25,
        'link_width': 1,
        'link_color_value': 'weight',
        'link_color_scale_domain': None,
        'link_color_scale_range': None,
    },
    'read_only': {'L', 'map'}
}

def __topojson_options(config):
    if config['options']['leaflet'] is True:
        config['container_type'] = 'div'
        config['requirements'].append('leaflet')
    else:
        config['container_type'] = 'svg'
    if config['options']['graph_bundle_links'] is True:
        config['requirements'].append('force_edge_bundling')

topojson = build_sketch(__topojson_args, opt_process=__topojson_options)


## Wordclouds

__wordcloud_args = {
    'requirements': ['d3', 'matta', 'wordcloud'],
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
        'font_size': 12,
        'font_weight': 'normal',
        'font_scale': 'sqrt',
        'min_font_size': 8,
        'max_font_size': 64,
        'font_opacity': 1.0,
        'rotation': 0.0,
        'color_scale_width': 150,
        'color_scale_height': 8,
        'color_scale_extent': [0.0, 1.0],
        'color_scale_domain': None,
        'color_scale_range': None,
    },
}

wordcloud = build_sketch(__wordcloud_args)

## Treemap

__treemap_args = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.treemap',
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
        'font_size': 14,
        'node_border': 1,
        'border_color': '#777',
        'sticky': True,
        'label_leaves_only': True
    },
}

treemap = build_sketch(__treemap_args)

## Circle Packing

__circlepack_args = {
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

circlepack = build_sketch(__circlepack_args)

## Parallel Coordinates

__parallel_coordinates_args = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.pcoordinates',
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
        'padding': {'left': 30, 'top': 30, 'right': 30, 'bottom': 30},
        'line_opacity': 0.75,
        'exclude': [],
        'line_stroke_width': 1.0
    },
}

def _pc_opts(options):
    #print options
    options['variables']['columns'] = [c for c in options['data']['dataframe'].columns.tolist() if not c in options['variables']['exclude']]

parallel_coordinates = build_sketch(__parallel_coordinates_args, opt_process=_pc_opts)

## Force Directed

__force_directed_args = {
    'requirements': ['d3', 'matta'],
    'visualization_name': 'matta.force',
    'figure_id': None,
    'container_type': 'svg',
    'data': {
        'graph': None,
    },
    'options': {
        'background_color': None,
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
        'node_ratio': 12,
        'node_value': None,
        'node_min_ratio': 8,
        'node_max_ratio': 24,
        'node_scale': 'linear',
        'node_labels': True,
        'theta': 0.8,
        'alpha': 0.1,
        'node_padding': 16,
        'avoid_collisions': False,
        'clamp_to_viewport': False,
    },
}

force_directed = build_sketch(__force_directed_args)

