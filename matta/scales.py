import numpy as np
import pandas as pd
from matplotlib.colors import rgb2hex

def threshold_scale(values, palette, is_domain=False, extend_by=0.05, center=None):
    """
    Creates an object representing a threshold scale for d3.js.

    :param values: The values that will be encoded by the scale. It could be the entire set of values or just the domain.
    :param palette: Color palette in RGB, as those returned by the Seaborn library.
    :param is_domain: Whether values is a domain extent or not.
    :param extend_by: Extension to be added to the scale domain.
    :param center: Value that can be used as center point in the scale domain. Useful for diverging color palettes.
    :return: Scale object compatible with d3.js.
    """

    if not is_domain:
        if center is None:
            color_domain = np.linspace(values.min(), values.max(), len(palette) - 1)
        else:
            diff = max(values.max() - center, center - values.min())
            color_domain = np.linspace(center - diff, center + diff, len(palette) - 1)
    else:
        if center is None:
            color_domain = np.linspace(values[0], values[1], len(palette) - 1)
        else:
            diff = max(values[1] - center, center - values[0])
            color_domain = np.linspace(center - diff, center + diff, len(palette) - 1)

    extension = (color_domain.max() - color_domain.min()) * extend_by

    color_scale = {
        'kind': 'threshold',
        'range': map(rgb2hex, palette),
        'domain': list(color_domain),
        'extent': [color_domain[0] - extension, color_domain[-1] + extension]
    }

    return color_scale

def categorical_scale(values, palette):
    """
    Creates an object representing a categorical/ordinal scale for d3.js.

    :param values: values encoded by the scale.
    :param palette: RGB colors (must have the same cardinality as values).
    :return: Scale object compatible with d3.js.
    """

    if type(values) == pd.Series:
        values = values.value_counts().index.values

    color_range = map(rgb2hex, palette)

    if len(values) < len(color_range):
        color_range = color_range[:len(values)]

    color_scale = {
        'kind': 'ordinal',
        'domain': values,
        'range': color_range
    }

    return color_scale