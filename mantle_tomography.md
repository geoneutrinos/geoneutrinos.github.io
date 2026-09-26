---
layout: page
title: Mantle Tomography
permalink: /mantle-tomography/
---

*This section was contributed by Michael Leyton [mleyton@pasadena.edu]()*

Geoneutrino flux predictions depend on assumptions about how heat-producing elements
are distributed throughout the crust and mantle. Seismic tomography is one of the few direct
constraints we have on large-scale mantle structure. This page hosts an interactive
3D viewer built from two independent tomographic datasets, alongside an explanation of
what each one shows and how they compare.

<div class="panel panel-primary launch-panel">
  <div class="panel-heading">Interactive 3D Viewer</div>
  <div class="panel-body" markdown=1>

Rotate, zoom, and filter two global mantle models — plus a model-agreement
comparison — rendered as a 3D point cloud from the core-mantle boundary up
through the transition zone.

[Launch the interactive viewer &raquo;](/static/mantle_tomography/viewer.html){: .btn .btn-primary .btn-lg}

  </div>
</div>


#### What am I looking at?
The viewer plots seismic velocity anomalies at thousands of points inside the
mantle, colored by value, with present-day coastlines drawn as a thin overlay for
geographic reference. Two prominent features to look for are the
**Large Low-Velocity Provinces (LLVPs)** - two continent-sized
regions of anomalously slow shear velocity sitting on the core-mantle boundary
beneath Africa and the Pacific - and fast, sheet-like anomalies elsewhere that
are generally interpreted as subducted oceanic lithosphere (old slabs). The viewer
includes a "reveal LLVPs" preset that jumps straight to filter settings where these
structures stand out.

<div class="row model-row">
  <div class="col-sm-6">
    <div class="panel panel-info">
      <div class="panel-heading">Model A - S40RTS (&delta;V/V)</div>
      <div class="panel-body">
        <p>A whole-mantle shear-velocity model, expressed as percent deviation from a
        reference Earth model (&delta;Vs/Vs). Built from Rayleigh wave dispersion,
        teleseismic body-wave traveltimes, and normal-mode splitting functions.</p>
        <p>45 depth slices from 24-2891&nbsp;km (crust to core-mantle
        boundary), downsampled to a 2&deg;&times;2&deg; grid.</p>
      </div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="panel panel-info">
      <div class="panel-heading">Model B - SubMachine Vote Map</div>
      <div class="panel-body">
        <p>A tomographic <em>vote count</em> (0-18): the number of independently
        published tomography models that agree an anomaly exists at a given point,
        after each is thresholded to a binary fast/slow mask and stacked. A high vote
        count means broad cross-model consensus, not a larger anomaly.</p>
        <p>45 depth slices from 1111-2871&nbsp;km, downsampled to the same
        2&deg;&times;2&deg; grid as Model A.</p>
      </div>
    </div>
  </div>
</div>

#### Comparing the two models
&delta;V/V and vote count are different physical quantities, so subtracting them
directly would not mean anything. The viewer instead offers a
**normalized difference**: S40RTS is interpolated onto the vote map's
depth levels, both fields are independently z-scored (converted to standard
deviations from each model's own mean), and then subtracted
(<code>diff&nbsp;=&nbsp;z(S40RTS)&nbsp;&minus;&nbsp;z(vote&nbsp;map)</code>). The result
highlights where the two models disagree about how anomalous a region is, in
unit-free terms, rather than claiming a literal difference in physical units.

#### Using the viewer

* **Model** - switch between S40RTS, the vote map, and the
  normalized difference. Each remembers its own threshold, depth range, and polarity
  settings, so you can flip back and forth without losing your place.
* **Threshold** - hides points below a minimum anomaly strength
  (or vote count) so only the strongest signal remains visible.
* **Polarity** - isolate slow anomalies (LLVPs) or fast
  anomalies (slabs) for the two signed models.
* **Depth range** - restrict the point cloud to a shell of the
  mantle, e.g. just the lowermost few hundred kilometers above the core.
* Drag to rotate, scroll to zoom, and toggle the coastline overlay, translucent
  surface shell, and core-mantle boundary reference ring independently.

#### References
**Ritsema, J., Deuss, A., van Heijst, H.J., and Woodhouse, J.H. (2011)**,
*S40RTS: a degree-40 shear-velocity model for the mantle from new Rayleigh wave
dispersion, teleseismic traveltime and normal-mode splitting function
measurements*, Geophysical Journal International, 184(3), 1223-1236.

**Hosseini, K., Matthews, K.J., Sigloch, K., Shephard, G.E., Domeier, M., and
Tsekhmistrenko, M. (2018)**, *SubMachine: Web-Based Tools for Exploring
Seismic Tomography and Other Models of Earth's Deep Interior*, Geochemistry,
Geophysics, Geosystems, 19, 1464-1483.

**Natural Earth**, 1:110m Physical Vectors - Coastline, used for
the present-day continent overlay.
