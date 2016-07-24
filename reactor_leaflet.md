---
layout: page
title: Reactors (Testing)
permalink: /reactors_testing/
no_menu: true
---
<link rel="stylesheet" href="/static/vender/leaflet/leaflet.css" />
<style>
.total.line { 
  stroke: black;
  stroke-width: 2;
  /*stroke-dasharray: 1, 1; */
  fill: yellow;
}
    .reac.line { 
      stroke: black;
      stroke-width: 0.5;
      stroke-dasharray: 2, 1;
      fill: none;
    }
    .iaea.line { 
      stroke: none;
      stroke-width: 0.5;
      stroke-dasharray: 2, 1;
      fill: green;
    }
    .c_reac.line{ 
      stroke: none;
      fill: #999;
    }
    .geo_u.line{ 
      stroke: blue;
      stroke-width: 2;
      fill: none;
    }
    .geo_th.line{ 
      stroke: red;
      stroke-width: 2;
      fill: none;
    }
    #detector_icon{
      position: absolute;
      top: 0px;
      pointer-events: none;
    }
    #reactor_icon{
      position: absolute;
      top: 0px;
      pointer-events: none;
    }
    #map_container{
			height:500px;
    }

    .axis path,
    .axis line {
      fill: none;
      stroke: grey;
      stroke-width: 1;
      shape-rendering: crispEdges;
    }
</style>
<div class="col-md-7">
  <div id="map_container">
  </div>
