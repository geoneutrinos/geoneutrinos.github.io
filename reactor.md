---
layout: page
title: Reactors Old
permalink: /reactors_old/
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
<script>
// Enable the tool tips for all elements with them
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
</script>

<script src="/static/js/build/reactors.js"></script>
