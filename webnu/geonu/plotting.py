#import matplotlib
#matplotlib.use('Agg')
#from mpl_toolkits.basemap import Basemap
#import matplotlib.pyplot as plt
from crust_model import CrustModel

#from multiprocessing import Process
import logging
log = logging.getLogger(__name__)
#import string

# Localization to make unicode sorting easy
import locale
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

def filename(request):
    filename = u'v1'

    for key in sorted(request.GET.keys(), cmp=locale.strcoll):
        if key != u'uthk':
            value = ''.join(sorted(list(set(request.GET[key].lower())),
                cmp=locale.strcoll))
        elif key == u'uthk':
            value = ''.join(request.GET[key].split(','))
        filename = filename + u'_' + key.lower() + u'.' + value

    filename = filename + u'.png'
    return filename

def get_data(request):
    crust = CrustModel()
    crust.config(**request.GET)
    return crust.griddata()

def get_rad_power(request):
    crust = CrustModel()
    crust.config(**request.GET)
    return crust.total_rad_power()

def get_rad_mass(request):
    crust = CrustModel()
    crust.config(**request.GET)
    return crust.radiogenic_masses()

def plot(request, image_path):
    log.debug('Map: Generating New Image')

    # Do the fast thing before (crust model) before doing the slow thing
    # that is the basemap init
    
    log.debug("Map: Basemap Init")
    m = Basemap(projection = 'cyl',
                llcrnrlat = -89, llcrnrlon = -180,
                urcrnrlat = 89, urcrnrlon = 180,
                resolution = 'l')
    log.debug("Map: calling crust griddata")
    lons, lats, data = get_data(request)
    nx = len(lons)
    ny = len(lats)

    log.debug("Map: Transform Scalar")
    map_data = m.transform_scalar(data, lons, lats, nx, ny, order=0)
    im_data = m.imshow(map_data, interpolation = 'nearest',)
    m.drawcoastlines(linewidth = 0.2)
    plt.axis('off')
    cbar = m.colorbar(im_data, location='bottom',)

    plt.subplots_adjust(left = 0 , right = 1, top = 1, bottom = 0, wspace = 0,
            hspace = 0)

    log.debug("Map: Writing map to file")
    plt.savefig(image_path,
            bbox_inches = 'tight', format='png', 
            dpi = 115, transparent = True, pad_inches = 0.01)

    log.debug("Map: Done")

def m_plot(request, image_path):
    p = Process(target=plot, args=(request, image_path,))
    p.start()
    p.join()
