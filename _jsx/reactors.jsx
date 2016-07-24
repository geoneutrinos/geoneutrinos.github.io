var React = require('react');
var ReactDOM = require('react-dom');

var L = require('leaflet');
L.Icon.Default.imagePath = '/static/vender/leaflet/images';

var d3 = require('d3');

var Col = require('react-bootstrap/lib/Col');

var Button = require('react-bootstrap/lib/Button');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Panel = require('react-bootstrap/lib/Panel');

var Form = require('react-bootstrap/lib/Form');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var Checkbox = require('react-bootstrap/lib/Checkbox');

var nu_spectrum = require("./spectrum.js").default;
var osc = require("./nuosc.js");
var react_data = require("./spherical_power.js").react_data;

var detectorPositionUpdate = new Event("detectorPosition");
var spectrumUpdate = new Event("spectrumUpdate");
var mouseFollow = new Event("mouseFollow");

// Map Display
var map = L.map('map_container').setView([0, 0], 1);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//
const EARTH_RADIUS = 6371; // km


// Global State Variables
var detectorPosition = {
  "lat": 41.75,
  "lon": -81.29
};

var followMouse = true;

var loadFactor = 'mean';

var customReactor = {
  'lat': 0,
  'lon': 0,
  'power': 0, //mw
  'uncertainty': 0, //kms
  'use': false
}

var geoneutrinos = {
  'mantleSignal': 8.2, //TNU
  'thuRatio': 2.7, //unitless
  'crustSignal': false
}

var spectrum = {
  'total': null,
  'iaea': null,
  'closest': null,
  'custom': null,
  'geo_u': null,
  'geo_th': null,
}

// end Global State
// Global State Updating Functions (mostly to do event bookkeeping)

function updateDetectorPosition(lon, lat){
    detectorPosition.lat = parseFloat(lat);
    detectorPosition.lon = parseFloat(lon);
    window.dispatchEvent(detectorPositionUpdate);
}

function updateFollowMouse(state){
  if (typeof(state) === "boolean"){
    followMouse = state;
  } else {
    followMouse = !followMouse;
  }
  window.dispatchEvent(mouseFollow);
}

function updateSpectrum(newSpectrum){
  spectrum = newSpectrum;
  window.dispatchEvent(spectrumUpdate);
}

var detectorPresets = [
	{
		"optgroup": "Asia",
    "children": [
        {value:"35.05,126.70",label:"Guemseong (950 mwe)"},
        {value:"9.95,77.28",  label:"INO (3000 mwe)"},
        {value:"22.12,112.51",label:"Jiangmen (2100 mwe)"},
        {value:"28.15,101.71",label:"Jinping (6720 mwe)"},
        {value:"36.42,137.30",label:"Kamioka (2050 mwe)"}
    ]
	},
	{
		"optgroup": "Europe",
    "children": [
      {value:"43.24,42.70",label:"Baksan (4900 mwe)"},
      {value:"54.55,-0.82",label:"Boulby (2805 mwe)"},
      {value:"42.77,-0.56",label:"Canfranc (2450 mwe)"},
      {value:"45.14,6.69" ,label:"Fréjus (4200 mwe)"},
      {value:"42.45,13.58",label:"LNGS (3100 mwe)"},
      {value:"63.66,26.04",label:"Pyhäsalmi (4000 mwe)"}
    ]
	},
	{
		"optgroup": "Mediterranean Sea",
    "children": [
      {value:"42.80,6.17",label:"Antares (2500 mwe)"},
      {value:"36.63,21.58",label:"Nestor (4000 mwe)"},
      {value:"37.551,15.384",label:"NEMO Test (2080 mwe)"}
    ]
  },
	{
		"optgroup": "North America",
    "children": [
      {value:"41.75,-81.29" ,label:"IMB (1570 mwe)"},
      {value:"37.38,-80.66" ,label:"KURF (1400 mwe)"},
      {value:"47.82,-92.24" ,label:"Soudan (1950 mwe)"},
      {value:"44.36,-103.76",label:"SURF (4300 mwe)"},
      {value:"32.37,-103.79",label:"WIPP (1600 mwe)"},
      {value:"46.47,-81.20" ,label:"SNOLAB (6010 mwe)"}
    ]
  },
	{
		"optgroup": "Oceania",
    "children": [
      {value:"-37.07,142.81", label:"SUPL (2700 mwe)"}
    ]
  },
	{
		"optgroup": "Pacific Ocean",
    "children": [
      {value:"22.75,-158.00", label:"ACO (4800 mwe)"},
      {value:"36.71,-122.19", label:"MARS (890 mwe)"}
    ]
  },
	{
		"optgroup": "South America",
    "children": [
      {value:"-30.25,-69.88", label:"ANDES (4200 mwe)"}
    ]
  }
];

