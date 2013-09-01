from pyramid.config import Configurator
from webnu.resources import Root

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(root_factory=Root, settings=settings)
    config.include('pyramid_jinja2')
    config.add_jinja2_search_path("webnu:templates")

    config.add_route('plot', '/plot.png')
    config.add_view('webnu.views.render_plot',
                    route_name='plot')

    config.add_route('plt_json', '/plot.json')
    config.add_view('webnu.views.plt_json',
                    route_name='plt_json')

    config.add_static_view(name='css', path='webnu:static/css')
    config.add_static_view(name='js', path='webnu:static/js')
    config.add_static_view(name='v', path='webnu:static/vender')


    config.add_route('model', '/model/')
    config.add_view(route_name='model', renderer='templates/model.jinja2')
    config.add_route('default', '/')
    config.add_view(route_name='default', renderer='templates/base.jinja2')
    return config.make_wsgi_app()
