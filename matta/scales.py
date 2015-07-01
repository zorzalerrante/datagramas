import numpy as np
import seaborn as sns
import scipy
from matplotlib.colors import rgb2hex

def threshold_scale(values, palette, is_domain=False, extend_by=0.05, center=None):
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
