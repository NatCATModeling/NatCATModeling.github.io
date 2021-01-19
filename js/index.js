var form = document.getElementById('config');

mapboxgl.accessToken = "pk.eyJ1IjoibmF0Y2F0bW9kZWxpbmciLCJhIjoiY2lmcHBibmI5NmQ2dHMza3FmN3VhdnNveCJ9.cq75mgWIzoAaesbmdR6T6Q";

    if (!mapboxgl.supported()) {
        alert("Your browser does not support Mapbox GL. Please try a different browser, e.g., Google Chrome or Firefox.");
    } else {

        // Set map bounda to North America only.
        var bounds = [
            [-180, 5], // Southwest coordinates
            [-20, 70] // Northeast coordinates
        ];

        var map = new mapboxgl.Map({
            attributionControl: true,
            container: "map", // container id
            //style: "mapbox://styles/natcatmodeling/cin69vk490028b5m4jbsij3ks", //stylesheet location
            style: form.styleSelect.value,
            center: [-122.419, 37.7749], // starting position
            zoom: 7, // starting zoom
            maxBounds: bounds // Sets bounds as max
        });

        // disable double click zoom -- reassigned to distance checking
        map['doubleClickZoom'].disable();

        //measure distance
        var distanceContainer = document.getElementById('distance');

        // GeoJSON object to hold our measurement features
        var geojson = {
            "type": "FeatureCollection",
            "features": []
        };

        // Used to draw a line between points
        var linestring = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": []
            }
        };
    }

  // Append data attribution
  var credit = document.createElement('a');
  credit.href = 'https://earthquake.usgs.gov';
  credit.className = 'fill-darken2 pad0x inline fr color-white';
  credit.target = '_target';
  credit.textContent = 'Developed by L.Chang. Sources of Data: USGS';
  map.getContainer().querySelector('.mapboxgl-ctrl-bottom-right').appendChild(credit);

function showLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    map.setZoom(12);
    map.setCenter([longitude, latitude]);

    // add marker
    map.getSource("markers").setData({
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            }
        }]
    });

    //change marker text
    //map.setLayoutProperty("point", "text-field", "You are here.");
}

function errorHandler(err) {
    if (err.code == 1) {
        alert("Error: Request to get location is denied! Please use secure protocol https://");
    } else if (err.code == 2) {
        alert("Error: Position is unavailable!");
    }
}


function getLocation() {

    if (navigator.geolocation) {
        // timeout at 60000 milliseconds (60 seconds)
        var options = {
            timeout: 60000
        };
        navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
    } else {
        alert("Sorry, the browser does not support geo-location!");
    }
}

// layer control function
function addLayer(name, id) {
    var link = document.createElement('a');
    link.href = '#';
    link.className = '';
    link.textContent = name;

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(id, 'visibility');

        if (visibility == 'visible') {
            map.setLayoutProperty(id, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(id, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}

// Add zoom and geo-location, and geocoder controls to the map
var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    countries: "us",
    bbox: [-128, 31.05,-108.83,49.64]
});

map.addControl(geocoder, 'top-left');

map.addControl(new mapboxgl.NavigationControl(), 'top-left');

var geoLocator = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});

map.addControl(geoLocator, "top-left");

// add full screen control
map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

var popup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true
});

// TO DO : Add a list of faults nearby, sort by distance

//define USGS data feed source
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

// past hr Events
var url_Hr = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";

var flag =0;

// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on("style.load", function() {

    // refreash geojson feed
    window.setInterval(function () {
        map.getSource('USGSLiveEvnt').setData(url);
        map.getSource('USGSLiveEvnt_Hr').setData(url_Hr);
    }, 900);

    //measure distance layer
    map.addSource('geojson', {
        "type": "geojson",
        "data": geojson
    });

    // Add distance measure styles to the map
    map.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'geojson',
        paint: {
            'circle-radius': 8,
            'circle-color': '#00FF00'
        },
        filter: ['in', '$type', 'Point']
    });
    map.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'geojson',
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-color': '#4F5AF5',
            'line-dasharray': [0, 2],
            'line-width': 5.5
        },
        filter: ['in', '$type', 'LineString']
    });

