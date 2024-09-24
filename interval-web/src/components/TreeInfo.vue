<template>
  <!-- Tree Info Section -->
  <div v-if="!isCollapsed && tree" class="info-content">

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
        </table>
        <img src="../assets/streetview.png" alt="api not working" class="image">
      </div>
    </section> 

    <!-- Ecological Benefits Section -->
    <section class="info-section ecological-benefits-section">
      <h2>Ecological Benefits</h2>
      <div class="table-details">
        <table>
          <!-- Sort the ecological benefits array by benefit name before rendering -->
          <tr v-for="(benefit, index) in sortedEcologicalBenefits" :key="index">
            <th>{{ benefit.name }}</th>
            <td>{{ benefit.value }} {{ benefit.unit }} (worth of {{ benefit.monetary }}$)</td>
          </tr>
        </table>
        <p><strong>Total Monetary Value: {{ totalMonetaryValue }}$</strong></p>
      </div>
    </section>

    <!-- Record of Activities/Issues Section -->
    <section v-if="tree.inspections.length > 0" class="info-section record-section">
      <h2>Record of Activities/Issues</h2>
      <div class="table-details">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in tree.inspections" :key="index">
              <td>{{ record.date }}</td>
              <td>{{ record.type }}</td>
              <td>{{ record.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section> 
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed} from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute(); // Get the current route

const props = defineProps({
  isCollapsed: Boolean,
})

const tree = ref(null);


// Computed property to sort the ecological benefits by name
const sortedEcologicalBenefits = computed(() => {
  return tree.value.ecologicalBenefits.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

const totalMonetaryValue = computed(() => {
  // Ensure we sum monetary values properly
  const total = tree.value.ecologicalBenefits.reduce((sum, benefit) => {
    const monetaryValue = parseFloat(benefit.monetary) || 0; // Ensure it's a number or default to 0
    return sum + monetaryValue;
  }, 0);

  // Safely format the result to 2 decimal places
  return total.toFixed(2); // toFixed returns a string for display
});

// Function to fetch tree data based on treeId
const fetchTreeData = async (treeId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/trees/${treeId}`);
    const treeData = await response.json();
    tree.value = treeData; // Set the fetched data to the tree ref
    console.log(tree.value);
  } catch (error) {
    console.error('Error fetching tree data:', error);
  }
};

// onMounted: When the component is mounted, check if tree data is passed
onMounted(() => {
  const treeId = route.params.treeId;
  if (treeId) {
    fetchTreeData(treeId); // Fetch tree data from API
  }
});

// Watch for changes to the route params (in case of navigation)
watch(() => route.params.treeId, (newTreeId) => {
  if (newTreeId) {
    fetchTreeData(newTreeId); // Refetch the tree data when the treeId changes
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
</style>
