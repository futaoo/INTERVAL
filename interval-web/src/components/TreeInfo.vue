<template>
  <!-- Tree Info Section -->
  <div v-if="!isCollapsed && tree " class="info-content">

    <div class="info-section tree-info-section">
      <h1>{{ tree.species.speciesCommonName }}</h1>
      <div class="table-details">
        <h2 class="species-name">{{ tree.species.speciesScientificName }}</h2>
        <img src="@/assets/species/testspecies.webp" alt="test species" class="species-img" />
        <table>
          <tbody>
            <tr>
              <th>Closest Street Address</th>
              <td>{{ tree.closestAddress }}</td>
            </tr>
            <tr>
              <th>Height (cm)</th>
              <td>{{ tree.height }}</td>
            </tr>
            <tr>
              <th>Trunk Diameter (cm)</th>
              <td>{{ tree.trunkDiameter }}</td>
            </tr>
            <tr>
              <th>Canopy Spread (cm)</th>
              <td>{{ tree.canopySpread }}</td>
            </tr>
            <tr>
              <th>Condition</th>
              <td>{{ tree.condition }}</td>
            </tr>
          </tbody>
        </table>
        <img src="../assets/streetview.png" alt="api not working" class="image">
      </div>
    </div> 

    <!-- Ecological Benefits Section -->
    <div class="info-section ecological-benefits-section">
      <h2>Ecological Benefits</h2>
      <div class="table-details">
        <table>
          <tbody>
            <!-- Sort the ecological benefits array by benefit name before rendering -->
            <tr v-for="(benefit, index) in tree.ecologicalBenefits" :key="index">
              <th>{{ benefit.name }}</th>
              <td>{{ benefit.value }} {{ benefit.unit }} (worth of {{ benefit.monetary }}$)</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Total Monetary Value: {{ totalMonetaryValue }}$</strong></p>
      </div>
    </div>

    <!-- Record of Activities/Issues Section -->
    <div v-if="tree.inspections.length > 0" class="info-section record-section">
      <h2>Record of Activities/Issues</h2>
      <div class="table-details">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Operations</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in tree.inspections" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.description }}</td>
              <td>
                <button @click="editRecord(record)" class="edit-link">Edit</button>
                /
                <button @click="deleteRecord(record)" class="edit-link">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div> 

     <!-- Submit Record Button -->
    <div class="info-section submit-record-section">
      <button class="submit-btn" @click="goToNewRecord">Submit Record</button>
    </div>

  </div>
</template>

<script setup>
import { useMapStore } from '@/stores/mapStore';
import { useTreeInfoStore } from '@/stores/statisticsStore';
import { useTreeRecordStore } from '@/stores/treeRecordStore';
import { selectedTreeStyle } from '@/utils/MapLayerStyles';
import WKT from 'ol/format/WKT';
import { storeToRefs } from 'pinia';
import { onMounted, watch, watchEffect} from 'vue';
import { useRoute, useRouter } from 'vue-router';




const route = useRoute(); // Get the current route
const router = useRouter();

const treeInfoStore = useTreeInfoStore();
const treeRecordStore = useTreeRecordStore();
const mapStore = useMapStore()

const { tree } = storeToRefs(treeInfoStore)
const { totalMonetaryValue } = storeToRefs(treeInfoStore)




const props = defineProps({
  isCollapsed: Boolean,
})

//Function to load the record page of the tree
const goToNewRecord = () => {
  router.push({ name: 'NewTreeRecord', params: { treeId: route.params.treeId } });
};

const editRecord = (record) => {
  treeRecordStore.setRecord(record);
  router.push({ name: 'EditTreeRecord', params: { treeId: route.params.treeId, recordId: record.recordId } });
};


const deleteRecord = async (record) => {
  try {
    const confirmDelete = confirm(`Are you sure you want to delete the record dated ${record.date}?`);
    if (!confirmDelete) return;

    // API that accepts DELETE requests
    const response = await fetch(`http://localhost:3001/api/trees/${route.params.treeId}/records/${record.recordId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Remove the record from the list on successful deletion
      tree.value.inspections = tree.value.inspections.filter(r => r !== record);
      alert('Record deleted successfully');
    } else {
      alert('Failed to delete the record');
    }
  } catch (error) {
    console.error('Error deleting the record:', error);
    alert('An error occurred while deleting the record');
  }
};



// onMounted: When the component is mounted, check if tree data is passed
onMounted(async () => {
  const treeId = route.params.treeId;

  if (treeId) {
    await treeInfoStore.fetchTreeData(treeId);
  }

});



function getLayerByTitle(map, title) {
  return map.getLayers().getArray().find(layer => layer.get('title') === title);
}

function zoomInGeomWKT (map, geomWKT) {
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
}

// Watch for changes to the route params (in case of navigation)
watch(() => route.params.treeId, async (newTreeId) => {
  if (newTreeId) {
    console.log('watched a new tree')
    // Refetch the tree data when the treeId changes
    await treeInfoStore.fetchTreeData(newTreeId);
  }
});


watchEffect(()=>{
  if (mapStore.isInitialized) {
    console.log("effects watched");
    const treeId = route.params.treeId;

    if (treeId) {
      const treeIdint = parseInt(treeId, 10);

      // Assume getLayerByTitle and zoomInGeomWKT are utility functions
      const map = mapStore.mapInstance;
      const treeLayer = getLayerByTitle(map, 'Trees');
      treeLayer.setStyle((feature) => selectedTreeStyle(feature, treeIdint, mapStore.styleCache));

      // Zoom in to the specific tree's geometry
      if (tree.value && tree.value.geomWKT) {
        zoomInGeomWKT(map, tree.value.geomWKT);
      }
    }
  }
});

</script>

<style scoped>
.info-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
}


.info-section {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px
}
.table-details {
  background-color: white;
  width: 100%;
  border-radius: 8.78px;
  padding: 5px 5px;
}


.record-section{
  width: 100%;
}

img.species-img{
  width: 30%;
}

h1 {
  margin-top: 0;
  font-size: 30px;
}

h2 {
  margin-top: 0;
  font-size: 20px;
}

h2.species-name {
  margin: 10px 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.species-image {
  max-width: 100px;
  height: auto;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
}

.submit-btn:hover {
  background-color: #45a049;
}

.edit-link {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.edit-link:hover {
  color: darkblue;
}


</style>
