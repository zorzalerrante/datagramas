# matta

An artist for your IPython notebook that helps you to use and scaffold visualizations with [d3.js](http://d3js.org).

Currently Matta supports some visualizations that I have needed to implement in my on-going doctoral thesis.
But the main idea is to have a generalizable template to build visualizations on.

Contributions are welcome.

## Examples / Documentation

Although there is no official documentation yet, you can explore the following resources for examples and descriptions.



### IPython Notebooks

The following notebooks serve as examples/documentation:

  * [Basic Notebook Examples](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Basic%20Examples.ipynb)
  * [Let's Make a Map Too](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Let's%20Make%20a%20Map%20Too.ipynb)
  * [Let's <del>Make</del> Scaffold a Barchart](http://nbviewer.ipython.org/github/carnby/matta/blob/master/examples/Let's%20Make%20a%20Barchart.ipynb)

**If you do not see any visualizations when browsing the notebooks on NBViewer, please refresh the page. I don't know why it doesn't work on first load -- if you have any idea of why this happens, please let me know! :)**

### In the Wild

  * [2|S: Los Dos Santiagos](http://dcc.uchile.cl/~egraells/abrecl/): this is a project where we scaffolded many
    visualizations (Sankey, TopoJSON, Force Edge Bundle) to visualize transport data in Santiago, Chile. 
    All visualizations in the page were scaffolded with matta! _Note: the site is in spanish_.


## Initialization / Installation

First, install the python package:

```
pip install -r requirements.txt
python setup.py install
```

Then make a symbolic link in your IPython profile to matta libs:

```
~/.ipython/profile_default/static/custom$ ln -s ~/phd/apps/matta/matta/libs/ matta
```

And finally, edit the `custom.js` file and add the following lines:

```javascript
require.config({
    paths: {
        "leaflet": "/static/custom/matta/leaflet-0.7.3/leaflet-src",
        "wordcloud": "/static/custom/matta/d3.layout.cloud",
        "sankey": "/static/custom/matta/d3.sankey",
        "matta": "/static/custom/matta/matta",
        "tile": "/static/custom/matta/d3.geo.tile",
        "force_edge_bundling": "/static/custom/matta/d3.ForceEdgeBundling",
        "topojson": "/static/custom/matta/topojson",
        "d3": "/static/custom/matta/d3.v3.min"
    }
});

require(['matta'], function(matta) {
    matta.add_css('/static/custom/matta/matta.css');
});
```

## Credits

### Included Libraries

 * [d3.js](http://d3js.org)
 * [d3.sankey](http://bost.ocks.org/mike/sankey/)
 * [d3.layout.cloud](http://www.jasondavies.com/wordcloud/#%2F%2Fwww.jasondavies.com%2Fwordtree%2Fcat-in-the-hat.txt)
 * [d3.ForceEdgeBundling](https://github.com/upphiminn/d3.ForceBundle)
 * [topojson 1.6.18](https://github.com/mbostock/topojson)
 * [leaflet](http://leafletjs.com)

### Credits

 * [Jason Davies](http://www.jasondavies.com/) and [Mike Bostock](http://bost.ocks.org/mike/) -- many code from them is being used, reused and abused
   (not to mention `d3.js` itself). Thanks!
 * [Force Bundle Layout](https://github.com/upphiminn/d3.ForceBundle)
 * All the great devs behind IPython, numpy, scipy, pandas, networkx, seaborn, d3.js...

### About the name

See [Roberto Matta @ Wikipedia](https://en.wikipedia.org/wiki/Roberto_Matta).
He has a painting named ["ojo con los desarrolladores"](https://www.flickr.com/photos/83257355@N00/1352671334/?rb=1) (_desarrolladores_ is spanish for developers).

