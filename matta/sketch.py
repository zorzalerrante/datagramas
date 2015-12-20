from __future__ import print_function, unicode_literals
import uuid
import pandas as pd
import networkx as nx
import numpy as np
import jinja2
import os
import json
import copy

from networkx.readwrite import json_graph
from IPython.display import HTML
from cytoolz.dicttoolz import valmap, merge
from IPython.display import display_html
from .templatefilters import setup_filters_in_jinja_env
from seaborn import color_palette
from matplotlib.colors import rgb2hex

MATTA_TEMPLATE_FILES = {'base.js', 'base.attributes.js', 'base.colorables.js',
    'base.html', 'multiples.html', 'select-categories.html',
    'scaffold.js'}

def _load_template(filename):
    if filename in MATTA_TEMPLATE_FILES:
        filename = '{0}/templates/{1}'.format(SRC_DIR, filename)

    with open(filename, 'r') as f:
        code = f.read()
        # the lambda avoids template caching
        return (code, filename, lambda *a, **k: False)

SRC_DIR = os.path.dirname(os.path.realpath(__file__))
env = jinja2.environment.Environment()
env.loader = jinja2.FunctionLoader(_load_template)
setup_filters_in_jinja_env(env)

class MattaJSONEncoder(json.JSONEncoder):
    """
    A Pandas/numpy/networkx aware JSON Encoder.

    Based on http://stackoverflow.com/questions/3488934/simplejson-and-numpy-array
    """
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, nx.Graph) or isinstance(obj, nx.DiGraph):
            if nx.is_tree(obj) and 'root' in obj.graph:
                # NOTE: there must be a root graph attribute, or the root must be the first node added.
                # otherwise it won't work
                return json_graph.tree_data(obj, obj.graph['root'])
            else:
                return json_graph.node_link_data(obj)
        elif isinstance(obj, pd.DataFrame):
            return obj.to_dict(orient='records')
        elif isinstance(obj, pd.Timedelta):
            return obj.total_seconds()
        return json.JSONEncoder.default(self, obj)

_dump_json = lambda x: json.dumps(x, cls=MattaJSONEncoder)

class sketch(object):
    """
    A sketch represents the state of a visualization before being rendered or scaffolded. It is built from a
    configuration dictionary provided by each visualization. See build_sketch.
    """

    def __init__(self, **kwargs):
        if not 'container_type' in kwargs:
            raise Exception('need to define a container element')

        if not 'data' in kwargs or kwargs['data'] is None:
            raise Exception('you need to define at least one data variable')

        self.configuration = kwargs.copy()

        if not 'visualization_css' in kwargs:
            self.configuration['visualization_css'] =  '{0}/templates/{1}.css'.format(SRC_DIR, self.configuration['visualization_name'])
        if not 'visualization_js' in kwargs:
            self.configuration['visualization_js'] = '{0}/templates/{1}.js'.format(SRC_DIR, self.configuration['visualization_name'])

        self.configuration['visualization_name'] = self.configuration['visualization_name'].replace('-', '_').replace('.', '_')
        self.configuration['variables'] = valmap(_dump_json, self.configuration['variables'])

        if 'attributes' in self.configuration:
            self.configuration['attributes'] = valmap(self.process_attribute, self.configuration['attributes'])
        else:
            self.configuration['attributes'] = {}

        if 'colorables' in self.configuration:
            self.configuration['colorables'] = valmap(self.process_colorable, self.configuration['colorables'])
        else:
            self.configuration['colorables'] = {}

        self.configuration['__data_variables__'] = self.configuration['data'].keys()
        self.configuration['data'] = _dump_json(self.configuration['data'])
        if 'facets' in self.configuration:
            self.configuration['facets'] = _dump_json(self.configuration['facets'])

    def process_attribute(self, attribute):
        if 'legend' not in attribute:
            attribute['legend'] = False

        return valmap(_dump_json, attribute)

    def process_colorable(self, colorable):
        if 'n_colors' not in colorable or colorable['n_colors'] is None:
            # this is the seaborn default
            colorable['n_colors'] = 6

        if 'palette' in colorable and colorable['palette'] is not None:
            if type(colorable['palette']) in (str, unicode):
                # a palette name
                palette = color_palette(colorable['palette'], n_colors=colorable['n_colors'])
                colorable['palette'] = map(rgb2hex, palette)
            else:
                # a list of colors. we override n_colors
                colorable['palette'] = map(rgb2hex, colorable['palette'])
                colorable['n_colors'] = len(colorable['palette'])
        else:
            colorable['palette'] = None

        if 'domain' not in colorable:
            colorable['domain'] = None

        if 'legend' not in colorable:
            colorable['legend'] = False

        return valmap(_dump_json, colorable)

    def _render_(self, template_name, **extra_args):
        repr_args = merge(self.configuration.copy(), extra_args)

        if self.configuration['visualization_js']:
            repr_args['visualization_js'] = env.get_template(self.configuration['visualization_js']).render(**repr_args)
        else:
            raise Exception('Empty Visualization code!')

        if 'functions_js' in self.configuration and self.configuration['functions_js'] is not None:
            repr_args['functions_js'] = env.get_template(self.configuration['functions_js']).render(**repr_args)

        template = env.get_template(template_name)

        if not 'figure_id' in repr_args or not repr_args['figure_id']:
            repr_args['figure_id'] = 'fig-{0}'.format(uuid.uuid4())

        if not 'vis_uuid' in repr_args or not repr_args['vis_uuid']:
            repr_args['vis_uuid'] = 'matta-vis-{0}'.format(uuid.uuid4())

        if not 'define_js_module' in repr_args:
            repr_args['define_js_module'] = True

        if self.configuration['visualization_css']:
            try:
                repr_args['visualization_css'] = env.get_template(self.configuration['visualization_css']).render(**repr_args)
            except IOError:
                repr_args['visualization_css'] = None

        return template.render(**repr_args)

    def _ipython_display_(self):
        """
        Automatically displays the sketch when returned on a notebook cell.
        """
        self.show()

    def show(self, multiples=None):
        """
        Displays the sketch on the notebook.
        """

        if multiples == 'small-multiples':
            template_name = 'multiples.html'
        elif multiples == 'select-categories':
            template_name = 'select-categories.html'
        else:
            template_name = 'base.html'
            
        rendered = self._render_(template_name)
        display_html(HTML(rendered))
        return None

    def scaffold(self, filename=None, define_js_module=True, style=None, append=False, author_comment=None):
        rendered = self._render_('scaffold.js', define_js_module=define_js_module, author_comment=author_comment)

        if filename is None:
            return rendered

        with open(filename, 'w') as f:
            f.write(rendered)

        if style is not None:
            mode = 'a' if append is True else 'w'
            with open(style, mode) as f:
                f.write(env.get_template(self.configuration['visualization_css']).render(**self.configuration))