</div>
<div class="col-md-5">
<div id="application">
</div>

  <ul class="nav nav-tabs">
    <li class="active"><a href="#detector" data-toggle="tab">Detector</a></li>
    <li><a href="#reactor" data-toggle="tab">Reactors</a></li>
    <li><a href="#geonu" data-toggle="tab">GeoNu</a></li>
    <li><a href="#output" data-toggle="tab">Output &amp; Stats</a></li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane active" id="detector">
      <div class="panel panel-default">
        <div class="panel-heading">Spectrum</div>
        <div class="panel-body">
          <div id="graph"></div>
          R<sub>Total</sub>: <span id="tnu_output"></span> TNU<br>
          R<sub>E &lt; 3.275 MeV</sub>: <span id="tnu_output_geo"></span> TNU<br>
          R<sub>Closest</sub>: <span id="tnu_output_close"></span> TNU (<span id="close_percent"></span>% of total)<br>
          Distance to Closest Reactor: <span id="closest_dist"></span> km<br>
          Distance to User Reactor: <span id="user_dist"></span> km
          <div class="checkbox">
            <label>
              <input id="mass_invert" type="checkbox"> Invert Neutrino Mass Hierarchy
            </label>
          </div>
          <small>1 TNU = 1 event/10<sup>32</sup> free protons/year</small>
        </div>
      </div>

    </div>
    <div class="tab-pane" id="reactor">
      <div class="panel panel-default">
        <div class="panel-heading">Reactor Load Factors</div>
        <div class="panel-body">
          <select id="load_factor" class="form-control">
            <!-- value="index" -->
            <option value="3">Mean LF</option>
            <option value="4">2013 LF</option>
          </select>
        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">Custom Reactor</div>
        <div class="panel-body">

          <form class='form-horizontal'>
            <div class="form-group">
              <label class='col-sm-2 control-label' for="react_power">Power</label>
              <div class="input-group col-sm-10">
                <input type="number" class="form-control" id="react_power" placeholder="0" value='0'>
                <div class="input-group-addon">MW</div>
              </div>
            </div>

            <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">
                <div class="checkbox">
                  <label>
                    <input id="user_reactor" type="checkbox"> Use Custom Reactor
                  </label>
                </div>
              </div>
            </div>

          </form>

          <div class="panel panel-default">
            <div class="panel-heading">Location</div>
            <div class="panel-body">
              <form class="form-horizontal">


                <div class="form-group">
                  <label for="react_lat" class="col-sm-2 control-label">Latitude</label>
                  <div class="col-sm-10">
                    <input type="number" class="form-control input-sm" id="react_lat" value="0">
                  </div>
                </div>

                <div class="form-group">
                  <label for="react_lon" class="col-sm-2 control-label">Longitude</label>
                  <div class="col-sm-10">
                    <input type="number" class="form-control input-sm" id="react_lon" value="-103.75">
                  </div>
                </div>

                <button id="place_reactor" type="button" class="btn btn-success" data-toggle="tooltip" data-placement="right" title="Allows clicking the map to place the reactor">Place Reactor</button>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-pane" id="geonu">
      <div class="panel panel-default">
        <div class="panel-heading">Mantle</div>
        <div class="panel-body">
          <form class="form-horizontal">
            <div class="form-group">
              <label for="mantle_signal" class="col-sm-4 control-label">Mantle Signal</label>
              <div class="col-sm-8">
                <div class="input-group">
                  <input type="number" min="0" step="0.1" class="form-control input-sm" id="mantle_signal" value="8.2">
                  <div class="input-group-addon">TNU</div>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="react_lat" class="col-sm-4 control-label">Th/U Ratio</label>
              <div class="col-sm-8">
                <input type="number" min="0" class="form-control input-sm" id="thu_ratio" value="2.7" step="0.1">
              </div>
            </div>
          </form>


        </div>
      </div>
      <div class="panel panel-default">
        <div class="panel-heading">Crust</div>
        <div class="panel-body">
          <div class="checkbox">
            <label>
              <input id="include_crust" type="checkbox" checked> Include Crust Signal
            </label>
          </div>
          We use a pre-computed model of the crust flux provided by W.F. McDonough and described in Y. Huang et al., "A reference Earth model for the heat producing elements and associated geoneutrino flux," Geochem., Geophys., Geosyst. 14, 2003 (2013).
        </div>
      </div>

    </div>

    <div class="tab-pane" id="output">
      <div>
        <div class="panel panel-default">
          <div class="panel-heading">Calculator</div>
          <div class="panel-body">
            <form class="form-horizontal">
              <div class="form-group">
                <label class="col-sm-2 control-label">Signal</label>
                <div class="col-sm-10">
                  <select id="signal_source" class="form-control">
                    <option value="0">All Reactors (geoneutrino background)</option>
                    <option value="1">Closest Core (geonu + other reactors background)</option>
                    <option value="2">User Reactor (geonu + other reactors background)</option>
                    <option value="3">Geoneutrino (reactor background)</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="col-sm-2 control-label">Solve For</label>
                <div class="col-sm-10">
                  <select id="solve_for" class="form-control">
                    <option value="0">Exposure Time</option>
                    <option value="1">Significance</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="min_e" class="col-sm-2 control-label">E<sub>min</sub></label>
                <div class="col-sm-10">
                  <input type="number" step="0.1" class="form-control"
                  id="min_e" value="0" max="10" min="0">
                </div>
              </div>
              <div class="form-group">
                <label for="max_e" class="col-sm-2 control-label">E<sub>max</sub></label>
                <div class="col-sm-10">
                  <input type="number" step="0.1" class="form-control"
                  id="max_e" value="10" max="10" min="0">
                </div>
              </div>
              <div class="form-group">
                <label for="time" class="col-sm-2 control-label">Time (years)</label>
                <div class="col-sm-10">
                  <input type="number" step="0.1" class="form-control"
                  id="time" value="10" max="10" min="0">
                </div>
              </div>
              <div class="form-group">
                <label for="sigma" class="col-sm-2 control-label">Sigma</label>
                <div class="col-sm-10">
                  <input type="number" step="0.1" class="form-control"
                  id="sigma" value="3" max="10" min="0">
                </div>
              </div>
            </form>
            <small>Sigma = Signal * sqrt(Time) / sqrt(Signal + 2 * Background)</small>
          </div>
        </div>
      </div>
    </div>


  </div>

</div>

<script>
// Enable the tool tips for all elements with them
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// Some global "switches" which alter certain behavior
// Mode determines what happens when clicking or mousing over the map:
// "normal" - follows the mouse around for spectrum
// "place_reactor" - clicking the map places a reactor at that location
// mass_invert inverts the neutrnio mass hierarchy when true
var mode = "normal";
var mass_invert = false;
var power_type = 3;

