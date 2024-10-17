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
import VectorTileSource from 'ol/source/VectorTile';
import { useTreeStore } from '@/stores/statisticsStore';
import { storeToRefs } from 'pinia';
import { useMapStore } from '@/stores/mapStore';
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { electoralStyle, initializeStyleCache, treeStyle, selectedTreeStyle, filteredTreeStyle} from '@/utils/MapLayerStyles';
import { createZoomControl, layerSwitcher } from '@/utils/MapControllers';
import { baseMaps} from '@/utils/MapLayers';



const router = useRouter();
const map = shallowRef(null); // A ref for the OpenLayers map
const treeStore = useTreeStore();
const mapStore = useMapStore()
const{inclTreeIds} = storeToRefs(treeStore);

const styleCache = {};


onMounted(async() => {

  await initializeStyleCache(styleCache);
  console.log('Map and style cache initialization complete.');

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
      return treeStyle(feature, styleCache);
    },
    minZoom: 16.99,
    title: 'tree-layer'
  });


  map.value.addLayer(treeLayer);


  //add map controllers 
  map.value.addControl(layerSwitcher);
  map.value.addControl(createZoomControl());

  

  /// Watch for changes to excludedTreeIds and trigger a layer refresh
  watch(inclTreeIds, (newIds) => {
    // Refresh the style of the tree layer when `excludedTreeIds` changes
    treeLayer.setStyle((feature) => {
      return filteredTreeStyle(feature, newIds, styleCache)
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
          return selectedTreeStyle(feature, selectedTreeId, styleCache);
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
