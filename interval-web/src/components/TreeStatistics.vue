<template>
  <!-- Tree Info Section -->
  <div v-if="!isCollapsed" class="info-content">
    <div class="map-desc">
      <h1>{{desc.title}}</h1>
      <p>{{desc.subtitle}}</p>
      <p>{{desc.intro}}</p>
    </div>
    <section class="info-section tree-statistics-section">
      <h1>Citywide Statistics</h1>
      <div class="table-details">
        <table class="stats-summary-table">
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
            <th>Public Trees:</th>
            <td>{{ treeStatistics.public }}</td>
          </tr>
          <tr>
            <th>Private Trees:</th>
            <td>{{ treeStatistics.private }}</td>
          </tr>
          <tr>
            <th>Native Trees:</th>
            <td>{{ treeStatistics.native }}</td>
          </tr>
          <tr>
            <th>Non-Native Trees:</th>
            <td>{{ treeStatistics.noNative }}</td>
          </tr>
          <tr>
            <th>Most Common Species:</th>
            <td>{{ treeStatistics.mostCommonSpecies }}</td>
          </tr>
        </table>
        <div class="pie-chart-container">
          <PieChart :chart-data="chartData"  />
          <h2 >Tree Species Composition</h2>
        </div>
      </div>
    </section>

    <!-- Ecological Benefits Section -->
    <section class="info-section ecological-benefits-section">
      <h2>Ecological Benefits</h2>
      <div class="table-details">
        <table class="benefits-table">
          <tr>
            <th>Total Carbon Sequestration:</th>
            <td>{{ treeStatistics.ecologicalBenefits.carbonSequestration.value }} {{ treeStatistics.ecologicalBenefits.carbonSequestration.unit }}</td>
          </tr>
          <tr>
            <th>Total Energy Conserved:</th>
            <td>{{ treeStatistics.ecologicalBenefits.energyConserved.value }} {{ treeStatistics.ecologicalBenefits.energyConserved.unit }}</td>
          </tr>
          <tr>
            <th>Total Air Pollutants Removed:</th>
            <td>{{ treeStatistics.ecologicalBenefits.airPollutantsRemoved.value }} {{ treeStatistics.ecologicalBenefits.airPollutantsRemoved.unit }}</td>
          </tr>
          <tr>
            <th>Total Stormwater Retained:</th>
            <td>{{ treeStatistics.ecologicalBenefits.stormwaterRetained.value }} {{ treeStatistics.ecologicalBenefits.stormwaterRetained.unit }}</td>
          </tr>
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
              <th>Activity</th>
              <th>Issue</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in treeStatistics.activitiesAndIssues" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.activity }}</td>
              <td>{{ record.issue }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

import PieChart from './PieChart.vue';

const props = defineProps({
  isCollapsed: Boolean
});

const desc = ref( {
  title: "Dublin City’s Trees",
  subtitle:"This interactive map brings Dublin City’s urban forest to your finger tips.",
  intro:"For the first time, you can access information about all the trees individually managed in Dublin City, from those lining streets to the ones growing in landscaped areas of parks. Learn about them, favorite and share them with your friends, and record and share your street tree stewardship activities."
});

const treeStatistics = ref({
  totalTrees: 150,
  totalSpecies: 20,
  totalIssues: 5,
  mostCommonSpecies: "Sycamore",
  public: 120,
  private: 30,
  native: 130,
  noNative: 20,
  ecologicalBenefits: {
    carbonSequestration: {
      unit: "kg/year",
      value: 5000
    },
    energyConserved: {
      unit:"kWh/year",
      value: 1000
    },
    airPollutantsRemoved: {
      unit: "pounds/year",
      value: 300
    },
    stormwaterRetained: {
      unit: "gallons/year",
      value: 10000
    }
  },
  speciesComposition: [
    { name: "Sycamore", count: 45 },
    { name: "Oak", count: 30 },
    { name: "Maple", count: 20 },
    { name: "Pine", count: 15 },
    { name: "Birch", count: 10 }
  ],
  activitiesAndIssues: [
    { date: "2024-01-01", activity: "Pruning", issue: "None" },
    { date: "2023-06-15", activity: "Inspection", issue: "Pest Infestation" },
    { date: "2023-09-10", activity: "Fertilizing", issue: "None" },
    { date: "2023-11-02", activity: "Inspection", issue: "Disease" }
  ]
});

// Prepare data for Pie Chart
const chartData = computed(() => ({
  labels: treeStatistics.value.speciesComposition.map(species => species.name),
  datasets: [
    {
      label: "Tree Species Composition",
      data: treeStatistics.value.speciesComposition.map(species => species.count),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
    }
  ]
}));
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
</style>
