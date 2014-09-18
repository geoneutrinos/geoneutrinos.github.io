//var k40_heat = 3.33 * 1e-12; // W/g
var k40_heat = 2.85 * 1e-8; // W/g
var u238_heat = 98.5 * 1e-9; // W/g
var th232_heat = 26.3 * 1e-9; // W/g
var u238_lum = 7.64 * 1e4; // l / kg µs
var th232_lum = 1.62 * 1e4; // l / kg µs
var k40_lum = 2.07 * 1e5; // l / kg µs

var earth_radius = 6.372; //megameters
var earth_surface_area = 5.1e14 // m^2

var crust_data;
var prem  = new Array();
var crust = {}
var mantle = {};

container_width = $(".plot_container").width()
var width = container_width,
    height = container_width/2;

var projection = d3.geo.equirectangular()
    .scale(153)
    .rotate([0,0])
    .translate([960 / 2, 480 /2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

function setup_display(){
  d3.select(".plot_container").append("canvas")
    .attr("id", "plot_display")
    .attr("width", 180)
    .attr("height", 90)
    .style("width", width + "px")
    .style("height", height + "px");

  d3.select(".colorbar").append("svg")
    .attr("id", "plot_colorbar")
    .attr("height", 25)
    .attr("width", width)
    .attr("viewBox", "0 0 960 25")
    .attr("preserveAspectRatio", "xMinYMin");
  var points = [
    [0, 0],
    [960, 0]
      ];

  var colormap = d3.scale.linear()
    .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
    .interpolate(d3.interpolateLab)
    .range(["#00008f", "#00f", "#0ff", "#ff0", "#f00", "#8f0000"]);


  var line = d3.svg.line()
    .interpolate("basis");

  d3.select("#plot_colorbar").selectAll("path")
    .data(quad(sample(line(points), 8)))
    .enter().append("path")
    .style("fill", function(d) { return colormap(d.t); })
    .style("stroke", function(d) { return colormap(d.t); })
    .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], 50); });

  // Sample the SVG path string "d" uniformly with the specified precision.
  function sample(d, precision) {
    var path = document.createElementNS(d3.ns.prefix.svg, "path");
    path.setAttribute("d", d);

    var n = path.getTotalLength(), t = [0], i = 0, dt = precision;
    while ((i += dt) < n) t.push(i);
    t.push(n);

    return t.map(function(t) {
      var p = path.getPointAtLength(t), a = [p.x, p.y];
      a.t = t / n;
      return a;
    });
  }

  // Compute quads of adjacent points [p0, p1, p2, p3].
  function quad(points) {
    return d3.range(points.length - 1).map(function(i) {
      var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
      a.t = (points[i].t + points[i + 1].t) / 2;
      return a;
    });
  }

  // Compute stroke outline for segment p12.
  function lineJoin(p0, p1, p2, p3, width) {
    var u12 = perp(p1, p2),
        r = width / 2,
        a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
        b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
        c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
        d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

    if (p0) { // clip ad and dc using average of u01 and u12
      var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
      a = lineIntersect(p1, e, a, b);
      d = lineIntersect(p1, e, d, c);
    }

    if (p3) { // clip ab and dc using average of u12 and u23
      var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
      b = lineIntersect(p2, e, a, b);
      c = lineIntersect(p2, e, d, c);
    }

    return "M" + a + "L" + b + " " + c + " " + d + "Z";
  }

  // Compute intersection of two infinite lines ab and cd.
  function lineIntersect(a, b, c, d) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
        y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
        ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [x1 + ua * x21, y1 + ua * y21];
  }

  // Compute unit vector perpendicular to p01.
  function perp(p0, p1) {
    var u01x = p0[1] - p1[1], u01y = p1[0] - p0[0],
        u01d = Math.sqrt(u01x * u01x + u01y * u01y);
    return [u01x / u01d, u01y / u01d];
  }
}
function singltonMinusTwoD(A, b){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
        row.push(b - A[i][ii]);
      }
    result.push(row);
  }
  return result;
}
function twodSingletonMult(A, b){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
        row.push(A[i][ii] * b);
      }
    result.push(row);
  }
  return result;
}
function twodSingletonAdd(A, b){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
        row.push(A[i][ii] + b);
      }
    result.push(row);
  }
  return result;
}
function twodSingletonDiv(A, b){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
        row.push(A[i][ii] / b);
      }
    result.push(row);
  }
  return result;
}
function singletonDivtwod(A, b){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
        row.push(b / A[i][ii]);
      }
    result.push(row);
  }
  return result;
}
function twodProduct(A, B){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
      if (B.length == 0 ){ //first time called
        row.push(A[i][ii]);
      } else {
        row.push(A[i][ii] * B[i][ii]);
      }
    }
    result.push(row);
  }
  return result;
}

function twodDivide(A, B){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
      if (B.length == 0 ){ //first time called
        row.push(A[i][ii]);
      } else {
        row.push(A[i][ii] / B[i][ii]);
      }
    }
    result.push(row);
  }
  return result;
}

function twodAdd(A, B){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
      if (B.length == 0 ){ //first time called
        row.push(A[i][ii]);
      } else {
        row.push(A[i][ii] + B[i][ii]);
      }
    }
    result.push(row);
  }
  return result;
}

function twodSqrtofSquares(A, B){
  var result = new Array();
  for (i = 0; i < A.length; i++){
    row = new Array();
    for (ii = 0; ii < A[i].length; ii++){
      if (B.length == 0 ){ //first time called
        row.push(A[i][ii]);
      } else {
        row.push(Math.sqrt(Math.pow(A[i][ii], 2) + Math.pow(B[i][ii], 2)));
      }
    }
    result.push(row);
  }
  return result;
}

function sumTwoD(A){
  return A.reduce(function(a,b){
    return a + b.reduce(function(a,b){
      return a + b;
    });
  },0);
}

function updateThingsWithServer(){
  $("#scale_title_placeholder").text("Loading...");
  
  //plotsrc = "/plot.json?layers=shuml&uthk=2.7,2.7,2.7,1.3,0.2,1.7,1.7,0.1,0.1,0.1,10.5,10.5,10.5,6.5,1.2,6.9,6.9,0.2,0.2,0.2,2.4,2.4,2.4,2.0,0.5,1.5,1.5,0.1,0.1,0.1";

  d3.json("/cache/crust_data.json", function(data) {
    crust_data = (data);
    crust_data.crust_f = singltonMinusTwoD(crust_data.ocean_f, 1)
    updateCrustThings();
  });
}

