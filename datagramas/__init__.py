from __future__ import print_function
import importlib
import os
from IPython.display import HTML
from .sketch import build_sketch, _dump_json
from .libraries import init_javascript_code

__author__ = 'Eduardo Graells-Garrido'
__version__ = '1.0.0'

def init_javascript(path='/custom/datagramas'):
    """
    Inits the Javascript code needed to load datagramas libraries in the Jupyter Notebook when viewed on NBViewer.
    """

    code = '''
<script>
$(document).ready(function() {{
    if (document.location.hostname !== 'localhost') {{
        {0}
    }}
}});
</script>'''

    code = code.format(init_javascript_code(path)) + '<span class="label label-info">datagramas</span> Javascript code added.'
    return HTML(code)

def dump_data(data, json_name):
    with open(json_name, 'w') as f:
        f.write(_dump_json(data))


def import_visualization(module_name, package=None):
    """
    Imports a Python module that contains a visualization using importlib.

    A valid visualization for datagramas contains at least two files: __init__.py and template.js.
    In __init__.py there must be a VISUALIZATION_CONFIG dictionary. Optionally, the file can contain
    a function named PROCESS_CONFIG.

    :param module_name: name of the module (for example, 'visualizations.treemap').
    :param package: anchor for resolving the package name.
    :return: a function that can display the visualization in IPython notebook or scaffold it to Javascript.
    """
    vis_module = importlib.import_module(module_name, package=package)
    module_dir = os.path.realpath(os.path.dirname(vis_module.__file__))
    config = vis_module.VISUALIZATION_CONFIG

    if not 'visualization_js' in config:
        template_js = '{0}/template.js'.format(module_dir)
        if os.path.exists(template_js):
            config['visualization_js'] = template_js
        else:
            raise Exception('No valid visualization code.')

    if not 'visualization_css' in config:
        template_css = '{0}/template.css'.format(module_dir)
        if os.path.exists(template_css):
            print(template_css)
            config['visualization_css'] = template_css
        else:
            config['visualization_css'] = None

    if os.path.exists('{0}/functions.js'.format(module_dir)):
        config['functions_js'] = '{0}/functions.js'.format(module_dir)

    opt_process = getattr(vis_module, 'PROCESS_CONFIG', None)

    return build_sketch(config, opt_process=opt_process)

# Included Visualizations
cartogram = import_visualization('.visualizations.cartogram', package='datagramas')
cartography = import_visualization('.visualizations.cartography', package='datagramas')
circlepack = import_visualization('.visualizations.circlepack', package='datagramas')
flow = import_visualization('.visualizations.flow', package='datagramas')
force = import_visualization('.visualizations.force', package='datagramas')
parcoords = import_visualization('.visualizations.parcoords', package='datagramas')
treemap = import_visualization('.visualizations.treemap', package='datagramas')
wordcloud = import_visualization('.visualizations.wordcloud', package='datagramas')
parsets = import_visualization('.visualizations.parsets', package='datagramas')

