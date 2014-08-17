from pyramid.response import Response
import pyramid.httpexceptions as exc
import numpy

import json
from gzip import GzipFile
import logging
import os
import geonu.plotting as gplt
import numpy as np

log = logging.getLogger(__name__)

class NumpyAwareJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()[::-1]
        return json.JSONEncoder.default(self, obj)

def my_view(request):
    return {'project':'webnu'}

def plt_json(request):
    response = Response(content_type='application/json')
    lon, lat, data = gplt.get_data(request)
    filename = gplt.filename(request)
    filename = filename
    here = os.path.dirname(__file__)
    image_path = os.path.join(here,'static','cache', filename + ".json")
    if not os.path.isfile(image_path):
        f = open(image_path, 'wb')
        f.write(json.dumps(data, separators=(',', ':'), cls=NumpyAwareJSONEncoder))
        f.close()
    return exc.HTTPFound("cache/" + filename + ".json")

def total_rad_power_json(request):
    response = Response(content_type='application/json')
    power = gplt.get_rad_power(request)
    response.body = str(power)
    return response

def crust_rad_mass_json(request):
    response = Response(content_type='application/json')
    power = gplt.get_rad_mass(request)
    response.body = str(power)
    return response

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
