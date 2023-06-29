document.addEventListener("DOMContentLoaded", function() {
    // Creating the map object centered in alska
    let map = L.map("map", {
      center: [61.2176, -149.8997],
      zoom: 7.5
    });
  
    // Adding the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // Connects to geojson API using D3
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
            radius: magnitude * 4,
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
          var div = L.DomUtil.create('div', 'legend-container');
          div.innerHTML = '<h4>Depth Legend</h4>'; 
          var depths = [0, 10, 30, 70];
          var labels = [];

          // Loop through the depth intervals and generate labels with colors
          for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
              '<i class="legend-marker" style="background:' + getColor(depths[i] + 1) + '"></i> ' +
              depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
          }
  
          return div;
        };
  
        legend.addTo(map);
      })


// Infomatic Chart
      // Set up the dimensions of the chart
    var margin = { top: 20, right: 20, bottom: 40, left: 40 };
    var width = 300 - margin.left - margin.right;
    var height = 200 - margin.top - margin.bottom;
  
    // Create the SVG container
    var svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Fetch the earthquake data
    d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
      .then(function(data) {
        try {
          if (!data || !data.features) {
            throw new Error('Invalid GeoJSON data');
          }
          var earthquakes = data.features;

          function getColor(depth) {
            return depth > 70 ? '#800026' :
              depth > 30 ? '#BD0026' :
              depth > 10 ? '#E31A1C' :
              '#FFEDA0';
          }
          // Extract the relevant data from the features and group by color and depth
          var groupedData = d3.group(data.features, function(d) {
            return getColor(d.geometry.coordinates[2]);
          });
  
          // Create an array of objects with color and depth information
          var groupedEntries = Array.from(groupedData, function([color, entries]) {
            return {
              color: color,
              depth: entries[0].geometry.coordinates[2],
              count: entries.length
            };
          });
          
          // Set the scales for x and y axes
          var xScale = d3.scaleLinear()
            .domain(d3.extent(groupedEntries, function(d) { return d.depth; }))
            .range([0, width]);
  
          var yScale = d3.scaleLinear()
            .domain([0, d3.max(groupedEntries, function(d) { return d.count; })])
            .range([height, 0]);
  
          // Add rectangles to represent the grouped data
          svg.selectAll("rect")
            .data(groupedEntries)
            .enter()
            .append("rect")
            .attr("x", function(d) { return xScale(d.depth); })
            .attr("y", function(d) { return yScale(d.count); })
            .attr("width", 20)
            .attr("height", function(d) { return height - yScale(d.count); })
            .style("fill", function(d) { return d.color; });
  
          // Add x-axis
          var xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
          
            // Remove tick lines for x-axis where there is no data
          xAxis.selectAll(".tick line")
            .filter(function(d) { return d === 0; })
            .remove();

          // Add y-axis
          var yAxis = svg.append("g")
            .call(d3.axisLeft(yScale));

          // Remove tick lines for y-axis where there is no data
          yAxis.selectAll(".tick line")
            .filter(function(d) { return d === 0; })
            .remove();
        
          // Add x-axis label
          svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .text("Depth");
  
          // Add y-axis label
          svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .text("Count");
        } catch (error) {
          console.log('Error processing geojson data:', error);
        }
      })

// end     

      .catch(function(error) {
        console.log('Error loading geojson data:', error);
      });
  
  });