function distance(p1, p2){
  var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  var dz = p1.z - p2.z;

  var dx2 = Math.pow(dx, 2);
  var dy2 = Math.pow(dy, 2);
  var dz2 = Math.pow(dz, 2);

  return Math.sqrt(dx2 + dy2 + dz2);
}

function squish_array(two_d_array){
  var output = new Array(two_d_array[0].length);
  for (var i=0; i < output.length; i++){
    output[i] = 0;
  }

  for (var i=0; i < two_d_array.length; i++){
    for (var ii=0; ii < output.length; ii++){
      output[ii] += two_d_array[i][ii];
    }
  }
  return output;
}

function tof11(elm){
  return (elm/1000).toFixed(11);
}

window.addEventListener("detectorPosition", function(e){
  // we want to find the smallest element, so start someplace big...
  var min_dist = 1e10;
  var min_spec;
  var lat = detectorPosition.lat * (Math.PI/180);
  var lon = detectorPosition.lon * (Math.PI/180);
  var react_spectrum = [];
  var p1 = {
    x : EARTH_RADIUS * Math.cos(lat) * Math.cos(lon),
    y : EARTH_RADIUS * Math.cos(lat) * Math.sin(lon),
    z : EARTH_RADIUS * Math.sin(lat)
  };

  var geo_nu_spectra = osc.geo_nu(detectorPosition.lat, detectorPosition.lon, geoneutrinos.mantleSignal, geoneutrinos.thuRatio, geoneutrinos.crustSignal);

  for (var i=0; i<react_data.length; i++){

    var p2 = {
      x : react_data[i][0],
      y : react_data[i][1],
      z : react_data[i][2]
    };

    var power = react_data[i][power_type];
    var dist = distance(p1, p2);
    var spec = osc.nuosc(dist, power, nu_spectrum, mass_invert);

    react_spectrum.push(spec);
    if ((dist < min_dist) && (d3.sum(spec) > 0)){
      min_dist = dist;
      min_spec = spec;
    }
  }
  var user_power = 0;
  if (customReactor.use){
    user_power = customReactor.power;
  }
  var reac_p = {
    x : earth_radius * Math.cos(customReactor.lat) * Math.cos(customReactor.lon),
    y : earth_radius * Math.cos(customReactor.lat) * Math.sin(customReactor.lon),
    z : earth_radius * Math.sin(customReactor.lat)
  };
  var user_dist = distance(p1, reac_p);
  var user_react_spectrum = osc.nuosc(user_dist, user_power, nu_spectrum, mass_invert);

  var user_spec = squish_array([user_react_spectrum]);
  var iaea = squish_array([squish_array(react_spectrum), user_spec]);
  updateSpectrum({
    closest: min_spec,
    geo_u: geo_nu_spectra.u_spec,
    geo_th: geo_nu_spectra.th_spec,
    iaea: iaea,
    custom: user_spec,
    total:  squish_array([squish_array(react_spectrum), user_spec, geo_nu_spectra.u_spec, geo_nu_spectra.th_spec])
  });
});

// On Map Detector Marker
var detectorMarker = L.marker(detectorPosition);
detectorMarker.addTo(map);
window.addEventListener("detectorPosition", function(){
  detectorMarker.setLatLng(detectorPosition);
});





function follow_mouse(e){
  if (!followMouse){
    return;
  }
  var xy = e.latlng;
  while (xy.lng > 180){
    xy.lng = xy.lng - 360;
  }
  while (xy.lng < -180){
    xy.lng = xy.lng + 360;
  }

  updateDetectorPosition(xy.lng.toFixed(2), xy.lat.toFixed(2));
}
map.on("mousemove", follow_mouse);
map.on("click", updateFollowMouse);
map.on("dragstart", function(e){map.off("mousemove", follow_mouse)});
map.on("dragend", function(e){map.on("mousemove", follow_mouse)});


