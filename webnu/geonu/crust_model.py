import numpy as np
import pickle
import sys
import logging
import os

class CrustModel:
    def thickness(self):
        thickness = np.zeros((self.crust_model.shape[0],1))
        for code in self.layers:
            if 's' == code :
                thickness += np.reshape(self.crust_model[:,12],(-1,1))
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

        self.dataout = np.append(self.crust_model, thickness, axis=1)

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
            self.thickness()
        elif output == u'p':
            self.output = 'density'
        elif output == u'q':
            self.output = 'heat'
        elif output == u'v':
            self.output = 'geonuflux'
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
        self.crust_model = pickle.load(pkl_file)
    
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