//line distance label
   map.addLayer({
			"id": "distance-label",
			"type": "symbol",
			"source": "geojson",
			"layout": {
			  "symbol-placement": "line-center",
			  "text-font": ["Open Sans Regular"],
			  "text-size": 18,
			  "text-offset": [1,1],
				'text-anchor': 'center',
				'text-justify': 'center',
				'icon-allow-overlap': true,
				'icon-ignore-placement': true
			},
			paint: {
  			  "text-color": '#4F5AF5'
            }
		  });
		  
		  
    //count to initate
    flag = flag + 1;

    // add the soil liquefaction layers
    map.addSource('liquefaction', {
        type: 'vector',
        url: 'mapbox://natcatmodeling.20u13bk5'
    });
    map.addLayer({
        'id': 'liqueVH',
        'type': 'fill',
        'source': 'liquefaction',
        'source-layer': "bayarea_liqsus_vh",
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#7a0177',
            'fill-opacity': 0.8
        },
        "filter": ["==", "LIQ", "VH"]
    });

    map.addLayer({
        'id': 'liqueH',
        'type': 'fill',
        'source': 'liquefaction',
        'source-layer': "bayarea_liqsus_vh",
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#c51b8a',
            'fill-opacity': 0.8
        },
        "filter": ["==", "LIQ", "H"]
    });

    map.addLayer({
        'id': 'liqueM',
        'type': 'fill',
        'source': 'liquefaction',
        'source-layer': "bayarea_liqsus_vh",
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#f768a1',
            'fill-opacity': 0.8
        },
        "filter": ["==", "LIQ", "M"]
    });

    map.addLayer({
        'id': 'liqueL',
        'type': 'fill',
        'source': 'liquefaction',
        'source-layer': "bayarea_liqsus_vh",
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#fbb4b9',
            'fill-opacity': 0.8
        },
        "filter": ["==", "LIQ", "L"]
    });

    map.addLayer({
        'id': 'liqueVL',
        'type': 'fill',
        'source': 'liquefaction',
        'source-layer': "bayarea_liqsus_vh",
        'layout': {
            'visibility': 'visible'
        },
        'paint': {
            'fill-color': '#feebe2',
            'fill-opacity': 0.8
        },
        "filter": ["==", "LIQ", "VL"]
    });

    //set initial visibility
    map.setLayoutProperty("liqueVL", 'visibility', 'none');
    map.setLayoutProperty("liqueL", 'visibility', 'none');
    map.setLayoutProperty("liqueM", 'visibility', 'none');
    map.setLayoutProperty("liqueH", 'visibility', 'none');
    map.setLayoutProperty("liqueVH", 'visibility', 'none');

    if (flag == 1){
        addLayer('Very High (VH) Liquefaction', 'liqueVH');
        addLayer('High (H) Liquefaction', 'liqueH');
        addLayer('Medium (M) Liquefaction', 'liqueM');
        addLayer('Low (L) Liquefaction', 'liqueL');
        addLayer('Very Low (VL) Liquefaction', 'liqueVL');
    }

    //add live EQ data
    map.addSource("USGSLiveEvnt", {
        type: 'geojson',
        data: url
    });
    map.addSource("USGSLiveEvnt_Hr", {
        type: 'geojson',
        data: url_Hr
    });

        //past 30 day events
        map.addLayer({
            "id": 'quakes',
            "interactive": true,
            "type": "circle",
            "source": "USGSLiveEvnt",
            "paint": {
                "circle-radius": [
                 'interpolate',
                 ['linear'],
                 ['number', ['get', 'mag']],
                 1, 3,
                 9, 30
                ],
                "circle-color": "#333",
                "circle-opacity": 0.4
            }
        });

        // past hr events
           map.addLayer({
            "id": 'quakesHr',
            "interactive": true,
            "type": "circle",
            "source": "USGSLiveEvnt_Hr",
            "paint": {
                "circle-radius": [
                    'interpolate',
                    ['linear'],
                    ['number', ['get', 'mag']],
                    1, 3,
                    9, 30
                    ],
                "circle-color": "#F276E4",
                "circle-opacity": 0.4
            }
        });
    
    // add custom source from mapbox [use unique MapID]
    map.addSource("mySource", {
        type: "vector",
        url: "mapbox://natcatmodeling.5nvu1zch" //uploaded Shapefile for USGS faults
    });

    map.addLayer({
        "id": "USGSfaults-1",
        "type": "line",
        "source": "mySource",
        "source-layer": "sectionsall",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#FF0000",
            "line-width": 3
        },
        "filter": ["==", "slipcode", 1]
    });

    map.addLayer({
        "id": "USGSfaults-2",
        "type": "line",
        "source": "mySource",
        "source-layer": "sectionsall",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#FF0000",
            "line-width": 2
        },
        "filter": ["==", "slipcode", 2]
    });

    map.addLayer({
        "id": "USGSfaults-3",
        "type": "line",
        "source": "mySource",
        "source-layer": "sectionsall",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#FF0000",
            "line-width": 1.5
        },
        "filter": ["==", "slipcode", 3]
    });

    map.addLayer({
        "id": "USGSfaults-4",
        "type": "line",
        "source": "mySource",
        "source-layer": "sectionsall",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "#FF0000",
            "line-width": 1
        },
        "filter": ["==", "slipcode", 4]
    });


    // add the filtered layer for highlighed segment
    map.addLayer({
        "id": "USGSfaults-hover",
        "type": "line",
        "source": "mySource",
        "source-layer": "sectionsall",
        "layout": {
            "line-join": "round",
            "line-cap": "round"
        },
        "paint": {
            "line-color": "blue",
            "line-width": 4
        },
        "filter": ["==", "name", ""]
    });

    // find current location
    getLocation();

    map.addSource("markers", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [],
            "properties": {
                "title": "Address",
                "marker-symbol": "star-15",
                "marker-size": "large",
                "marker-color": "#0000FF"
            }
        }
    });

    map.addLayer({
        "id": "point",
        "type": "symbol",
        "source": "markers",
        "layout": {
            "icon-image": "star-15", // see complete list at https://github.com/mapbox/mapbox-gl-styles/tree/master/sprites/basic-v9/_svg
            "icon-size": 1.6,
            "text-field": "Searched Location",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 18,
            "text-offset": [0, 1.2],
            "text-anchor": "top"
        },
        "paint": {
            "text-color": "blue"
        }
    });

    // Listen for the `result` event that is triggered when a user
    // makes a selection and add a marker that matches the result.
    geocoder.on("result", function(ev) {
        map.getSource("markers").setData(ev.result.geometry);
    });

});

