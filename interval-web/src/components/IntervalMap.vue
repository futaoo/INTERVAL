<template>
  <div class="map-container">
    <div id="map" class="openlayer-map"></div>
    <button @click.prevent="submitGeo()" class="geo-btn">Geo Submit</button>
  </div>
</template>

<script setup>
import { onMounted, shallowRef, inject, watch} from 'vue';
import { useRouter } from 'vue-router';
import 'ol/ol.css';
import * as ol from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorTileLayer from 'ol/layer/VectorTile';
import MVT from 'ol/format/MVT';
import TileLayer from 'ol/layer/Tile';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Stroke, Style, Text, Circle as CircleStyle } from 'ol/style';
import {asArray, asString} from 'ol/color';
import Overlay from 'ol/Overlay';
import { useTreeStore } from '@/stores/statisticsStore';
import {Select} from 'ol/interaction';
import { storeToRefs } from 'pinia';




const router = useRouter();
const speciesColors = inject('speciesColors'); // Inject global color map
const map = shallowRef(null); // A ref for the OpenLayers map
const treeStore = useTreeStore();

const{inclTreeIds} = storeToRefs(treeStore);


const styleCache = {};

// Function to generate styles dynamically and cache them
const getCachedStyle = (speciesId, actualSpread) => {
  // Fallback to default values if properties are missing
  const spread = actualSpread ? actualSpread / 100 : 5; // Default radius is 10 if `actual_spread` is not provided
  const color = speciesColors[speciesId] || '#00FF00'; // Default color is green if not found


  // Use speciesId and spread as keys for the cache
  const cacheKey = `${speciesId}-${spread}`;

  // Return the cached style if it exists, otherwise create and store it
  if (!styleCache[cacheKey]) {
    const rgbaColor = asArray(color);
    rgbaColor[3]=0.8; // Adjust color to add transparency (opacity)

    styleCache[cacheKey] = new Style({
      image: new CircleStyle({
        radius: spread, // Dynamic radius based on `actual_spread`
        fill: new Fill({ color: rgbaColor }),
        stroke: new Stroke({ color: rgbaColor, width: 1 }),
      }),
    });
  }

  return styleCache[cacheKey];
};



const electoralStyle = (feature) => {
  // Define base styles for the polygon
  const baseStyle = new Style({
    stroke: new Stroke({
      color: 'black',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(0, 100, 0, 0.6)',
    }),
  });

  // Add text style for labels using the 'english' property
  const labelText = feature.get('english');
  if (labelText) {
    // If the `english` property exists, add a text label
    baseStyle.setText(
      new Text({
        font: 'bold 12px Calibri,sans-serif',
        text: labelText,         // Set the label text
        fill: new Fill({
          color: '#000',         // Text color
        }),
        stroke: new Stroke({
          color: '#fff',         // Add a white outline for readability
          width: 3,
        }),
        overflow: true,          // Allow text to overflow if feature is small
        placement: 'point',      // Place the text at the centroid of the feature
      })
    );
  }

  return baseStyle;
}


onMounted(() => {

  // Create OpenLayers map
  map.value = new ol.Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }),
      }),
    ],
    view: new ol.View({
      center: fromLonLat([-6.26031, 53.349805]), // Center at Dublin
      zoom: 13,
    }),
    renderer:'webgl'
  });


  // Create and add a vector tile layer for electoral boundaries
  const electoralLayer = new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: 'http://localhost:3000/electoral/{z}/{x}/{y}', 
    }),
      style: electoralStyle,
    maxZoom: 14,
  });

  map.value.addLayer(electoralLayer);


  // Create and add a vector tile layer for trees
  const treeLayer = new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: 'http://localhost:3000/tree/{z}/{x}/{y}', 
    }),
    style: (feature) => {
      // Retrieve properties from the feature
      const speciesId = feature.get('species_id');
      const actualSpread = feature.get('actual_spread');

        // Call `getCachedStyle` to get the appropriate style, including exclusion check
      return getCachedStyle(speciesId, actualSpread);
    },
    minZoom: 15
  
  });


  map.value.addLayer(treeLayer);

  

  /// Watch for changes to excludedTreeIds and trigger a layer refresh
  watch(inclTreeIds, (newIds) => {
    // Refresh the style of the tree layer when `excludedTreeIds` changes
    treeLayer.setStyle((feature) => {
      const speciesId = feature.get('species_id');
      const actualSpread = feature.get('actual_spread');
      const treeId = feature.get('tree_id');

      if(newIds.includes(treeId)){
        // Call `getCachedStyle` to get the appropriate style, including exclusion check
        return getCachedStyle(speciesId, actualSpread);
      }

    });
  });

  // Mouse move event listener for changing cursor style
  map.value.on('pointermove', function (evt) {
    const pixel = map.value.getEventPixel(evt.originalEvent);
    const feature = map.value.forEachFeatureAtPixel(pixel, (feature) => feature);
    
    // Check if the feature exists and is from the electoralLayer
    if (feature) {
      // Change cursor style to pointer if over electoral feature
      map.value.getTargetElement().style.cursor = 'pointer';
    } else {
      // Reset cursor style if not over a feature
      map.value.getTargetElement().style.cursor = '';
    }
  });

  // Add a click event listener specifically for the electoral layer
  map.value.on('singleclick', function (evt) {
    const pixel = map.value.getEventPixel(evt.originalEvent);
    const feature = map.value.forEachFeatureAtPixel(pixel, (feature) => feature);
    
    if (feature) { // Check if a feature was clicked
      const properties = feature.getProperties(); // Get feature properties
      const electoralId = properties.ogc_fid; // Get the unique ID
      const treeId = properties.tree_id;

      if (electoralId) {
        // Navigate to the ElectoralStatistics route
        // If electoralId is present, zoom in to the clicked location at zoom level 16
        map.value.getView().animate({
          center: evt.coordinate,
          zoom: 16,
          duration: 500  // Smooth animation (500ms)
        });

        router.push({ name: 'ElectoralStatistics', params: { id: electoralId } });
      }
      if(treeId){
        // Navigate to the TreeInfo route
        router.push({ name: 'TreeInfo', params: { treeId: treeId } });
      }
    }
  });

  // Submit the drawn geometry layers (if using drawing libraries in OpenLayers)
  const submitGeo = () => {
    // Replace with your OpenLayers drawing feature handling logic
    console.log('Submit Geo');
  };
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.openlayer-map {
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