</script>


<script>

var earth_radius = 6371;
var result;

//document.getElementById("the_map").addEventListener("mousemove", function(e){
//function follow_mouse(e){
//  if (mode == "place_reactor"){
//    return;
//  }
//  var checkbox = document.getElementById("is_locked");
//  if (!checkbox.checked){
//    return;
//  }
//  document.getElementById("detector_preset").value = "none";
//  xy = e.latlng;
//  while (xy.lng > 180){
//    xy.lng = xy.lng - 360;
//  }
//  while (xy.lng < -180){
//    xy.lng = xy.lng + 360;
//  }
//
//  document.getElementById("cursor_lat").value = xy.lat.toFixed(2);
//  document.getElementById("cursor_lon").value = xy.lng.toFixed(2);
//  update_map();
//}
//
//map.on("mousemove", follow_mouse);
//map.on("dragstart", function(e){map.off("mousemove", follow_mouse)});
//map.on("dragend", function(e){map.on("mousemove", follow_mouse)});

//document.getElementById("the_map").addEventListener("click", function(e){
//  if (mode == "normal"){
//    var checkbox = document.getElementById("is_locked");
//    if (checkbox.checked){
//      checkbox.checked = false;
//    } else {
//      checkbox.checked = true;
//    }
//  }
//  if (mode == "place_reactor"){
//    xy = image_coordinates_to_lon_lat(e.layerX, e.layerY, this.width, this.height);
//    document.getElementById("react_lat").value = xy[1].toFixed(2);
//    document.getElementById("react_lon").value = xy[0].toFixed(2);
//    mode = "normal";
//    $("#place_reactor").addClass("btn-success");
//    $("#place_reactor").removeClass("btn-danger");
//    document.getElementById("place_reactor").textContent = "Place Reactor";
//    update_map();
//  }
//});

document.getElementById("place_reactor").addEventListener("click", function(e){
  if ($(this).hasClass("btn-success")){
    $(this).removeClass("btn-success");
    $(this).addClass("btn-danger");
    this.textContent = "Cancel Reactor Placement";
    mode = "place_reactor";
  } else {
    mode = "normal";
    $(this).addClass("btn-success");
    $(this).removeClass("btn-danger");
    this.textContent = "Place Reactor";
  }
});

//document.getElementById("cursor_lat").addEventListener("input", function(e){
//  update_map();
//});
//document.getElementById("cursor_lon").addEventListener("input", function(e){
//  update_map();
//});
//document.getElementById("react_lat").addEventListener("input", function(e){
//  update_map();
//});
//document.getElementById("react_lon").addEventListener("input", function(e){
//  update_map();
//});
document.getElementById("mantle_signal").addEventListener("input", function(e){
  update_map();
});
document.getElementById("thu_ratio").addEventListener("input", function(e){
  update_map();
});
document.getElementById("react_power").addEventListener("input", function(e){
  update_map();
});
document.getElementById("user_reactor").addEventListener("change", function(e){
  update_map();
});
document.getElementById("include_crust").addEventListener("change", function(e){
  update_map();
});
document.getElementById("mass_invert").addEventListener("change", function(e){
  mass_invert = this.checked;
  update_map();
});
document.getElementById("signal_source").addEventListener("change", function(e){
  signal_stats();
});
document.getElementById("solve_for").addEventListener("change", function(e){
  signal_stats();
});
document.getElementById("min_e").addEventListener("input", function(e){
  signal_stats();
});
document.getElementById("max_e").addEventListener("input", function(e){
  signal_stats();
});
document.getElementById("time").addEventListener("input", function(e){
  signal_stats();
});
document.getElementById("sigma").addEventListener("input", function(e){
  signal_stats();
});



