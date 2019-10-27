import {
  NEUTRON_REST_MASS,
  PROTON_REST_MASS,
  ELECTRON_REST_MASS,
} from './config'

const memoize = require('memoizee');

/**
 * Calculate the number of antineutrinos per fision
 */
function λ(Ev, ...c){
  const params = c.map((cv, i) => cv * Math.pow(Ev, i));
  return Math.exp(params.reduce((sum, value) => sum + value, 0));
}

function σ(Ev){ // Neutrino energy in MeV

  const Ee = Math.max(ELECTRON_REST_MASS, Ev - (NEUTRON_REST_MASS - PROTON_REST_MASS))

  return 9.52e-44 * Math.sqrt((Ee * Ee) - (ELECTRON_REST_MASS * ELECTRON_REST_MASS)) * Ee;
}

function R(Ev, Qi, ...c){
  return λ(Ev, ...c) * (1/Qi) * (σ(Ev)/(4 * Math.PI))
}

const σ2003 = memoize(function(Ev){ // Neutrino energy in MeV

  const a = -0.07056;
  const b = 0.02018;
  const c = -0.001953;

  const sv = a + (b * Math.log(Ev)) + (c * Math.pow(Math.log(Ev), 3));
  const sve = Math.pow(Ev, sv)
  console.log(sve)

  const Ee = Math.max(ELECTRON_REST_MASS, Ev - (NEUTRON_REST_MASS - PROTON_REST_MASS))

  return 1e-43 * Math.sqrt((Ee * Ee) - (ELECTRON_REST_MASS * ELECTRON_REST_MASS)) * Ee * sve;
})

function R2003(Ev, Qi, ...c){
  return λ(Ev, ...c) * (1/Qi) * (σ2003(Ev)/(4 * Math.PI))
}

export { λ, σ, R, σ2003, R2003};
