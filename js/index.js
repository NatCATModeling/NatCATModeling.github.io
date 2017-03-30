var form = document.getElementById('config');

mapboxgl.accessToken = "pk.eyJ1IjoibmF0Y2F0bW9kZWxpbmciLCJhIjoiY2lmcHBibmI5NmQ2dHMza3FmN3VhdnNveCJ9.cq75mgWIzoAaesbmdR6T6Q";

    if (!mapboxgl.supported()) {
        alert("Your browser does not support Mapbox GL. Please try a different browser, e.g., Google Chrome or Firefox.");
    } else {

        // Set map bounda to North America only.
        var bounds = [
            [-175, 25], // Southwest coordinates
            [-20, 70] // Northeast coordinates
        ];

        var map = new mapboxgl.Map({
            attributionControl: true,
            container: "map", // container id
            //style: "mapbox://styles/natcatmodeling/cin69vk490028b5m4jbsij3ks", //stylesheet location
            style: form.styleSelect.value,
            center: [-122.419, 37.7749], // starting position
            zoom: 6, // starting zoom
            maxBounds: bounds // Sets bounds as max
        });
    }

  // Append data attribution
  var credit = document.createElement('a');
  credit.href = 'https://earthquake.usgs.gov';
  credit.className = 'fill-darken2 pad0x inline fr color-white';
  credit.target = '_target';
  credit.textContent = 'Data from USGS';
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
var geocoder = new mapboxgl.Geocoder({
    position: "top-left",
    country: "us",
    type: "postcode,address,region,place,locality,neighborhood,poi",
    placeholder: "Find an address, ZIP, or Place",
    container: "geocoder-container",
    autocomplete: "true",
    proximity: [-119.4179, 36.7783]
});

map.addControl(geocoder);


map.addControl(new mapboxgl.Navigation({
    position: "top-left"
}));

var geoLocator = new mapboxgl.Geolocate({
    position: "top-left"
});

map.addControl(geoLocator);

var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
});

//define USGS data feed source
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
var source = new mapboxgl.GeoJSONSource({
    data: url
});

// past hr Events
var url_Hr = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";
var source_Hr = new mapboxgl.GeoJSONSource({
    data: url_Hr
});

window.setInterval(function() {
    source.setData(url);
   source_Hr.setData(url_Hr);
}, 900);

var flag =0;

// After the map style has loaded on the page, add a source layer and default
// styling for a single point.
map.on("style.load", function() {
    flag = flag + 1;

    // add teh soil liquefaction layers
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
    map.addSource("USGSLiveEvnt", source);
    map.addSource("USGSLiveEvnt_Hr", source_Hr);
    var mags = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (var i = 0; i < mags.length; i++) {
        var mag = mags[i];

        //past 30 day events
        map.addLayer({
            "id": "quakes-" + mag,
            "interactive": true,
            "type": "circle",
            "source": "USGSLiveEvnt",
            "filter": ["all", [">=", "mag", mag],
                ["<", "mag", mag + 1]
            ],
            "paint": {
                "circle-radius": Math.pow(mag, 2.5),
                "circle-color": "#333",
                "circle-opacity": 0.3
            }
        });

        // past hr events
           map.addLayer({
            "id": "quakes_Hr" + mag,
            "interactive": true,
            "type": "circle",
            "source": "USGSLiveEvnt_Hr",
            "filter": ["all", [">=", "mag", mag],
                ["<", "mag", mag + 1]
            ],
            "paint": {
                "circle-radius": Math.pow(mag, 2.5),
                "circle-color": "#F276E4",
                "circle-opacity": 0.8
            }
        });
    }

    // add custom source from mapbox [use unique MapID]
    map.addSource("mySource", {
        type: "vector",
        url: "mapbox://natcatmodeling.5nvu1zch" //uploaded Shapefile for USGS faults
    });

    // Add a layer to the map"s style. Here, we reference the source we created above and make sure to point to the layer we want within that source"s

    // map.addLayer({
    //     "id": "USGSfaults",
    //     "type": "line",
    //     "source": "mySource",
    //     "source-layer": "sectionsall",
    //     "layout": {
    //         "line-join": "round",
    //         "line-cap": "round"
    //     },
    //     "paint": {
    //         "line-color": "red",
    //         "line-width": 2
    //     }
    // });
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
            "line-width": 3.5
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
                "marker-symbol": "marker-15",
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
            "icon-image": "marker-15", // see complete list at https://github.com/mapbox/mapbox-gl-styles/tree/master/sprites/basic-v8/_svg
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

map.on("click", function(e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ["quakes_Hr-0", "quakes_Hr-1", "quakes_Hr-2", "quakes_Hr-3", "quakes_Hr-4", "quakes_Hr-5", "quakes_Hr-6", "quakes_Hr-7", "quakes_Hr-8", "quakes_Hr-9", "quakes_Hr-10","quakes-0", "quakes-1", "quakes-2", "quakes-3", "quakes-4", "quakes-5", "quakes-6", "quakes-7", "quakes-8", "quakes-9", "quakes-10"]
    });

    if (!features.length) {
        return;
    }

    var feature = features[0];
    var EvntDate = new Date(feature.properties.time);

    var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true
        })
        .setLngLat(feature.geometry.coordinates)
        .setHTML("<span style='color:green;font-weight:bold;font-size: 12pt' > <a href = '" + feature.properties.url + "' target = '_blank'>" + feature.properties.title + " on " + EvntDate.toLocaleString() +" (click to learn more at USGS)" + "</a>" + "</br>" +  "<b>Epicenter Coordinates:  </b>" + "</br>" + feature.geometry.coordinates[1].toFixed(5) + ", " + feature.geometry.coordinates[0].toFixed(5)  + "</span>")
        .addTo(map);
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

    // change mouse pointer when close to Quake event circles
    var features = map.queryRenderedFeatures(e.point, {

        layers: ["quakes-0", "quakes-1", "quakes-2", "quakes-3", "quakes-4", "quakes-5", "quakes-6", "quakes-7", "quakes-8", "quakes-9", "quakes-10","quakes_Hr-0", "quakes_Hr-1", "quakes_Hr-2", "quakes_Hr-3", "quakes_Hr-4", "quakes_Hr-5", "quakes_Hr-6", "quakes_Hr-7", "quakes_Hr-8", "quakes_Hr-9", "quakes_Hr-10"]
    });
    map.getCanvas().style.cursor = (features.length) ? "pointer" : "";

    // fault line name popup
    features = map.queryRenderedFeatures(e.point, {
        radius: 5,
        layers: ["USGSfaults-1", "USGSfaults-2", "USGSfaults-3", "USGSfaults-4"]
    });

    if (features.length) {
        // Populate the popup and set its coordinates based on the feature found.
        popup.setLngLat(e.lngLat)
            //.setHTML("<strong>Highlighted Fault Line(s):</br><hr>" + features[0].properties.name, null, 2 + "</strong>")
            .setHTML("<span style='color:cyan;font-weight:bold;font-size: 12pt' >" + "<a href ='" + features[0].properties.CFM_URL + "' target='_blank'>" + features[0].properties.name + " </a>" + "</span>")
            .addTo(map);


        // hightlighted fault segment
        map.setFilter("USGSfaults-hover", ["==", "name", features[0].properties.name]);
    } else {
        map.setFilter("USGSfaults-hover", ["==", "name", ""]);
    }

});


// Base Map Selector
form.styleSelect.addEventListener('change', function() {
    'use strict';
    map.setStyle(form.styleSelect.value);
});
