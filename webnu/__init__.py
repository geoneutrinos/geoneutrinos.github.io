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
    return config.make_wsgi_app()
