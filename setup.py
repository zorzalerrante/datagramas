from distutils.core import setup

setup(name = "matta",
    version = "0.1.0",
    description = 'Ready-made visualizations for your IPython notebook',
    author = 'Eduardo Graells-Garrido',
    author_email = 'eduardo.graells@gmail.com',
    license = 'MIT License',
    url = 'http://github.com/carnbymatta',
    packages = ['matta'],
    package_dir = {'matta': 'matta'},
    include_package_data = True,
    package_data = {
        'matta' : [
            'libs/*',
            'templates/base.html',
            'templates/matta.*.js',
            'templates/matta.*.css'
        ]},
    scripts = [],
    long_description = """A set of ready-made visualizations written
        in d3.js for usage inside the IPython notebook."""
)