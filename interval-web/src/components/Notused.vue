<!-- <template>
	<div class="map-container">
		<l-map class="leaflet-container"
			:zoom="zoom"
			:center="center"
			@update:zoom="zoomUpdated"
			@update:center="centerUpdated"
			@update:bounds="boundsUpdated"
		>
			<l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>

			<l-control>
				<div id="search-control"></div>
			</l-control>

		</l-map>
	</div>
</template>
  
<script setup>
import { ref } from 'vue';
import { LMap, LTileLayer, LControl } from '@vue-leaflet/vue-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

  
// Data variables
const url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution = '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors';
const zoom = ref(13);
const center = ref([53.349805, -6.26031]);  //dublin coordinates
const bounds = ref(null);

// Methods to update reactive data
const zoomUpdated = (newZoom) => {
zoom.value = newZoom;
};

const centerUpdated = (newCenter) => {
center.value = newCenter;
};

const boundsUpdated = (newBounds) => {
bounds.value = newBounds;
};


// Create an OpenStreetMap provider
const provider = new OpenStreetMapProvider();

// Initialize the GeoSearch control
const searchControl = new GeoSearchControl({
	provider: provider,
	style: 'bar', // Can also be 'button'
	autoComplete: true,
	autoCompleteDelay: 250,
	searchLabel: 'Enter an address or location',
	keepResult: true
});

// searchControl.onAdd('search-control');


</script>
  
  
  
  <style scoped>
  /* Ensure the map container has height and width for Leaflet */
  .map-container {
    width: 100%;
    height: 100%;
  }
  
  /* Leaflet-specific styling to make controls appear correctly */
  .leaflet-container {
    width: 100%;
    height: 100%;
  }
  </style>
   -->