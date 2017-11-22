const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60; //seconds
const ELEMENTARY_CHARGE = 1.6021766208e-19; //Coulombs
/* 1e22 is a bunch of meters to km stuff */
const A = (SECONDS_PER_YEAR/ELEMENTARY_CHARGE) * 1e22 // km^2/MW/year
const ELECTRON_REST_MASS = 0.5109989461 // MeV
const NEUTRON_REST_MASS = 939.56563 // MeV
const PROTON_REST_MASS = 938.2720813 //MeV

/* Inverse Beta Decay Threshold
 * while most of this is due to the mass difference between
 * the neutron (product) and proton (reactant)
 */
const IBD_THRESHOLD = 1.806 // MeV

const V_FIT_PARAMS = { // TABLE I in the paper, probably just defaults
  "U235":  [1.740, -0.7976, 0.05122, -0.009664],
  "U238":  [0.8651, -0.08484, -0.08347, -0.0006647],
  "PU239": [1.399, -0.6211, -0.01117, -0.005785],
  "PU241": [1.160, -0.3722, -0.04199, -0.004548],
}


/**
 * Calculate the number of antineutrinos per fision
 */
function λ(Ev, ...c){
  const params = c.map((cv, i) => cv * Math.pow(Ev, i));
  return Math.exp(params.reduce((sum, value) => sum + value, 0));
}

function σ(Ev){ // Neutrino energy in MeV
  const Ee = Math.max(0, Ev - (NEUTRON_REST_MASS - PROTON_REST_MASS))

  if (Ee < IBD_THRESHOLD){
    return 0
  }

  return 9.62e-44 * Math.sqrt(Ee * Ee, ELECTRON_REST_MASS * ELECTRON_REST_MASS) * Ee;
}

export { λ, σ };
