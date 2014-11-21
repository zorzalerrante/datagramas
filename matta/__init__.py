from IPython.display import HTML
import codecs
import jinja2
import os
import json
import numpy as np
import networkx as nx
from networkx.readwrite import json_graph
import pandas as pd
import uuid

SRC_DIR = os.path.dirname(os.path.realpath(__file__))
env = jinja2.environment.Environment()
env.loader = jinja2.FileSystemLoader([SRC_DIR + '/templates', SRC_DIR + '/libs'])


# based on http://stackoverflow.com/questions/3488934/simplejson-and-numpy-array
class MattaJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray) and obj.ndim == 1:
                return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, nx.Graph) or isinstance(obj, nx.DiGraph):
            return json_graph.node_link_data(obj)
        elif isinstance(obj, pd.DataFrame):
            return obj.to_dict(outtype='records')
        return json.JSONEncoder.default(self, obj)

_dump_json = lambda x: json.dumps(x, cls=MattaJSONEncoder)

def init(d3_url='http://d3js.org/d3.v3.min.js', lib_path='http://localhost:8000'):
    paths = {
        'd3': '{0}?noext'.format(d3_url),
        'wordcloud': '{0}/libs/d3.layout.cloud.js?noext'.format(lib_path),
        'tile': '{0}/libs/d3.geo.tile.js?noext'.format(lib_path),
        'sankey': '{0}/libs/d3.sankey.js?noext'.format(lib_path),
        'matta': '{0}/libs/matta.js?noext'.format(lib_path),
        'force_directed': '{0}/libs/matta.force-directed.js?noext'.format(lib_path),
        'force_edge_bundling': '{0}/libs/d3.ForceEdgeBundling.js?noext'.format(lib_path),
        'topojson': '{0}/libs/topojson.js?noext'.format(lib_path),
        'leaflet': '{0}/libs/leaflet-0.7.3/leaflet-src.js?noext'.format(lib_path),
    }

    template = '''<script>

        require.config({{
          paths: {0}
        }});

        require(['matta'], function(matta) {{
            matta.add_css('{1}');
        }});
        </script>
        '''.format(_dump_json(paths), lib_path  + '/libs/matta.css')

    return HTML(template)


def _draw(template_file, data, label=None, **kwargs):
    with codecs.open(template_file, 'r', 'utf-8') as f:
        template = jinja2.Template(f.read())

    rendered = template.render(data=_dump_json(data), **kwargs)
    return HTML(rendered)


def _render_visualization(name, data, label=None, **kwargs):
    global env
    
    files = {'style_file': 'matta.{0}.css'.format(name),
                'js_file': 'matta.{0}.js'.format(name),
                }
                
    for key, filename in files.iteritems():
        if os.path.exists('{0}/templates/{1}'.format(SRC_DIR, filename)):
            kwargs[key] = filename
     
    if os.path.exists('{0}/templates/matta.{1}.html'.format(SRC_DIR, name)):
        template = env.get_template('matta.{0}.html'.format(name))
    else:
        template = env.get_template('base.html')   
    
    if not 'container_type' in kwargs:
        kwargs['container_type'] = 'svg'
        
    kwargs['visualization_name'] = name

    if not 'fig_id' in kwargs:
        kwargs['fig_id'] = 'fig-{0}'.format(uuid.uuid4())

    if not 'vis_uuid' in kwargs:
        kwargs['vis_uuid'] = 'matta-vis-{0}'.format(uuid.uuid4())
    
    rendered = template.render(data=_dump_json(data), **kwargs)
    return HTML(rendered)


def draw_wordcloud(data, **kwargs):
    defaults = {
        'width': 600,
        'height': 400,
        'min_size': 12,
        'max_size': 64,
        'scaling_type': 'linear',
        'font': 'serif',
        'rotate': 0,
        'time_interval': 10,
        'requirements': ['d3', 'matta', 'wordcloud'],
    }

    defaults.update(kwargs)

    if 'label' in kwargs:
        defaults['label'] = _dump_json(kwargs['label'])

    return _render_visualization('wordcloud', data, **defaults)


