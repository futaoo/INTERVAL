<template>
  <div class="map-container">
    <div id="map" class="leaflet-map"></div>
    <button @click.prevent="submitGeo()" class="geo-btn">
    Geo Submit
    </button>
  </div>

</template>
  
<script setup>
import { ref, onMounted, shallowRef, inject} from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import 'leaflet-geosearch/dist/geosearch.css'; // Import the CSS for GeoSearch
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'; // Import GeoSearch and OSM provider
import 'esri-leaflet';

const router = useRouter();

// Inject the globally provided 'speciesColors'
const speciesColors = inject('speciesColors');


const map = shallowRef(null); // A ref for the Leaflet map

const markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: 'marker-icon.png',
    shadowUrl: 'marker-shadow.png'
  });

// Import the GeoJSON electoral divisions file from the assets folder
// const geojsonUrl = new URL('@/assets/electoral_dublin.geojson', import.meta.url).href;

onMounted(() => {
  // Initialize the map with a specific center and zoom level
  map.value = L.map('map', {zoomControl: false, pmIgnore:false}).setView([53.349805, -6.26031], 13);

  // Add a tile layer (OpenStreetMap)
  L.tileLayer(
    // 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', 
    'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.value);

  // let geoJsonLayer;
  // // Load the GeoJSON data
  // fetch(geojsonUrl)
  //   .then(response => response.json())
  //   .then(geojsonData => {
  //     geoJsonLayer = L.geoJSON(geojsonData, {
  //       style: {
  //         color: '#ffffff',
  //         weight: 3,
  //         opacity: 1,
  //         fillColor:'#006400',
  //         fillOpacity: 0.5
  //       },
  //       onEachFeature: onEachFeature
  //     }).addTo(map.value);
  //     // Initially hide the layer if zoom level is higher than 14
  //     if (map.value.getZoom() > 14) {
  //       map.value.removeLayer(geoJsonLayer);
  //     }
  //   }).catch(error => console.error('Error loading the GeoJSON file:', error));
  
  // // Listen to zoom events to show/hide the GeoJSON layer
  // map.value.on('zoomend', () => {
  //   const currentZoom = map.value.getZoom();
  //   if (currentZoom > 14 && map.value.hasLayer(geoJsonLayer)) {
  //     // Remove the layer if zoom level is above 14
  //     map.value.removeLayer(geoJsonLayer);
  //   } else if (currentZoom <= 14 && !map.value.hasLayer(geoJsonLayer)) {
  //     // Add the layer back if zoom level is 14 or below
  //     map.value.addLayer(geoJsonLayer);
  //   }
  // });

  const markers = new Map();

  // Add vector tiles for trees
  var electoralTileLayer = L.vectorGrid
    .protobuf('http://localhost:3000/electoral/{z}/{x}/{y}', {
      // rendererFactory: L.svg.tile,
      vectorTileLayerStyles: {
        'electoral':  {
          color: 'black',
          weight: 3,
          opacity: 1,
          fillColor:'#006400',
          fillOpacity: 0.6,
          fill: true
        }
      },
      maxZoom: 14,
      interactive: true,
      getFeatureId: function(feature) { 
        if(!markers.has(feature.properties.ogc_fid)){
          const { english, ctrd_lat, ctrd_long } = feature.properties;
          // Create a custom DivIcon to display the "english" property
          const labelIcon = L.divIcon({
            className: 'text-label',
            html: `<div style="font-weight: bold; color: black; font-size: 12px; white-space: nowrap; pointer-events: none;">
                      ${english}
                    </div>`,
            iconSize: null // Size based on content
          });
            // Add a marker with the custom DivIcon at the centroid position (ctrd_lat, ctrd_long)
          const electoral_marker = L.marker([ctrd_lat, ctrd_long], { icon: labelIcon }).addTo(map.value); 
          markers.set(feature.properties.ogc_fid, electoral_marker)
        }

      }
  }).addTo(map.value);

  electoralTileLayer.on('click', async (e) => {
    // Get the click location (lat/lng)
    const clickedLatLng = e.latlng;
    const electoral_id = e.layer.properties.ogc_fid;
    // Pan and zoom to the clicked position at zoom level 15
    map.value.setView(clickedLatLng, 15);

    router.push({name:'ElectoralStatistics', params:{id: electoral_id}})
    
  })

  // add electoral label dynamically according to the zoom level
  map.value.on('zoomend', ()=>{
    if(map.value.getZoom()>14 && markers.size>0){
      markers.forEach((marker)=>{
        map.value.removeLayer(marker);
      })
    }else if(map.value.getZoom()==14){
      markers.forEach((marker)=>{
        marker.addTo(map.value);
      })
    }
  }) 



  


  // Add vector tiles for trees
  var treeTileLayer = L.vectorGrid
    .protobuf('http://localhost:3000/tree/{z}/{x}/{y}', {
      rendererFactory: L.svg.tile,
      vectorTileLayerStyles: {
        'tree': function (properties) {
          // Get the species color from the loaded color map or fallback to a default green
          var color = speciesColors[properties.species_id] || '#00FF00';

          var radius = properties.actual_spread ? properties.actual_spread/100 +10 : 10; // Adjust scaling factor based on data
        
          return {
            color: color,
            fill: true,
            fillOpacity: 0.7,
            radius: radius // Set the radius dynamically based on 'actual_spread'
          };
        }
      },
      minZoom: 15,
      interactive: true
    }).addTo(map.value);

  // Click event handler for vector grid tiles (tree layer)
  treeTileLayer.on('click', async function(e) {
    const treeId = e.layer.properties.tree_id;
    router.push({name:'TreeInfo', params:{treeId: treeId}})
    });
  

  // Initialize the OpenStreetMap provider for GeoSearch
  const provider = new OpenStreetMapProvider();
    
  // Initialize the GeoSearch control
  const searchControl = new GeoSearchControl({
    provider: provider,
    position: 'bottomright',
    marker: {
      icon: markerIcon,
      draggable: false,
    },
    style: 'button', // You can also use 'button' for a smaller control
    autoComplete: true,
    autoCompleteDelay: 250,
    retainZoomLevel: false,
    searchLabel: 'Enter an address or location',
    keepResult: true,
  });


  map.value.pm.addControls({  
    position: 'bottomright',  
    drawCircleMarker: false,
    rotateMode: false,
  }); 

  // Add zoom control
  new L.Control.Zoom({
      position: 'bottomright'
  }).addTo(map.value);

  // Add the search control to the map
  map.value.addControl(searchControl);

});


const submitGeo = () => {
    console.log(map.value.pm.getGeomanDrawLayers()[0].pm._shape);
}

// function onEachFeature(feature, layer) {

//   // Get the "ENGLISH" property
//   const label = feature.properties.ENGLISH || 'No Name'; // Use fallback if "ENGLISH" is empty

//   // Calculate the centroid of the polygon using its bounds
//   const bounds = layer.getBounds();
//   const centroid = bounds.getCenter(true);

//   // Create a DivIcon to show the text without any box or background
//   const textIcon = L.divIcon({
//     className: '',  // Custom class for styling
//     html: `<div style="font-weight: bold; color: white; font-size: 12px; white-space: nowrap; pointer-events: none;">
//                    ${label}
//                  </div>`,              // Display the label text
//     iconSize: null            // Let the icon size be determined by text content
//   });

//   // Add the text icon at the centroid of the polygon
//   L.marker(centroid, { icon: textIcon }).addTo(map.value);

//   layer.on('click', (e) => {
//     // Get the click location (lat/lng)
//     const clickedLatLng = e.latlng;

//     // Pan and zoom to the clicked position at zoom level 15
//     map.value.setView(clickedLatLng, 15);
//   });
// }

</script>

<style scoped>
/* Ensure the map container has height and width for Leaflet */
.map-container {
  width: 100%;
  height: 100%;
}

/* Leaflet-specific styling to make controls appear correctly */
.leaflet-map {
  width: 100%;
  height: 100%;
}

.geo-btn {
  position: absolute;
  top: 200px;
  right: 10px;
  z-index: 10000;
}


</style>
