<template>
  <!-- Tree Info Section -->
  <div v-if="!isCollapsed" class="info-content">
    <div class="map-desc">
      <h1><b>{{desc.title}}</b></h1>
      <p>{{desc.subtitle}}</p>
      <p>{{desc.intro}}</p>
    </div>
    <section class="info-section tree-statistics-section">
      <h1>{{ electoralName }} Tree Statistics</h1>
      <div class="table-details">
        <div class="pie-chart-container">
          <PieChart :key="route.params.id" v-if="treeStatistics.speciesComposition.length" :chart-data="treeStatistics.speciesComposition"  />
          <h2 >Tree Species Composition</h2>
        </div>
        <table class="stats-summary-table">
          <tbody>
            <tr>
              <th>Trees on Map:</th>
              <td>{{ treeStatistics.totalTrees }}</td>
            </tr>
            <tr>
              <th>Tree Species on Map</th>
              <td>{{ treeStatistics.totalSpecies }}</td>
            </tr>
            <tr>
              <th>Issues Reported:</th>
              <td>{{ treeStatistics.totalIssues }}</td>
            </tr>
            <tr>
              <th>Private Trees:</th>
              <td>{{ treeStatistics.privatePercentage }} %</td>
            </tr>
            <tr>
              <th>Non-Native Trees:</th>
              <td>{{ treeStatistics.nonNativePercentage }} %</td>
            </tr>
            <tr>
              <th>Most Common Species:</th>
              <td>{{ treeStatistics.mostCommonSpecies }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Ecological Benefits Section -->
    <section class="info-section ecological-benefits-section">
      <h2>Ecological Benefits</h2>
      <div class="table-details">
        <table class="benefits-table">
          <tbody>
            <tr v-for="(benefit, index) in treeStatistics.ecologicalBenefits" :key="index">
              <th>Total {{ benefit.name }}:</th>
              <td>{{ benefit.totalValue }} {{ benefit.unit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Record of Activities/Issues Section -->
    <section class="info-section record-section">
      <h2>Recent Activities/Issues</h2>
      <div class="table-details">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity Type</th>
              <th>Description</th>
              <th>Tree</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in treeStatistics.activities" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.description }}</td>
              <td>
                <router-link :to="{ name: 'TreeInfo', params: { treeId: record.treeId } }" :class="{ 'tree-link': record.treeName, 'unknown-tree': !record.treeName }" >
                  {{ record.treeName || 'Unknown Species' }} 
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject} from 'vue';
import { useRoute } from 'vue-router';
import PieChart from './PieChart.vue';


const route = useRoute(); // Get the current route


const props = defineProps({
  isCollapsed: Boolean
});

const desc = ref( {
  title: "Dublin City’s Trees",
  subtitle:"This interactive map brings Dublin City’s urban forest to your finger tips.",
  intro:"For the first time, you can access information about all the trees individually managed in Dublin City, from those lining streets to the ones growing in landscaped areas of parks. Learn about them, favorite and share them with your friends, and record and share your street tree stewardship activities."
});

const treeStatistics = ref({
  totalTrees: 0,
  totalSpecies: 0,
  totalIssues: 0,
  mostCommonSpecies: "",
  publicPercentage: 0,
  privatePercentage: 0,
  nativePercentage: 0,
  nonNativePercentage: 0,
  ecologicalBenefits: [],
  speciesComposition: [],
  activities: []
});


const electoralName = ref('');


// Simulate fetching data from API
onMounted(async ()=>{

  const electoralId = route.params.id;

  fetchStatistics(electoralId);

});



const fetchStatistics = async (electoralId)=>{
  
  try{
    const response = await fetch(`http://localhost:3001/api/electoral/${electoralId}`);
    const data = await response.json();

    // Sort activities by date (most recent first), format the date to 'yyyy-mm-dd', and select the top 10
    const sortedActivities = data.activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(activity => ({
        ...activity,
        date: new Date(activity.date).toISOString().slice(0, 10) // Format to 'yyyy-mm-dd'
    }));

    electoralName.value = electoralId? data.electoralName:'Citywide';
    
    // electoralName.value = data.electoralName;
    treeStatistics.value = {
      totalTrees: data.totalTrees,
      totalSpecies: data.totalSpecies,
      totalIssues: data.activities.length,
      mostCommonSpecies: data.mostCommonSpecies,
      publicPercentage: data.publicPercentage,
      privatePercentage: data.privatePercentage,
      nativePercentage: data.nativePercentage,
      nonNativePercentage: data.nonNativePercentage,
      ecologicalBenefits: data.ecologicalBenefits,
      speciesComposition: data.speciesComposition,
      activities: sortedActivities
    };
  }catch (error) {
    console.error('Error fetching electoral data:', error);
  } 
}



// Watch for changes to the route params (in case of navigation)
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchStatistics(newId); // Refetch the tree data when the treeId changes
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
.pie-chart-container {
  display: flex;
  flex-direction: column;
  text-align: center;
  margin: 30px 0;
  gap: 20px;
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

.tree-link {
  color: green;
  text-decoration: underline;
  font-weight: bold;
  cursor: pointer;
}

.tree-link:hover {
  color: darkgreen;
}

.unknown-tree {
  color: grey;
  font-style: italic;
}
</style>