function updateCrustThings(){
  var include = new Array();
  var sources = document.getElementsByClassName("selected_crust_layers");
  for (i = 0; i < sources.length; i++){
    if (sources[i].checked){
      include.push(sources[i].value);
    }
  }
    
  // Compute requested thickness
  var thickness = new Array();
  for (i = 0; i < crust_data.area.length; i++){
    row = new Array();
    for (ii = 0; ii < crust_data.area[i].length; ii++){
      row.push(0);
      }
    thickness.push(row);
    }
    if (include.indexOf("s") > -1){
      thickness = twodAdd(crust_data.thickness.s, thickness);
    }
    if (include.indexOf("h") > -1){
      thickness = twodAdd(crust_data.thickness.h, thickness);
    }
    if (include.indexOf("u") > -1){
      thickness = twodAdd(crust_data.thickness.u, thickness);
    }
    if (include.indexOf("m") > -1){
      thickness = twodAdd(crust_data.thickness.m, thickness);
    }
    if (include.indexOf("l") > -1){
      thickness = twodAdd(crust_data.thickness.l, thickness);
    }
    crust.thickness = thickness;


  // Compute requested heat
  crust.heat = {}
  var heat1 = new Array();
  for (i = 0; i < crust_data.area.length; i++){
    row = new Array();
    for (ii = 0; ii < crust_data.area[i].length; ii++){
      row.push(0);
      }
    heat1.push(row);
    }
  crust.heat.u = heat1;
  var heat2 = new Array();
  for (i = 0; i < crust_data.area.length; i++){
    row = new Array();
    for (ii = 0; ii < crust_data.area[i].length; ii++){
      row.push(0);
      }
    heat2.push(row);
    }
  crust.heat.th = heat2;
  var heat3 = new Array();
  for (i = 0; i < crust_data.area.length; i++){
    row = new Array();
    for (ii = 0; ii < crust_data.area[i].length; ii++){
      row.push(0);
      }
    heat3.push(row);
    }
  crust.heat.k = heat3;
  crust.heat.total = 0;

  u_range = 10 / 1e-6;
  th_range = 10 / 1e-6;
  k_range = 100 / 1e-2;
  c_u_heat = 98.5 * 1e-6;
  c_th_heat = 26.3 * 1e-6;
  c_k_heat = 3.33 * 1e-9;

    if (include.indexOf("s") > -1){
      c_u = parseFloat(document.getElementById("c_ssed_u").value)/u_range;
      c_th = parseFloat(document.getElementById("c_ssed_th").value)/th_range;
      c_k = parseFloat(document.getElementById("c_ssed_k").value)/k_range;
      o_u = parseFloat(document.getElementById("o_ssed_u").value)/u_range;
      o_th = parseFloat(document.getElementById("o_ssed_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_ssed_k").value)/k_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.u[i][ii] += (c_u   * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (c_th * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (c_k   * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii] * c_k_heat);
        crust.heat.u[i][ii] += (o_u   * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (o_th * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (o_k   * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii] * c_k_heat);
        }
      }
    }
    if (include.indexOf("h") > -1){
      c_u = parseFloat(document.getElementById("c_hsed_u").value)/u_range;
      c_th = parseFloat(document.getElementById("c_hsed_th").value)/th_range;
      c_k = parseFloat(document.getElementById("c_hsed_k").value)/k_range;
      o_u = parseFloat(document.getElementById("o_hsed_u").value)/u_range;
      o_th = parseFloat(document.getElementById("o_hsed_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_ssed_k").value)/k_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.u[i][ii] += (c_u   * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (c_th * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (c_k   * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii] * c_k_heat);
        crust.heat.u[i][ii] += (o_u   * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (o_th * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (o_k   * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii] * c_k_heat);
        }
      }
    }
    if (include.indexOf("u") > -1){
      c_u = parseFloat(document.getElementById("c_up_u").value)/u_range;
      c_th = parseFloat(document.getElementById("c_up_th").value)/th_range;
      c_k = parseFloat(document.getElementById("c_up_k").value)/k_range;
      o_u = parseFloat(document.getElementById("o_up_u").value)/u_range;
      o_th = parseFloat(document.getElementById("o_up_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_up_k").value)/k_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.u[i][ii] += (c_u   * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (c_th * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (c_k   * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii] * c_k_heat);
        crust.heat.u[i][ii] += (o_u   * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (o_th * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (o_k   * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii] * c_k_heat);
        }
      }
    }
    if (include.indexOf("m") > -1){
      c_u = parseFloat(document.getElementById("c_mid_u").value)/u_range;
      c_th = parseFloat(document.getElementById("c_mid_th").value)/th_range;
      c_k = parseFloat(document.getElementById("c_mid_k").value)/k_range;
      o_u = parseFloat(document.getElementById("o_mid_u").value)/u_range;
      o_th = parseFloat(document.getElementById("o_mid_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_mid_k").value)/k_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.u[i][ii] += (c_u   * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (c_th * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (c_k   * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii] * c_k_heat);
        crust.heat.u[i][ii] += (o_u   * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (o_th * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (o_k   * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii] * c_k_heat);
        }
      }
    }
    if (include.indexOf("l") > -1){
      c_u = parseFloat(document.getElementById("c_low_u").value)/u_range;
      c_th = parseFloat(document.getElementById("c_low_th").value)/th_range;
      c_k = parseFloat(document.getElementById("c_low_k").value)/k_range;
      o_u = parseFloat(document.getElementById("o_low_u").value)/u_range;
      o_th = parseFloat(document.getElementById("o_low_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_low_k").value)/k_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.u[i][ii] += (c_u   * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (c_th * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (c_k   * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii] * c_k_heat);
        crust.heat.u[i][ii] += (o_u   * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii] * c_u_heat);
        crust.heat.th[i][ii] += (o_th * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii] * c_th_heat);
        crust.heat.k[i][ii] += (o_k   * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii] * c_k_heat);
        }
      }
    }
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust.heat.total += crust.heat.u[i][ii] + crust.heat.th[i][ii] + crust.heat.k[i][ii];
        crust.heat.u[i][ii] = crust.heat.u[i][ii]/crust_data.area[i][ii]/1000;
        crust.heat.th[i][ii] = crust.heat.th[i][ii]/crust_data.area[i][ii]/1000;
        crust.heat.k[i][ii] = crust.heat.k[i][ii]/crust_data.area[i][ii]/1000;
      }
    }



  updateThings();
}

