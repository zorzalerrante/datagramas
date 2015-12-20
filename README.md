# matta

An artist for your IPython notebook that helps you to use and scaffold visualizations with [d3.js](http://d3js.org).

Currently `matta` supports some visualizations that I needed to implement in my doctoral thesis.
But the main idea is to have a generalizable template to build visualizations on.

`matta` works with Python 2. Python 3 support is planned to be added at some point.

Contributions are welcome.

## Examples / Documentation

Although there is no official documentation yet, the following notebooks serve as examples/documentation:

  * [Basic Notebook Examples](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Basic%20Examples.ipynb)
  * [Let's Make a Map Too](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Let's%20Make%20a%20Map%20Too.ipynb)
  * [Let's <del>Make</del> Scaffold a Barchart](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Let's%20Make%20a%20Barchart.ipynb)

## Initialization / Installation

First, install the python package:

```
pip install -r requirements.txt
python setup.py install
```

Then make a symbolic link in your IPython profile to matta libs:

```
~/.jupyter/custom$ ln -s ~/path_to_matta/matta/libs/ matta
```

And finally, edit the `custom.js` file and add the following lines:

```javascript
require.config({
    shim: {
        'cartogram': {
            'deps': ['d3'],
            'exports': 'd3.cartogram'
        },
        'parsets': {
            'deps': ['d3'],
            'exports': 'd3.parsets'
        },
        'cola': {
            'deps': ['d3'],
            'exports': 'cola'
        },
        'sankey': {
            'deps': ['d3'],
            'exports': 'd3.sankey'
        },
        'legend': {
            'deps': ['d3'],
            'exports': 'd3.legend'
        }
    },
    paths: {
        "leaflet": "/custom/matta/leaflet-0.7.3/leaflet-src",
        "cloud": "/custom/matta/d3-cloud/d3.layout.cloud",
        "sankey": "/custom/matta/d3-sankey/sankey",
        "matta": "/custom/matta/matta",
        "tile": "/custom/matta/d3.geo.tile",
        "force_edge_bundling": "/custom/matta/d3.ForceEdgeBundling",
        "topojson": "/custom/matta/topojson/topojson.min",
        "d3": "/custom/matta/d3/d3.min",
        "cola": "/custom/matta/cola/cola.min",
        "cartogram": "/custom/matta/d3-cartogram/cartogram-module",
        'parsets': '/custom/matta/d3-parsets-1.2.4/d3.parsets',
        'legend': '/custom/matta/d3-legend/d3-legend.min'
    }
});

require(['matta'], function(matta) {
    matta.add_css('/custom/matta/matta.css');
});
```

This will make IPython to load matta every time you load a notebook file. If you use an older version of IPython notebook,
note that you will need to include the "/static" prefix to those URLs.

## Visualization Modules

All visualization in matta are modules. A module is composed of a configuration and several template and style files. 

The **"Let's <del>Make</del> Scaffold a Barchart"** example notebook is a basic example of all these concepts.

### Configuration

  * Options
  * Data
  * Variables
  * Auxiliary Variables
  * Read-only Properties
  * Mapped Attributes
  * Colorables
  * Extra Functions: PROCESS_CONFIG

### Template Files

  * template.js
  * template.css
  * functions.js
  
### Scaffolding



## Credits

matta bundles the following libraries (see the `matta/libs` subfolder):

 * [d3.js](http://d3js.org)
 * [d3.sankey](http://bost.ocks.org/mike/sankey/)
 * [d3.layout.cloud](http://www.jasondavies.com/wordcloud/#%2F%2Fwww.jasondavies.com%2Fwordtree%2Fcat-in-the-hat.txt)
 * [d3.ForceEdgeBundling](https://github.com/upphiminn/d3.ForceBundle)
 * [d3.parsets](https://github.com/jasondavies/d3-parsets)
 * [topojson 1.6.18](https://github.com/mbostock/topojson)
 * [leaflet](http://leafletjs.com)
 * [cartogram.js](http://prag.ma/code/d3-cartogram/)
 * [WebCola](http://marvl.infotech.monash.edu/webcola/)
 * [d3-legend](http://d3-legend.susielu.com/)

It also contains snippets of code from:

 * [D3 Plus](http://d3plus.org/): we use the color text function.

### Next Steps?

 * Build a plug-in structure to define behavior at visualization events (e.g., tooltips, callbacks).
 * Facet data with small-multiples or visualization widgets.
 * Bundle a tooltip library (for instance, [d3-tip](https://github.com/Caged/d3-tip)).
 * Allow to export template versions of visualizations+data (e.g., export to gist).

### About the name

See [Roberto Matta @ Wikipedia](https://en.wikipedia.org/wiki/Roberto_Matta).
He has a painting named ["ojo con los desarrolladores"](https://www.flickr.com/photos/83257355@N00/1352671334/?rb=1) (_desarrolladores_ is spanish for developers).

### In the Wild

  * [2|S: Los Dos Santiagos](http://dcc.uchile.cl/~egraells/abrecl/): this is a project where we scaffolded many
    visualizations (Sankey, TopoJSON, Force Edge Bundle) to visualize transport data in Santiago, Chile.
    All visualizations in the page were scaffolded with matta! _Note: the site is in spanish_.
  * [Data Portraits](http://auroratwittera.cl/perfil/carnby/): this visualization was implemented in matta for my
  doctoral thesis. I needed a way to visualize Twitter profiles and the output of a recommender algorithm. Since the
  data used in the visualization was constantly changing (because algorithms were being developed), I needed a more 
  dynamic way to implement the visualization than always editing JS/HTML files and then reloading everything, 
  including re-execution of algorithms. 