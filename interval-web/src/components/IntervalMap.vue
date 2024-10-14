<template>
  <div class="map-container">
    <div id="map" class="openlayer-map"></div>
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
import LayerTile from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorTileSource from 'ol/source/VectorTile';
import { Fill, Stroke, Style, Text, Circle as CircleStyle, RegularShape } from 'ol/style';
import {asArray} from 'ol/color';
import { useTreeStore } from '@/stores/statisticsStore';
import { storeToRefs } from 'pinia';
import { useMapStore } from '@/stores/mapStore';
import {Zoom} from 'ol/control';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';






const router = useRouter();
const speciesColors = inject('speciesColors'); // Inject global color map
const map = shallowRef(null); // A ref for the OpenLayers map
const treeStore = useTreeStore();
const mapStore = useMapStore()

const{inclTreeIds} = storeToRefs(treeStore);


const styleCache = {};

// Function to generate styles dynamically and cache them
const getCachedStyle = (speciesId, spreadCategory, isPublic) => {
  const spreadRadiusMap = {
    'Up to 300 cm': 3,
    '301 - 600 cm': 6,
    '601 - 900 cm': 9,
    '901 - 1200 cm': 12,
    'More than 1200 cm': 15,
    'Unknown': 2, // Default radius for unknown spread category
  };

  const radius = spreadRadiusMap[spreadCategory] || 2; // Fallback to 2 for unknown category
  const color = speciesColors[speciesId] || '#00FF00'; // Default color is green if not found

  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;
  if (!styleCache[cacheKey]) {
    const rgbaColor = asArray(color);
    rgbaColor[3] = 0.8; // Adjust color opacity

    const shapeStyle = isPublic
      ? new CircleStyle({
          radius: radius,
          fill: new Fill({ color: rgbaColor }),
          stroke: new Stroke({ color: rgbaColor, width: 1 }),
        })
      : new RegularShape({
          points: 3,
          radius: radius + 2, // Adjust size for private trees
          angle: 0,
          fill: new Fill({ color: rgbaColor }),
          stroke: new Stroke({ color: rgbaColor, width: 1 }),
        });

    styleCache[cacheKey] = new Style({
      image: shapeStyle,
    });
  }
  return styleCache[cacheKey];
};

// Fetch unique style combinations and initialize style cache
const initializeStyleCache = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/styles');
    const styleData = await response.json();

    styleData.forEach(({ species_id, spread_category, is_public }) => {
      // Prepopulate the style cache for all combinations
      getCachedStyle(species_id, spread_category, is_public);
    });

    console.log('Style cache initialized:', styleCache);
  } catch (error) {
    console.error('Error initializing style cache:', error);
  }
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