function updateThings(){
  var from_mantle = 0;
  var min = 0;
  var max = 1;
  var heatmap = new Array();
  var mantle_signal = mantle_nu_tnu(); // we always want this now
  var u238_status = "not";
  var th232_status = "not";
  var k40_status = "not";

  if (document.getElementById('use_bse_constraint').checked){
    bse_diff_u238 = (elm_total_mass("u238") - bse_elm_mass.u238)/1e20;
    bse_diff_th232 = (elm_total_mass("th232") - bse_elm_mass.th232)/1e20;
    bse_diff_k40 = (elm_total_mass("k40") - bse_elm_mass.k40)/1e20;
    if (bse_diff_u238 > 0 ){
      u238_status = "high";
      document.getElementById("u_constraint_status").textContent = "Exceeds BSE Constraint";
      document.getElementById("u_status_row").className = "danger";
    } else {
      u238_status = "low";
      document.getElementById("u_constraint_status").textContent = "Within BSE Constraint";
      document.getElementById("u_status_row").className = "success";
    }
    if (bse_diff_th232 > 0 ){
      document.getElementById("th_constraint_status").textContent = "Exceeds BSE Constraint";
      document.getElementById("th_status_row").className = "danger";
      th232_status = "high";
    } else {
      document.getElementById("th_constraint_status").textContent = "Within BSE Constraint";
      document.getElementById("th_status_row").className = "success";
      th232_status = "low";
    }
    if (bse_diff_k40 > 0 ){
      document.getElementById("k_constraint_status").textContent = "Exceeds BSE Constraint";
      document.getElementById("k_status_row").className = "danger";
      k40_status = "high";
    } else {
      document.getElementById("k_constraint_status").textContent = "Within BSE Constraint";
      document.getElementById("k_status_row").className = "success";
      k40_status = "low";
    }
  } else {
    document.getElementById("u_constraint_status").textContent = "Unconstrained";
    document.getElementById("th_constraint_status").textContent = "Unconstrained";
    document.getElementById("k_constraint_status").textContent = "Unconstrained";
      document.getElementById("u_status_row").className = "";
      document.getElementById("th_status_row").className = "";
      document.getElementById("k_status_row").className = "";

  }
  // heatmap init to zeros for if nothing is selected...
  for (i = 0; i < crust_data.area.length; i++){
    row = new Array();
    for (ii = 0; ii < crust_data.area[i].length; ii++){
      row.push(0);
      }
    heatmap.push(row);
    }

  var include = new Array();
  var sources = document.getElementsByClassName("sources_checkboxes");
  for (i = 0; i < sources.length; i++){
    if (sources[i].checked){
      include.push(sources[i].value);
    }
  }

    document.getElementById("total_crust_power").textContent = ((crust.heat.total)/1e12).toFixed(1);
    display_power();
  if ($('#plot_display_selector').val() == 'thickness') {
    heatmap = crust.thickness;
    min = 0;
    max = 70;
  } else if ($('#plot_display_selector').val() == 'heat') {
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust.heat.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust.heat.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust.heat.k, heatmap);
    }
    from_mantle = mantle_heat();
    min = 0;
    max = 140;
  } else if ($('#plot_display_selector').val() == 'neutrino_flux') {
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust_data.nu_flux.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust_data.nu_flux.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust_data.nu_flux.k, heatmap);
    }
    if (include.indexOf("r") > -1){
      heatmap = twodAdd(crust_data.reactor.flux, heatmap);
    }
    from_mantle = mantle_signal;
    min = 0;
    max = 60000000;
    //console.log("neutrino");
  } else if ($('#plot_display_selector').val() == 'neutrino') {
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust_data.nu_signal.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust_data.nu_signal.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust_data.nu_signal.k, heatmap);
    }
    if (include.indexOf("r") > -1){
      heatmap = twodAdd(crust_data.reactor.signal11, heatmap);
    }
    from_mantle = mantle_nu_tnu();
    min = 0;
    max = 80;
    //console.log("neutrino");
  } else if ($('#plot_display_selector').val() == 'geonu_fraction') {
    var mantle_flux = mantle_nu_flux();
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust_data.nu_flux.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust_data.nu_flux.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust_data.nu_flux.k, heatmap);
    }
    heatmap = singletonDivtwod(twodSingletonAdd(heatmap, mantle_flux), mantle_flux);
    from_mantle = 0;
    min = 0;
    max = 1;
  } else if ($('#plot_display_selector').val() == 'mantle_ratio') {
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust_data.nu_signal.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust_data.nu_signal.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust_data.nu_signal.k, heatmap);
    }
    if (include.indexOf("r") > -1){
      heatmap = twodAdd(crust_data.reactor.signal33, heatmap);
    }
    from_mantle = mantle_nu_tnu();
    heatmap = singletonDivtwod(heatmap, from_mantle);
    from_mantle = 0;
    max = 10;
    min = 0;
  } else if ($('#plot_display_selector').val() == 'mantle_uncertain') {
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      heatmap = twodAdd(crust_data.nu_signal.u, heatmap);
    }
    if (include.indexOf("th") > -1){
      heatmap = twodAdd(crust_data.nu_signal.th, heatmap);
    }
    if (include.indexOf("k") > -1){
      heatmap = twodAdd(crust_data.nu_signal.k, heatmap);
    }
    from_mantle = mantle_nu_tnu();
    heatmap = twodSingletonDiv(twodSqrtofSquares(heatmap, crust_data.reactor.signal33), from_mantle);
    from_mantle = 0;
    min = 0;
    max = 3;
  }

  var dx = heatmap[0].length,
  dy = heatmap.length;

  //var min = d3.min(heatmap, function(subunit){
  //  return d3.min(subunit);
  //}) + from_mantle;
  //var max = d3.max(heatmap, function(subunit){
  //  return d3.max(subunit);
  //}) + from_mantle;
  
  var step = (max - min)/5;

  // Fix the aspect ratio.
  // var ka = dy / dx, kb = height / width;
  // if (ka < kb) height = width * ka;
  // else width = height / ka;

  var x = d3.scale.linear()
    .domain([0, dx])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, dy])
    .range([height, 0]);

  var color = d3.scale.linear()
    .domain([min, min + (step), min + (step * 2), min + (step *3), min + (step * 4), max])
    .range(["#00008F", "#00f", "#0ff", "#ff0", "#f00", "#8f0000"]);

  d3.select("#plot_display")
    //.attr("width", dx)
    //.attr("height", dy)
    //.style("width", width + "px")
    //.style("height", height + "px")
    .call(drawImage);


  // Compute the pixel colors; scaled by CSS.
  function drawImage(canvas) {
    var context = canvas.node().getContext("2d"),
        image = context.createImageData(dx, dy);

    for (var y = 0, p = -1; y < dy; ++y) {
      for (var x = 0; x < dx; ++x) {
        var plot_data = heatmap[y][x] + from_mantle;
        if (plot_data > max){
          plot_data = max;
        }
        var c = d3.rgb(color(plot_data));
        image.data[++p] = c.r;
        image.data[++p] = c.g;
        image.data[++p] = c.b;
        image.data[++p] = 255;
      }
    }

    context.putImageData(image, 0, 0);
  }

  function removeZero(axis) {
    axis.selectAll("g").filter(function(d) { return !d; }).remove();
  }

  // Finally, set the colorbar labels
  if (max > 1000){
    var label_start = min + (max - min) * 0.1;
    $("#sl_0_pc").text((label_start).toExponential());
    $("#sl_25_pc").text((label_start + step).toExponential());
    $("#sl_50_pc").text((label_start + (step * 2)).toExponential());
    $("#sl_75_pc").text((label_start + (step * 3)).toExponential());
    $("#sl_100_pc").text((label_start + (step * 4)).toExponential());
  } else{
  var label_start = min + (max - min) * 0.1;
  $("#sl_0_pc").text((label_start).toFixed(1));
  $("#sl_25_pc").text((label_start + step).toFixed(1));
  $("#sl_50_pc").text((label_start + (step * 2)).toFixed(1));
  $("#sl_75_pc").text((label_start + (step * 3)).toFixed(1));
  $("#sl_100_pc").text((label_start + (step * 4)).toFixed(1));
  }

  var display_value = $("#plot_display_selector").val();
  if (display_value == "thickness"){
    $("#scale_title_placeholder").text("Crust Thickness (km)");
  } else if (display_value == "heat"){
    $("#scale_title_placeholder").html("Crust Heat Intensity (mW/m<sup>2</sup>)");
  } else if (display_value == "neutrino_flux"){
    $("#scale_title_placeholder").html("Geoneutrino Flux (/cm<sup>2</sup>s)");
  } else if (display_value == "neutrino"){
    $("#scale_title_placeholder").html("Geoneutrino Signal (TNU)");
  } else if (display_value == "geonu_fraction"){
    $("#scale_title_placeholder").text("Mantle Geo-neutrino Flux Fraction");
  } else if (display_value == "mantle_ratio"){
    $("#scale_title_placeholder").text("Mantle Signal-to-Background Ratio");
  } else if (display_value == "mantle_uncertain"){
    $("#scale_title_placeholder").text("Mantle Signal Fractional Uncertainty");
  } else {
    $("#scale_title_placeholder").text("Something has gone wrong...");
  }


