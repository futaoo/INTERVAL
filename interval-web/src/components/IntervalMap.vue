<template>
    <div class="map-container">
      <div id="map" class="leaflet-map"></div>
    </div>
  </template>
  
<script setup language="ts">
import { ref, onMounted, shallowRef } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import 'leaflet-geosearch/dist/geosearch.css'; // Import the CSS for GeoSearch
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch'; // Import GeoSearch and OSM provider


const map = shallowRef(null); // A ref for the Leaflet map

onMounted(() => {
  // Initialize the map with a specific center and zoom level
  map.value = L.map('map', {zoomControl: false, pmIgnore:false}).setView([53.349805, -6.26031], 13);

  // Add a tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);

  // Initialize the OpenStreetMap provider for GeoSearch
  const provider = new OpenStreetMapProvider();

  const markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    // specify the path here
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
  });
    
  // Initialize the GeoSearch control
  const searchControl = new GeoSearchControl({
    provider: provider,
    position: 'topright',
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
  // Add the search control to the map
  map.value.addControl(searchControl);

  map.value.pm.addControls({  
    position: 'bottomright',  
    drawCircleMarker: false,
    rotateMode: false,
  }); 

  // Add zoom control
  new L.Control.Zoom({
      position: 'bottomright'
  }).addTo(map.value);

});
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
</style>