function use_nav_pos(){
  navigator.geolocation.getCurrentPosition(function(pos){
    updateDetectorPosition(pos.coords.longitude, pos.coords.latitude)
})};

var Plot = React.createClass({
  resize: function(){
    // update width
    var width = parseInt(d3.select(this._div).style('width'), 10);
    width = width - this._margin.left - this._margin.right;

    // reset x range
    this._x.range([0, width]);

    // do the actual resize...
    d3.select(this._svg.node().parentNode)
      .style('width', (width + this._margin.left + this._margin.right) + 'px');

    this._svg.selectAll('.x.label')
      .attr('x', width);

    this._svg.select(".x.axis")
      .call(this._xAxis);

    this._svg.selectAll('rect.background')
      .attr('width', width);
    this._le.attr("transform", "translate(" + (width - 40) + ",0)");

  },
  updateLines: function(){
    function for_plot(arr){
      arr = arr.slice(100,899);
      arr.push(0);
      return arr;
    }

    this._x.domain([0, d3.max(spectrum.total, function(d, i) { return i; })- 200]);
    this._y.domain([0, d3.max(spectrum.total, function(d) { return d; })]);
    this._svg.select(".reac")
      .attr("d", this._valueline(for_plot(spectrum.custom)));
    this._svg.select(".c_reac")
      .attr("d", this._valueline(for_plot(spectrum.closest)));
    this._svg.select(".geo_u")
      .attr("d", this._valueline(spectrum.geo_u.slice(100,900)));
    this._svg.select(".geo_th")
      .attr("d", this._valueline(spectrum.geo_th.slice(100,900)));
    this._svg.select(".total")
      .attr("d", this._valueline(for_plot(spectrum.total)));
    this._svg.select(".iaea")
      .attr("d", this._valueline(for_plot(spectrum.iaea)));
    this._svg.select("#yaxis")
      .call(this._yAxis);
    this._svg.select(".x.axis")
      .call(this._xAxis);
  },
  componentWillUnmount: function(){
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("spectrumUpdate", this.updateLines);
  },
  componentDidMount: function(){
    window.addEventListener("resize", this.resize);
    window.addEventListener("spectrumUpdate", this.updateLines);
    // Set the dimensions of the graph
    this._margin = {top: 30, right: 20, bottom: 40, left: 50},
        this._width = parseInt(d3.select(this._div).style('width'), 10) - this._margin.left - this._margin.right,
        this._height = 270 - this._margin.top - this._margin.bottom;
    
    // Set the ranges
    this._x = d3.scaleLinear().range([0, this._width]);
    this._y = d3.scaleLinear().range([this._height, 0]);
    
    // Define the axes
    this._xAxis = d3.axisBottom(this._x)
      .ticks(8).tickFormat(function(d) {return ((d/100)+1).toFixed(0)});
    
    this._yAxis = d3.axisLeft(this._y)
      .ticks(5).tickFormat(function(d) {return (d/1000)});
    
      // Define the line
    var x = this._x;
    var y = this._y;
    this._valueline = d3.line()
      .x(function(d, i) { return x(i); })
      .y(function(d) { return y(d); });
    
      // Adds the svg canvas
      this._svg = d3.select(this._div)
      .append("svg")
      .attr("width", this._width + this._margin.left + this._margin.right)
      .attr("height", this._height + this._margin.top + this._margin.bottom)
      .append("g")
      .attr("transform", 
          "translate(" + this._margin.left + "," + this._margin.top + ")");
    
    this._svg.append("path")
    .attr("class", "total line");
    
    this._svg.append("path")
    .attr("class", "iaea line");
    
    this._svg.append("path")
    .attr("class", "c_reac line");
    
    this._svg.append("path")
    .attr("class", "geo_u line");
    this._svg.append("path")
    .attr("class", "geo_th line");
    
    this._svg.append("path")
    .attr("class", "reac line");
    
    
    // Add the X Axis
    this._svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this._height + ")")
    .call(this._xAxis);
    
    // Add the Y Axis
    this._svg.append("g")
    .attr("class", "y axis")
    .attr("id", "yaxis")
    .call(this._yAxis);
    
    // Add the axis labels
    this._svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .style("font-size", "15px")
    .attr("y", -50)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Rate (TNU/10 keV)");
    this._svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .style("font-size", "15px")
    .attr("x", this._width)
    .attr("y", this._height + 33)
    .text("Antineutrino Energy (MeV)");
    
    this._le = this._svg.append("g")
    .attr("transform", "translate(" + (this._width - 0) + ",0)");

    var le = this._le;
    
    
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "0.3em")
    .text("Total");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "1.5em")
    .text("Closest Reactor");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "2.5em")
    .text("Reactors");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "3.5em")
    .text("Geoneutrinos");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "4.5em")
    .text("Uranium");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("x", "-2.1em")
    .attr("y", "5.5em")
    .text("Thorium");
    le.append("text")
    .attr("text-anchor", "end")
    .attr("class", "reac")
    .attr("x", "-2.1em")
    .attr("y", "6.6em")
    .style("display", "none")
    .text("User Reactor");
    
    le.append("line")
    .attr("x1", "-1.9em")
    .attr("x2", "0")
    .attr("y1", "0")
    .attr("y2", "0")
    .attr("stroke-width", 2)
    .style("stroke", "#000");
    le.append("line")
    .attr("x1", "-1.9em")
    .attr("x2", "0")
    .attr("y1", "5.2em")
    .attr("y2", "5.2em")
    .attr("stroke-width", 2)
    .style("stroke", "red");
    le.append("line")
    .attr("x1", "-1.9em")
    .attr("x2", "0")
    .attr("y1", "4.2em")
    .attr("y2", "4.2em")
    .attr("stroke-width", 2)
    .style("stroke", "blue");
    
    le.append("rect")
    .attr("width", "1.9em")
    .attr("height", "1em")
    .attr("x", "-1.9em")
    .attr("y", "0.5em")
    .style("fill", "#999");
    le.append("rect")
    .attr("width", "1.9em")
    .attr("height", "1em")
    .attr("x", "-1.9em")
    .attr("y", "1.5em")
    .style("fill", "green");
    le.append("rect")
    .attr("width", "1.9em")
    .attr("height", "1em")
    .attr("x", "-1.9em")
    .attr("y", "2.5em")
    .style("fill", "yellow");
    
    le.append("line")
    .attr("x1", "-1.9em")
    .attr("x2", "0")
    .attr("y1", "6.3em")
    .attr("y2", "6.3em")
    .attr("stroke-width", 2)
    .style("stroke", "#000")
    .style("stroke-dasharray", "2,1")
    .attr("class", "reac")
    .style("display", "none");
  },
  render: function(){
    return (
        <div ref={(c) => this._div = c} className="Plot"></div>
        );
  }
});

