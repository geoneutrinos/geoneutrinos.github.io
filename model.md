---
layout: page
title: Model
permalink: /model/
---

<link rel="stylesheet" type="text/css" href="/static/css/nu_model.css">

<div class="row">
  <div class="col-sm-8 ">
    <div class="row">
      <div class="col-12 plot_container" id="plot_container">
      </div>
    </div>
    <div class="row">
      <div class="col-12 colorbar">
      </div>
    </div>
    <div class="row">
      <div class="col-12 scale_labels">
        <span id="sl_0_pc"></span>
        <span id="sl_25_pc"></span>
        <span id="sl_50_pc"></span>
        <span id="sl_75_pc"></span>
        <span id="sl_100_pc"></span>
      </div>
    </div>
    <div class="row">
      <div class="col-12 scale_title">
        <span id="scale_title_placeholder">Loading...</span>
        <hr />
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6 displays">
        <div class="panel panel-success">
          <!-- Default panel contents -->
          <div class="panel-heading">Output Parameters</div>

          <!-- Table -->
          <table class="table">
            <tr>
              <td>Mantle Radiogenic Power:</td><td><span id="total_power"></span> TW</td>
            </tr>
            <tr>
              <td>Crust Radiogenic Power:</td><td><span id="total_crust_power"></span> TW</td>
            </tr>
            <tr>
              <td>Mantle Neutrino Signal from Uranium:</td><td><span id="mantle_tnu_u"></span> TNU</td>
            </tr>
            <tr>
              <td>Mantle Neutrino Signal from Thorium:</td><td><span id="mantle_tnu_th"></span> TNU</td>
            </tr>
          </table>
        </div>

      </div>
      <div class="col-sm-6 displays">
        <div class="panel panel-info">
          <!-- Default panel contents -->
          <div class="panel-heading">Constrained Model</div>

          <!-- Table -->
          <table class="table">
            <tr id="u_status_row">
              <td>Uranium:</td><td><span id="u_constraint_status"></span></td>
            </tr>
            <tr id="th_status_row">
              <td>Thorium:</td><td><span id="th_constraint_status"></span></td>
            </tr>
            <tr id="k_status_row">
              <td>Potassium:</td><td><span id="k_constraint_status"></span></td>
            </tr>
          </table>
        </div>

      </div>
    </div>
  </div>
  <div class="col-sm-4">
    <ul class="nav nav-tabs">
      <li class="active"><a href="#basic" data-toggle="tab">Basic</a></li>
      <li><a href="#mantle" data-toggle="tab">Mantle</a></li>
      <li><a href="#crust" data-toggle="tab">Crust</a></li>
    </ul>
    <div class="tab-content">
      <div class="tab-pane active" id="basic">
        {% include model/_basic_config.html %}
      </div>
      <div class="tab-pane" id="mantle">
        {% include model/_mantle_configs.html %}
      </div>
      <div class="tab-pane" id="crust">
        {% include model/_crust_configs.html %}
      </div>
    </div>
  </div>
</div>
<script src="/static/js/heat_flow.js"></script>
<script src="/static/js/d3.v3.min.js"></script>
<script src="/static/js/d3.geo.projection.v0.min.js" charset="utf-8"></script>
<script src="/static/js/topojson.v1.min.js"></script>
<script src="/static/js/nu_model.js"></script>
