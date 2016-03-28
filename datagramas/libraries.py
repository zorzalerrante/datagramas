import json

"""
This is a dict containing all the embedded libraries within datagramas.
The source attribute of each library points to the file relative to the datagramas/libs sub-folder.
"""
LIBRARIES = {
    'd3': {
        'source': 'd3/d3.min',
        'author': 'Mike Bostock',
        'vendor_url': 'http://d3js.org/',
        'version': '3.5.10',
        'dependencies': {}
    },
    'datagramas': {
        'source': 'datagramas',
        'author': 'Eduardo Graells',
        'vendor_url': 'http://github.com/carnby/datagramas',
        'version': '1.0.0',
        'dependencies': {'d3'}
    },
    'cloud': {
        'source': 'd3-cloud/d3.layout.cloud',
        'author': 'Jason Davies',
        'vendor_url': 'https://www.jasondavies.com/wordcloud/about/',
        'version': '1.2.1',
        'dependencies': {'d3'}
    },
    'sankey': {
        'source': 'd3-sankey/sankey',
        'author': 'Mike Bostock',
        'vendor_url': 'http://bost.ocks.org/mike/d3-sankey/',
        'version': 'N/A',
        'dependencies': {'d3'},
        'exports': 'd3.sankey'
    },
    'topojson': {
        'source': 'topojson/topojson.min',
        'author': 'Mike Bostock',
        'vendor_url': 'https://github.com/mbostock/topojson',
        'version': '1.6.19',
        'dependencies': {}
    },
    'leaflet': {
        'source': 'leaflet/leaflet',
        'author': 'Vladimir Agafonkin',
        'vendor_url': 'http://leafletjs.com/',
        'version': '0.7.7',
        'dependencies': {}
    },
    'cartogram': {
        'source': 'd3-cartogram/cartogram',
        'author': 'Shawn Allen',
        'vendor_url': 'https://github.com/shawnbot/d3-cartogram/',
        'version': 'N/A',
        'dependencies': {'d3'},
        # used only for shim configuration in RequireJS
        'exports': 'd3.cartogram'
    },
    'force_edge_bundling': {
        'source': 'd3-force-bundling/d3.ForceEdgeBundling',
        'author': 'Corneliu S.',
        'vendor_url': 'https://github.com/upphiminn/d3.ForceBundle',
        'version': 'N/A',
        'dependencies': {'d3'}
    },
    'parsets': {
        'source': 'd3-parsets-1.2.4/d3.parsets',
        'author': 'Jason Davies',
        'vendor_url': 'http://www.jasondavies.com/parallel-sets/',
        'version': '1.2.4',
        'dependencies': {'d3'},
        'exports': 'd3.parsets'
    },
    'cola': {
        'source': 'cola/cola.min',
        'author': 'Tim Dwyer',
        'vendor_url': 'http://marvl.infotech.monash.edu/webcola/',
        'version': 'N/A',
        'dependencies': {'d3'},
        'exports': 'cola'
    },
    'legend': {
        'source': 'd3-legend/d3-legend.min',
        'author': 'Susie Lu',
        'vendor_url': 'http://d3-legend.susielu.com/',
        'version': '1.6.0',
        'dependencies': {'d3'},
        'exports': 'd3.legend'
    },
    'd3-geo-projection': {
        'source': 'd3-geo-projection/d3.geo.projection',
        'author': 'Mike Bostock',
        'vendor_url': 'https://github.com/d3/d3-geo-projection',
        'version': '0.2.16',
        'dependencies': {'d3'},
        'exports': 'd3.projections'
    },
    'd3-tip': {
        'source': 'd3-tip/index',
        'author': 'Justin Palmer',
        'vendor_url': 'https://github.com/Caged/d3-tip',
        'version': '0.6.7',
        'dependencies': {'d3'},
        'exports': 'd3.tip'
    }
}

def init_javascript_code(path='/custom/datagramas'):
    """
    Returns the Javascript code needed to load datagramas libraries.

    In the IPython notebook this can be loaded automatically by adding the output
    of this function to custom.js script.
    """

    shims = {key: {'deps': list(lib_data['dependencies']), 'exports': lib_data['exports']} for key, lib_data in LIBRARIES.items() if 'exports' in lib_data}
    paths = {key: '{0}/{1}'.format(path, lib_data['source']) for key, lib_data in LIBRARIES.items()}

    template = '''

    if (!require.defined('datagramas')) {{
        require.config({{
            paths: {0},
            shim: {1},
        }});

        require(['datagramas'], function(datagramas) {{
            datagramas.add_css('{2}');
        }});
    }}
    '''

    template = template.format(json.dumps(paths, indent=2), json.dumps(shims, indent=2), path  + '/datagramas.css')

    return template
