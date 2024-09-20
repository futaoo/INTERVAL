<template>
    <InfoPage :active-page="activePage" />
    <TreeFilter />
    <div class="map-container">
      <div id="map" class="leaflet-map"></div>
    </div>
    <button @click.prevent="submitGeo()" class="geo-btn">
      Geo Submit
    </button>
  </template>
  
<script setup>
import { ref, onMounted, shallowRef, toRef} from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import 'leaflet-geosearch/dist/geosearch.css'; // Import the CSS for GeoSearch
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'; // Import GeoSearch and OSM provider
import 'esri-leaflet';
import InfoPage from './InfoPage.vue';
import TreeFilter from './TreeFilter.vue';



const map = shallowRef(null); // A ref for the Leaflet map

const activePage = ref({
  treePage: false,
  statisticPage: true
})


const markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconUrl: 'marker-icon.png',
    shadowUrl: 'marker-shadow.png'
  });

// Sample GeoJSON for 3 trees
const treeGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-6.2603, 53.3498] },
      "properties": { "id": "tree1", "speciesCommonName": "Sycamore", "trunkDiameter": 30 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-6.2615, 53.3489] },
      "properties": { "id": "tree2", "speciesCommonName": "Oak", "trunkDiameter": 40 }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-6.2628, 53.3478] },
      "properties": { "id": "tree3", "speciesCommonName": "Maple", "trunkDiameter": 50 }
    }
  ]
};

let treeLayer = null;

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

  // Add the GeoJSON layer for the tree markers
  treeLayer = L.geoJSON(treeGeoJSON, {
    pointToLayer: (feature, latlng) => {
      // Convert the point into a circle marker with styling
      return L.circleMarker(latlng, styleFeature(feature));
    },
    onEachFeature: (feature, layer) => {
      // Add popup to each feature
      layer.bindPopup(`<b>Tree ID:</b> ${feature.properties.id}<br/><b>Species:</b> ${feature.properties.speciesCommonName}<br/><b>Trunk Diameter:</b> ${feature.properties.trunkDiameter} cm`);

       // Add a click event listener to the layer
      layer.on('click', () => {
        showTreePage(activePage)
      });  
    } 
  });

  // Listen for the zoomend event to toggle visibility of the GeoJSON layer
  map.value.on('zoomend', function () {
    const currentZoom = map.value.getZoom();
    if (currentZoom >= 17) {
      if (!map.value.hasLayer(treeLayer)) {
        treeLayer.addTo(map.value);  // Add the layer if zoom level is 17 or higher
      }
    } else {
      if (map.value.hasLayer(treeLayer)) {
        map.value.removeLayer(treeLayer);  // Remove the layer if zoom level is less than 17
      }
    }
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

function showTreePage(activePage) {
  activePage.value.treePage = true;
  activePage.value.statisticPage = false;
}


// Function to style the GeoJSON points based on tree trunk diameter
function styleFeature(feature) {
  return {
    radius: feature.properties.trunkDiameter / 3, // Circle size based on trunk diameter
    fillColor: "#3388ff",
    color: "#3388ff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.5
  };
};
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
