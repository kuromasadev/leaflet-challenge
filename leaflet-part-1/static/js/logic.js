document.addEventListener("DOMContentLoaded", function() {
    // Creating the map object
    let map = L.map("map", {
      center: [61.2176, -149.8997],
      zoom: 5
    });
  
    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // TileLayer loads without error
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Connects to geojson API using D3 without error
    d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
      .then(function(data) {
        // Code for processing the earthquake data
        var earthquakes = data.features;
        
        function getColor(depth) {
            return depth > 70 ? '#800026' :
              depth > 30 ? '#BD0026' :
              depth > 10 ? '#E31A1C' :
              '#FFEDA0';
        }
        // Define the size and color of markers based on earthquake properties
        function getMarkerOptions(magnitude, depth) {
          return {
            radius: magnitude * 4, // Adjust the size of the marker based on the magnitude
            fillColor: getColor(depth),
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };
        }
  
        // Loop through the earthquakes data and create markers on the map
        earthquakes.forEach(function(earthquake) {
          var coordinates = earthquake.geometry.coordinates;
          var magnitude = earthquake.properties.mag;
          var depth = coordinates[2];

          var markerOptions = getMarkerOptions(magnitude, depth);
  
          // Create a marker with a popup
          var marker = L.circleMarker([coordinates[1], coordinates[0]], markerOptions)
            .bindPopup(`<b>Magnitude:</b> ${magnitude}<br/><b>Depth:</b> ${depth} km`)
            .addTo(map);
        });
  
        // Create a legend
        var legend = L.control({ position: 'topright' });
        legend.onAdd = function(map) {
          var div = L.DomUtil.create('div', 'info legend');
          div.innerHTML = '<h4>Depth Legend</h4>'; 
          div.style.backgroundColor = 'white'; 
          var depths = [0, 10, 30, 70];
          var labels = [];
  
          // Loop through the depth intervals and generate labels with colors
          for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
              '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
              depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
          }
  
          return div;
        };
  
        legend.addTo(map);
      })
      .catch(function(error) {
        console.log('Error loading geojson data:', error);
      });
  
    function getColor(depth) {
      return depth > 70 ? '#800026' :
        depth > 30 ? '#BD0026' :
        depth > 10 ? '#E31A1C' :
        '#FFEDA0';
    }
  });
  