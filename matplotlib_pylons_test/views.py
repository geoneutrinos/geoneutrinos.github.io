from pyramid.response import Response
import matplotlib
matplotlib.use('Agg')
from mpl_toolkits.basemap import Basemap
import matplotlib.pyplot as plt
from geonu.crust_model import CrustModel
import logging

def my_view(request):
    return {'project':'matplotlib_pylons_test'}

def render_plot(request):
    response = Response(content_type='image/png')
    try:
        image = open('matplotlib_pylons_test/static/images/test.png', 'rb')
        response.app_iter = image

        logging.info('Map: Using cached image')
        return response
    except IOError:
        logging.info('Map: Generating New Image')
        m = Basemap(projection = 'cyl',
                    llcrnrlat = -89, llcrnrlon = -180,
                    urcrnrlat = 89, urcrnrlon = 180,
                    resolution = 'l')
        crust = CrustModel()
        get = request.GET
        crust.config(**get)
        
        lons, lats, data = crust.griddata()
        nx = len(lons)
        ny = len(lats)
        map_data = m.transform_scalar(data, lons, lats, nx, ny)
        im_data = m.imshow(map_data, interpolation = 'nearest')
        m.drawcoastlines(linewidth = 0.2)
        plt.axis('off')

        plt.subplots_adjust(left = 0 , right = 1, top = 1, bottom = 0, wspace = 0,
                hspace = 0)
        plt.savefig('matplotlib_pylons_test/static/images/test.png',
                bbox_inches = 'tight',
                dpi = 115, transparent = True, pad_inches = 0.01)

        response.app_iter = open('matplotlib_pylons_test/static/images/test.png', 'rb')
        return response
