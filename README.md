## How to setup VirtualEnv for the WebNU project #

1. The first thing that needs to be done is to setup the virtual env
   itself, done by running `virtualenv DIR` where DIR will be created
   by virtualenv, it should install pip and setup tools.

2. all subsequent commands need to be run with the virtualenv activated,
   do that by running `source bin/acticate` in bash. the activate script
   is located in the virtualenv dir that you created in step one.

3. With the virtualenv activated, install pyramid by running `pip
   install pyramid==1.2`. Pyramid will be downloaded and installed into the
   virtualenv. This will install a known good version of pyramid for use
   with the webnu project. Also installed will be the dependancies of
   pyramid (Chameleon, Mako, Paste, PasteScript, WebOb, repoze.lru,
   zope.component, zope.interface, zope.deprecation, venusian,
   translationstring, MarkupSafe, zope.event)

4. Numpy must also be installed by running `pip install numpy`. At the
   time of writing this was numpy-1.6.1

5. Matplotlib must be built from source. To get the latest matplotlib
   clone it from github `git clone
   git://github.com/matplotlib/matplotlib.git`. Then cd into the
   matplotlib direcotry and run `python setup.py install`

6. Basemap also needs to be built from source. To get the latest basemap
   source, clone it from github,
   `git clone git://github.com/matplotlib/basemap.git` If you already
   have GEOS installed that you will need to tell python where the libs
   and headers are by setting the env variable GEOS_DIR to where you
   installed it to. If you don't have it built already, you will need to
   build it first then run setup.py (`python setup.py install`).

7. the project also relys on pyramid\_jinja2, install that with pip:
   `pip install pyramid_jinja2`

8. Finally you will need to install the webnu project with the setup
   script. The default for development would be `python setup.py
   develop`

9. The application can be launched with `paster serve development.ini`
   however the plotting functions won't work yet.

## Additional Setup steps ##
1. The crust model pickle file 'crust\_model\_v2.pkl' needs to be placed
   in the geonu directory.

1. the direcotry for the maps need to be created as
   'webnu/static/images/maps/' with approprate permissions for the
   program to be able to read and write images in it.
