const reactor_db = require("../reactor_database/reactors.json");

function geo_reactor_locations(){
  return Object.getOwnPropertyNames(reactor_db.reactors).map(function(reactor){
    return [reactor_db.reactors[reactor].lat, reactor_db.reactors[reactor].lon]
  }
  )
}

export {reactor_db};
export const reactor_locations = geo_reactor_locations();
