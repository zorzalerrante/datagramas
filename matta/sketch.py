from cytoolz.dicttoolz import valmap
from IPython.display import HTML, display_html
import os
import uuid
import pandas as pd
import networkx as nx
from networkx.readwrite import json_graph
import numpy as np
from IPython.display import HTML
import codecs
import jinja2
import os
import json
import copy

def _load_template(filename):
    if filename in ('base.js', 'base.html', 'scaffold.js'):
        filename = '{0}/templates/{1}'.format(SRC_DIR, filename)

    with open(filename, 'r') as f:
        code = f.read()
        return code

SRC_DIR = os.path.dirname(os.path.realpath(__file__))
env = jinja2.environment.Environment()
#env.loader = jinja2.FileSystemLoader([SRC_DIR + '/templates', SRC_DIR + '/libs'])
env.loader = jinja2.FunctionLoader(_load_template)

# based on http://stackoverflow.com/questions/3488934/simplejson-and-numpy-array
class MattaJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, nx.Graph) or isinstance(obj, nx.DiGraph):
            if nx.is_tree(obj):
                # NOTE: the root must be the first node added. otherwise it won't work
                return json_graph.tree_data(obj, obj.nodes_iter().next())
            else:
                return json_graph.node_link_data(obj)
        elif isinstance(obj, pd.DataFrame):
            return obj.to_dict(orient='records')
        return json.JSONEncoder.default(self, obj)

_dump_json = lambda x: json.dumps(x, cls=MattaJSONEncoder)

class sketch(object):
    def __init__(self, **kwargs):
        if not 'container_type' in kwargs:
            raise('need to define a container element')

        if not 'data' in kwargs or kwargs['data'] is None:
            raise Exception('you need to define at least one data variable')

        self.configuration = kwargs.copy()

        if not 'visualization_css' in kwargs:
            self.configuration['visualization_css'] =  '{0}/templates/{1}.css'.format(SRC_DIR, self.configuration['visualization_name'])
        if not 'visualization_js' in kwargs:
            self.configuration['visualization_js'] = '{0}/templates/{1}.js'.format(SRC_DIR, self.configuration['visualization_name'])

        self.configuration['visualization_name'] = self.configuration['visualization_name'].replace('-', '_').replace('.', '_')
        self.configuration['variables'] = valmap(_dump_json, self.configuration['variables'])
        self.configuration['__data_variables__'] = self.configuration['data'].keys()
        self.configuration['data'] = _dump_json(self.configuration['data'])

    def _render_(self, template_name):
        repr_args = self.configuration.copy()

        if self.configuration['visualization_css']:
            try:
                repr_args['visualization_css'] = env.get_template(self.configuration['visualization_css']).render(**repr_args)
            except IOError:
                repr_args['visualization_css'] = None

        if self.configuration['visualization_js']:
            repr_args['visualization_js'] = env.get_template(self.configuration['visualization_js']).render(**repr_args)
        else:
            raise Exception('Empty Visualization code!')

        template = env.get_template(template_name)

        if not 'figure_id' in repr_args or not repr_args['figure_id']:
            repr_args['figure_id'] = 'fig-{0}'.format(uuid.uuid4())

        if not 'vis_uuid' in repr_args or not repr_args['vis_uuid']:
            repr_args['vis_uuid'] = 'matta-vis-{0}'.format(uuid.uuid4())

        return template.render(**repr_args)

    def _ipython_display_(self):
        rendered = self._render_('base.html')
        display_html(HTML(rendered))

    def scaffold(self, filename=None, style=None, append=False):
        rendered = self._render_('scaffold.js')

        if filename is None:
            return rendered

        with open(filename, 'w') as f:
            f.write(rendered)

        if style is not None:
            mode = 'a' if append is True else 'w'
            with open(style, mode) as f:
                f.write(env.get_template(self.configuration['visualization_css']).render(**self.configuration))


def build_sketch(defaults, opt_process=None):
    def sketch_fn(**kwargs):
        sketch_args = copy.deepcopy(defaults)

        for key, value in kwargs.iteritems():
            if key in sketch_args:
                sketch_args[key] = value
            if key in sketch_args['data']:
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
            elif key == 'figure_id':
                sketch_args[key] = value
            else:
                raise Exception('invalid argument: {0}'.format(key))

        if callable(opt_process):
            opt_process(sketch_args)

        return sketch(**sketch_args)

    return sketch_fn