function updateGeocoderProximity() {
    // proximity is designed for local scale, if the user is looking at the whole world,
    // it doesn't make sense to factor in the arbitrary centre of the map
    if (map.getZoom() > 9) {
        var center = map.getCenter().wrap(); // ensures the longitude falls within -180 to 180 as the Geocoding API doesn't accept values outside this range
        geocoder.setProximity({
            longitude: center.lng,
            latitude: center.lat
        });
    } else {
        geocoder.setProximity(null);
    }
}

map.on('moveend', updateGeocoderProximity); // and then update proximity each time the map moves

//measure distance
map.on('load', function() {

    updateGeocoderProximity();

    map.on('mouseenter',  'quakes', function (e) {
           // Change the cursor style as a UI indicator.
           map.getCanvas().style.cursor = 'pointer';
                  // change mouse pointer when close to Quake event circles
                var coordinates = e.features[0].geometry.coordinates.slice();
            
                // Ensure that if the map is zoomed out such that multiple
                // copies of the feature are visible, the popup appears
                // over the copy being pointed to.
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                      var EvntDate = new Date(e.features[0].properties.time);
                      var EvntUpdateDate = new Date(e.features[0].properties.updated);
                      popup.setLngLat(coordinates)
                          .setHTML("<span style='color:green;font-weight:bold;font-size: 9pt' > <a href = '" + e.features[0].properties.url + "' target = '_blank'>" +
                              e.features[0].properties.title 
                              + " on " +
                              EvntDate.toLocaleString() + 
                              " (link to USGS)" + "</a>" + 
                               "</br>" + 
                               "<b>Epicenter at </b>" +
                              e.features[0].geometry.coordinates[1].toFixed(5) + 
                              ", " + 
                              e.features[0].geometry.coordinates[0].toFixed(5) + "</span>" +
                                  " (Updated " + EvntUpdateDate.toLocaleString() + ") "
                                  )
                          .addTo(map);
              
    });
        map.on('mouseenter', 'quakesHr', function (e) {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';
            // change mouse pointer when close to Quake event circles
            var coordinates = e.features[0].geometry.coordinates.slice();

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            var EvntDate = new Date(e.features[0].properties.time);
            var EvntUpdateDate = new Date(e.features[0].properties.updated);
            popup.setLngLat(coordinates)
                .setHTML("<span style='color:green;font-weight:bold;font-size: 9pt' > <a href = '" + e.features[0].properties.url + "' target = '_blank'>" +
                    e.features[0].properties.title +
                    " on " +
                    EvntDate.toLocaleString() +
                    " (link to USGS)" + "</a>" +
                    "</br>" +
                    "<b>Epicenter at </b>" +
                    e.features[0].geometry.coordinates[1].toFixed(5) +
                    ", " +
                    e.features[0].geometry.coordinates[0].toFixed(5) + "</span>" +
                    " (Updated " + EvntUpdateDate.toLocaleString() + ") "
                )
                .addTo(map);

        });
    map.on('mouseleave', 'quakes', function () {
        map.getCanvas().style.cursor = '';
    });

    map.on('mouseleave', 'quakesHr', function () {
        map.getCanvas().style.cursor = '';
    });

    map.on("mousemove", function(e) {

        // show Lat/lon & Liqueafaction info in the Tex Box
        var liqueInfo = map.queryRenderedFeatures(e.point, {
            layers: ["liqueVH", "liqueH", "liqueM", "liqueL", "liqueVL"]
        });
    
        // show Liqu + Lat/lon in the Text Box
        if (liqueInfo.length) {
            var liq = "";
                switch ( liqueInfo[0].properties.LIQ) {
                    case "VH":
                        liq = "Very High";
                        break;
                    case "H":
                        liq = "High";
                        break;
                    case "M":
                        liq = "Medium";
                        break;
                    case "L":
                        liq = "Low";
                        break;
                    case "VL":
                        liq= "Very Low";
                        break;
                    default:
                        liq = "NA (no data)";
                        break;
                }
            document.getElementById("features").innerHTML = JSON.stringify("Liqueafaction Susceptibility:  " + liq + "<br> Long: " + Math.round(e.lngLat.lng * 10000) / 10000 + ", Lat:" + Math.round(e.lngLat.lat * 10000) / 10000);
        } else {
            // show only Lat/lon in the Text Box
            document.getElementById("features").innerHTML = JSON.stringify("Long:" + Math.round(e.lngLat.lng * 10000) / 10000 + ", Lat:" + Math.round(e.lngLat.lat * 10000) / 10000);
        }


        // fault line name popup
        features = map.queryRenderedFeatures(e.point, {
            radius: 5,
            layers: ["USGSfaults-1", "USGSfaults-2", "USGSfaults-3", "USGSfaults-4"]
        });
    
        if (features.length) {
            // Populate the popup and set its coordinates based on the feature found.
            popup.setLngLat(e.lngLat)
                //.setHTML("<strong>Highlighted Fault Line(s):</br><hr>" + features[0].properties.name, null, 2 + "</strong>")
                .setHTML("<span style='color:cyan;font-weight:bold;font-size: 12pt' >" + "<a href ='" + features[0].properties.CFM_URL.replace("geohazards.","earthquake.") + "' target='_blank'>" + features[0].properties.name + " </a>" + "</span>")
                .addTo(map);
    
            // hightlighted fault segment
            map.setFilter("USGSfaults-hover", ["==", "name", features[0].properties.name]);
        } else {
            map.setFilter("USGSfaults-hover", ["==", "name", ""]);
        }
    
        // UI indicator for clicking/hovering a point on the map to measure distance
        var features = map.queryRenderedFeatures(e.point, { layers: ['measure-points'] });
        //map.getCanvas().style.cursor = (features.length) ? 'pointer' : 'crosshair';  
   
    });
    
    //measure distance
    map.on('dblclick', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['measure-points'] });

        // Remove the linestring from the group
        // So we can redraw it based on the points collection
        if (geojson.features.length > 1) geojson.features.pop();

        // Clear the Distance container to populate it with a new value
        distanceContainer.innerHTML = '';

        // If a feature was clicked, remove it from the map
        if (features.length) {
            var id = features[0].properties.id;
            geojson.features = geojson.features.filter(function(point) {
                return point.properties.id !== id;
            });
        } else {
            if (geojson.features.length ==2) {
                geojson.features.pop();  // remove the previous point if there is already two points
            }           
            var point = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        e.lngLat.lng,
                        e.lngLat.lat
                    ]
                },
                "properties": {
                    "id": String(new Date().getTime())
                }
            };

            geojson.features.push(point);
        }

        if (geojson.features.length ==2) {

            linestring.geometry.coordinates = geojson.features.map(function(point) {
               //console.log(point.geometry.coordinates);
                return point.geometry.coordinates;
                
            });

            geojson.features.push(linestring);

            // Populate the distanceContainer with total distance
            var value = document.createElement('pre');
            value.textContent = 'Distance: ' + turf.lineDistance(linestring, 'miles').toFixed(1).toLocaleString('fullwide', { useGrouping: false }) + ' mi';
            distanceContainer.appendChild(value);
			
						// update line length on the line
		  map.setLayoutProperty('distance-label',"text-field", 'Distance: ' + turf.lineDistance(linestring, 'miles').toFixed(1).toLocaleString('fullwide', { useGrouping: false }) + ' mi'  );

		  
        }

        map.getSource('geojson').setData(geojson);


        
    });
    
});


// Base Map Selector
form.styleSelect.addEventListener('change', function() {
    'use strict';
    map.setStyle(form.styleSelect.value);
});


