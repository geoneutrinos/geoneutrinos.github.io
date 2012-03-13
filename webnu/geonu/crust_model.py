import numpy as np
import pickle
import sys
import logging
import os
import math

class Column:
    def __init__(self):
        self.columns = { 'LON':0,         # Longetude
            'LAT':1,         # Latitude
            'OCEAN_F':2,     # Oceanic Crust Flag
            'ICE_P':3,       # Ice density
            'H2O_P':4,       # Water density
            'SFTSD_P':5,     # soft sediment Density
            'HDSD_P':6,      # hard sediment density
            'UPCST_P':7,     # upper crust density
            'MDCST_P':8,     # millde crust density
            'LOCST_P':9,     # power crust density
            'ICE_T':10,      # ice thickness
            'H2O_T':11,      # water thickness
            'SFTSD_T':12,    # soft sediment thickness
            'HDSD_T':13,     # hard sediment thickness
            'UPCST_T':14,    # upper crust thickness
            'MDCST_T':15,    # middle crust thickness
            'LOCST_T':16,    # lower crust thickness
            'THICKNESS':17,  # summed thickness
            'SFTSD_M':18,    # soft sediment mass
            'HDSD_M':19,     # hard sediment mass
            'UPCST_M':20,    # uper crust mass
            'MDCST_M':21,    # middle crust mass
            'LOCST_M':22,    # lower crust mass
            'AREA':23,       # the area of the block
            'MASS':24,       # sum of masses
            'U238':25,       # uranium concentration
            'TH232':26,      # thorium concentration
            'K40':27}        # potassium concentration
    def size(self,):
        return len(self.columns)

    def __getattr__(self, name):
        try:
            return self.columns[name]
        except:
            raise AttributeError


class memoize(object):
    def __init__(self, fn):
        self.fn = fn
        self.memo = {}
    def __call__(self, *args):
        if not self.memo.has_key(args):
            self.memo[args] = self.fn(*args)
        return self.memo[args]

    def __repr__(self):
        """Return the function's docstring."""
        return self.func.__doc__

    
