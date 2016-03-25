import json
import numpy as np
import networkx as nx
import pandas as pd
from networkx.readwrite import json_graph


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


def _dump_json(x):
    return json.dumps(x, cls=MattaJSONEncoder)


