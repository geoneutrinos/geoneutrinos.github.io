from pyramid.response import Response

import logging
import os
import geonu.plotting as gplt
log = logging.getLogger(__name__)

def my_view(request):
    return {'project':'webnu'}

def render_plot(request):
    response = Response(content_type='image/png')

    filename = gplt.filename(request)

    log.debug('Filename:' + filename)
    here = os.path.dirname(__file__)
    image_path = os.path.join(here,'static','images', 'maps', filename)
    try:
        image = open(image_path, 'rb')
        response.app_iter = image

        log.debug('Map: Using cached image')
        return response
    except IOError: #assuming the map hasn't been generated yet

        gplt.m_plot(request, image_path)
        response.app_iter = open(image_path, 'rb')
        return response
