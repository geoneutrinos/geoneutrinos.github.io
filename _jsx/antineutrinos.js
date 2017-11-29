import {
  NEUTRON_REST_MASS,
  PROTON_REST_MASS,
  ELECTRON_REST_MASS,
  IBD_THRESHOLD,
} from './config'


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