var LocationPresets = React.createClass({
  getInitialState:function(){
    return {selectValue:'none'};
    },
  handleDetectorChange: function(e){
    // if the detector moves, the preset is not valid anymore
    this.setState({selectValue:'none'});
    window.removeEventListener("detectorPosition", this.handleDetectorChange);
  },
  handleChange:function(e){
    var value = e.target.value;
    var point = value.split(',');
    if (this.state.selectValue != 'none'){
      // this is tricky, we don't want to set things to None of the cause of the detector move was
      // because a different preset was selected, so remove the event handeler if that is the case
      window.removeEventListener("detectorPosition", this.handleDetectorChange);
    }

    this.setState({selectValue:value});
    updateDetectorPosition(point[1], point[0]);
    map.panTo([point[0], point[1]]);
    updateFollowMouse(false);
    window.addEventListener("detectorPosition", this.handleDetectorChange);
    },
  render: function(){
    return (
      <FormControl value={this.state.selectValue} onChange={this.handleChange} componentClass="select" placeholder="select">
      <option disabled value="none">Location Presets</option>
      {
        this.props.groups.map(function(group){
          return (
              <optgroup label={group.optgroup}>
              {group.children.map(function(child){
                  return (<option value={child.value}>{child.label}</option>);
                })};
              </optgroup>
              );
        })
      }
      </FormControl>
    );
  }
});