function update_map(){
  //var map_height = document.getElementById("the_map").height;
  //var map_width = document.getElementById("the_map").width;

  var lon_deg = parseFloat(document.getElementById("cursor_lon").value);
  var lat_deg = parseFloat(document.getElementById("cursor_lat").value);
  //var detct_image_coords = lon_lat_to_image_coordinates(lon_deg, lat_deg, map_width, map_height);
  //document.getElementById("detector_icon").style.top = detct_image_coords[0] + "px";
  //document.getElementById("detector_icon").style.left = detct_image_coords[1] + 15 + "px";

  var reac_lon_deg = parseFloat(document.getElementById("react_lon").value);
  var reac_lat_deg = parseFloat(document.getElementById("react_lat").value);
  //var react_image_coords = lon_lat_to_image_coordinates(reac_lon_deg, reac_lat_deg, map_width, map_height);
  //document.getElementById("reactor_icon").style.top = react_image_coords[0] + "px";
  //document.getElementById("reactor_icon").style.left = react_image_coords[1] + 15 + "px";
  var reac_lat = reac_lat_deg * (Math.PI/180);
  var reac_lon = reac_lon_deg * (Math.PI/180);
  var user_input = document.getElementById("user_reactor").checked;
  if (user_input){
    //document.getElementById("reactor_icon").style.display = "block";
  } else {
    //document.getElementById("reactor_icon").style.display = "none";
  }

  reac_p = {
    x : earth_radius * Math.cos(reac_lat) * Math.cos(reac_lon),
    y : earth_radius * Math.cos(reac_lat) * Math.sin(reac_lon),
    z : earth_radius * Math.sin(reac_lat)
  };
  reac_power = parseFloat(document.getElementById("react_power").value);

  var react_spectrum = [];
  var geo_nu_spectra = geo_nu(lon_deg, lat_deg);

  lat = lat_deg  * (Math.PI/180);
  lon = lon_deg * (Math.PI/180);

  p1 = {
    x : earth_radius * Math.cos(lat) * Math.cos(lon),
    y : earth_radius * Math.cos(lat) * Math.sin(lon),
    z : earth_radius * Math.sin(lat)
  };

  // we want to find the smallest element, so start someplace big...
  var min_dist = 1e10;
  var min_spec;
  for (var i=0; i<react_data.length; i++){

    p2 = {
      x : react_data[i][0],
      y : react_data[i][1],
      z : react_data[i][2]
    };

    power = react_data[i][power_type];
    dist = distance(p1, p2);
    var spec = nuosc(dist, power, spectrum, mass_invert);

    react_spectrum.push(spec);
    if ((dist < min_dist) && (d3.sum(spec) > 0)){
      min_dist = dist;
      min_spec = spec;
    }
  }
  var user_dist = distance(p1, reac_p);
  if (user_input){
    user_react_spectrum = nuosc(user_dist, reac_power, spectrum, mass_invert);
    document.getElementById("user_dist").textContent = user_dist.toFixed(0);
    d3.selectAll(".reac").style("display", "");
    if (user_dist < min_dist){
      min_dist = user_dist;
      min_spec = user_react_spectrum;
    }
  } else {
    user_react_spectrum = nuosc(user_dist, 0, spectrum, mass_invert);
    document.getElementById("user_dist").textContent = "N/A";
    d3.selectAll(".reac").style("display", "none");
  }
  document.getElementById("closest_dist").textContent = min_dist.toFixed(0);


  closest = min_spec;
  user_spec = squish_array([user_react_spectrum]);
  iaea = squish_array([squish_array(react_spectrum), user_spec]);
  total = squish_array([squish_array(react_spectrum), user_spec, geo_nu_spectra.u_spec, geo_nu_spectra.th_spec]);

  text_out = Array(1001);
  text_out[0] = "total,iaea,close,user,geo_u,geo_th";
  for (var i=0; i< iaea.length; i++){
    text_out[i+1] = tof11(total[i]) + "," + tof11(iaea[i])+","+ tof11(closest[i]) + "," + tof11(user_spec[i]) + "," + tof11(geo_nu_spectra.u_spec[i]) + "," + tof11(geo_nu_spectra.th_spec[i]);
  }
  result = {
    "total":total,
    "iaea":iaea,
    "close":closest,
    "user":user_spec,
    "geo_u":geo_nu_spectra.u_spec,
    "geo_th":geo_nu_spectra.th_spec,
  };

  document.getElementById("osc_out").value = text_out.join('\n');
  var total_tnu = (d3.sum(total)/1000).toFixed(1)
    var close_tnu = (d3.sum(closest)/1000).toFixed(1)
    document.getElementById("tnu_output").textContent = total_tnu;
  document.getElementById("tnu_output_close").textContent = close_tnu;
  document.getElementById("close_percent").textContent = (close_tnu/total_tnu * 100).toFixed(0);
  document.getElementById("tnu_output_geo").textContent = (d3.sum(total.slice(0, 326))/1000).toFixed(1);

  function for_plot(arr){
    arr = arr.slice(100,899);
    arr.push(0);
    return arr;
  }

  x.domain([0, d3.max(total, function(d, i) { return i; })- 200]);
  y.domain([0, d3.max(total, function(d) { return d; })]);
  svg.select(".reac")
    .attr("d", valueline(for_plot(user_spec)));
  svg.select(".c_reac")
    .attr("d", valueline(for_plot(closest)));
  svg.select(".geo_u")
    .attr("d", valueline(geo_nu_spectra.u_spec.slice(100,900)));
  svg.select(".geo_th")
    .attr("d", valueline(geo_nu_spectra.th_spec.slice(100,900)));
  svg.select(".total")
    .attr("d", valueline(for_plot(total)));
  svg.select(".iaea")
    .attr("d", valueline(for_plot(iaea)));
  svg.select("#yaxis")
    .call(yAxis);
  svg.select(".x.axis")
    .call(xAxis);
  signal_stats();
}
//update_map();

