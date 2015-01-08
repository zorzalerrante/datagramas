import numpy as np
import seaborn as sns
import scipy
from matplotlib.colors import rgb2hex

def threshold_scale(values, palette, is_domain=False, extend_by=0.05):
    if not is_domain:
        color_domain = np.linspace(values.min(), values.max(), len(palette) - 1)
    else:
        color_domain = np.linspace(values[0], values[1], len(palette) - 1)

    extension = (values.max() - values.min()) * extend_by

    color_scale = {
        'range': map(rgb2hex, palette),
        'domain': list(color_domain),
        'extent': [color_domain[0] - extension, color_domain[-1] + extension]
    }

    return color_scale
