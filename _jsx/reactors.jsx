var React = require('react');
var ReactDOM = require('react-dom');

var Button = require('react-bootstrap/lib/Button');
var Tabs = require('react-bootstrap/lib/Tabs');
var Tab = require('react-bootstrap/lib/Tab');
var Panel = require('react-bootstrap/lib/Panel');



var Application = React.createClass({
  render: function(){
    return (
      <Tabs defaultActiveKey={1} animation={false} id="noanim-tab-example">
        <Tab eventKey={1} title="Detector">
          <Panel header="Panel heading without title">
              <Button>Hello Panel</Button>
            </Panel>
          </Tab>
        <Tab eventKey={2} title="Reactors">Tab 2 content</Tab>
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
