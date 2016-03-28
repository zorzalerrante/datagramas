from distutils.core import setup
import glob

with open('requirements.txt', 'rt') as f:
    requirements = f.read().splitlines()

setup(name = 'datagramas',
    version = '1.0.0-beta',
    description = 'Ready-made visualization usage and scaffolding for your IPython notebook',
    author = 'Eduardo Graells-Garrido',
    author_email = 'eduardo.graells@telefonica.com',
    license = 'MIT License',
    url = 'http://github.com/carnby/matta',
    packages = ['datagramas'],
    package_dir = {'datagramas': 'datagramas'},
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
            'templates/scaffold.js'
            ]
        )
    },
    scripts = [],
    long_description = '''A set of ready-made visualizations written
        in d3.js for usage inside the Jupyter notebook, as well as tools to
        scaffold visualizations.''',
    classifiers=[
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.4'
    ]
)
