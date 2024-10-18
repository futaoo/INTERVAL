<template>
  <!-- Tree Info Section -->
  <div v-if="!isCollapsed" class="info-content">
    <div class="map-desc">
      <h1><b>{{desc.title}}</b></h1>
      <p>{{desc.subtitle}}</p>
      <p>{{desc.intro}}</p>
    </div>
    <section class="info-section tree-statistics-section">
      <h1>{{ treeStore.electoralName }} Tree Statistics</h1>
      <div class="table-details">
        <div class="pie-chart-container">
          <PieChart v-if="treeStatistics.speciesComposition.length" :key="route.query" :chart-data="treeStatistics.speciesComposition"  />
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
                <router-link :to="{ name: 'TreeInfo', params: { treeId: record.treeId } }" :class="{ 'tree-link': record.treeName, 'unknown-tree': !record.treeName }">
                  {{ record.treeName || 'Unknown Species'}}
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
import { ref, onMounted,} from 'vue';
import { useRoute } from 'vue-router';
import PieChart from './PieChart.vue';
import { useTreeStore } from '@/stores/statisticsStore';
import { storeToRefs } from 'pinia'

const treeStore = useTreeStore()

const { treeStatistics } = storeToRefs(treeStore);


const route = useRoute(); // Get the current route


const props = defineProps({
  isCollapsed: Boolean
});

const desc = ref( {
  title: "Dublin City’s Trees",
  subtitle:"This interactive map brings Dublin City’s urban forest to your finger tips.",
  intro:"For the first time, you can access information about all the trees individually managed in Dublin City, from those lining streets to the ones growing in landscaped areas of parks. Learn about them, favorite and share them with your friends, and record and share your street tree stewardship activities."
});

onMounted(async()=>{

  const fromFilter = treeStore.fromFilter;
  if (!fromFilter){
    const query = route.query;

    // Create a new query object to justify the parameters
    const justifiedQuery = {};

    // Ensure species_id is an array if it's a single value or undefined
    justifiedQuery.species_id = query.species_id
      ? (Array.isArray(query.species_id) ? query.species_id : [query.species_id])
      : undefined;

    // Ensure condition is an array if it's a single value or undefined
    justifiedQuery.condition = query.condition
      ? (Array.isArray(query.condition) ? query.condition : [query.condition])
      : undefined;

    // Convert height, trunk, and spread ranges to numbers and handle missing values
    justifiedQuery.height_min = query.height_min ? parseInt(query.height_min, 10) : undefined;
    justifiedQuery.height_max = query.height_max ? parseInt(query.height_max, 10) : undefined;

    justifiedQuery.trunk_min = query.trunk_min ? parseInt(query.trunk_min, 10) : undefined;
    justifiedQuery.trunk_max = query.trunk_max ? parseInt(query.trunk_max, 10) : undefined;

    justifiedQuery.spread_min = query.spread_min ? parseInt(query.spread_min, 10) : undefined;
    justifiedQuery.spread_max = query.spread_max ? parseInt(query.spread_max, 10) : undefined;

    // Handle the geometry value directly (assume empty string if missing)
    justifiedQuery.userGeometry = query.userGeometry || undefined;

    // Convert boolean strings to actual boolean values
    justifiedQuery.is_native = query.is_native === 'true' ? true : query.is_native === 'false' ? false : undefined;
    justifiedQuery.is_public = query.is_public === 'true' ? true : query.is_public === 'false' ? false : undefined;

    // Remove undefined or unnecessary values (e.g., if a field was not supplied)
    Object.keys(justifiedQuery).forEach(key => {
      if (justifiedQuery[key] === undefined || justifiedQuery[key] === null) {
        delete justifiedQuery[key];
      }
    });
    await treeStore.fetchStatistics(justifiedQuery);
        
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
