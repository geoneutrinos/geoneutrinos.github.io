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
    </div>

    <div class="tab-pane" id="output">
    </div>


  </div>

</div>

<script>
// Enable the tool tips for all elements with them
$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
</script>

<script src="/static/js/build/reactors.js"></script>
