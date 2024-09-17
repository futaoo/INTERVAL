<template>
  <div :class="['tree-info-box', { collapsed: isCollapsed }]">
    <!-- Toggle Button -->
    <button class="toggle-button" @click.prevent="toggleCollapse">
      <!-- Arrow Icon: Pointing Left when expanded, Right when collapsed -->
       <!-- Left Arrow -->
      <span v-if="!isCollapsed">&#9664;</span> 
      <!-- Right Arrow -->
      <span v-else>&#9654;</span>
    </button>
    <!-- Tree Info Section -->
    <div v-if="!isCollapsed" class="info-content">
      <section class="info-section tree-info-section">
        <h1>{{ tree.species.speciesCommonName }}</h1>
        <div class="table-details">
          <h2 class="species-name">{{ tree.species.speciesScientificName }}</h2>
          <img src="@/assets/species/testspecies.webp" alt="test species" class="species-img" />
          <table>
            <tr>
              <th>Closest Street Address</th>
              <td>{{ tree.closestAddress }}</td>
            </tr>
            <tr>
              <th>Height (m)</th>
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
          </table>
        </div>
      </section>

      <!-- Ecological Benefits Section -->
      <section class="info-section ecological-benefits-section">
        <h2>Ecological Benefits</h2>
        <div class="table-details">
          <table>
          <tr>
            <th>Carbon Sequestration</th>
            <td>{{ tree.ecologicalBenefits.carbonSequestration.value }} {{ tree.ecologicalBenefits.carbonSequestration.unit }} ({{ tree.ecologicalBenefits.carbonSequestration.monetary }}$)</td>
          </tr>
          <tr>
            <th>Energy Conserved</th>
            <td>{{ tree.ecologicalBenefits.energyConserved.value }} {{ tree.ecologicalBenefits.energyConserved.unit }} ({{ tree.ecologicalBenefits.energyConserved.monetary }}$)</td>
          </tr>
          <tr>
            <th>Air Pollutants Removed</th>
            <td>{{ tree.ecologicalBenefits.airPollutantsRemoved.value }} {{ tree.ecologicalBenefits.airPollutantsRemoved.unit }} ({{ tree.ecologicalBenefits.airPollutantsRemoved.monetary }}$)</td>
          </tr>
          <tr>
            <th>Stormwater Retained</th>
            <td>{{ tree.ecologicalBenefits.stormwaterRetained.value }} {{ tree.ecologicalBenefits.stormwaterRetained.unit }} ({{ tree.ecologicalBenefits.stormwaterRetained.monetary }}$)</td>
          </tr>
        </table>
        </div>
      </section>

      <!-- Record of Activities/Issues Section -->
      <section class="info-section record-section">
        <h2>Record of Activities/Issues</h2>
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
              <tr v-for="(record, index) in tree.inspections" :key="index">
                <td>{{ record.date }}</td>
                <td>{{ record.activity }}</td>
                <td>{{ record.issue }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Reactive state to track collapse
const isCollapsed = ref(false);

// Function to toggle collapse state
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const tree = {
  species: {
    speciesCommonName: "Sycamore",
    speciesScientificName: "Acer pseudoplatanus",
    speciesImageUrl: "https://interval.eu/imgs/.../species1.jpg"
  },
  closestAddress: "123 Dublin Street",
  trunkDiameter: 30,
  height: 15,
  canopySpread: 500,
  condition: "Good",
  ecologicalBenefits: {
    carbonSequestration: {
      unit: "kg/year",
      value: 50,
      monetary: 60
    },
    energyConserved: {
      unit: "kWh/year",
      value: 10,
      monetary: 15
    },
    airPollutantsRemoved: {
      unit: "pounds/year",
      value: 20,
      monetary: 35
    },
    stormwaterRetained: {
      unit: "gallons/year",
      value: 30,
      monetary: 40
    }
  },
  inspections: [
    {
      id: "record1",
      date: "2023-01-01",
      activity: "Pruning",
      issue: "None"
    },
    {
      id: "record2",
      date: "2023-06-15",
      activity: "Inspection",
      issue: "Pest Infestation"
    }
  ]
};
</script>

<style scoped>
.tree-info-box {
  overflow-y: scroll;
  display: flex;
  width: 28%;
  padding: 10px 20px;
  flex-direction: column;
  align-items: flex-start;
  z-index: 9999;
  gap: 40px;
  position: absolute;
  top: 110px;
  bottom: 40px;
  left: 1%;
  border-radius: 8.78px;
  background: rgba(105, 158, 250, 0.60);
  backdrop-filter: blur(0px); 
}

/* Collapsed State */
.tree-info-box.collapsed {
  width: 50px;
  height: 50px;
  padding: 5px;
  overflow: hidden;
  cursor: pointer;
}

/* Toggle Button */
.toggle-button {
  position: absolute;
  top: 10px;
  right: 10px; /* Position it outside the info box */
  width: 30px;
  height: 30px;
  /* background-color: #fff; */
  /* border: 1px solid #ccc; */
  /* border-radius: 50%; */
  /* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: transform 0.3s ease;
}

/* Rotate the toggle button when collapsed */
/* .tree-info-box.collapsed .toggle-button {
  transform: rotate(360deg);
} */

/* Hide the info content when collapsed */
.tree-info-box.collapsed .info-content {
  display: none;
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
</style>