class CrustModel:

    @memoize
    def area(north_lat, south_lat, earth_radius=600):
        lon_width = math.radians(2) # degrees
        dLat = math.sin(math.radians(north_lat)) - math.sin(math.radians(south_lat))
        area = (earth_radius ** 2 * lon_width * dLat)
        return area

    def thickness(self):
        logging.info('Thickness: Start')
        layers = []
        for code in self.layers:
            if 's' == code :
                layers.append(self.C.SFTSD_T)
            elif 'h' == code:
                layers.append(self.C.HDSD_T)
            elif 'u' == code:
                layers.append(self.C.UPCST_T)
            elif 'm' == code:
                layers.append(self.C.MDCST_T)
            elif 'l' == code:
                layers.append(self.C.LOCST_T)
            else:
                raise ValueError('invalid crust code')

        logging.info("Thickness: Layers are %s",layers)
        for i, point in enumerate(self.crust_model): 
            for layer in layers:
                self.crust_model[i, self.C.THICKNESS] += point[layer]
        logging.info('Thickness: Done')

    def density(self):
        for code in self.layers:
            if 's' == code :
                return self.C.SFTSD_P
            elif 'h' == code:
                return self.C.HDSD_P
            elif 'u' == code:
                return self.C.UPCST_P
            elif 'm' == code:
                return self.C.MDCST_P
            elif 'l' == code:
                return self.C.LOCST_P
            else:
                raise ValueError('invalid crust code')
        
        return density

    def mass(self):
        logging.info('starting mass loop')
        # We need to convert the model units into SI so that the results will
        # be in kg, for this a factor of 1000 is added from 1g/cc in kg/m^3 and
        # a factor of 10^9 is added from km^3 to m^3
        coef = 1000 * 1000000000
        for i, point in enumerate(self.crust_model):
            self.crust_model[i,self.C.AREA] = self.area(point[1], point[1] - 2, 6371)
            self.crust_model[i,18] = point[5] * point[12] * self.crust_model[i,self.C.AREA] * coef 
            self.crust_model[i,19] = point[6] * point[13] * self.crust_model[i,self.C.AREA] * coef 
            self.crust_model[i,20] = point[7] * point[14] * self.crust_model[i,self.C.AREA] * coef 
            self.crust_model[i,21] = point[8] * point[15] * self.crust_model[i,self.C.AREA] * coef 
            self.crust_model[i,22] = point[9] * point[16] * self.crust_model[i,self.C.AREA] * coef 

        logging.info('mass loop done')
        layers = []
        if self.dataout == self.C.MASS:
            for code in self.layers:
                if 's' == code :
                    layers.append(self.C.SFTSD_M)
                elif 'h' == code:
                    layers.append(self.C.HDSD_M)
                elif 'u' == code:
                    layers.append(self.C.UPCST_M)
                elif 'm' == code:
                    layers.append(self.C.MDCST_M)
                elif 'l' == code:
                    layers.append(self.C.LOCST_M)
                else:
                    raise ValueError('invalid crust code')

            for i, point in enumerate(self.crust_model):
                for layer in layers:
                    self.crust_model[i, self.C.MASS] += point[layer]

    def concentrations(self, args):
        conc = string.split(args, sep=',')
        for i, point in enumerate(self.crust_model):
            if point[self.C.OCEAN_F] == 0: # is continental crust
                self.crust_model[i, self.C.U238] = conc[0]
                self.crust_model[i, self.C.TH232] = conc[2]
                self.crust_model[i, self.C.K40] = conc[4]
            elif point[self.C.OCEAN_F] == 1: # is oceanic crust
                self.crust_model[i, self.C.U238] = conc[1]
                self.crust_model[i, self.C.TH232] = conc[3]
                self.crust_model[i, self.C.K40] = conc[5]

    def config(self, **kwargs):
        for key in kwargs:
            key = key.lower()
            if key == u'layers':
                logging.info('layers found in GET')
                self.select_layers(kwargs[key])
            elif key == u'output':
                logging.info('output foudn in GET')
                self.select_output(kwargs[key])
            elif key == u'uthk':
                logging.info('concentrations found in GET')
                self.concentrations(kwargs[key])
            else:
                raise ValueError('Unknown key found in GET request')

    def set_concentrations(self, layers={}, u={}, k={}, th={}):
        pass

    def select_layers(self, layers = "umlsh"):
        self.layers = layers.lower()

    def select_output(self, output = "t"):
        """Selects the output for the griddata function

        The following parameters are ok:
            t, thickness in meters
            p, density in kg/m^3
            q, heat in watts (J/s)
            c, neutrino quanta per second
        """
        output = output.lower()
        if output == u't':
            self.thickness()
            self.dataout = self.C.THICKNESS
        elif output == u'p':
            if len(self.layers) == 1:
                self.dataout = self.density()
            else:
                raise ValueError('density only accepts one layer')
        elif output == u'q':
            self.output = 'heat'
        elif output == u'v':
            self.output = 'geonuflux'
        elif output == u'o':
            self.dataout = self.C.OCEAN_F
        elif output == u'm':
            self.dataout = self.C.MASS
            self.mass()
        else:
            raise ValueError('no valid output parameter was found')


    def griddata(self):
        """Dump the contents of a CrustModel instance to a grid format

        This method will take the current state of instance it is called on and
        return a tuple containg a list of lons, lats and the data in a grid
        format sutable for giving to the imgshow and transform scalar methods
        of matplotlib with basemap.
        """
        lons = np.unique(self.crust_model[:,0])
        lats = np.unique(self.crust_model[:,1])

        #for now it is probably best to just dump one layer untill a some sort
        # of output state is defined, this will be the thickness of the
        # upper crust for now

        data = np.empty(shape=(len(lats),len(lons)))
        lon = {}
        lat = {}
        for index, point in np.ndenumerate(lons):
            lon[point] = index[0]

        for index, point in np.ndenumerate(lats):
            lat[point] = index[0]

        for point in self.crust_model:
            lon_p = point[0]
            lat_p = point[1]

            data[lat[lat_p],lon[lon_p]] = point[self.dataout]
        
        return (lons + 1,lats - 1,data) # coords need to be centerpoint

    def __init__(self):
        here = os.path.dirname(__file__)
        pkl_file = open(os.path.join(here, 'crust_model_v2.pkl'), 'rb')
        crust_model_load = pickle.load(pkl_file)
        self.C = Column()
        num_col = self.C.size()
        padding = np.zeros((crust_model_load.shape[0],num_col-17))
        self.crust_model = np.append(crust_model_load, padding, axis=1)
    
if __name__ == "__main__":
    print "This is the CrustModel class for the geonu project, running as a"
    print "script will do tests on the class to help with debugging"
    sys.stdout.write("Attempting to init CrustModel Class...")
    try:
        crust_model = CrustModel()
        sys.stdout.write("OK!\n")
    except:
        sys.stdout.write("Fail!\n improve the error reporting in this\n")
    sys.stdout.write("griddata...")
    x,y,data = crust_model.griddata()
    print data
