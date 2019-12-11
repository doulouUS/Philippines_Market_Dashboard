# Notes on using crossfilter.js and dc.js

## Ressources to learn
Self-contained application: [tutorial](http://adilmoujahid.com/posts/2015/01/interactive-data-visualization-d3-dc-python-mongodb/)

Clear intro: [intro](https://animateddata.co.uk/articles/crossfilter/)

## crossfilter.js

Creating dimensions is the main source of overhead, can generate up to 32.
Keep reference of these dimensions

## dc.js

Create a new graph
  * template of the graph (see existing examples + build your own)
  * crossfilter dataset
  * crossfilter dimension, built on top of the crossfilter dataset
  * crossfilter group, built on top of the crossfilter dimension



## Crossfilter core concepts

Dimension
	* from exisiting properties
	* derived from existing properties
	* can be filtered: filters remain active until they’re removed.
	* "columns of original data"

Group
	* "array of groups, where each has a key (the thing we are grouping by), and a value
	* value property is the count of each of the dimension's unique values

## General structure of code

	1. Data import
	2. Creation of data formats
	3. Change of data formats
	4. crossfilter object creation
	5. dimensions creations
		some subtleties
	6. group creation
		some subtleties
	7. charts creation
		d3 manipulations to get a perfect result


## Handling Geojson
  Visualize your geojson files here: [geojson.io](http://geojson.io/)

  How Generate Geojson:

### FIRST METHOD (Manual)
    1. Get the Open Street Map (OSM) ID of the region you're interested in
      * use the overpass API to automate queries: [link](https://wiki.openstreetmap.org/wiki/Overpass_API)
      * test your queries: [link](http://overpass-turbo.eu/)
    2. Input the ID here: [link](http://polygons.openstreetmap.fr/)

### SECOND METHOD (Program)

    1. Design your Overpass query
    2. Use `overpy` python package to execute and retrieve the JSON dataset
    3. Convert JSON to GeoJSON => painful

### THIRD METHOD

    1. Design overpass query
    2. Submit the query through command line to a .osm file  
    ```
    wget -O muenchen.osm "https://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145"
    ```
    3. Transform .osm to .geojson using osmtogeojson [github](https://github.com/tyrasd/osmtogeojson/)


### Missing regions

These regions are in our MCC data, but not referenced in the geojson file I retrieved online.

['Caloocan', 'Kalinga-Apayao', 'Las Pinas', 'Makati', 'Malabon', 'Mandaluyong', 'Marikina', 'Muntinlupa', 'Navotas', 'Paranaque', 'Pasay', 'Pasig', 'Pateros', 'Quezon Province', 'San Juan', 'Taguig', 'Valenzuela', 'Western Leyte']

### Remarks

* Only lower case details in geojson file.
* Necessary to set up the location of where you want your map to be centered (otherwise it doesn't display)
