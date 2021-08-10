// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h4>" + feature.properties.place +
      "</h4><hr><p><h5>" + new Date(feature.properties.time) + "</h5></p><hr><p><h5> Magnitude: "
       + feature.properties.mag+ "     " + "Depth: " + feature.geometry.coordinates[2]+"</h5></p>");
  }
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  function getColor(depth) {
    switch(true) {
      case depth > 100:
        return "red";
      case depth > 50:
        return "orangered";
      case depth > 25:
        return "orange";
      case depth > 10:
        return "gold";
      case depth > 5:
        return "yellow";
      default:
        return "lightgreen";
    } 
  }

  function createCircleMarker(feature, latlng) {
    let options = {
      radius: (feature.properties.mag) * 3,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "black",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }
    return L.circleMarker( latlng, options );
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: createCircleMarker,
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define graymap layers
  var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    //id: "mapbox/streets-v11",
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Gray Map": graymap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the Graymap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [graymap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  function selectColor(dep) {
    switch(true) {
      case dep > 100:
        return "red";
      case dep > 50:
        return "orangered";
      case dep > 25:
        return "orange";
      case dep > 10:
        return "gold";
      case dep > 5:
        return "yellow";
      default:
        return "lightgreen";
    } 
  }

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
    var dep = [-5,5,10,25,50,100];
    var labels = [];

    // Add min & max
    var legendInfo = "<h1>Earthquake Depth</h1>" ;

    div.innerHTML = legendInfo;

    for (var i =0; i < dep.length; i++) {
      div.innerHTML += 
      '<i style="background:' + selectColor(dep[i] + 1) + '"></i> ' +
          dep[i] + (dep[i + 1] ? '&ndash;' + dep[i + 1] + '<br>' : '+');

        }
      return div;
  };

  // Adding legend to the map
  legend.addTo(myMap);


}
