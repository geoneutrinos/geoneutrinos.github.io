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
            'LOCST_T':16,
            'THICKNESS':17}    # lower crust thickness

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
        
        for i, point in enumerate(self.crust_model):
            for code in self.layers:
                if 's' == code :
                    self.crust_model[i, self.C.SFTSD_T] += point[self.C.SFTSD_T]
                elif 'h' == code:
                    thickness += np.reshape(self.crust_model[:,13],(-1,1))
                elif 'u' == code:
                    thickness += np.reshape(self.crust_model[:,14],(-1,1))
                elif 'm' == code:
                    thickness += np.reshape(self.crust_model[:,15],(-1,1))
                elif 'l' == code:
                    thickness += np.reshape(self.crust_model[:,16],(-1,1))
                else:
                    raise ValueError('invalid crust code')
        
    def oceanic(self):
        oceanic = np.reshape(self.crust_model[:,2],(-1,1))
        return oceanic

    def density(self):
        density = np.zeros((self.crust_model.shape[0],1))
        for code in self.layers:
            if 's' == code :
                density += np.reshape(self.crust_model[:,5],(-1,1))
            elif 'h' == code:
                density += np.reshape(self.crust_model[:,6],(-1,1))
            elif 'u' == code:
                density += np.reshape(self.crust_model[:,7],(-1,1))
            elif 'm' == code:
                density += np.reshape(self.crust_model[:,8],(-1,1))
            elif 'l' == code:
                density += np.reshape(self.crust_model[:,9],(-1,1))
            else:
                raise ValueError('invalid crust code')
        
        return density

    def mass(self):
        mass = np.zeros((self.crust_model.shape[0],11))
        mass = np.append(self.crust_model, mass, axis=1)
        logging.info('starting mass loop')
        # We need to convert the model units into SI so that the results will
        # be in kg, for this a factor of 1000 is added from 1g/cc in kg/m^3 and
        # a factor of 10^9 is added from km^3 to m^3
        coef = 1000 * 1000000000
        for i, point in enumerate(mass):
            mass[i,17] = self.area(point[1], point[1] - 2, 6371)
            if point[2] == 0:
                mass[i,18] = point[5] * point[12] * mass[i,17] * coef 
                mass[i,19] = point[6] * point[13] * mass[i,17] * coef 
                mass[i,20] = point[7] * point[14] * mass[i,17] * coef 
                mass[i,21] = point[8] * point[15] * mass[i,17] * coef 
                mass[i,22] = point[9] * point[16] * mass[i,17] * coef 
            if point[2] == 1:
                mass[i,23] = point[5] * point[12] * mass[i,17] * coef 
                mass[i,24] = point[6] * point[13] * mass[i,17] * coef 
                mass[i,25] = point[7] * point[14] * mass[i,17] * coef 
                mass[i,26] = point[8] * point[15] * mass[i,17] * coef 
                mass[i,27] = point[9] * point[16] * mass[i,17] * coef 
        logging.info('mass loop done')
        return mass

    def config(self, **kwargs):
        for key in kwargs:
            key = key.lower()
            if key == u'layers':
                logging.info('layers found in GET')
                self.select_layers(kwargs[key])
            elif key == u'output':
                logging.info('output foudn in GET')
                self.select_output(kwargs[key])
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
            self.dataout = np.append(self.crust_model, self.thickness(), axis=1)
        elif output == u'p':
            if len(self.layers) == 1:
                self.dataout = np.append(self.crust_model, self.density(), axis=1)
            else:
                raise ValueError('density only accepts one layer')
        elif output == u'q':
            self.output = 'heat'
        elif output == u'v':
            self.output = 'geonuflux'
        elif output == u'o':
            self.dataout = np.append(self.crust_model, self.oceanic(), axis=1)
        elif output == u'm':
            self.dataout = self.mass()
        else:
            raise ValueError('no valid output parameter was found')


    def griddata(self):
        """Dump the contents of a CrustModel instance to a grid format

        This method will take the current state of instance it is called on and
        return a tuple containg a list of lons, lats and the data in a grid
        format sutable for giving to the imgshow and transform scalar methods
        of matplotlib with basemap.
        """
        lons = np.unique(self.dataout[:,0])
        lats = np.unique(self.dataout[:,1])

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

        for point in self.dataout:
            lon_p = point[0]
            lat_p = point[1]

            data[lat[lat_p],lon[lon_p]] = point[17]
        
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
