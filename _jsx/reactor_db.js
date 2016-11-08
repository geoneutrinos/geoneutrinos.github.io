const memoize = require('memoizee');

const reactor_db = require("../reactor_database/reactors.json");

const EARTH_RADIUS = 6371; // km

const ll_to_xyz = memoize(functio(lat, lon){
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
      return [reactor_db.reactors[reactor].lat, reactor_db.reactors[reactor].lon]
    }
  )

}

export {reactor_db};
export const reactor_locations = geo_reactor_locations();