// colorbar

}
function draw_geo_lines(){
  var svg = d3.select(".plot_container").append("svg")
    .attr("viewBox", "0 0 960 480")
    .attr("preserveAspectRatio", "xMinYMin")
    .attr("width", width)
    .attr("height", height)


    d3.json("/js/plates.json", function(collection) {
      feature = svg.selectAll()
      .data(collection.features)
      .enter().append("svg:path")
      .attr("d", path)
      .attr("class", "plates")
    });
    d3.json("/js/bounds.json", function(collection) {
      feature = svg.selectAll()
      .data(collection.features)
      .enter().append("svg:path")
      .attr("d", path)
      .attr("class", "bounds")
    });
}

//build controls for each layer in the PREM
mantle_layers = new Array();
function mantle_concentric_control_factory(){
  mlc = $("#mantle_layer_container");
  for (var layer=prem.length; layer--;){
      outer_r = parseFloat(prem[layer][1]);
      inner_r = parseFloat(prem[layer][0]);
    if (inner_r > 3479 && outer_r < 6346.7){
      mantle_layers.push(layer);

    mlc.append("\
        <p>Radius: "+outer_r+"KM to "+inner_r+ "KM</p>\
    <table class='table'>\
      <thead>\
        <tr>\
          <th>Param</th>\
          <th>Change</th>\
          <th>Value</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
          <td>U</td>\
          <td><input id='mantle_u238_slider"+layer+"' min=0 max=50 step=0.5 data-layer='"+layer+"' data-isotope='u238' class='layered_mantle_slider mantle_u238_slider range_responsive has_constraint' type='range'></td>\
          <td><span id='mantle_u238_label_"+layer+"' data-label-for='mantle_u238_slider"+layer+"' data-label-suffix='ng/g' data-label-precision='1'></span></td>\
        </tr>\
        <tr>\
          <td>Th</td>\
          <td><input id='mantle_th232_slider"+layer+"' min=0 max=200 step=0.5 data-layer='"+layer+"' data-isotope='th232' class='layered_mantle_slider mantle_th232_slider range_responsive has_constraint' type='range'></td>\
          <td><span id='mantle_th232_label_"+layer+"' data-label-for='mantle_th232_slider"+layer+"' data-label-suffix='ng/g' data-label-precision='1'></span></td>\
        </tr>\
        <tr>\
          <td>K</td>\
          <td><input id='mantle_k40_slider"+layer+"' min=0 max=600 step=1 data-layer='"+layer+"' data-isotope='k40' class='layered_mantle_slider mantle_k40_slider range_responsive has_constraint' type='range'></td>\
          <td><span id='mantle_k40_label_"+layer+"' data-label-for='mantle_k40_slider"+layer+"' data-label-suffix='µg/g' data-label-precision='0'></span></td>\
        </tr>\
      </tbody>\
    </table>\
        ");
  }
    var elements = document.getElementsByClassName("layered_mantle_slider");
    for (i=0; i < elements.length; i++){
      elements[i].addEventListener("constraint_done", updateThings);
    }
    document.getElementById("2_layer_boundary_slider").setAttribute("min", Math.min.apply(Math, mantle_layers));
    document.getElementById("2_layer_boundary_slider").setAttribute("max", Math.max.apply(Math, mantle_layers));
    document.getElementById("2_layer_boundary_slider").value = 32;
    inner_r = prem[32][0];
    text_content = pad_str_num(((earth_radius * 1000) - inner_r).toFixed(0), 4, "0");
    document.getElementById("2_layer_boundary_value").textContent = text_content;
  }
}

function pad_str_num(str, width, fill){
  gap = width - str.length;
  if (gap > 0) {
    return Array(gap + 1).join(fill) + str;
  } else {
    return str;
  }
}

function deal_with_2_layer_boundary_change(){
  boundary_i = parseInt(document.getElementById("2_layer_boundary_slider").value);
  inner_r = prem[boundary_i][0];
  text_content = pad_str_num(((earth_radius * 1000) - inner_r).toFixed(0), 4, "0");
  document.getElementById("2_layer_boundary_value").textContent = text_content;
  for (layer in prem){
    if (parseFloat(prem[layer][0]) > 3479 && (parseFloat(prem[layer][1]) < 6346.7)){
      if (layer > boundary_i){
        k40 = document.getElementById("2_layer_upper_k40_slider").value;
        th232 = document.getElementById("2_layer_upper_th232_slider").value;
        u238 = document.getElementById("2_layer_upper_u238_slider").value;
        document.querySelector(".mantle_k40_slider[data-layer='"+layer+"']").value = k40;
        document.querySelector(".mantle_th232_slider[data-layer='"+layer+"']").value = th232;
        document.querySelector(".mantle_u238_slider[data-layer='"+layer+"']").value = u238;
      } else {
        k40 = document.getElementById("2_layer_lower_k40_slider").value;
        th232 = document.getElementById("2_layer_lower_th232_slider").value;
        u238 = document.getElementById("2_layer_lower_u238_slider").value;
        document.querySelector(".mantle_k40_slider[data-layer='"+layer+"']").value = k40;
        document.querySelector(".mantle_th232_slider[data-layer='"+layer+"']").value = th232;
        document.querySelector(".mantle_u238_slider[data-layer='"+layer+"']").value = u238;
      }
    }
  }
  layer_sliders = document.getElementsByClassName("mantle_k40_slider");
  for (var i = 0; i < layer_sliders.length; ++i) {
    layer_sliders[i].dispatchEvent(new Event('update_label'));
  }
  layer_sliders = document.getElementsByClassName("mantle_u238_slider");
  for (var i = 0; i < layer_sliders.length; ++i) {
    layer_sliders[i].dispatchEvent(new Event('update_label'));
  }
  layer_sliders = document.getElementsByClassName("mantle_th232_slider");
  for (var i = 0; i < layer_sliders.length; ++i) {
    layer_sliders[i].dispatchEvent(new Event('update_label'));
  }
  updateThings()
}

var elms = document.getElementsByClassName("2_layer_mantle");
for (var i = 0; i < elms.length; i++){
 elms[i].addEventListener("constraint_done", deal_with_2_layer_boundary_change);
}
document.getElementById("2_layer_boundary_slider").addEventListener("input", deal_with_2_layer_boundary_change);

$(document).ready(function() {
  // just doing this first cause whatever
  load_prem();
  mantle_concentric_control_factory();
  bse_less_crust_masses();
  connect_labels();


  //UI Components
  // Basic Controlls
  
  // Layers
  // Plate Boundries
  $("#plate_boundries_on").click(function() {
    $(".plates").css("visibility", "visible");
  });
  $("#plate_boundries_off").click(function() {
    $(".plates").css("visibility", "hidden");
  });
  // continental Boundries
  $("#continental_boundries_on").click(function() {
    $(".bounds").css("visibility", "visible");
  });
  $("#continental_boundries_off").click(function() {
    $(".bounds").css("visibility", "hidden");
  });

  //Mantle Controlls
  //Uuniform Mantle
  // Trying this without jquery to see how fast it might be
  function uniform_mantle_slider_factory(name, units, precision){
    function mantle_uniform_slider_generic(with_update){
      with_update = typeof with_update !== 'undefined' ? with_update : true;
      //the whole thing cause this is called outside of an event
      k40 = document.getElementById("mantle_uniform_k40_slider").value;
      u238 = document.getElementById("mantle_uniform_u238_slider").value;
      th232 = document.getElementById("mantle_uniform_th232_slider").value;
      layer_sliders = document.getElementsByClassName("mantle_k40_slider");
      for (var i = 0; i < layer_sliders.length; ++i) {
        layer_sliders[i].value = k40;
        layer_sliders[i].dispatchEvent(new Event('update_label'));
      }
      layer_sliders = document.getElementsByClassName("mantle_u238_slider");
      for (var i = 0; i < layer_sliders.length; ++i) {
        layer_sliders[i].value = u238;
        layer_sliders[i].dispatchEvent(new Event('update_label'));
      }
      layer_sliders = document.getElementsByClassName("mantle_th232_slider");
      for (var i = 0; i < layer_sliders.length; ++i) {
        layer_sliders[i].value = th232;
        layer_sliders[i].dispatchEvent(new Event('update_label'));
      }
      if (with_update){
      updateThings();
      }
    }
    return mantle_uniform_slider_generic;
  }
  deal_with_mantle_uniform_k40_slider_change = uniform_mantle_slider_factory('k40', 'µg/g', 0)
  deal_with_mantle_uniform_th232_slider_change = uniform_mantle_slider_factory('th232', 'ng/g', 1)
  deal_with_mantle_uniform_u238_slider_change = uniform_mantle_slider_factory('u238', 'ng/g', 1)
  document.getElementById("mantle_uniform_k40_slider").addEventListener("constraint_done", deal_with_mantle_uniform_k40_slider_change);
  document.getElementById("mantle_uniform_th232_slider").addEventListener("constraint_done", deal_with_mantle_uniform_th232_slider_change);
  document.getElementById("mantle_uniform_u238_slider").addEventListener("constraint_done", deal_with_mantle_uniform_u238_slider_change);


  //Set initial Values
  $("#mantle_uniform_k40_slider").val(240);
  $("#mantle_uniform_th232_slider").val(80);
  $("#mantle_uniform_u238_slider").val(20);
  deal_with_mantle_uniform_th232_slider_change(false);
  deal_with_mantle_uniform_k40_slider_change(false);
  deal_with_mantle_uniform_u238_slider_change(false);

  //set the constraints on things with user set ratios
    function deal_with_slider_change_factory(group, isotope){
      return function(){
      u238_elm = document.querySelector("[data-layer='"+group+"'][data-isotope='u238']");
      th232_elm = document.querySelector("[data-layer='"+group+"'][data-isotope='th232']");
      k40_elm = document.querySelector("[data-layer='"+group+"'][data-isotope='k40']");
      if(isotope == "k40"){
      if (document.getElementById("fixed_ku_ratio_bool").checked){
        ratio = document.getElementById("fixed_ku_ratio").value;
        u = (k40_elm.value /ratio * 1000);
        u238_elm.value = u;
      }
      if (document.getElementById("fixed_thu_ratio_bool").checked){
        ratio = document.getElementById("fixed_thu_ratio").value;
        u238 = u238_elm.value;
        th232 = (u * ratio);
        th232_elm.value = th232;
      }
    }
      if(isotope == "u238"){
      if (document.getElementById("fixed_ku_ratio_bool").checked){
        ratio = document.getElementById("fixed_ku_ratio").value;
        k40 = (u238_elm.value * ratio / 1000);
        k40_elm.value = k40;
      }
      if (document.getElementById("fixed_thu_ratio_bool").checked){
        ratio = document.getElementById("fixed_thu_ratio").value;
        th232 = th232_elm.value;
        th232 = (u238_elm.value * ratio);
        th232_elm.value = th232;
      }
    }
      if(isotope == "th232"){
      if (document.getElementById("fixed_thu_ratio_bool").checked){
        ratio = document.getElementById("fixed_thu_ratio").value;
        u238 = (th232_elm.value / ratio);
        u238_elm.value = u238;
      }
      if (document.getElementById("fixed_ku_ratio_bool").checked){
        ratio = document.getElementById("fixed_ku_ratio").value;
        u238 = u238_elm.value;
        k40 = (u238 * ratio / 1000);
        k40_elm.value = k40;
      }
    }
      u238_elm.dispatchEvent(new Event('update_label'));
      th232_elm.dispatchEvent(new Event('update_label'));
      k40_elm.dispatchEvent(new Event('update_label'));
      this.dispatchEvent(new Event("ratios_done"));
      }
    }
  var has_ratio_list = document.getElementsByClassName("has_ratios");
  var has_constraint_list = document.getElementsByClassName("has_constraint");
  function deal_with_constrained_slider_change_factory(){
    return function(){
      this.dispatchEvent(new Event('update_label'));
      this.dispatchEvent(new Event('constraint_done'));
    }
  }

  for (var i=has_ratio_list.length; i--;){
    isotope = has_ratio_list[i].getAttribute("data-isotope");
    group = has_ratio_list[i].getAttribute("data-layer");
    deal_with_slider_change = deal_with_slider_change_factory(group, isotope);
    has_ratio_list[i].addEventListener('input', deal_with_slider_change);
  }
  for (var i=has_constraint_list.length; i--;){
    isotope = has_constraint_list[i].getAttribute("data-isotope");
    group = has_constraint_list[i].getAttribute("data-layer");
    deal_with_slider_change = deal_with_constrained_slider_change_factory(group, isotope);
    has_constraint_list[i].addEventListener('input', deal_with_slider_change);
  }

  //Draw Everything and Run the App :)
  $(".causes_update").on("change", function(){
    updateThings();
  });
  $(".causes_crust_update").on("change", function(){
    updateCrustThings();
  });
  var width = $(".plot_container").width();
  $(".plot_container").height(width/2);
  $(".colorbar").height(25);
  setup_display();
  updateThingsWithServer();
  draw_geo_lines();
  sliders = document.querySelectorAll("input[type='range']");
  for (var i=sliders.length; i--;){
    sliders[i].dispatchEvent(new Event("update_label"));
  }

  document.getElementById("plot_container").addEventListener("mousemove", plot_overlay);
  document.getElementById("bse_u238_slider").addEventListener("ratios_done", bse_less_crust_masses);
  document.getElementById("bse_th232_slider").addEventListener("ratios_done", bse_less_crust_masses);
  document.getElementById("bse_k40_slider").addEventListener("ratios_done", bse_less_crust_masses);
});

function plot_overlay(e){
  c_top = this.getBoundingClientRect().top;
  c_left = this.getBoundingClientRect().left;
  c_width = this.getBoundingClientRect().width;
  c_height = this.getBoundingClientRect().height;
  mpos_x = e.clientX - c_left;
  mpos_y = e.clientY - c_top;
  x_persentage = mpos_x / c_width;
  y_persentage = mpos_y / c_height;
  lon = (x_persentage * 360) - 180;
  lat = (y_persentage * -180) + 90;
  //console.log(Math.round(lat) + ", " + Math.round(lon));
}

//Keep the canvas the same size as the svg (which automatically scales)
$(window).resize(function() {
  var width = $(".plot_container").width();
  $(".plot_container").height(width/2);
  var width = $(".plot_container").width();
  $("canvas").width(width);
  $("canvas").height(width/2);
$("svg").width(width);
});


//Mantle Model
function geometry_calc(r1, r2){

  integrate_part = function(r_top, r_bot){
    var a = ((Math.log(r_top)/2.0 - 0.25) * Math.pow(r_top, 2));
    var b = ((Math.log(r_bot)/2.0 - 0.25) * Math.pow(r_bot, 2));
    var c = r_top * Math.log(r_top) - r_top;
    var d = r_bot * Math.log(r_bot) - r_bot;
    var phi = a - b - c + d;
    return phi;
  }
  var r_top = 1.0 + r2/earth_radius;
  var r_bot = 1.0 + r1/earth_radius;
  var phi = integrate_part(r_top, r_bot);
  r_top = 1.0 - r2/earth_radius;
  r_bot = 1.0 - r1/earth_radius;
  var phi2 = integrate_part(r_top, r_bot);
  phi = phi - phi2;
  phi = phi * earth_radius/2.;
  return phi;
}

// LOAD the PREM and calcualte needed vars
function load_prem(){
  var last_g = 0;
  function prem_volume(start, stop){
    //returns cm^3
    var a = Math.pow((stop * 10e4), 3);
    var b = Math.pow((start * 10e4), 3);
    return (4/3) * Math.PI * (a - b);
  }

  function prem_mass(start, stop, g){
    function total_mass(radius, g_p){
      return (g_p * Math.pow(radius * 1000, 2))/(6.67e-11) * 1000;
    }
    a = total_mass(stop, g);
    b = total_mass(start, last_g);
    last_g = g;
    return a - b;
  }

  $.ajax({
    url:'/js/prem.json',
    dataType: "json",
    async: false,
    success: function(data){
    for (d in data){
    volume = prem_volume(data[d][0], data[d][1]);
    mass = (prem_mass(data[d][0], data[d][1], data[d][2]));
    density = mass/volume;
    geometry = geometry_calc(data[d][0]/1000, data[d][1]/1000) * 100000000;
    geo_factor = geometry * density;
    prem.push(Array(data[d][0], data[d][1], mass, geo_factor));
    }
  }
  });
}

function elm_total_mass(elm){
  var mass = 0;
  var crust_mass = 0;
  var u_range = 1e9/100000;
  var th_range = 1e9/100000;
  var k_range = 1000000 * 0.000117;
  var include = new Array();
  var sources = document.getElementsByClassName("selected_crust_layers");
  for (i = 0; i < sources.length; i++){
    if (sources[i].checked){
      include.push(sources[i].value);
    }
  }

  if (elm == "u238"){
    for (index in prem){
      if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
        u238 = parseFloat(document.querySelector('.mantle_u238_slider[data-layer="'+index+'"]').value)/1e9;
        mass += u238 * prem[index][2];
      }
    }
    if (include.indexOf("s") > -1){
      c_k = parseFloat(document.getElementById("c_ssed_u").value)/u_range;
      o_k = parseFloat(document.getElementById("o_ssed_u").value)/u_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("h") > -1){
      c_k = parseFloat(document.getElementById("c_hsed_u").value)/u_range;
      o_k = parseFloat(document.getElementById("o_ssed_u").value)/u_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("u") > -1){
      c_k = parseFloat(document.getElementById("c_up_u").value)/u_range;
      o_k = parseFloat(document.getElementById("o_up_u").value)/u_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("m") > -1){
      c_k = parseFloat(document.getElementById("c_mid_u").value)/u_range;
      o_k = parseFloat(document.getElementById("o_mid_u").value)/u_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("l") > -1){
      c_k = parseFloat(document.getElementById("c_low_u").value)/u_range;
      o_k = parseFloat(document.getElementById("o_low_u").value)/u_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
  }
  if (elm == "th232"){
    for (index in prem){
      if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
        k40 = parseFloat(document.querySelector('.mantle_th232_slider[data-layer="'+index+'"]').value)/1e9;
        mass += k40 * prem[index][2];
      }
    }
    if (include.indexOf("s") > -1){
      c_k = parseFloat(document.getElementById("c_ssed_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_ssed_th").value)/th_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("h") > -1){
      c_k = parseFloat(document.getElementById("c_hsed_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_ssed_th").value)/th_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("u") > -1){
      c_k = parseFloat(document.getElementById("c_up_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_up_th").value)/th_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("m") > -1){
      c_k = parseFloat(document.getElementById("c_mid_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_mid_th").value)/th_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("l") > -1){
      c_k = parseFloat(document.getElementById("c_low_th").value)/th_range;
      o_k = parseFloat(document.getElementById("o_low_th").value)/th_range;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
  }
  if (elm == "k40"){
    for (index in prem){
      if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
        k40 = parseFloat(document.querySelector('.mantle_k40_slider[data-layer="'+index+'"]').value)/1000000 * 0.000117;
        mass += k40 * prem[index][2];
      }
    }
    if (include.indexOf("s") > -1){
      c_k = parseFloat(document.getElementById("c_ssed_k").value)/k_range * 0.000117;
      o_k = parseFloat(document.getElementById("o_ssed_k").value)/k_range * 0.000117;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.s[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.s[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("h") > -1){
      c_k = parseFloat(document.getElementById("c_hsed_k").value)/k_range * 0.000117;
      o_k = parseFloat(document.getElementById("o_ssed_k").value)/k_range * 0.000117;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.h[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.h[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("u") > -1){
      c_k = parseFloat(document.getElementById("c_up_k").value)/k_range * 0.000117;
      o_k = parseFloat(document.getElementById("o_up_k").value)/k_range * 0.000117;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.u[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.u[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("m") > -1){
      c_k = parseFloat(document.getElementById("c_mid_k").value)/k_range * 0.000117;
      o_k = parseFloat(document.getElementById("o_mid_k").value)/k_range * 0.000117;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.m[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.m[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
    if (include.indexOf("l") > -1){
      c_k = parseFloat(document.getElementById("c_low_k").value)/k_range * 0.000117;
      o_k = parseFloat(document.getElementById("o_low_k").value)/k_range * 0.000117;
    for (i = 0; i < crust_data.area.length; i++){
      for (ii = 0; ii < crust_data.area[i].length; ii++){
        crust_mass += (c_k   * crust_data.mass.l[i][ii] * crust_data.crust_f[i][ii]);
        crust_mass += (o_k   * crust_data.mass.l[i][ii] * crust_data.ocean_f[i][ii]);
        }
      }
    }
  }
  return mass + crust_mass;
}

//calculates the heat from the mantle with given inputs
function mantle_heat(){
  heat = 0; // W/cm^2
  k_heat = 0;
  u_heat = 0;
  th_heat = 0;

  mass = 0;
  for (index in prem){
    if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
      k40 = parseFloat(document.querySelector('.mantle_k40_slider[data-layer="'+index+'"]').value)/1000000 * 0.000117;
      u238 = parseFloat(document.querySelector('.mantle_u238_slider[data-layer="'+index+'"]').value)/1e9;
      th232 = parseFloat(document.querySelector('.mantle_th232_slider[data-layer="'+index+'"]').value)/1e9;
      k_heat = k_heat + (k40 * prem[index][2] * k40_heat);
      u_heat = u_heat + (u238 * prem[index][2] * u238_heat);
      th_heat = th_heat + (th232 * prem[index][2] * th232_heat);
    }
  }
  heat = k_heat + u_heat + th_heat
  heat = heat / earth_surface_area * 1000 // mW/m^2
  return heat
}
function display_power(){
  h = mantle_heat();
  h = (h * earth_surface_area / 1000) * 1e-12;
  document.getElementById('total_power').textContent = h.toFixed(1);
}
function mantle_nu_flux(){
  var include = new Array();
  var sources = document.getElementsByClassName("sources_checkboxes");
  for (i = 0; i < sources.length; i++){
    if (sources[i].checked){
      include.push(sources[i].value);
    }
  }
  nu = 0; // /cm^2 µs
  k_lum = 0;
  u_lum = 0;
  th_lum = 0;
  for (index in prem){
    if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
      k40 = parseFloat($(".mantle_k40_slider[data-layer="+index+"]").val())/1000000 * 0.000117;
      u238 = parseFloat($(".mantle_u238_slider[data-layer="+index+"]").val())/1e9;
      th232 = parseFloat($(".mantle_th232_slider[data-layer="+index+"]").val())/1e9;
      k_lum = k_lum + (k40 *  prem[index][3] * k40_lum);
      u_lum = u_lum + (u238 * prem[index][3] * u238_lum);
      th_lum = th_lum + (th232 * prem[index][3] * th232_lum);
    }
  }
    output = 0;
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      output = output + u_lum;
    }
    if (include.indexOf("th") > -1){
      output = output + th_lum;
    }
    if (include.indexOf("k") > -1){
      output = output + k_lum;
    }
  return output;
}
function mantle_nu_tnu(){
  var include = new Array();
  var sources = document.getElementsByClassName("sources_checkboxes");
  for (i = 0; i < sources.length; i++){
    if (sources[i].checked){
      include.push(sources[i].value);
    }
  }
  nu = 0; // /cm^2 µs
  k_lum = 0;
  u_lum = 0;
  th_lum = 0;
  for (index in prem){
    if (parseFloat(prem[index][0]) > 3479 && (parseFloat(prem[index][1]) < 6346.7)){
      k40 = parseFloat($(".mantle_k40_slider[data-layer="+index+"]").val())/1000000 * 0.000117;
      u238 = parseFloat($(".mantle_u238_slider[data-layer="+index+"]").val())/1e9;
      th232 = parseFloat($(".mantle_th232_slider[data-layer="+index+"]").val())/1e9;
      k_lum = k_lum + (k40 *  prem[index][3] * k40_lum);
      u_lum = u_lum + (u238 * prem[index][3] * u238_lum);
      th_lum = th_lum + (th232 * prem[index][3] * th232_lum);
    }
  }
  u_tnu = (u_lum * 0.55) / 7.6e4; //the tnu calculation for u
  th_tnu = (th_lum * 0.55) / 2.5e5; //the tnu calculation for th

  document.getElementById('mantle_tnu_u').textContent = u_tnu.toFixed(1);
  document.getElementById('mantle_tnu_th').textContent = th_tnu.toFixed(1);

  nu = (k_lum + u_lum + th_lum) * 1e-6; // why is this here???
    output = 0;
    if (include.indexOf("u") > -1){ //this is the js stupid way of checking for elemnts
      output = output + u_tnu;
    }
    if (include.indexOf("th") > -1){
      output = output + th_tnu;
    }
    return output
}
var bse_elm_mass = {};

function bse_less_crust_masses(){
  var bse_mass = 4.0023623114788215e27 //grams
  k40 = parseFloat(document.getElementById("bse_k40_slider").value);
  document.getElementById("bse_k40_value").textContent = k40.toFixed(0) + "µg/g";
  k40 = k40/1000000 * 0.000117;
  u238 = parseFloat(document.getElementById("bse_u238_slider").value);
  document.getElementById("bse_u238_value").textContent = u238.toFixed(1) + "ng/g";
  u238 = u238/1e9;
  th232 = parseFloat(document.getElementById("bse_th232_slider").value);
  document.getElementById("bse_th232_value").textContent = th232.toFixed(1) + "ng/g";
  th232 = th232/1e9;
  bse_elm_mass.k40 = k40 * bse_mass;
  bse_elm_mass.u238 = u238 * bse_mass;
  bse_elm_mass.th232 = th232 * bse_mass;
  k_heat = bse_elm_mass.k40 * k40_heat;
  u_heat = bse_elm_mass.u238 *  u238_heat;
  th_heat =  bse_elm_mass.th232 * th232_heat;
  power = (k_heat + u_heat + th_heat) * 1e-12; //TW
  document.getElementById("bse_rad_power").textContent = power.toFixed(1);
  return power;
}

function connect_labels(){
  var labels = document.querySelectorAll("[data-label-for]");
  for (var i=labels.length; i--;){
    slider = document.getElementById(labels[i].getAttribute("data-label-for"));
    slider.addEventListener("update_label", function(){
      label = document.querySelector('[data-label-for="'+this.getAttribute("id")+'"]');
      precision = parseInt(label.getAttribute("data-label-precision"));
      suffix = label.getAttribute("data-label-suffix");
      label.textContent = parseFloat(this.value).toFixed(precision) + suffix;
    });
  }
}