var LocationPanel = React.createClass({
  handlePositionChange: function(){
    this.setState(detectorPosition);
  },
  handleMouseBoxChange: function(){
    this.setState({"followMouse":followMouse});
  },
  changeLat: function(){
  },
  getInitialState: function(){
    var state = {};
    state.lat = detectorPosition.lat;
    state.lon = detectorPosition.lon;
    state.followMouse = followMouse;
    return state;
  },
  componentDidMount: function(){
    window.addEventListener("detectorPosition", this.handlePositionChange)
    window.addEventListener("mouseFollow", this.handleMouseBoxChange)
  },
  componentWillUnmount: function(){
    window.removeEventListener("detectorPosition", this.handlePositionChange)
    window.removeEventListener("mouseFollow", this.handleMouseBoxChange)
  },
  render: function(){
    return (
        <Panel header="Location">
        	<Form horizontal>
    				<FormGroup controlId="cursor_lat">
    				  <Col componentClass={ControlLabel} sm={2}>
                Latitude
    				  </Col>
    				  <Col sm={10}>
    				    <FormControl type="number" value={this.state.lat} />
    				  </Col>
    				</FormGroup>

    				<FormGroup controlId="cursor_lon">
    				  <Col componentClass={ControlLabel} sm={2}>
                Longitude
    				  </Col>
    				  <Col sm={10}>
    				    <FormControl type="number" value={this.state.lon} />
    				  </Col>
    				</FormGroup>

    				<FormGroup>
    				  <Col smOffset={2} sm={10}>
    				    <Checkbox onClick={updateFollowMouse} checked={this.state.followMouse}>Follow Cursor on Map</Checkbox>
    				  </Col>
    				</FormGroup>


		        <FormGroup controlId="detector_preset">
    				  <Col sm={12}>
                <LocationPresets groups={detectorPresets} />
              </Col>
            </FormGroup>

					  <Button onClick={use_nav_pos} bsStyle="primary">Use My Current Position</Button>

        	</Form>
        </Panel>
    );
  }
});

var OutputText = React.createClass({
  getInitialState: function(){
    var state = {
      textContent: "Empty"
    };
    return state;
  },
  dealWithSpectrumUpdate: function(){
    var text_out = Array(1001);
    text_out[0] = "total,iaea,close,user,geo_u,geo_th";
    for (var i=0; i< spectrum.iaea.length; i++){
      text_out[i+1] = tof11(spectrum.total[i]) + "," + tof11(spectrum.iaea[i])+","+ tof11(spectrum.closest[i]) + "," + tof11(spectrum.custom[i]) + "," + tof11(spectrum.geo_u[i]) + "," + tof11(spectrum.geo_th[i]);
    }
    this.setState({textContent: text_out.join("\n")});
  },
  componentDidMount: function(){
    window.addEventListener('spectrumUpdate', this.dealWithSpectrumUpdate);
  },
  componentWillUnmount: function(){
    window.removeEventListener('spectrumUpdate', this.dealWithSpectrumUpdate);
  },
  render: function(){
    var textareaStyle = {
      width: "100%"
    };
    return (
        <div>
        <p>
        The box below contains the antineutrino energy spectrum and its 
        components at the selected location. The data, which range from 
        0 to 10 MeV, are in units of TNU (#/10^32 free protons/year) per 
        10 keV. Comma-seperated columns of data correspond to: total, 
        sum of known IAEA reactor cores, closest core, user defined core 
        (0 if not using a custom reactor), and U and Th geoneutrino 
        background. There are a total of 1000 rows of data under each 
        column. The first 180 data rows have value 0 due to the energy 
        threshold of the electron antineutrino inverse beta decay 
        interaction on a free proton. For plotting or further analysis, 
        simply copy and paste the contents of this box into a text file 
        or spreadsheet program. Please cite this website if using these 
        data as: Barna, A.M. and Dye, S.T., "Web Application for Modeling 
        Global Antineutrinos," arXiv:1510.05633 (2015).
        </p>
        <textarea readonly={true} rows={8} style={textareaStyle} name={"description"} value={this.state.textContent} />
        </div>
        )
  }
});


var Application = React.createClass({
  render: function(){
    return (
      <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
        <Tab eventKey={1} title="Detector">
          <Plot />
          <LocationPanel />
        </Tab>
        <Tab eventKey={2} title="Reactors">Tab 2 Content</Tab>
        <Tab eventKey={3} title="GeoNu">Tab 3 content</Tab>
        <Tab eventKey={4} title="Output & Stats">
          <OutputText />
        </Tab>
      </Tabs>
    );
  }
});

ReactDOM.render(
  <Application />,
  document.getElementById('application')
);

