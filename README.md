# Matta

An artist for your IPython notebook that helps you to scaffold visualizations with [d3.js](http://d3js.org).

Currently Matta supports some visualizations that I have needed to implement in my on-going doctoral thesis.
But the main idea is to have a generalizable template to build visualizations on.

Contributions are welcome.

**[See the basic notebook examples here](http://nbviewer.ipython.org/github/carnby/matta/blob/master/matta/notebooks/examples.ipynb)**

## Initialization

Make a symbolic link in your IPython profile to matta libs:

```
~/.ipython/profile_default/static/custom$ ln -s ~/phd/apps/matta/matta/libs/ matta
```

Then edit the custom.js file and add the following lines:

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
        "force_directed": "/static/custom/matta/matta.force-directed",
        "d3": "/static/custom/matta/d3.v3.min"
    }
});

require(['matta'], function(matta) {
    matta.add_css('/static/custom/matta/matta.css');
});
```

## Visualizing Data

We work with pandas DataFrames, networkx Graphs, and bags of words. As long as you can convert your data to those
 formats, then you will we able to use matta.

All visualizations make use of the same invocation paradigm (treemap in the example):

```
visualization(dataframe=DF, graph=GRAPH, items=BOW, **kwargs)
```

Where **kwargs is the set of options available for each visualization.

## Current Visualizations

 * wordcloud (directly from Jason Davies code)
 * parallel coordinates (adapted from Jason Davies code)
 * treemap (directly from d3js)
 * force directed graph
 * graph with tiled background map and force/hierarchical edge bundling.

# Scaffolding Visualizations

Here I briefly describe how to scaffold visualizations.

## Credits

### Included Libraries

 * d3.js
 * d3.sankey
 * d3.layout.cloud
 * d3.geo.tile
 * d3.ForceEdgeBundling
 * topojson 1.6.18

### Credits

 * [Jason Davies](http://www.jasondavies.com/) and [Mike Bostock](http://bost.ocks.org/mike/) -- many code from them is being used, reused and abused
   (not to mention `d3.js` itself). Thanks!
 * [Force Bundle Layout](https://github.com/upphiminn/d3.ForceBundle)
 * All the great devs behind IPython, numpy, scipy, pandas, networkx, seaborn, d3.js...

### About the name

See [here](https://en.wikipedia.org/wiki/Roberto_Matta).

