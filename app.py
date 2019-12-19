#!/usr/bin/env python3

from flask import Flask
from flask import render_template
import os


app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index_grid.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
