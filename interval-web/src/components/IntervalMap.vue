<template>
  <div class="map-container">
    <div id="map" class="openlayer-map"></div>
  </div>
</template>

<script setup>
import { onMounted, shallowRef, inject, watch, ref} from 'vue';
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
import { createZoomControl, layerSwitcher} from '@/utils/MapControllers';
import { baseMaps} from '@/utils/MapLayers';
import WKT from 'ol/format/WKT';
import {Attribution} from 'ol/control';




const router = useRouter();
const treeStore = useTreeStore();
const mapStore = useMapStore();
const bus = inject('$bus');

const{inclTreeIds} = storeToRefs(treeStore);


const styleCache = {};

const map = shallowRef(null); // A ref for the OpenLayers map


onMounted(async() => {
  await initializeStyleCache(styleCache);
  console.log('Map and style cache initialization complete.');
  mapStore.setStyleCahe(styleCache);

  // Create OpenLayers map
  map.value = new ol.Map({
    target: 'map',
    layers: [baseMaps],
    view: new ol.View({
      center: fromLonLat([-6.26031, 53.349805]), // Center at Dublin
      zoom: 11,
    }),
    controls: [
      new Attribution({
    }),
  ],
  });

  // Create and add a vector tile layer for electoral boundaries
  const electoralLayer = new VectorTileLayer({
    source: new VectorTileSource({
      format: new MVT(),
      url: 'http://localhost:3000/electoral/{z}/{x}/{y}', 
    }),
    style: electoralStyle,
    maxZoom: 16.5,
    title: 'Electoral Divisions'
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
    title: 'Trees',
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
          zoom: 18,
          duration: 200  // Smooth animation (500ms)
        });

        router.push({ name: 'ElectoralStatistics', params: { id: electoralId } });
      }
      if(treeId){
        // Navigate to the TreeInfo route
        router.push({ name: 'TreeInfo', params: { treeId: treeId } });
      }
    }
  });

  bus.$on('zoomInTree', (data)=> {
    zoomInGeomWKT(map.value, data.geomWKT);
    treeLayer.setStyle((feature) => selectedTreeStyle(feature, data.treeId, mapStore.styleCache));

  });

  mapStore.setMapInstance(map);
  mapStore.setMapInitializedTrue();
  console.log("map initialized completed:", mapStore.isInitialized);

});



function zoomInGeomWKT (map, geomWKT) {
  console.log("zoom in", geomWKT);
  const format = new WKT();
  const geometry = format.readGeometry(geomWKT, {
    dataProjection: 'EPSG:4326', // Adjust data is in a different projection
    featureProjection: map.getView().getProjection() // Map's current projection
  });

  // Get the point coordinates from the geometry
  const coordinates = geometry.getCoordinates();

  // Zoom to the point with smooth animation
  map.getView().animate({
    center: coordinates,
    zoom: 18,  // Set the desired zoom level
    duration: 1000 // Smooth animation (500ms)
  }); 
  console.log("finished zoom in")
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
  top: auto !important;
  /* width: 38px;
  height: 38px; */
  /* right: 10px; */
  bottom: 100px;
  /* text-align: left; */
}

</style>