function signal_stats(){
  var min_i = parseInt(parseFloat(document.getElementById("min_e").value) * 100);
  var max_i = parseInt(parseFloat(document.getElementById("max_e").value) * 100);

  var solve_for = document.getElementById("solve_for").value;
  var signal_source = document.getElementById("signal_source").value;

  if (signal_source == "0"){
    var signal = d3.sum(result.iaea.slice(min_i, max_i))/1000 + d3.sum(result.user.slice(min_i, max_i))/1000;
    var background = d3.sum(result.geo_u.slice(min_i, max_i))/1000 + d3.sum(result.geo_th.slice(min_i, max_i))/1000;
  } else if (signal_source == "1"){
    var signal = d3.sum(result.close.slice(min_i, max_i))/1000;
    var background = d3.sum(result.total.slice(min_i, max_i))/1000  - d3.sum(result.close.slice(min_i, max_i))/1000;
  } else if (signal_source == "2"){
    var signal = d3.sum(result.user.slice(min_i, max_i))/1000;
    var background = d3.sum(result.total.slice(min_i, max_i))/1000 - d3.sum(result.user.slice(min_i, max_i))/1000;
  } else if (signal_source == "3"){
    var background = d3.sum(result.iaea.slice(min_i, max_i))/1000 + d3.sum(result.user.slice(min_i, max_i))/1000;
    var signal = d3.sum(result.geo_u.slice(min_i, max_i))/1000 + d3.sum(result.geo_th.slice(min_i, max_i))/1000;
  }

  if (solve_for == "0"){
    document.getElementById("sigma").removeAttribute("readonly");
    var sigma = parseFloat(document.getElementById("sigma").value);;
    document.getElementById("time").setAttribute("readonly", "true");
    document.getElementById("time").value = ((signal + 2 * background) * (sigma/signal) * (sigma/signal)).toFixed(3);
  } else if (solve_for == "1"){
    document.getElementById("sigma").setAttribute("readonly", "true");
    var time = parseFloat(document.getElementById("time").value);
    document.getElementById("time").removeAttribute("readonly");
    var sigma = signal * Math.sqrt(time)/Math.sqrt(signal + 2 * background);
    document.getElementById("sigma").value = sigma.toFixed(2);
  }
}
</script>
  <script>
document.getElementById("load_factor").addEventListener("change", function(e){
  power_type = parseInt(this.value);
  update_map();
});
  </script>
<script src="/static/js/build/reactors.js"></script>
