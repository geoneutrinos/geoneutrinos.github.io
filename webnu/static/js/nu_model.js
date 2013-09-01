function updateThings(){
  var values = [];
  var plotsrc = "";
  $('input[name=layer]:checked').each(function(){
    values.push($(this).val());
  });
  //plotsrc = "/plot.json?layers=" + values.join("") + "&output=t";
  plotsrc = "/plot.json?layers=shuml&output=t";

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

  d3.json(plotsrc, function(heatmap) {
    var dx = heatmap[0].length,
    dy = heatmap.length;

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
    .domain([95, 115, 135, 155, 175, 195])
    .range(["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"]);

  d3.select(".plot_container").append("canvas")
    .attr("width", dx)
    .attr("height", dy)
    .style("width", width + "px")
    .style("height", height + "px")
    .call(drawImage);

  var svg = d3.select(".plot_container").append("svg")
    .attr("viewBox", "0 0 960 480")
    .attr("preserveAspectRatio", "xMinYMin")
    .attr("width", "100%")


  d3.json("/js/plates.json", function(collection) {
    feature = svg.selectAll()
    .data(collection.features)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("class", "plates")
  });

  // Compute the pixel colors; scaled by CSS.
  function drawImage(canvas) {
    var context = canvas.node().getContext("2d"),
        image = context.createImageData(dx, dy);

    for (var y = 0, p = -1; y < dy; ++y) {
      for (var x = 0; x < dx; ++x) {
        var c = d3.rgb(color(heatmap[y][x]));
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
  });

}
$(document).ready(function() {

  updateThings();

  // do stuff
  $('input').click(updateThings);
  updateThings;
});
$(window).resize(function() {
  var width = $(".plot_container").width();
  $("canvas").width(width);
  $("canvas").height(width/2);
});
