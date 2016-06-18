var React = require('react');
var ReactDOM = require('react-dom');

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



var detectorPresets = [
	{
		"optgroup": "Asia",
    "children": [
      {"label":"Guemseong (950 mwe)", "value":"35.05,126.70"},
      {"label":"INO (3000 mwe)"},
      {"label":"Jiangmen (2100 mwe)"},
      {"label":"Jinping (6720 mwe)"},
      {"label":"Kamioka (2050 mwe)"}
    ]
	},
	{
		"optgroup": "Europe",
    "children": [
      {"label":"Baksan (4900 mwe)"},
      {"label":"Boulby (2805 mwe)"}
    ]
	}
];


//TODO Use actual react for this rather than manipulating the DOM
function use_nav_pos(){
  navigator.geolocation.getCurrentPosition(function(pos){
    document.getElementById("cursor_lat").value = pos.coords.latitude;
    document.getElementById("cursor_lon").value = pos.coords.longitude;
    document.getElementById("is_locked").checked = false;
    update_map();
})};

var LocationPresets = React.createClass({
  getInitialState:function(){
    return {selectValue:'none'};
    },
  handleChange:function(e){
    //TODO get this out of the view code
    var value = e.target.value;
    this.setState({selectValue:value});
    var point = value.split(',');
    console.log(point);
    var lat = point[0];
    var lon = point[1];
    document.getElementById("cursor_lat").value = lat;
    document.getElementById("cursor_lon").value = lon;
    document.getElementById("is_locked").checked = false;
    update_map();
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
  render: function(){
    return (
        <Panel header="Location">
        	<Form horizontal>
    				<FormGroup controlId="cursor_lat">
    				  <Col componentClass={ControlLabel} sm={2}>
                Latitude
    				  </Col>
    				  <Col sm={10}>
    				    <FormControl type="number" placeholder="" />
    				  </Col>
    				</FormGroup>

    				<FormGroup controlId="cursor_lon">
    				  <Col componentClass={ControlLabel} sm={2}>
                Longitude
    				  </Col>
    				  <Col sm={10}>
    				    <FormControl type="number" placeholder="" />
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
