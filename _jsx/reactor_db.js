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
    return {
      lat: reactor_db.reactors[reactor].lat, 
      lon: reactor_db.reactors[reactor].lon,
      name: reactor,
    }
  }
  )
}

function average_lf(start_year="2003", start_month="01", end_year="2015", end_month="12"){
  const first = start_year + "-" + start_month;
  const last = end_year + "-" + end_month;
  const start_index = reactor_db.times.indexOf(first);
  const end_index = reactor_db.times.indexOf(last) + 1;
  const month_days = Array.apply(null, Array(reactor_db.times.length)).map(function (_, i) {return new Date(2003,i+1,0).getDate();});
  const days = month_days.slice(start_index, end_index)
  const total_days = days.reduce((a,b) => a+b)
  const temporal_weights = days.map(a => a/total_days)


  return Object.getOwnPropertyNames(reactor_db.reactors).sort().map(function(reactor){
      const load_factors = reactor_db.loads[reactor].slice(start_index, end_index);
      const load_factor = load_factors.map((currentValue, index) => (reactor_db.reactors[reactor].power * currentValue/100) * temporal_weights[index]);
      var [x, y, z] = ll_to_xyz(reactor_db.reactors[reactor].lat, reactor_db.reactors[reactor].lon);
      return {
        x:x, 
        y:y, 
        z:z, 
        //power:reactor_db.reactors[reactor].power * load_factor/100, 
        power: load_factor.reduce((a,b) => a +b),
        name:reactor, 
        obj:reactor_db.reactors[reactor]
      };
    }
  )

}

export {reactor_db, average_lf};
export const reactor_locations = geo_reactor_locations();
