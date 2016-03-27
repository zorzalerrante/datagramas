import json
import numpy as np
import networkx as nx
import pandas as pd
import jinja2
from networkx.readwrite import json_graph


class DatagramasJSONEncoder(json.JSONEncoder):
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


def _dump_json(x):
    return json.dumps(x, cls=DatagramasJSONEncoder)


class JSCode(object):
    """
    A class that wraps a JavaScript code sentence rendered into a template considering a visualization context.
    """
    def __init__(self, code):
        self.code = code

    def render(self, **opts):
        return jinja2.Template(self.code).render(**opts)


class d3jsObject(object):
    """
    A representation of a d3-style object in Python, to be rendered later in visualization templates.

    An example is a geographic projection:

    d3.geo.mercator()
        .center([0,0])
        .scale(1)
        .translate([0, 0]);

    This is represented as:

    - js_name: 'd3.geo.mercator'
    - options: {'center': [0, 0], 'scale': 1, 'translate': [0,0]}

    But sometimes you need to include other variables from the visualization or context-dependent stuff.
    For those times, you can use the JSCode object. For instance:

    - options: {'translate': JSCode('[_vis_width / 2, _vis_height / 2]')}

    This would render the option as:

    .translate([_vis_width / 2, _vis_height / 2]).
    """
    def __init__(self, js_name, options=None, dependencies=None):
        self.js_name = js_name
        self.dependencies = dependencies
        self.options = options

    def render(self, context=None):
        if context is None:
            context = {}

        args = {}

        for key, value in self.options.items():
            if type(value) == JSCode:
                args[key] = value.render(**context)
            else:
                args[key] = _dump_json(value)

        template = """{{ js_name }}(){% for key, value in object_args.items() %}.{{ key}}({{ value }}){% endfor %}"""
        return jinja2.Template(template).render(js_name=self.js_name, object_args=args)