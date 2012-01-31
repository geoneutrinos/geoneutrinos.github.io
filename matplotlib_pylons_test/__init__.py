from pyramid.config import Configurator
from matplotlib_pylons_test.resources import Root

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(root_factory=Root, settings=settings)
    config.include('pyramid_jinja2')
    config.add_jinja2_search_path("matplotlib_pylons_test:templates")

    config.add_route('plot', '/plot.png')
    config.add_view('matplotlib_pylons_test.views.render_plot',
                    route_name='plot')
    return config.make_wsgi_app()
