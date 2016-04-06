from distutils.core import setup
import os

setup(name = 'datagramas',
    version = '1.0.0b',
    description = 'Ready-made visualization usage and scaffolding for your Jupyter notebook',
    author = 'Eduardo Graells-Garrido',
    author_email = 'eduardo.graells@telefonica.com',
    license = 'MIT License',
    url = 'http://github.com/carnby/datagramas',
    packages = ['datagramas'],
    package_dir = {'datagramas': 'datagramas'},
    package_data = {
        'datagramas' : (
            [os.path.join('libs', '*.*')] +
            [os.path.join('libs', '*', '*')] +
            [os.path.join('libs', '*', '*', '*')] +
            [os.path.join('visualizations', '*.*')] +
            [os.path.join('visualizations', '*', '*')] +
            [os.path.join('templates', 'base.html'),
            os.path.join('templates', 'base.js'),
            os.path.join('templates', 'scaffold.js')
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
