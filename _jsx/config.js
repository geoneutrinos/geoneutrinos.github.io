export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; //seconds
export const ELEMENTARY_CHARGE = 1.602176634e-19; //Coulombs (exact as of 20 May 2019)
export const ELECTRON_REST_MASS = 0.5109989461 // MeV
export const NEUTRON_REST_MASS = 939.565413 // MeV
export const PROTON_REST_MASS = 938.2720813 //MeV
export const DEG_TO_RAD = Math.PI / 180;

/* Inverse Beta Decay Threshold
 * while most of this is due to the mass difference between
 * the neutron (product) and proton (reactant)
 */
//export const IBD_THRESHOLD = 1.806 // MeV

// Huber 2011 -> DOI: 10.1103/PhysRevC.84.024617
// Mueller 2011 -> 10.1103/PhysRevC.83.054615
export const V_FIT_PARAMS = {
  "U235":  [4.367, -4.577, 2.100, -5.294e-1, 6.186e-2, -2.777e-3], // Huber 2011 (phys rev c) table 3
  "U238":  [4.833e-1, 1.927e-1, -1.283e-1, -6.762e-3, 2.233e-3, -1.536e-4], // Mueller 2011 table 6
  "PU239": [4.757, -5.392, 2.563, -6.596e-1, 7.820e-2, -3.536e-3], // Huber 2011 (phys rev c) table 3
  "PU241": [2.990, -2.882, 1.278, -3.343e-1, 3.905e-2, -1.754e-3] // Huber 2011 (phys rev c) table 3
}


// Neutrino Oscilation Parameters
//
// Table 14.1 REVIEW OF PARTICLE PHYSICS DOI: 10.1103/PhysRevD.98.030001
export const OSCILLATION_PARAMETERS = {
  "s2t12" : 0.297,
  "dmsq21" : 7.37e-5,
  "s2t13Normal" : 0.0215,
  "s2t13Inverted" : 0.0216,

  "dmsq31Normal" : 2.56e-3,
  "dmsq31Inverted" : 2.4663e-3,
};


export const FISSION_ENERGIES = { //MeV
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
  "FBR": {
    "U235":  0.56,
    "U238":  0.08, 
    "PU239": 0.30,
    "PU241": 0.06
  },
  "HEU": {
    "U235":  1,
    "U238":  0, 
    "PU239": 0,
    "PU241": 0
  },
  "GCR": {
    "U235":  0.7248,
    "U238":  0.0423, 
    "PU239": 0.2127,
    "PU241": 0.0202
  },
  "PHWR": {
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
  },
  "FBR_MOX": {
    "U235":  0.39,
    "U238":  0.08, 
    "PU239": 0.42,
    "PU241": 0.11
  }
}
