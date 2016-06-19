var React = require('react');
var ReactDOM = require('react-dom');

var L = require('leaflet');
L.Icon.Default.imagePath = '/static/vender/leaflet/images';

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

var detectorPositionUpdate = new Event("detectorPosition");
var spectrumUpdate = new Event("spectrumUpdate");

// Map Display
var map = L.map('map_container').setView([0, 0], 1);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



// Global State Variables
var detectorPosition = {
  "lat": 0,
  "lon": 0
};
var detectorMarker = L.marker(detectorPosition);
detectorMarker.addTo(map);
function updateDetectorPosition(lon, lat){
    detectorPosition.lat = parseFloat(lat);
    detectorPosition.lon = parseFloat(lon);
    detectorMarker.setLatLng(detectorPosition);
    window.dispatchEvent(detectorPositionUpdate);
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


function follow_mouse(e){
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
map.on("dragstart", function(e){map.off("mousemove", follow_mouse)});
map.on("dragend", function(e){map.on("mousemove", follow_mouse)});


//TODO Use actual react for this rather than manipulating the DOM
function use_nav_pos(){
  navigator.geolocation.getCurrentPosition(function(pos){
    updateDetectorPosition(pos.coords.longitude, pos.coords.latitude)
})};

var LocationPresets = React.createClass({
  getInitialState:function(){
    return {selectValue:'none'};
    },
  handleChange:function(e){
    var value = e.target.value;
    var point = value.split(',');

    this.setState({selectValue:value});
    updateDetectorPosition(point[1], point[0]);
    map.panTo([point[0], point[1]]);
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
  getInitialState: function(){
    return detectorPosition;
  },
  componentDidMount: function(){
    window.addEventListener("detectorPosition", this.handlePositionChange)
  },
  componentWillUnmount: function(){
    window.removeEventListener("detectorPosition", this.handlePositionChange)
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
    				    <Checkbox id="is_locked" checked>Follow Cursor on Map</Checkbox>
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


var Application = React.createClass({
  render: function(){
    return (
      <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
        <Tab eventKey={1} title="Detector">
          <LocationPanel />
        </Tab>
        <Tab eventKey={2} title="Reactors">Tab 2 Content</Tab>
        <Tab eventKey={3} title="GeoNu">Tab 3 content</Tab>
        <Tab eventKey={4} title="Output & Stats">Tab 4 content</Tab>
      </Tabs>
    );
  }
});

ReactDOM.render(
  <Application />,
  document.getElementById('application')
);