onMounted(async() => {

  await initializeStyleCache();
  console.log('Map and style cache initialization complete.');

  const osm = new LayerTile({
    title: 'Street',
    type: 'base',
    visible: true,
    source: new OSM()
  });

  const carto = new LayerTile({
    title: 'Light',
    type: 'base',
    visible: true,
    source: new XYZ({
      url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attributions: '&copy; <a href="https://www.openstreetmap.org/copyright"></a> contributors',
    }),
  });

  // Create a LayerGroup for base maps
  const baseMaps = new LayerGroup({
    title: 'Base maps',
    layers: [osm, carto]
  });

  // Create OpenLayers map
  map.value = new ol.Map({
    target: 'map',
    layers: [baseMaps],
    view: new ol.View({
      center: fromLonLat([-6.26031, 53.349805]), // Center at Dublin
      zoom: 11,
    }),
    renderer:'webgl',
    controls: []
  });

  // Initialize the LayerSwitcher control
  const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group',
    activationMode: 'click',
  });


  map.value.addControl(layerSwitcher);

  // Create a new Zoom control
  const zoomControl = new Zoom();

  // Dynamically update the Zoom control's position
  // Access the zoom control's element and modify its style using JavaScript
  map.value.addControl(zoomControl);
  const zoomElement = zoomControl.element;

  // Set position styles dynamically
  zoomElement.style.position = 'absolute';
  zoomElement.style.right = '10px';  // Position from the right
  zoomElement.style.bottom = '30px'; // Position from the bottom
  zoomElement.style.left = 'auto';   // Override left position
  zoomElement.style.top = 'auto';    // Override top position


  // Create and add a vector tile layer for electoral boundaries
  const electoralLayer = new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: 'http://localhost:3000/electoral/{z}/{x}/{y}', 
    }),
    style: electoralStyle,
    maxZoom: 16.5,
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
      const spreadCategory = feature.get('spread_category');
      const isPublic = feature.get('is_public');

      // Use the pre-loaded style cache
      const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;

        // Call `getCachedStyle` to get the appropriate style, including exclusion check
      return styleCache[cacheKey] || new Style({
        image: new CircleStyle({
          radius: 2, // Default radius if not found in cache
          fill: new Fill({ color: '#999' }),
          stroke: new Stroke({ color: '#000', width: 1 }),
        }),
      });
    },
    minZoom: 16.99,
  });


  map.value.addLayer(treeLayer);

  

  /// Watch for changes to excludedTreeIds and trigger a layer refresh
  watch(inclTreeIds, (newIds) => {
    // Refresh the style of the tree layer when `excludedTreeIds` changes
    treeLayer.setStyle((feature) => {
      const speciesId = feature.get('species_id');
      const spreadCategory = feature.get('spread_category');
      const treeId = feature.get('tree_id');
      const isPublic = feature.get('is_public');

      // Use the pre-loaded style cache
      const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`;

      if(newIds.includes(treeId)){
        // Call `getCachedStyle` to get the appropriate style, including exclusion check
        return styleCache[cacheKey] || new Style({
          image: new CircleStyle({
            radius: 2, // Default radius if not found in cache
            fill: new Fill({ color: '#999' }),
            stroke: new Stroke({ color: '#000', width: 1 }),
          }),
        });
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

  let selectedTreeId = null;  // Store the currently selected feature

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
          zoom: 17,
          duration: 500  // Smooth animation (500ms)
        });

        router.push({ name: 'ElectoralStatistics', params: { id: electoralId } });
      }
      if(treeId){

        // If a tree was clicked, store the treeId
        selectedTreeId = treeId;
        // Use the layer style function to handle style changes
        treeLayer.setStyle((feature) => {
          const featureTreeId = feature.get('tree_id');
          const speciesId = feature.get('species_id');
          const spreadCategory = feature.get('spread_category');
          const isPublic = feature.get('is_public')

          // Use the pre-loaded style cache
          const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`
          
          // Check if the current feature is the selected one
          const isSelected = selectedTreeId === featureTreeId;

          // Return a different style if the feature is selected
          return isSelected ? getHighlightedStyle(speciesId, spreadCategory, isPublic) : styleCache[cacheKey];
        });

        // Zoom to the selected tree with smooth animation
        map.value.getView().animate({
          center: evt.coordinate,
          zoom: 18,
          duration: 500  // Smooth animation (500ms)
        });
        // Navigate to the TreeInfo route
        router.push({ name: 'TreeInfo', params: { treeId: treeId } });
      }
    }
  });

  mapStore.setMapInstance(map);

});

// Function to return the highlighted style for the selected tree
function getHighlightedStyle(speciesId, spreadCategory, isPublic) {
  // Use the pre-loaded style cache
  const cacheKey = `${speciesId}-${spreadCategory}-${isPublic}`
  var baseStyle = styleCache[cacheKey];
  // console.log('basestyle', baseStyle);
  const undefinedStyle = new Style({
          image: new CircleStyle({
            radius: 2, // Default radius if not found in cache
            fill: new Fill({ color: '#999' }),
            stroke: new Stroke({ color: '#000', width: 1 }),
          }),
        });

  baseStyle = baseStyle? baseStyle : undefinedStyle;

  const fillColor = baseStyle.getImage().getFill().getColor();  // Keep the same fill color as the cached style

  return new Style({
    image: isPublic  
      ? new CircleStyle({
          radius: baseStyle.getImage().getRadius() + 2,  // Increase the size of the circle
          fill: new Fill({ color: fillColor }),  // Use the same fill color
          stroke: new Stroke({ color: '#654321', width: 5 })  // Add a red border for highlighting
        })
      : new RegularShape({
          points: 3,
          radius: baseStyle.getImage().getRadius() + 2,  // Increase the size of the triangle
          fill: new Fill({ color: fillColor }),
          stroke: new Stroke({ color: '#654321', width: 5 }),  // Add a red border for highlighting
          angle: 0,
        }),
  });
}
</script>

<style>
.map-container {
  width: 100%;
  height: 100%;
}

.openlayer-map {
  width: 100%;
  height: 100%;
}

.layer-switcher {
  position: absolute;
  top: auto;
  right: 10px;
  bottom: 100px;
  text-align: left;
}

</style>