def draw_treemap(data, **kwargs):
    defaults = {
        'treemap_mode': 'squarify',
        'ratio': 1.0,
        'padding': 0.0,
        'fit_labels': False,
        'font_size': 10,
        'value': 'value',
        'children': 'children',
        'node_id': 'label',
        'fill': None,
        'requirements': ['d3', 'matta'],
    }
    defaults.update(kwargs)
    defaults['container_type'] = 'div'
    
    return _render_visualization('treemap', data, **defaults)


def draw_parallel_coordinates(data, **kwargs):
    defaults = {
        'requirements': ['d3', 'matta'],
        'opacity': 0.5,
        'exclude': [],
        'stroke_width': 1,
    }
    defaults.update(kwargs)
    defaults['container_type'] = 'svg'
    defaults['columns'] = [c for c in data.columns.tolist() if not c in defaults['exclude']]

    return _render_visualization('pcoordinates', data, **defaults)

def draw_graph_map(data, **kwargs):
    defaults = {
        'width': 800,
        'height': 800,
        'tension': 0.8,
        'bundle_links': False,
        'force_bundle_links': False,
        'force_edge_step_size': 0.1,
        'force_edge_compatibility_threshold': 0.6,
        'force_edge_bundling_stiffness': 0.1,
        'force_edge_cycles': 6,
        'force_edge_iterations': 60,
        'links': True,
        'background_tiles': True,
        'tile_opacity': 0.5,
        'n_tile_alternatives': 2,
        'tile_base_url': 'tile.stamen.com/toner',
        'requirements': ['d3', 'matta', 'tile', 'force_edge_bundling'],
    }

    defaults.update(kwargs)
    return _render_visualization('graph-map', data, **defaults)


def draw_force_directed_graph(data, **kwargs):
    defaults = {
        'width': 800,
        'height': 800,
        'links': True,
        'force_gravity': 0.05,
        'force_charge': -100,
        'link_distance': 100,
        'font_size': 10,
        'node_radius': 12,
        'avoid_collisions': True,
        'clamp_to_viewport': True,
        'requirements': ['d3', 'matta', 'force_directed'],
    }

    defaults.update(kwargs)
    return _render_visualization('force-directed', data, **defaults)


def draw_sankey(data, **kwargs):
    defaults = {
        'width': 800,
        'height': 400,
        'layout_iterations': 32,
        'link_color': '#000',
        'link_opacity': 0.02,
        'font_size': 12,
        'label_margins': 50,
        'node_opacity': 0.9,
        'node_color': 'steelblue',
        'node_width': 30,
        'node_padding': 20,
        'requirements': ['d3', 'matta', 'sankey'],
    }

    defaults.update(kwargs)
    return _render_visualization('sankey', data, **defaults)


def draw_topojson(data, **kwargs):
    defaults = {
        'width': 800,
        'height': 800,
        'feature_id': 'id',
        'label': None,
        'legend': True,
        'path_opacity': 1.0,
        'path_stroke': 'gray',
        'path_stroke_width': 1.0,
        'fill_color': None,
        'feature_data': None,
        # name of the column in the data frame that maps to the id column in the topojson features
        'property_name': 'id',
        'property_value': None,
        'property_color': None,
        'area_opacity': 1.0,
        'symbol_scale': 'linear',
        'symbol_color': 'steelblue',
        'symbol_color_property': None,
        'symbol_opacity': 1.0,
        'symbol_stroke': 'gray',
        'symbol_stroke_width': 1,
        'symbol_min_ratio': 1,
        'symbol_max_ratio': 20,
        # leaflet background
        'leaflet': False,
        'leaflet_tile_layer': 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'leaflet_map_link': '<a href="http://openstreetmap.org">OpenStreetMap</a>',
        'requirements': ['d3', 'matta', 'topojson'],
    }

    defaults.update(kwargs)

    if defaults['leaflet']:
        defaults['requirements'].append('leaflet')
        defaults['container_type'] = 'div'

    if not 'feature_name' in defaults:
        defaults['feature_name'] = data['objects'].keys()[0]

    if defaults['feature_data'] is not None:
        defaults['feature_data'] = _dump_json(defaults['feature_data'])


    return _render_visualization('topojson', data, **defaults)
