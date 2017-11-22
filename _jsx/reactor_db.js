import { nuosc } from './nuosc';

const memoize = require('memoizee');

const reactor_db = require("../reactor_database/reactors.json");

const EARTH_RADIUS = 6371; // km

const ll_to_xyz = memoize(function(lat, lon){
  lat = lat * (Math.PI/180);
  lon = lon * (Math.PI/180);
  return [
    EARTH_RADIUS * Math.cos(lat) * Math.cos(lon),
    EARTH_RADIUS * Math.cos(lat) * Math.sin(lon),
    EARTH_RADIUS * Math.sin(lat)
  ]
});

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
  }

  loadFactor(start = new Date("2003-01"), stop = new Date("2016-12")){
    const loads = this.loads.filter((load) => (load.date >= start) && (load.date <= stop));
    const totalDays = loads.reduce((a,b) => a + b.days, 0);
    const weightedLoads = loads.map((load) => load.load * (load.days/totalDays));
    return weightedLoads.reduce((a,b) => a + b);
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

export {corelist};
