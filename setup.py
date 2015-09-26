from distutils.core import setup

with open('requirements.txt') as f:
    requirements = f.read().splitlines()

setup(name = "matta",
    version = "0.9.0",
    description = 'Ready-made visualization usage and scaffolding for your IPython notebook',
    author = 'Eduardo Graells-Garrido',
    author_email = 'eduardo.graells@gmail.com',
    license = 'MIT License',
    url = 'http://github.com/carnby/matta',
    packages = ['matta'],
    package_dir = {'matta': 'matta'},
    include_package_data = True,
    install_requires = requirements,
    package_data = {
        'matta' : [
            'LICENSE',
            'libs/*.js',
            'libs/*.css',
            'libs/leaflet-0.7.3/*.js',
            'libs/leaflet-0.7.3/*.css',
            'libs/leaflet-0.7.3/images/*',
            'templates/base.html',
            'templates/base.js',
            'templates/scaffold.js',
            'templates/matta.*.js',
            'templates/matta.*.css',
            'examples/*.ipynb'
        ]},
    scripts = [],
    long_description = """A set of ready-made visualizations written
        in d3.js for usage inside the IPython notebook, as well as tools to
        scaffold visualizations."""
)
