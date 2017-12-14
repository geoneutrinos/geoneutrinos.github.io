import {
  dmsq21,
  s2t13,
  ds2t13,
  s2t12,
  ds2t12,
  
  c4t13,
  s22t12,
  
  s22t13,
  c2t12,

  dmsq31,
  dmsq32,

  EARTH_RADIUS_KM

} from './config';

var memoize = require('memoizee');

var huang = require('./huang.js').huang;
var geo_nu_spectra = require("./geo_nu_spectra.js").geo_nu_spectra;

//neutrino calculations

var osc_spec = memoize(function(dist, inverted){

  if (inverted){
    var dmsq32_use = dmsq31;
    var dmsq31_use = dmsq32;
  } else {
    var dmsq31_use = dmsq31;
    var dmsq32_use = dmsq32;
  }

  var oscarg21 = 1.27 * dmsq21 * dist * 1000;
  var oscarg31 = 1.27 * dmsq31_use * dist * 1000;
  var oscarg32 = 1.27 * dmsq32_use * dist * 1000;

  var oscspec = new Array(1000);

  for (var i=0; i < oscspec.length; i++){
    oscspec[i] = 0;
    if (i >= 0){
      var enu = (i + 1) * 0.01;

      var supr21 = c4t13 * s22t12 * Math.pow(Math.sin(oscarg21/enu), 2);
      var supr31 = s22t13 * c2t12 * Math.pow(Math.sin(oscarg31/enu), 2);
      var supr32 = s22t13 * s2t12 * Math.pow(Math.sin(oscarg32/enu), 2);

      var pee = 1 - supr21 - supr31 - supr32;

      oscspec[i] = pee;
    }
  }
  return oscspec;
});

/*
   In javascript, the return value is explictly passed back.
   So here we would create the array and just give it back to the caller
   of the function for them to deal with (usually assigned to some var)
 */
function nuosc(dist, pwr, spectrum, inverted, better=false){
  var earth_rad_sq = EARTH_RADIUS_KM * EARTH_RADIUS_KM;
  var flux = pwr * earth_rad_sq / (dist * dist);

  var oscspec = new Array(1000);

  //locks the distance to integer kilometers
  var dist = Math.round(dist);

  var pee = osc_spec(dist, inverted);

  if (better == true){
    var dist2 = dist * dist;
    for (var i=0; i < oscspec.length; i++){
      oscspec[i] = pee[i] * pwr * spectrum[i] / dist2;
    }
    return oscspec;
  }

  for (var i=0; i < oscspec.length; i++){
    oscspec[i] = 0;
    if (i >= 179){
      oscspec[i] = pee[i] * flux * spectrum[i];
    }
  }
  return oscspec;
}

function geo_nu(lat, lon, mantle_signal, mantle_ratio, include_crust=true){
  var pee = c4t13*(1.-s22t12*0.5)+s2t13*s2t13;
  // These "add one" operations are due to differences in how python
  // and Javascipt treat their "round" operations.
  var lat = Math.round(lat); 
  var lon = Math.round(lon);


  if (lat < 0){
    lat += 1;
  }
  if (lon < 0){
    lon += 1;
  }
  if (include_crust == true){
    var include_crust = 1;
  } else {
    var include_crust = 0;
  }

  var crust_u = huang[lon][lat]["U"] * 13.2 * pee * include_crust;
  var crust_th = huang[lon][lat]["Th"] * 4.0 * pee * include_crust;
  var user_mantle_signal = mantle_signal;
  var user_mantle_ratio = mantle_ratio;
  var mantle_u = user_mantle_signal/(1 + 0.065*user_mantle_ratio);
  var mantle_th = user_mantle_signal - mantle_u;
  var total_u = crust_u + mantle_u;
  var total_th = crust_th + mantle_th;
  var u_spectra = new Array(1000);
  var th_spectra = new Array(1000);
  for (var i=0; i < geo_nu_spectra.u238.length; i++){
    u_spectra[i] = geo_nu_spectra.u238[i] * total_u * 100;
  }
  for (var i=0; i < geo_nu_spectra.th232.length; i++){
    th_spectra[i] = geo_nu_spectra.th232[i] * total_th * 100;
  }
  return {
    "u_tnu": total_u,
    "th_tnu": total_th,
    "u_spec": u_spectra,
    "th_spec": th_spectra
  }
}

export { nuosc, geo_nu };
