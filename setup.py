from distutils.core import setup
import glob

with open('requirements.txt') as f:
    requirements = f.read().splitlines()

setup(name = 'matta',
    version = '1.0.0-pre',
    description = 'Ready-made visualization usage and scaffolding for your IPython notebook',
    author = 'Eduardo Graells-Garrido',
    author_email = 'eduardo.graells@telefonica.com',
    license = 'MIT License',
    url = 'http://github.com/carnby/matta',
    packages = ['matta'],
    package_dir = {'matta': 'matta'},
    include_package_data = True,
    install_requires = requirements,
    package_data = {
        'matta' : (
            glob.glob('libs/*.*') +
            glob.glob('libs/*/*') +
            glob.glob('libs/*/*/*') +
            glob.glob('visualizations/*.*') +
            glob.glob('visualizations/*/*') +
            ['templates/base.html',
            'templates/base.js',
            'templates/scaffold.js',
            'templates/matta.*.js',
            'templates/matta.*.css',
            ]
        )},
    scripts = [],
    long_description = '''A set of ready-made visualizations written
        in d3.js for usage inside the IPython notebook, as well as tools to
        scaffold visualizations.'''
)
