from __future__ import unicode_literals
import uuid
import jinja2
import os
import copy

from IPython.display import HTML
from cytoolz.dicttoolz import valmap, merge
from IPython.display import display_html
from seaborn import color_palette
from matplotlib.colors import rgb2hex
from .js_utils import _dump_json, d3jsObject, JSCode

DATAGRAMAS_TEMPLATE_FILES = {'base.js', 'base.attributes.js', 'base.colorables.js',
    'base.html', 'multiples.html', 'select-categories.html',
    'scaffold.js'}

def _load_template(filename):
    if filename in DATAGRAMAS_TEMPLATE_FILES:
        filename = '{0}/templates/{1}'.format(SRC_DIR, filename)

    with open(filename, 'r') as f:
        code = f.read()
        # the lambda avoids template caching
        return (code, filename, lambda *a, **k: False)

SRC_DIR = os.path.dirname(os.path.realpath(__file__))
env = jinja2.environment.Environment()
env.loader = jinja2.FunctionLoader(_load_template)


class sketch(object):
    """
    A sketch represents the state of a visualization before being rendered or scaffolded. It is built from a
    configuration dictionary provided by each visualization. See build_sketch.
    """

    datagram_events = ['datagram_start', 'datagram_end']

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

        self.configuration['variables'] = valmap(self.process_variable, self.configuration['variables'])

        if 'objects' in self.configuration:
            self.configuration['objects'] = valmap(self.process_objects, self.configuration['objects'])

        if 'attributes' in self.configuration:
            self.configuration['attributes'] = valmap(self.process_attribute, self.configuration['attributes'])
        else:
            self.configuration['attributes'] = {}

        if 'colorables' in self.configuration:
            self.configuration['colorables'] = valmap(self.process_colorable, self.configuration['colorables'])
        else:
            self.configuration['colorables'] = {}

        if 'allowed_events' in self.configuration['options'] and self.configuration['options']['allowed_events']:
            if 'events' in self.configuration:
                self.configuration['events'] = {k: self.process_event(k, v) for k, v in self.configuration['events'].items() if v is not None}

        self.configuration['__data_variables__'] = list(self.configuration['data'].keys())
        self.configuration['data'] = _dump_json(self.configuration['data'])
        if 'facets' in self.configuration:
            self.configuration['facets'] = _dump_json(self.configuration['facets'])

        self.configuration['datagram_events'] = self.datagram_events

    def process_variable(self, variable):
        if type(variable) != JSCode:
            return _dump_json(variable)

        return variable.render(context=self.configuration)

    def process_event(self, key, variable):
        if type(variable) != JSCode:
            raise Exception('Events can only be of JSCode type.')

        if key not in self.configuration['options']['allowed_events'] and key not in self.datagram_events:
            raise Exception('Unsupported event: {0}.'.format(key))

        rendered = variable.render(context=self.configuration)

        return rendered

    def process_objects(self, variable):
        if type(variable) != d3jsObject:
            raise Exception('Non-object passed as object argument.')

        rendered = variable.render(context=self.configuration)

        return rendered

    def process_attribute(self, attribute):
        if 'legend' not in attribute:
            attribute['legend'] = False

        return valmap(self.process_variable, attribute)

    def process_colorable(self, colorable):
        if 'domain' not in colorable:
            colorable['domain'] = None

        if 'n_colors' not in colorable or colorable['n_colors'] is None:
            if colorable['domain'] is None:
                # this is the seaborn default
                colorable['n_colors'] = 6
            else:
                colorable['n_colors'] = len(colorable['domain'])
        else:
            if type(colorable['n_colors']) != int or colorable['n_colors'] < 1:
                raise Exception('Number of colors must be an integer greater or equal than 1.')

        if 'palette' in colorable and colorable['palette'] is not None:
            if type(colorable['palette']) == str:
                # a palette name
                palette = color_palette(colorable['palette'], n_colors=colorable['n_colors'])
                colorable['palette'] = list(map(rgb2hex, palette))
            else:
                # a list of colors. we override n_colors
                colorable['palette'] = list(map(rgb2hex, colorable['palette']))
                colorable['n_colors'] = len(colorable['palette'])
        else:
            colorable['palette'] = None

        if 'legend' not in colorable:
            colorable['legend'] = False

        return valmap(self.process_variable, colorable)

    def _render_(self, template_name='base.html', **extra_args):
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
            repr_args['vis_uuid'] = 'datagram-vis-{0}'.format(uuid.uuid4())

        if not 'define_js_module' in repr_args:
            repr_args['define_js_module'] = True

        if self.configuration['visualization_css']:
            try:
                repr_args['visualization_css'] = env.get_template(self.configuration['visualization_css']).render(**repr_args)
            except IOError:
                repr_args['visualization_css'] = None

        # some dependencies have names with invalid characters for variable names in Javascript
        repr_args['requirements_as_args'] = list(map(lambda x: x.replace('-', '_'), repr_args['requirements']))

        # if there are defined events, we merge them here
        repr_args['event_names'] = []

        if 'allowed_events' in repr_args['options'] and repr_args['options']['allowed_events']:
            repr_args['event_names'].extend(repr_args['options']['allowed_events'])

        repr_args['event_names'].extend(self.datagram_events)
        repr_args['event_names'] = list(set(repr_args['event_names']))

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
{% for key, value in data.items() %}{{ key }} -- (default: {{ value }})
{% endfor %}

{% if variables %}Keyword Arguments:
{% for key, value in variables.items() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

{% if options %}Sketch Arguments:
{% for key, value in options.items() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

{% if attributes %}Mappeable Attributes:
{% for key, value in attributes.items() %}{{ key }} -- (default: {{ value }})
{% endfor %}{% endif %}

{% if colorables %}Colorable Attributes:
{% for key, value in colorables.items() %}{{ key }} -- (default: {{ value }})
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

        for key, value in kwargs.items():
            if key in sketch_args:
                sketch_args[key] = value

            elif key == 'events' and 'options' in sketch_args and 'allowed_events' in sketch_args['options']:
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
                elif value is None or type(value) == str:
                    sketch_args['attributes'][key]['value'] = value
                else:
                    raise Exception('Not supported value for attribute {0}: {1}'.format(key, value))

            elif 'colorables' in sketch_args and key in sketch_args['colorables']:
                if type(value) == dict:
                    sketch_args['colorables'][key].update(value)
                elif type(value) in (int, float):
                    sketch_args['colorables'][key]['value'] = value
                elif value is None or type(value) == str:
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
    sketch_fn.variable_names = list(default_args['data'].keys())

    return sketch_fn
