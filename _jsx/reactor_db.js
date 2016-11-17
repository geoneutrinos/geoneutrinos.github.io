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

function geo_reactor_locations(){
  return Object.getOwnPropertyNames(reactor_db.reactors).map(function(reactor){
    return [reactor_db.reactors[reactor].lat, reactor_db.reactors[reactor].lon]
  }
  )
}

function average_lf(start_year="2003", start_month="01", end_year="2015", end_month="12"){
  const first = start_year + "-" + start_month;
  const last = end_year + "-" + end_month;
  const start_index = reactor_db.times.indexOf(first);
  const end_index = reactor_db.times.indexOf(last) + 1;


  return Object.getOwnPropertyNames(reactor_db.reactors).map(function(reactor){
      const load_factors = reactor_db.loads[reactor].slice(start_index, end_index);
      const load_factor = load_factors.reduce(function(a,b){return a+b}) / load_factors.length;
      var [x, y, z] = ll_to_xyz(reactor_db.reactors[reactor].lat, reactor_db.reactors[reactor].lon);
      return [x, y, z, reactor_db.reactors[reactor].power * load_factor/100];
    }
  )

}

export {reactor_db, average_lf};
export const reactor_locations = geo_reactor_locations();
