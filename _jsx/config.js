export const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; //seconds
export const ELEMENTARY_CHARGE = 1.6021766208e-19; //Coulombs
/* 1e22 is a bunch of meters to km stuff */
export const A = (SECONDS_PER_YEAR/ELEMENTARY_CHARGE) * 1e22 // km^2/MW/year
export const ELECTRON_REST_MASS = 0.5109989461 // MeV
export const NEUTRON_REST_MASS = 939.56563 // MeV
export const PROTON_REST_MASS = 938.2720813 //MeV

/* Inverse Beta Decay Threshold
 * while most of this is due to the mass difference between
 * the neutron (product) and proton (reactant)
 */
export const IBD_THRESHOLD = 1.806 // MeV

export const V_FIT_PARAMS = { // TABLE I in the paper, probably just defaults
  "U235":  [1.740, -0.7976, 0.05122, -0.009664],
  "U238":  [0.8651, -0.08484, -0.08347, -0.0006647],
  "PU239": [1.399, -0.6211, -0.01117, -0.005785],
  "PU241": [1.160, -0.3722, -0.04199, -0.004548],
}


// Neutrino Oscilation Parameters

export const dmsq21 = 7.50e-5;
export const ddmsq21 = 0.19e-5;
export const s2t13 = 0.0218;
export const ds2t13 = 0.0010;
export const s2t12 = 0.304;
export const ds2t12 = 0.013;

export const c4t13 = (1 - s2t13) * (1 - s2t13);
export const s22t12 = 4 * s2t12 * (1 - s2t12);

//added nuosc13
export const s22t13 = 4 * s2t13 * (1-s2t13);
export const c2t12 = 1 - s2t12;

export const dmsq32_inverted = 2.457e-3;
export const dmsq31_inverted = dmsq32_inverted - dmsq21;
export const dmsq31 = 2.457e-3;
export const dmsq32 = dmsq31 - dmsq21;


export const EARTH_RADIUS_KM = 6371; // km
export const DEG_TO_RAD = Math.PI / 180;
