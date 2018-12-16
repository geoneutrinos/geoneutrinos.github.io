import { nuosc } from './nuosc';

import { 
  V_FIT_PARAMS,
  FISSION_ENERGIES,
  FUEL_FRACTIONS,
  SECONDS_PER_YEAR,
  ELEMENTARY_CHARGE,
} from './config';

import defaultSpectrum from './spectrum';

import { R } from './antineutrinos';

const memoize = require('memoizee');

import projector from 'ecef-projector';

const reactor_db = require("../reactor_database/reactors.json");

const ll_to_xyz = memoize(function(lat, lon){
  return projector.project(lat, lon, 0).map((n) => n/1000);
});

function mevRange(count = 1000, start = 0, stop = 10){
  // TODO figure out how to deal with a start not a zero
  const binSize = (stop - start) / count;
  var bins = [...Array(count).keys()];

  bins = bins.map((bin) => bin + 1);
  bins = bins.map((bin) => bin * (stop/count));
  bins = bins.map((bin) => bin - (binSize/2));
  return bins;
}

const bins = mevRange();

class LoadFactor {
  constructor(date, load){
    this.date = new Date(date);
    this.load = load/100;
    this.days = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
  }
}


class ReactorCore {
  constructor(name, country, lat, lon, type, mox, power, loads, custom = true){
    this.name = name;
    this.country = country;
    this.lat = lat;
    this.lon = lon;
    this.type = type;
    this.mox = Boolean(mox);
    this.power = power;
    this.loads = loads;
    [this.x, this.y, this.z] = ll_to_xyz(lat, lon);
    this.custom = custom;
    this.spectrumType = undefined;
    this.spectrum = this.neutrinoSpectrum();
  }

  loadFactor(start = new Date("2003-01"), stop = new Date("2016-12")){
    if (this.custom == true){
      return 1;
    }
    const loads = this.loads.filter((load) => (load.date >= start) && (load.date <= stop));
    const totalDays = loads.reduce((a,b) => a + b.days, 0);
    const weightedLoads = loads.map((load) => load.load * (load.days/totalDays));
    return weightedLoads.reduce((a,b) => a + b);
  }

  neutrinoSpectrum(){
    if ((["LEU", "PWR", "BWR", "LWGR"].includes(this.type)) && (!this.mox)){
      this.spectrumType = "LEU";
    }
    if ((["PWR", "BWR", "LWGR"].includes(this.type)) && (this.mox)){
      this.spectrumType = "LEU_MOX";
    }
    if (["LEU_MOX"].includes(this.type)){
      this.spectrumType = "LEU_MOX";
    }
    if ((["PHWR"].includes(this.type)) && (!this.mox)){
      this.spectrumType = "PHWR";
    }
    if ((["GCR"].includes(this.type)) && (!this.mox)){
      this.spectrumType = "GCR";
    }
    if ((["HEU"].includes(this.type)) && (!this.mox)){
      this.spectrumType = "HEU";
    }

    if (this.spectrumType === undefined){
      console.log("undefined", this.type, this.mox)
      console.log(this);
      return defaultSpectrum;
    }

    const fuelFractions = FUEL_FRACTIONS[this.spectrumType]


    const spectrum = bins.map((Ev) => {
      return Object.keys(fuelFractions).map((isotope) => {
            let fuelFraction = fuelFractions[isotope];
            let fissionEnergy = FISSION_ENERGIES[isotope];
            let vFitParams = V_FIT_PARAMS[isotope];
        
            return (SECONDS_PER_YEAR/ELEMENTARY_CHARGE) * 1e22 * fuelFraction * R(Ev, fissionEnergy, ...vFitParams);
          }
        ).reduce((c,n) => c+n, 0);
      });

    return spectrum;

  }
}

var corelist = Object.getOwnPropertyNames(reactor_db.reactors).map(function(reactor){
  const core_info = reactor_db.reactors[reactor];
  const dates = reactor_db.times;
  const loads = reactor_db.loads[reactor];
  const load_factors = loads.map((load, i) => new LoadFactor(dates[i], load));
    return new ReactorCore(reactor,
      core_info.country,
      core_info.lat,
      core_info.lon,
      core_info.type,
      core_info.mox,
      core_info.power,
      load_factors,
      false, // not a custom reactor
    )
  });
corelist.sort(function(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
          return -1;
        }
    if (nameA > nameB) {
          return 1;
        }

    // names must be equal
   return 0;
 });

export {corelist, ReactorCore};