sketch_doc_string_template = jinja2.Template('''{{ summary }}

Data Arguments:
{% for key, value in data.iteritems() %}{{ key }} -- (default: {{ value }})
{% endfor %}

{% if variables %}Keyword Arguments:
{% for key, value in variables.iteritems() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

{% if options %}Sketch Arguments:
{% for key, value in options.iteritems() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

{% if attributes %}Mappeable Attributes:
{% for key, value in attributes.iteritems() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

''')

def build_sketch(default_args, opt_process=None):
    """
    Receives a visualization config and returns a sketch function that can be used to display or scaffold
    visualizations.

    The sketch function is not a visualization per-se. Instead, it gets called with parameters that can replace
    or update the default configuration provided by default_args, and the updated configuration is used to
    display/scaffold a visualization.
    """
    def sketch_fn(**kwargs):
        """
        This is the function executed each time a visualization is displayed or scaffolded.

        The default arguments used when defining the visualization will be updated with those from the
        keyword arguments. However, not all elements of default_args can be overwritten.

        This also includes logic to decide when to update an entire setting or just a sub-element of it.

        :param kwargs: arguments for the visualization.
        :return: sketch
        """
        sketch_args = copy.deepcopy(default_args)

        for key, value in kwargs.iteritems():
            if key in sketch_args:
                sketch_args[key] = value

            elif key in sketch_args['data']:
                sketch_args['data'][key] = value

            elif key in sketch_args['options']:
                if type(sketch_args['options'][key]) == dict:
                    sketch_args['options'][key].update(value)
                else:
                    sketch_args['options'][key] = value

            elif key in sketch_args['variables']:
                if type(sketch_args['variables'][key]) == dict:
                    sketch_args['variables'][key].update(value)
                else:
                    sketch_args['variables'][key] = value

            elif 'attributes' in sketch_args and key in sketch_args['attributes']:
                if type(value) == dict:
                    sketch_args['attributes'][key].update(value)
                elif type(value) in (int, float):
                    sketch_args['attributes'][key]['value'] = value
                elif value is None or type(value) in (str, unicode):
                    sketch_args['attributes'][key]['value'] = value
                else:
                    raise Exception('Not supported value for attribute {0}: {1}'.format(key, value))

            elif 'colorables' in sketch_args and key in sketch_args['colorables']:
                if type(value) == dict:
                    sketch_args['colorables'][key].update(value)
                elif type(value) in (int, float):
                    sketch_args['colorables'][key]['value'] = value
                elif value is None or type(value) in (str, unicode):
                    sketch_args['colorables'][key]['value'] = value
                else:
                    raise Exception('Not supported value for colorable {0}: {1}'.format(key, value))

            elif key in ('figure_id', 'facets'):
                sketch_args[key] = value

            else:
                raise Exception('Invalid argument: {0}'.format(key))

        if callable(opt_process):
            opt_process(sketch_args)

        return sketch(**sketch_args)

    if not 'summary' in default_args:
        default_args['summary'] = default_args['visualization_name']

    sketch_fn.__doc__ = sketch_doc_string_template.render(default_args)
    sketch_fn.variable_names = default_args['data'].keys()

    return sketch_fn
