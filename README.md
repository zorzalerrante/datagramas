# Matta

An artist for your IPython notebook that provides _ready-made_ visualizations with [d3.js](http://d3js.org) for you to modify. 
The basic idea is to generate template-based visualizations and to modify them in the notebook. 
A future idea is to export the generated visualization (plus modifications) into a stand-alone visualization.

Currently Matta supports some visualizations that I have needed to implement in my on-going doctoral thesis. But the main idea is to have a generalizable template to build visualizations on.

Contributions are welcome.

**[See the basic notebook examples here](http://nbviewer.ipython.org/github/carnby/matta/blob/master/matta/notebooks/examples.ipynb)**

## Initialization

```python
import matta
matta.init(lib_path='http://localhost:8001', d3_url='http://localhost:8001/libs/d3.v3.min.js')
```

`lib_path` points to the url that has the lib folder available. For instance, I do the following:

```
cd ~/resources/matta
python -m SimpleHTTPServer 8001
```

`d3_url` points to the `d3.v3.min.js` script.

## Usage

All visualizations make use of the same invocation paradigm (treemap in the example):

```
matta.draw_treemap(data[,fig_id='treemap-figure', **kwargs])
```

A visualization is defined by its name, default settings plus and two templates: a css file (templates/matta.vis-name.css) and a javascript file (templates/matta.vis-name.js).

For instance, the sankey visualization takes as input a networkx graph and is defined as follows:

```python
def draw_sankey(data, **kwargs):
    defaults = {
        'fig_id':'sankey-graph',
        'width': 800,
        'height': 400,
        'layout_iterations': 32,
        'link_color': '#000',
        'link_opacity': 0.02,
        'font_size': 12,
        'label_margins': 50,
        'node_opacity': 0.9,
        'node_color': 'steelblue',
        'node_width': 30,
        'node_padding': 20,
        'requirements': ['d3', 'matta', 'sankey'],
    }

    defaults.update(kwargs)
    return _render_visualization('sankey', data, **defaults)
```

The method `_render_visualization` uses jinja2 to render the templates.

There is a base template in `templates/base.html` which takes care of setting up _require.js_ (see the `requirements` argument) as well as the boilerplate code. Note that the _fig_id_ argument generates an _id_ attribute on the _div_ element holding the visualization.

The _force-directed_, _graph-map_ and _sankey_ visualizations take as input a networkx graph.

The _pcoordinates_ visualization takes a pandas DataFrame as input.

## Current Visualizations

 * wordcloud (directly from Jason Davies code)
 * parallel coordinates (adapted from Jason Davies code)
 * treemap (directly from d3js)
 * force directed graph
 * graph with tiled background map and force/hierarchical edge bundling.

## Included Libraries

 * d3.js
 * d3.sankey
 * d3.layout.cloud
 * d3.geo.tile
 * d3.ForceEdgeBundling
 * topojson 1.6.18

## Dependencies

 * IPython
 * jinja2 (templates)
 * pandas (Dataframes. Currently being used in the Parallel Coordinates visualization).
 * networkx (Graphs. Currently being used in the Force Directed Graph).

## What's Next

 * In addition to more visualizations (added as needed), a nice idea is to render a visualization and then use `%%javascript` in the following cells to modify it. I would like to be able to retrieve the content of those cells and inject them on the templates. In this way, the IPython notebook could be used as a development environment to design and export visualizations. This includes extending the base template to consider a stand-alone visualization.
 * Register new visualizations by code. If you are creating a new visualization, then you could register it instead of including it in matta's source.

## About the name

See [here](https://en.wikipedia.org/wiki/Roberto_Matta).

## Credits

 * [Jason Davies](http://www.jasondavies.com/) and [Mike Bostock](http://bost.ocks.org/mike/) -- many code from them is being used, reused and abused (not to mention `d3.js` itself). Thanks!
 * [Force Bundle Layout](https://github.com/upphiminn/d3.ForceBundle)
 * All the great devs behind IPython, numpy, scipy, pandas, networkx, d3.js...
 * [webcolors](https://bitbucket.org/ubernostrum/webcolors/overview/) -- the list of css3 color names was extracted from the library.

## License

```
(Some parts Copyright (C) 2014 Eduardo Graells-Garrido)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```


