Web Application
===============
Our web application is built using Flask_, a microframework written in Python_.
Flask_ is being utilized for URL routing and template rendering.
No other caluclations other than those required to route and render the templates are performed on the server.
The computations for rendering the user interface, output figures, and output text data are all handled by the user agent.
All the client side programs are written in JavaScript (ECMAScript 5.1)
Each of these components will be discussed in detail in this section.

Request Routing
---------------
When a user agent (usually a web browser) make an HTTP GET request to a path on a server, the server needs to determine the response.
Server software, such as Apache or Nginx, is configured with a set of rules to determine what, if anything, should be returned to the requesting agent.
Our server, Flask_, uses a routing table to link paths to Python_ methods to call.
The routing table contains a list of routes, such as ``/model``, and the method to call if that route is requested.
Query parameters and uri fragments are ignored when determining a matching route.

When called, method should return a suitable response, usually some text body and the approprate HTTP headers.
This can be a simple as returing a preset string, or as complicated as performing a set of complex calculations to generate the response.
Most of the methods we use simply compose the templates and return them.
Whatever they do, it is important for the response to be fast, usually less than one second.

Template Rendering
------------------
We are using a templating system to minimize code repetition and speed devlopment, specifically, we are using jinja2_.
A base template is defined (see: ``webnu/templates/base.html`` in the souce) which contains the basic elements which should appear on all pages.
This would include the html headers, the navigation bar which appears on every page, the JavaScript and style sheets which are used by all pages.
The base template also includes several placeholders where content from other templates can be placed.

Other templates inheret and extend the base template.
When, for example, the ``/reactors`` page is requested, the reactor page template is found and starts to be rendered.
The reactors template has a declaration that it extends the base template in it and contains only the content for the placeholders in the base template.
This content is then placed inside the placeholders and the entire result is returned to the user.


Rendering a Page
----------------
The events which occur when the reactors page is requested is as follows (in this order):

1. The page template is rendered and returned.
2. When the returned HTML is parsed, the browser will start to render the page.
3. When the links to style sheets are encountered, the rendering will block until those can be fetched.
4. References to external JavaScript files are loaded in the order they appear in the document.
5. The reactor data is loaded as part of these external files.
6. Since the main application JavaScript is inline and at the bottom of the document, it can start to execute as soon as it is encountered.
7. The spectrum plot is initialized (though empty) and the event listeners are attached to elements on the webpage.
8. The method which updates the spectrum plot is called once for the default display.

One the above has finished, the page is ready for user input and will wait for an event needing a response.

User Input Events
-----------------
The interaction between the browser rendered document and any JavaScript is usually by what are called Events.
Events are fired automatically by the web browser when the user performs certain actions.
The reactor page is listening for the following events:

* The mouse has moved while over the map.
* The mouse has clicked the map.
* The Detector latitude has changed.
* The Detector longitude has changed.
* The "follow cursor on map" checkbox has changed.
* The user made a Detector preset selection.
* The Reactor power has changed.
* The "use custom reactor" checkbox has changed.
* The Reactor latitude has changed.
* The reactor longitude has changed.
* The user has clicked the "Place Reactor" button.
* The "invert mass Hierarchy" checkbox has changed.

Each of these events can cause a state change in the application, they may also be in conflict with each other.
Lets discuss how each event is handled.

A Mouse Move Over the Map
`````````````````````````
An event listener for the  JavaScript ``mousemove`` is attached to the map image.
When the mouse moves while over the map, the attached function is called with the "Event" passed into it.
If the "follow cursor on map" checkbox is selected, the coordinates from the event are translated into lat and lon.
The lat and lon values are placed in the approprate box in the detector "Location" panel.
The "Location Presets" selection input is set to no selection.
Finally the "update spectrum" function is called.

If the "follow cursor on map" checkbox is not selected, the function returns immediatly without doing anything.

A Mouse Click on the Map
````````````````````````
The JavaScript ``click`` event is listened for on the map.
When clicked, usually the "Follow Cursor On Map" checkbox is toggled.
The exception is if the user has clicked the "Place Reactor" button, if this is the case, the next click will set the lat and lon of the user reactor.

A Text Input or Checkbox Changed
````````````````````````````````
When any of the text input boxes has a value change, the "update spectrum" routine is simply called.
These boxes include the reactor power box, the reactor lat and lon boxes, and the detector lat and lon boxes.
If the state of the "Invert Neutrino Mass Hierarchy" or "Use Custom Reactor" checkboxes have changed, the update specturm routine is also called.

A Preset Has Been Selected
``````````````````````````
When the user selects an option from the "Location Presets" selection input the lat and lon for that detector are placed in the text inputs.
The "Follow Cursor On Map" checkbox is set to off.
The update spectrum function is then called.


.. [Flask] http://flask.pocoo.org
.. [Python] https://www.python.org
.. [jinja2] http://jinja.pocoo.org

The Spectrum Update Method
--------------------------
The specturm update function is central to the web application function, almost every action the user may do causes it to be called.
It has several important tasks:

* Get the new user input values.
* Calcualte the distances to all the reactors from the detector.
* Calcualte the neutrino survival propability for each distance.
* Multiply the reactor output spectrum with the approprate set of survival probabilities.
* Sum all the reactor contributions.
* Draw the new spectrum plot.
* Set the detector and reactor icon locations on the map.
* Update the spectrum text output.

When the spectrum update function is called it performs the following actions.
First, the detecor and user reactor locations are set.
To do this, the latitude and longitude of the detecor and user reactor are taken directly from the text in put fields on the webpage.
Then the geogrpahic coordinates are converted to the image coordinates of the map, where the point (0, 0) is in the upper left corner.
The detecor and user reactor image positions are then set with the image coordinates.
If the user does not want the custom reactor to be used, the reactor image display attribute is set to "none".

Next the distance and neutrino spectrum contributions for each reactor are calculated.
For computational simplicity, we are storing all the reactor positions in a three dimentional Cartesian coordinate system.
The distance between each reactor and the user provided detector location is given by the Euclidean distance.
The neutrino spectrum functinon is called for each reactor, the returning spectrums are stored seperately temporarily.
The distance loop also records which reactor is the closest to the detector so its contribution may be plotted seperately on the output figure.

The spectrum update function then calculates all the ancilary output parameters: the distances to the user reactor and the closest reactor, and the TNU outputs.
It also update the text spectrum output box.

Finally, the line plot figure is updated.
Since we are using the d3.js data binding library, this is done sinply by instructing d3 to use the newly calculated values.
The y-axis domain is also updated.
The entire figure does not need to be redrawn, only what has changed.

The Survival Probability Method
-------------------------------
The survival probability method calculates the oscilated survival probability spectrum for an input distance.
Due to multiple calls to computationally expensive trigonometric functions, the computed spectrum for any given input distance is cached for future use.


Some outline ideas
------------------
TODOs and the document outline/writing topics/ideas.

* A walkthrough of the inputs to our implimentation
  
  * IAEA (Glenn)

* Special Optimizations (survival probability caching)
* The actual graphing (d3, svg)

* Preset locations (a table)
