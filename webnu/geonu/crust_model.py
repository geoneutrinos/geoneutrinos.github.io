import numpy as np
import pickle
import sys
import logging

class CrustModel:
    def __init__(self):
        pkl_file = open('webnu/geonu/crust_model_v2.pkl', 'rb')
        self.crust_model = pickle.load(pkl_file)
    
    def config(self, **kwargs):
        pass
    def set_concentrations(self, layers={}, u={}, k={}, th={}):
        pass
    def select_layers(self, layers = "umlsh"):
        return self.layers
    def output_param(self, output = "t"):
        """Selects the output for the griddata function

        The following parameters are ok:
            t, thickness in meters
            p, density in kg/m^3
            q, heat in watts (J/s)
            c, neutrino quanta per second
        """

        return self.output
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

            data[lat[lat_p],lon[lon_p]] = point[15]
        
        return (lons + 1,lats - 1,data) # coords need to be centerpoint

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
