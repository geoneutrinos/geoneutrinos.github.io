from flask import Flask
from flask import render_template
app = Flask(__name__)

@app.route("/proposal")
def proposal():
    return render_template('base.jinja2')

@app.route("/about")
def about():
    return render_template('base.jinja2')

@app.route("/model")
def model():
    return render_template('model.jinja2')

@app.route("/")
def index():
    return render_template('home.jinja2')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6543)

