var k40_heat = 3.33 * 1e-12; // W/g
var u238_heat = 98.5 * 1e-9; // W/g
var th232_heat = 26.3 * 1e-9; // W/g
var k40_lum = 76.4; // l / kg µs
var u238_lum = 12.6; // l / kg µs
var th232_lum = .0271; // l / kg µs

var earth_surface_area = 5.1e14 // m^2

var crust_data = new Array();
var prem  = new Array();
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
function updateThingsWithServer(){
  var output;
  if ($('#plot_display_selector').val() == 'thickness') {
    output = "&output=t";
  } else if ($('#plot_display_selector').val() == 'heat') {
    output = "&output=q";
  } else if ($('#plot_display_selector').val() == 'neutrino') {
    output = "&output=n";
  } else if ($('#plot_display_selector').val() == 'ratio') {
    output = "&output=n";
  }
  $("#scale_title_placeholder").text("Loading...");
  var values = [];
  //var plotsrc = "";
  $('input[name=crust_layers]:checked').each(function(){
    values.push($(this).val());
  });
  plotsrc = "/plot.json?layers=" + values.join("") + output + "&uthk=2.7,2.7,2.7,1.3,0.2,1.7,1.7,0.1,0.1,0.1,10.5,10.5,10.5,6.5,1.2,6.9,6.9,0.2,0.2,0.2,2.4,2.4,2.4,2.0,0.5,1.5,1.5,0.1,0.1,0.1";

  d3.json(plotsrc, function(data) {
    crust_data[0] = (data);
    updateThings();
  });
}

function updateThings(){
  var from_mantle = 0;
  var min = 0;
  var max = 1;
  var heatmap = crust_data[0];
    var dx = heatmap[0].length,
    dy = heatmap.length;

  if ($('#plot_display_selector').val() == 'thickness') {
    console.log("thickness");
    min = 0;
    max = 70;
  } else if ($('#plot_display_selector').val() == 'heat') {
    from_mantle = mantle_heat();
    min = 0;
    max = 140;
  } else if ($('#plot_display_selector').val() == 'neutrino') {
    from_mantle = mantle_nu_lum();
    console.log("neutrino");
  var min = d3.min(heatmap, function(subunit){
    return d3.min(subunit);
  });
  var max = d3.max(heatmap, function(subunit){
    return d3.max(subunit);
  });
  } else if ($('#plot_display_selector').val() == 'ratio') {
    console.log("ratio");
  }

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
        var c = d3.rgb(color(heatmap[y][x] + from_mantle));
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
  var label_start = min + (max - min) * 0.1;
  $("#sl_0_pc").text((label_start).toFixed(1));
  $("#sl_25_pc").text((label_start + step).toFixed(1));
  $("#sl_50_pc").text((label_start + (step * 2)).toFixed(1));
  $("#sl_75_pc").text((label_start + (step * 3)).toFixed(1));
  $("#sl_100_pc").text((label_start + (step * 4)).toFixed(1));

  var display_value = $("#plot_display_selector").val();
  if (display_value == "thickness"){
    $("#scale_title_placeholder").text("Crust Thickness (km)");
  } else if (display_value == "heat"){
    $("#scale_title_placeholder").text("Heat Flux (mW/m^2)");
  } else if (display_value == "neutrino"){
    $("#scale_title_placeholder").text("Geoneutrino Flux (Quanta/cm^2)");
  } else if (display_value == "ratio"){
    $("#scale_title_placeholder").text("Mantle/Total Neutrino Flux Ratio");
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
function mantle_concentric_control_factory(layers){
  console.log(layers);
  for (layer in layers){
    console.log(layer);
  }
}

$(document).ready(function() {
  // just doing this first cause whatever
  load_prem();


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
  $("#mantle_uniform_k40_slider").on("input change", function(){
    $("#mantle_uniform_k40_value").text(this.value + "µg/g");
  });
  $("#mantle_uniform_th232_slider").on("input change", function(){
    $("#mantle_uniform_th232_value").text(parseFloat(this.value).toFixed(1) + "ng/g");
  });
  $("#mantle_uniform_u238_slider").on("input change", function(){
    $("#mantle_uniform_u238_value").text(parseFloat(this.value).toFixed(1) + "ng/g");
  });


  //Set initial Values
  $("#mantle_uniform_k40_slider").val(95).change();
  $("#mantle_uniform_th232_slider").val(11).change();
  $("#mantle_uniform_u238_slider").val(5.5).change();

  //Draw Everything and Run the App :)
  $(".causes_update").on("input change", function(){
    updateThings();
  });
  $(".causes_server_update").on("input change", function(){
    updateThingsWithServer();
  });
  var width = $(".plot_container").width();
  $(".plot_container").height(width/2);
  $(".colorbar").height(25);
  setup_display();
  updateThingsWithServer();
  draw_geo_lines();
});

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
  var earth_radius = 6.372; //megameters

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
    prem.push(Array([data[d][0], data[d][1], mass, geo_factor]));
    }
  }
  });
}

//calculates the heat from the mantle with given inputs
function mantle_heat(){
  heat = 0; // W/cm^2
  k40 = parseFloat($("#mantle_uniform_k40_slider").val())/1000000;
  u238 = parseFloat($("#mantle_uniform_u238_slider").val())/1e9;
  th232 = parseFloat($("#mantle_uniform_th232_slider").val())/1e9;
  for (index in prem){
    if (parseFloat(prem[index][0][0]) > 3479 && (parseFloat(prem[index][0][1]) < 6346.7)){
      heat = heat + (k40 * prem[index][0][2] * k40_heat);
      heat = heat + (u238 * prem[index][0][2] * u238_heat);
      heat = heat + (th232 * prem[index][0][2] * th232_heat);
    }
    //if (parseFloat(prem[0][index][0]) > 3479){
    //  console.log(prem[0][index]);
    //}
  }
  heat = heat / earth_surface_area * 1000 // mW/m^2
  return heat
}
function mantle_nu_lum(){
  nu = 0; // W/cm^2
  k40 = parseFloat($("#mantle_uniform_k40_slider").val())/1000000;
  u238 = parseFloat($("#mantle_uniform_u238_slider").val())/1e9;
  th232 = parseFloat($("#mantle_uniform_th232_slider").val())/1e9;
  for (index in prem){
    if (parseFloat(prem[index][0][0]) > 3479 && (parseFloat(prem[index][0][1]) < 6346.7)){
      nu = nu + (k40 * prem[index][0][2]  * prem[index][0][3] * k40_lum);
      nu = nu + (u238 * prem[index][0][2] * prem[index][0][3] * u238_lum);
      nu = nu + (th232 * prem[index][0][2]* prem[index][0][3] * th232_lum);
    }
    //if (parseFloat(prem[0][index][0]) > 3479){
    //  console.log(prem[0][index]);
    //}
  }
  //nu = nu / earth_surface_area * 1000 // mW/m^2
  console.log(nu * 0.0001)
  return nu
}
