import numpy as np
import pickle
import sys
import logging
import os
import math
import string
log = logging.getLogger(__name__)

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
            'HEAT':25,
            'SFTSD_H':26,
            'HDSD_H':27,
            'UPCST_H':28,
            'MDCST_H':29,
            'LOCST_H':30,
            'SFTSD_U238':31,
            'SFTSD_TH232':32,
            'SFTSD_K40':33,
            'HDSD_U238':34,
            'HDSD_TH232':35,
            'HDSD_K40':36,
            'UPCST_U238':37,
            'UPCST_TH232':38,
            'UPCST_K40':39,
            'MDCST_U238':40,
            'MDCST_TH232':41,
            'MDCST_K40':42,
            'LOCST_U238':43,
            'LOCST_TH232':44,
            'LOCST_K40':45,
            'SFTSD_NU':46,
            'HDSD_NU':47,
            'UPCST_NU':48,
            'MDCST_NU':49,
            'LOCST_NU':50,
            'NU':51,
            'X':52,
            'Y':53,
            'Z':54,
            'SFTSD_D':55,
            'HDSD_D': 56,
            'UPCST_D': 57,
            'MDCST_D': 58,
            'LOCST_D': 59,
            'HEAT_SANS_AREA': 60,
            'HEAT_U': 61,
            'HEAT_TH': 62,
            'HEAT_K': 63,
            'NU_FLUX_U': 64,
            'NU_FLUX_TH': 65,
            'NU_FLUX_K': 66,
            'NU_SIG_U': 67,
            'NU_SIG_TH': 68,
            }
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
    def area(north_lat, south_lat, earth_radius=6371):
        lon_width = math.radians(2) # degrees
        dLat = math.sin(math.radians(north_lat)) - math.sin(math.radians(south_lat))
        area = (earth_radius ** 2 * lon_width * dLat)
        return area

    def thickness(self):
        log.debug('Thickness: Start')
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

        #log.debug("Thickness: Layers are %s",layers)
        self.crust_model[:, self.C.THICKNESS] = np.sum(self.crust_model[:,layers], axis=1)
        log.debug('Thickness: Done')

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

    def mass(self, do=None):
        log.debug('starting mass loop')
        # We need to convert the model units into SI so that the results will
        # be in kg, for this a factor of 1000 is added from 1g/cc in kg/m^3 and
        # a factor of 10^6 is added from km^2 to m^2
        coef = 1e3 * 1e6 * 1e3
        #self.crust_model[:,18] = self.crust_model[:,5] * self.crust_model[:,12] * self.crust_model[:,self.C.AREA] * coef 
        #self.crust_model[:,19] = self.crust_model[:,6] * self.crust_model[:,13] * self.crust_model[:,self.C.AREA] * coef 
        #self.crust_model[:,20] = self.crust_model[:,7] * self.crust_model[:,14] * self.crust_model[:,self.C.AREA] * coef 
        #self.crust_model[:,21] = self.crust_model[:,8] * self.crust_model[:,15] * self.crust_model[:,self.C.AREA] * coef 
        #self.crust_model[:,22] = self.crust_model[:,9] * self.crust_model[:,16] * self.crust_model[:,self.C.AREA] * coef 

        self.crust_model[:,(18,19,20,21,22)] = (self.crust_model[:,(5,6,7,8,9)] *
        self.crust_model[:,(12,13,14,15,16)] *
        np.rot90(np.tile(self.crust_model[:,self.C.AREA],(5,1)), 3) * coef )


        log.debug('mass loop done')
        if do == "mass":
            layers = []
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

    def heat(self):
        u_heat = 98.5 * 1e-6 # W/KG from sdye 1111.6099
        th_heat = 26.3 * 1e-6 # W/KG from sdye 1111.6099
        k_heat = 3.33 * 1e-9 # W/KG from sdye 1111.6099

        log.debug("Heat: Calling compute_layer_conc()")
        self.compute_layer_conc()
        
        log.debug("Heat: Starting Heat Loop")
        u_total_heat = self.crust_model[:,(31,34,37,40,43)] * u_heat
        th_total_heat = self.crust_model[:,(32,35,38,41,44)] * th_heat
        k_total_heat = self.crust_model[:,(33,36,39,42,45)] * k_heat 

        log.debug("Heat: Heat Loop Done")
        layers = []
        for code in self.layers:
            if 's' == code :
                layers.append(0)
            elif 'h' == code:
                layers.append(1)
            elif 'u' == code:
                layers.append(2)
            elif 'm' == code:
                layers.append(3)
            elif 'l' == code:
                layers.append(4)
            else:
                raise ValueError('invalid crust code')
        log.debug("Heat: Summing Requested Layers")
        self.crust_model[:, self.C.HEAT_U] = np.sum(u_total_heat[:,layers], axis=1) / self.crust_model[:, self.C.AREA] /1000
        self.crust_model[:, self.C.HEAT_TH] = np.sum(th_total_heat[:, layers], axis=1) / self.crust_model[:, self.C.AREA] /1000
        self.crust_model[:, self.C.HEAT_K] = np.sum(k_total_heat[:, layers], axis=1) / self.crust_model[:, self.C.AREA]/ 1000
        self.crust_model[:, self.C.HEAT_SANS_AREA] = np.sum(u_total_heat, axis=1) + np.sum(th_total_heat, axis=1) + np.sum(k_total_heat,axis = 1)

        log.debug("Heat: Done")

    def radiogenic_masses(self):
        #total masses of [u, th, k] for the crust (
        return [30.9e18, 133.6e18, 23.5e22]


    def nu(self):
        u_tnu = 12.8 * 0.55
        th_tnu = 4.04 * 0.55

        scale = 1e6

        here = os.path.dirname(__file__)
        nu_file = open(os.path.join(here, "crust_signal.csv"), "r")
        nu = []
        for l in nu_file:
            nu.append([float(e) for e in l.split(',')])

        nu = np.array(nu)

        self.crust_model[:, self.C.NU_FLUX_U] = 0
        self.crust_model[:, self.C.NU_FLUX_TH] = 0
        self.crust_model[:, self.C.NU_FLUX_K] = 0
        self.crust_model[:, self.C.NU_SIG_U] = 0
        self.crust_model[:, self.C.NU_SIG_TH] = 0
        layers = []
        for code in self.layers:
            if 's' == code :
                self.crust_model[:, self.C.NU_FLUX_U] += nu[:, 3] * scale
                self.crust_model[:, self.C.NU_FLUX_TH] +=nu[:, 4] * scale
                self.crust_model[:, self.C.NU_FLUX_K] +=nu[:, 5] * scale
                self.crust_model[:, self.C.NU_SIG_U] += nu[:, 3] * u_tnu
                self.crust_model[:, self.C.NU_SIG_TH] += nu[:, 4] * th_tnu
            elif 'h' == code:
                self.crust_model[:, self.C.NU_FLUX_U] += nu[:, 3] * scale
                self.crust_model[:, self.C.NU_FLUX_TH] +=nu[:, 4] * scale
                self.crust_model[:, self.C.NU_FLUX_K] +=nu[:, 5] * scale
                self.crust_model[:, self.C.NU_SIG_U] +=nu[:, 3] * u_tnu
                self.crust_model[:, self.C.NU_SIG_TH] +=nu[:, 4] * th_tnu
            elif 'u' == code:
                self.crust_model[:, self.C.NU_FLUX_U] += nu[:, 6] * scale
                self.crust_model[:, self.C.NU_FLUX_TH] +=nu[:, 7] * scale
                self.crust_model[:, self.C.NU_FLUX_K] +=nu[:, 8] * scale
                self.crust_model[:, self.C.NU_SIG_U] +=nu[:, 6] * u_tnu
                self.crust_model[:, self.C.NU_SIG_TH] +=nu[:, 7] * th_tnu
            elif 'm' == code:
                self.crust_model[:, self.C.NU_FLUX_U] += nu[:, 9] * scale
                self.crust_model[:, self.C.NU_FLUX_TH] +=nu[:, 10] * scale
                self.crust_model[:, self.C.NU_FLUX_K] +=nu[:, 11] * scale
                self.crust_model[:, self.C.NU_SIG_U] +=nu[:, 9] * u_tnu
                self.crust_model[:, self.C.NU_SIG_TH] +=nu[:, 10] * th_tnu
            elif 'l' == code:
                self.crust_model[:, self.C.NU_FLUX_U] += nu[:, 12] * scale
                self.crust_model[:, self.C.NU_FLUX_TH] +=nu[:, 13] * scale
                self.crust_model[:, self.C.NU_FLUX_K] +=nu[:, 14] * scale
                self.crust_model[:, self.C.NU_SIG_U] +=nu[:, 12] * u_tnu
                self.crust_model[:, self.C.NU_SIG_TH] +=nu[:, 13] * th_tnu
            else:
                raise ValueError('invalid crust code')

        log.debug("Nu: Done")
    
    def spherical_to_cartesian(self, out=False, depth=0):
        earth_r = (6371.0 - depth) * 1000

        sin_lat = np.sin(np.radians(91-self.crust_model[:, self.C.LAT]))
        cos_lat = np.cos(np.radians(91-self.crust_model[:, self.C.LAT]))
        sin_lon = np.sin(np.radians(   self.crust_model[:, self.C.LON]))
        cos_lon = np.cos(np.radians(   self.crust_model[:, self.C.LON]))
        x = earth_r * cos_lon * sin_lat
        y = earth_r * sin_lon * sin_lat
        z = earth_r * cos_lat
        if out is True:
            o = np.array([x, y, z])
            return o.T + 1
        self.crust_model[:, self.C.X] = x
        self.crust_model[:, self.C.Y] = y
        self.crust_model[:, self.C.Z] = z
    
    def one_r_sq_cart(self, p1, p2):
        x1, y1, z1 = p1
        x2, y2, z2 = p2
        x = x1 - x2
        y = y1 - y2
        z = z1 - z2
        d = (x ** 2) + (y ** 2) + (z ** 2)
        if p1 == p2:
            d = 14
        return 1/(4 * math.pi * d)



    def one_r_sq_sph(self, lon, lat, lon_0, lat_0):
        earth_r = 6371.0 * 1000
        lon = math.radians(lon + 1)
        lat = math.radians(lat - 1)
        lon_0 = math.radians(lon_0 + 1)
        lat_0 = math.radians(lat_0 - 1)
        #a = math.sin(lat_0) * math.sin(lat)
        #b = math.cos(lat_0) * math.cos(lat)
        #c = lon - lon_0
        #d = b * math.fabs(c)
        #e = a + d
        #log.debug('a:%f, b:%f, c:%f, d:%f, e:%f, lond:%f, latd:%f', a,b,c,d,e,lond, latd)
        #f = math.acos(e)
        #d_km = earth_r * 2 * math.sin(f/2)
        #inv_d = 1/(4 * math.pi * (d_km ** 2))
        a = lat - lat_0
        b = lon - lon_0
        c = a/2
        d = b/2
        e = math.sin(c) ** 2
        f = math.sin(d) ** 2
        g = math.cos(lat) * math.cos(lat_0)
        h = g * f
        i = math.sqrt(h + e)
        j = math.asin(i)
        d_km = earth_r * 2 * math.sin(j/2)
        if d_km == 0:
            d_km = 14
        inv_d = 1/(4 * math.pi * (d_km ** 2))
        return inv_d


    def compute_layer_conc(self):
        log.debug("Conc: starting concentraiton loop")
        self.crust_model[:, self.C.SFTSD_U238]  =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.SFTSD_M] * self.conc['C_SFTSD_U238'])
        self.crust_model[:, self.C.SFTSD_TH232] =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.SFTSD_M] * self.conc['C_SFTSD_TH232'])
        self.crust_model[:, self.C.SFTSD_K40]   =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.SFTSD_M] * self.conc['C_SFTSD_K40'])
        self.crust_model[:, self.C.HDSD_U238]   =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.HDSD_M] *  self.conc['C_HDSD_U238'])
        self.crust_model[:, self.C.HDSD_TH232]  =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.HDSD_M] *  self.conc['C_HDSD_TH232'])
        self.crust_model[:, self.C.HDSD_K40]    =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.HDSD_M] *  self.conc['C_HDSD_K40'])
        self.crust_model[:, self.C.UPCST_U238]  =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.UPCST_M] * self.conc['C_UPCST_U238'])
        self.crust_model[:, self.C.UPCST_TH232] =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.UPCST_M] * self.conc['C_UPCST_TH232'])
        self.crust_model[:, self.C.UPCST_K40]   =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.UPCST_M] * self.conc['C_UPCST_K40'])
        self.crust_model[:, self.C.MDCST_U238]  =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.MDCST_M] * self.conc['C_MDCST_U238'])
        self.crust_model[:, self.C.MDCST_TH232] =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.MDCST_M] * self.conc['C_MDCST_TH232'])
        self.crust_model[:, self.C.MDCST_K40]   =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.MDCST_M] * self.conc['C_MDCST_K40'])
        self.crust_model[:, self.C.LOCST_U238]  =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.LOCST_M] * self.conc['C_LOCST_U238'])
        self.crust_model[:, self.C.LOCST_TH232] =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.LOCST_M] * self.conc['C_LOCST_TH232'])
        self.crust_model[:, self.C.LOCST_K40]   =+ ((1-self.crust_model[:, self.C.OCEAN_F]) * self.crust_model[:, self.C.LOCST_M] * self.conc['C_LOCST_K40'])

        self.crust_model[:, self.C.SFTSD_U238]  =self.crust_model[:, self.C.SFTSD_U238] + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.SFTSD_M] * self.conc['O_SFTSD_U238'])
        self.crust_model[:, self.C.SFTSD_TH232] =self.crust_model[:, self.C.SFTSD_TH232]+ (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.SFTSD_M] * self.conc['O_SFTSD_TH232'])
        self.crust_model[:, self.C.SFTSD_K40]   =self.crust_model[:, self.C.SFTSD_K40]  + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.SFTSD_M] * self.conc['O_SFTSD_K40'])
        self.crust_model[:, self.C.HDSD_U238]   =self.crust_model[:, self.C.HDSD_U238]  + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.HDSD_M] *  self.conc['O_HDSD_U238'])
        self.crust_model[:, self.C.HDSD_TH232]  =self.crust_model[:, self.C.HDSD_TH232] + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.HDSD_M] *  self.conc['O_HDSD_TH232'])
        self.crust_model[:, self.C.HDSD_K40]    =self.crust_model[:, self.C.HDSD_K40]   + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.HDSD_M] *  self.conc['O_HDSD_K40'])
        self.crust_model[:, self.C.UPCST_U238]  =self.crust_model[:, self.C.UPCST_U238] + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.UPCST_M] * self.conc['O_UPCST_U238'])
        self.crust_model[:, self.C.UPCST_TH232] =self.crust_model[:, self.C.UPCST_TH232]+ (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.UPCST_M] * self.conc['O_UPCST_TH232'])
        self.crust_model[:, self.C.UPCST_K40]   =self.crust_model[:, self.C.UPCST_K40]  + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.UPCST_M] * self.conc['O_UPCST_K40'])
        self.crust_model[:, self.C.MDCST_U238]  =self.crust_model[:, self.C.MDCST_U238] + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.MDCST_M] * self.conc['O_MDCST_U238'])
        self.crust_model[:, self.C.MDCST_TH232] =self.crust_model[:, self.C.MDCST_TH232]+ (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.MDCST_M] * self.conc['O_MDCST_TH232'])
        self.crust_model[:, self.C.MDCST_K40]   =self.crust_model[:, self.C.MDCST_K40]  + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.MDCST_M] * self.conc['O_MDCST_K40'])
        self.crust_model[:, self.C.LOCST_U238]  =self.crust_model[:, self.C.LOCST_U238] + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.LOCST_M] * self.conc['O_LOCST_U238'])
        self.crust_model[:, self.C.LOCST_TH232] =self.crust_model[:, self.C.LOCST_TH232]+ (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.LOCST_M] * self.conc['O_LOCST_TH232'])
        self.crust_model[:, self.C.LOCST_K40]   =self.crust_model[:, self.C.LOCST_K40]  + (self.crust_model[:, self.C.OCEAN_F] * self.crust_model[:, self.C.LOCST_M] * self.conc['O_LOCST_K40'])
        log.debug("Conc: loop done")

    def concentrations(self, args):
        """Input is expeced to be:
        U: 10^-6 g/g
        Th: 10^-6 g/g
        K: 10^-2 g/g

        will be converted to kg/kg here
        """

        conc = string.split(args, sep=',')
        self.conc['C_SFTSD_U238'] = float(conc[0]) * 1e-6
        self.conc['C_HDSD_U238'] = float(conc[1]) * 1e-6
        self.conc['C_UPCST_U238'] = float(conc[2]) * 1e-6
        self.conc['C_MDCST_U238'] = float(conc[3]) * 1e-6
        self.conc['C_LOCST_U238'] = float(conc[4]) * 1e-6
        self.conc['O_SFTSD_U238'] = float(conc[5]) * 1e-6
        self.conc['O_HDSD_U238'] = float(conc[6]) * 1e-6
        self.conc['O_UPCST_U238'] = float(conc[7]) * 1e-6
        self.conc['O_MDCST_U238'] = float(conc[8]) * 1e-6
        self.conc['O_LOCST_U238'] = float(conc[9]) * 1e-6

        self.conc['C_SFTSD_TH232'] = float(conc[10]) * 1e-6
        self.conc['C_HDSD_TH232'] = float(conc[11]) * 1e-6
        self.conc['C_UPCST_TH232'] = float(conc[12]) * 1e-6
        self.conc['C_MDCST_TH232'] = float(conc[13]) * 1e-6
        self.conc['C_LOCST_TH232'] = float(conc[14]) * 1e-6
        self.conc['O_SFTSD_TH232'] = float(conc[15]) * 1e-6
        self.conc['O_HDSD_TH232'] = float(conc[16]) * 1e-6
        self.conc['O_UPCST_TH232'] = float(conc[17]) * 1e-6
        self.conc['O_MDCST_TH232'] = float(conc[18]) * 1e-6
        self.conc['O_LOCST_TH232'] = float(conc[19]) * 1e-6
        
        self.conc['C_SFTSD_K40'] = float(conc[20]) * 1e-2
        self.conc['C_HDSD_K40'] = float(conc[21]) * 1e-2
        self.conc['C_UPCST_K40'] = float(conc[22]) * 1e-2
        self.conc['C_MDCST_K40'] = float(conc[23]) * 1e-2
        self.conc['C_LOCST_K40'] = float(conc[24]) * 1e-2
        self.conc['O_SFTSD_K40'] = float(conc[25]) * 1e-2
        self.conc['O_HDSD_K40'] = float(conc[26]) * 1e-2
        self.conc['O_UPCST_K40'] = float(conc[27]) * 1e-2
        self.conc['O_MDCST_K40'] = float(conc[28]) * 1e-2
        self.conc['O_LOCST_K40'] = float(conc[29]) * 1e-2
        log.debug("Concentrations retirved from GET request")

    def config(self, **kwargs):
        for key in kwargs:
            key = key.lower()
            if key == u'layers':
                log.debug('layers found in GET')
                self.select_layers(kwargs[key])
            elif key == u'uthk':
                log.debug('concentrations found in GET')
                self.concentrations(kwargs[key])
            elif key == u'output':
                log.debug('output foudn in GET')
                self.select_output(kwargs[key])
            else:
                raise ValueError('Unknown key found in GET request')
        self.compute_output()

    def select_layers(self, layers = "umlsh"):
        self.layers = layers.lower()

    def compute_output(self):
        self.thickness()
        self.heat()
        self.mass(do="mass")
        self.nu()

    def griddata(self):
        """Dump the contents of a CrustModel instance to a grid format

        This method will take the current state of instance it is called on and
        return a tuple containg a list of lons, lats and the data in a grid
        format sutable for giving to the imgshow and transform scalar methods
        of matplotlib with basemap.
        """
        #if self.dataout == self.C.NU: #special case for nu flux
        #    cm = self.nu_grd
        #else:
        #    cm = self.crust_model
        cm = self.crust_model


        lons = np.unique(self.crust_model[:,0])
        lats = np.unique(self.crust_model[:,1])
        datas = {}
        datas["thickness"] = np.empty(shape=(len(lats),len(lons)))
        datas["reactor"] = {
                "flux": np.empty(shape=(len(lats),len(lons))),
                "signal": np.empty(shape=(len(lats),len(lons))),
                "flux33": np.empty(shape=(len(lats),len(lons))),
                "signal33": np.empty(shape=(len(lats),len(lons))),
                }
        datas["heat"] = {
                "u": np.empty(shape=(len(lats),len(lons))),
                "th": np.empty(shape=(len(lats),len(lons))),
                "k": np.empty(shape=(len(lats),len(lons))),
                "total": np.sum(self.crust_model[:, self.C.HEAT_SANS_AREA])
                }
        datas["nu_flux"] = {
                "u": np.empty(shape=(len(lats),len(lons))),
                "th": np.empty(shape=(len(lats),len(lons))),
                "k": np.empty(shape=(len(lats),len(lons))),
                }
        datas["nu_signal"] = {
                "u": np.empty(shape=(len(lats),len(lons))),
                "th": np.empty(shape=(len(lats),len(lons))),
                "k": np.zeros(shape=(len(lats),len(lons))),
                }

        lon = {}
        lat = {}
        for index, point in np.ndenumerate(lons):
            lon[point] = index[0]

        for index, point in np.ndenumerate(lats):
            lat[point] = index[0]

        log.info("Griddata")
        for i, point in enumerate(cm):
            lon_p = self.crust_model[i, 0]
            lat_p = self.crust_model[i, 1]
            #datas["reactor"]["flux"][lat[lat_p],lon[lon_p]] = point[self.dataout]
            #datas["reactor"]["signal"][lat[lat_p],lon[lon_p]] = point[self.dataout]
            #datas["reactor"]["flux33"][lat[lat_p],lon[lon_p]] = point[self.dataout]
            #datas["reactor"]["signal33"][lat[lat_p],lon[lon_p]] = point[self.dataout]
            datas["thickness"][lat[lat_p],lon[lon_p]] = point[self.C.THICKNESS]
            datas["heat"]["u"][lat[lat_p],lon[lon_p]] = point[self.C.HEAT_U]
            datas["heat"]["th"][lat[lat_p],lon[lon_p]] = point[self.C.HEAT_TH]
            datas["heat"]["k"][lat[lat_p],lon[lon_p]] = point[self.C.HEAT_K]
            datas["nu_flux"]["u"][lat[lat_p],lon[lon_p]] = point[self.C.NU_FLUX_U]
            datas["nu_flux"]["th"][lat[lat_p],lon[lon_p]] = point[self.C.NU_FLUX_TH]
            datas["nu_flux"]["k"][lat[lat_p],lon[lon_p]] = point[self.C.NU_FLUX_K]
            datas["nu_signal"]["u"][lat[lat_p],lon[lon_p]] = point[self.C.NU_SIG_U]
            datas["nu_signal"]["th"][lat[lat_p],lon[lon_p]] = point[self.C.NU_SIG_U]
        
        log.info("Griddata done")
        return (lons + 1,lats - 1,datas) # coords need to be centerpoint

    def total_rad_power(self):
        return "{0:0.1f}".format(np.sum(self.crust_model[:, self.C.HEAT_SANS_AREA]) * 1e-12)

    def __init__(self):
        here = os.path.dirname(__file__)
        pkl_file = open(os.path.join(here, 'crust_model_v2.pkl'), 'rb')
        crust_model_load = pickle.load(pkl_file)
        self.C = Column()
        num_col = self.C.size()
        padding = np.zeros((crust_model_load.shape[0],num_col-17))
        self.crust_model = np.append(crust_model_load, padding, axis=1)
        self.conc = {}
        for i, point in enumerate(self.crust_model):
            self.crust_model[i,self.C.AREA] = self.area(point[1], point[1] - 2, 6371)
        self.mass()
    
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
