export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; //seconds
export const ELEMENTARY_CHARGE = 1.6021766208e-19; //Coulombs
export const ELECTRON_REST_MASS = 0.5109989461 // MeV
export const NEUTRON_REST_MASS = 939.565413 // MeV
export const PROTON_REST_MASS = 938.2720813 //MeV
export const EARTH_RADIUS_KM = 6371; // km
export const DEG_TO_RAD = Math.PI / 180;

/* Inverse Beta Decay Threshold
 * while most of this is due to the mass difference between
 * the neutron (product) and proton (reactant)
 */
//export const IBD_THRESHOLD = 1.806 // MeV

export const V_FIT_PARAMS = { // TABLE I in the paper, probably just defaults
  "U235":  [1.740, -0.7976, 0.05122, -0.009664],
  "U238":  [0.8651, -0.08484, -0.08347, -0.0006647],
  "PU239": [1.399, -0.6211, -0.01117, -0.005785],
  "PU241": [1.160, -0.3722, -0.04199, -0.004548],
}


// Neutrino Oscilation Parameters
//
export const OSCILLATION_PARAMETERS = {
  "s2t12" : 0.321,
  "dmsq21" : 7.56e-5,
  "s2t13Normal" : 0.02155,
  "s2t13Inverted" : 0.02140,

  "dmsq31Normal" : 2.55e-3,
  "dmsq31Inverted" : 2.49e-3,
};


export const FISSION_ENERGIES = { //MeV?
  "U235":  201.912,
  "U238":  204.997, 
  "PU239": 210.927,
  "PU241": 213.416
};

export const FUEL_FRACTIONS = {
  "LEU": {
    "U235":  0.56,
    "U238":  0.08, 
    "PU239": 0.30,
    "PU241": 0.06
  },
  "SEU": {
    "U235":  0.52,
    "U238":  0.05, 
    "PU239": 0.42,
    "PU241": 0.01
  },
  "LEU_MOX": {
    "U235":  0.39,
    "U238":  0.08, 
    "PU239": 0.42,
    "PU241": 0.11
  }
}
