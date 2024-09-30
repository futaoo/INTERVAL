<template>
  <div class="filter-container">
    <!-- Filter Button to Toggle Floating Filter Popover -->
    <button @click="isPopoverOpen = !isPopoverOpen" class="filter-btn">
      Filter Trees
    </button>

    <!-- Floating Vue Popover for Filter Options -->
    <div v-if="isPopoverOpen" :show="isPopoverOpen" @hide="isPopoverOpen = false" class="filter-popup">
      <div class="filter-item">
        <input
          v-model="searchQuery"
          @input="filterItems"
          placeholder="Search species..."
          class="search-input"
        />
        
        <!-- Dropdown for Search Query -->
        <ul v-if="filteredItems.length && searchQuery" class="dropdown">
          <li
            v-for="(item, index) in filteredItems"
            :key="index"
            @click="toggleCheck(item)"
            class="dropdown-item"
          >
            {{ item.common_name }} ({{ item.scientific_name }})
          </li>
        </ul>

        <!-- Scrollable List of Selected Species -->
        <div class="checkbox-list">
          <div
            v-for="(item, index) in selectedSpecies"
            :key="index"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              @click.prevent="toggleCheck(item)"
              checked="true"
            />
            <label>{{ item.common_name || 'Unknown' }} ({{ item.scientific_name || 'Unknown' }})</label>
          </div>
        </div>

      </div>

      <!-- Public or Private Filter -->
      <div class="filter-item">
        <label style="font-weight: bold;">Ownership:</label> 
        <div class="binary-choose">
          <div>
            <input type="radio" id="public" value="Public" v-model="filters.ownership" />
            <label for="public">Public</label>
          </div>
          <div>
            <input type="radio" id="private" value="Private" v-model="filters.ownership" />
            <label for="private">Private</label>
          </div>
          <div>
            <input type="radio" id="all-ownership" value="" v-model="filters.ownership" />
            <label for="all-ownership">All</label>
          </div>
        </div>
      </div>

      <!-- Native or Non-native Filter -->
      <div class="filter-item">
        <label style="font-weight: bold;">Origin:</label>
        <div class="binary-choose">
          <div>
            <input type="radio" id="native" value="Native" v-model="filters.origin" />
            <label for="native">Native</label>
          </div>
          <div>
            <input type="radio" id="non-native" value="Non-native" v-model="filters.origin" />
            <label for="non-native">Non-native</label>
          </div>
          <div>
            <input type="radio" id="all-origin" value="" v-model="filters.origin" />
            <label for="all-origin">All</label>
          </div>
        </div>
      </div>

      <!-- Height Range Filter -->
      <div class="filter-item">
        <label style="font-weight: bold;">Height Range (m):</label>
        <div class="range-inputs">
          <input type="number" v-model.number="filters.heightMin" min="0" max="200" step="1" />
          <span>to</span>
          <input type="number" v-model.number="filters.heightMax" min="0" max="200" step="1" />
        </div>
      </div>

      <!-- Trunk Range Filter -->
      <div class="filter-item">
        <label style="font-weight: bold;">Trunk Diameter Range (m):</label>
        <div class="range-inputs">
          <input type="number" v-model.number="filters.diameterMin" min="0" max="200" step="1" />
          <span>to</span>
          <input type="number" v-model.number="filters.diameterMax" min="0" max="200" step="1" />
        </div>
      </div>

      <!-- Spread Range Filter -->
      <div class="filter-item">
        <label style="font-weight: bold;">Canopy Spread Range (m):</label>
        <div class="range-inputs">
          <input type="number" v-model.number="filters.spreadMin" min="0" max="200" step="1" />
          <span>to</span>
          <input type="number" v-model.number="filters.spreadMax" min="0" max="200" step="1" />
        </div>
      </div>

      <!-- Checkbox List for Conditions -->
      <div class="filter-item">
        <h3 style="font-weight: bold;">Tree Condition:</h3>
        <div class="conditions-list">
          <div v-for="(condition, index) in conditions" :key="index" class="condition-item">
          <input 
            type="checkbox" 
            v-model="filters.condition" 
            :value="condition" 
          />
          <label>{{ condition }}</label>
        </div></div>
      </div>

      <!-- Apply Filter Button -->
      <button @click="applyFilters" class="apply-btn">Apply Filter</button>
    </div>
  </div>
</template>

<script setup>
import { useTreeStore } from '@/stores/statisticsStore';
import { ref , onMounted, inject} from 'vue';
import { useRouter } from 'vue-router';


const treeStore = useTreeStore()

const router = useRouter();

// Reactive state for popover visibility and filters
const isPopoverOpen = ref(false);
const filters = ref({
  speciesId: [],
  condition: [],
  ownership: '',
  origin: '',
  heightMin: null,
  heightMax: null,
  diameterMin: null,
  diameterMax: null,
  spreadMin: null,
  spreadMax: null,
  geoWKT: ''
});


// Dummy species list for the select dropdown
const speciesData = ref([]); // Fetched from API

const filteredItems = ref([]);

// Selected species (for the checkbox list)
const selectedSpecies = ref([]);

// checkbox list conditions
const conditions = ref([]);




// Search query for filtering species
const searchQuery = ref('');


// Function to filter items based on the search query
const filterItems = () => {
  filteredItems.value = speciesData.value.filter(item => {
    const commonName = item.common_name ? item.common_name.toLowerCase() : '';
    const scientificName = item.scientific_name ? item.scientific_name.toLowerCase() : '';
    return commonName.includes(searchQuery.value.toLowerCase()) || scientificName.includes(searchQuery.value.toLowerCase());
  });
};

// Function to toggle the checked state of an item
const toggleCheck = (item) => {
  if (filters.value.speciesId.includes(item.species_id)) {
    // Uncheck the item
    filters.value.speciesId = filters.value.speciesId.filter(id => id !== item.species_id);
    selectedSpecies.value = selectedSpecies.value.filter(species => species.species_id !== item.species_id);
  } else {
    // Check the item
    filters.value.speciesId.push(item.species_id);
    selectedSpecies.value.push(item);
  }
  searchQuery.value = ''; // Clear the search query
};

// API endpoint to get species
const API_URL = 'http://localhost:3001/api/species';

// API endpoint to get conditions
const CONDITIONS_API_URL = 'http://localhost:3001/api/conditions';


// Fetch species data from the API on component mount using fetch
onMounted(async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    speciesData.value = data.species;  // Assuming API returns { species: [...] }
    filteredItems.value = speciesData.value;  // Initialize the filtered items

    // Fetch distinct conditions data
    const conditionsResponse = await fetch(CONDITIONS_API_URL);
    const conditionsData = await conditionsResponse.json();
    conditions.value = conditionsData.conditions.map(c => c.condition);  // Extract conditions into a simple array

  } catch (error) {
    console.error('Error fetching species data:', error);
  }
});

const applyFilters = async () => {
    const apiFilters = {
    species_id: filters.value.speciesId.length ? [...filters.value.speciesId] : undefined,
    condition: filters.value.condition.length ? [...filters.value.condition] : undefined,
    height_min: filters.value.heightMin? filters.value.heightMin*100 : undefined,
    height_max: filters.value.heightMax? filters.value.heightMax*100 : undefined,
    trunk_min: filters.value.diameterMin? filters.value.diameterMin*100 : undefined,
    trunk_max: filters.value.diameterMax? filters.value.diameterMax*100 : undefined,
    spread_min: filters.value.spreadMin? filters.value.spreadMin*100 :undefined,
    spread_max: filters.value.spreadMax? filters.value.spreadMax*100 : undefined,
    userGeometry: filters.value.geoWKT || undefined, // Use the WKT directly from the geoWKT field
    is_native: filters.value.origin? mapOriginToBoolean(filters.value.origin): undefined, // Convert origin to boolean or undefined
    is_public: filters.value.ownership? mapOwnershipToBoolean(filters.value.ownership) : undefined// Convert ownership to boolean or undefined
  };

  // Convert `apiFilters` into query parameters for the route
  const queryParams = Object.fromEntries(
    Object.entries(apiFilters).filter(([_, value]) => value !== undefined)
  );

  await treeStore.fetchStatistics(queryParams);

  router.push({name:"FilterStatistics", query: queryParams});
};

// Function to map origin to boolean values (true/false) or null
const mapOriginToBoolean = (origin) => {
  if (origin === 'Native') return true;
  if (origin === 'Non-Native') return false;
  return null; // No filter selected
};

// Function to map ownership to boolean values (true/false) or null
const mapOwnershipToBoolean = (ownership) => {
  if (ownership === 'Public') return true;
  if (ownership === 'Private') return false;
  return null; // No filter selected
};

</script>

<style scoped>
.filter-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 500;
}

.filter-btn {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;  
  border: 2px solid #599a5d;
  border-radius: 5px;
}

.filter-btn:hover {
  background-color: #45a049;
}

.filter-popup {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  width: 250px;
  top: 0;
  right: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.filter-item {
  margin-bottom: 10px;
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.dropdown {
  position: absolute;
  background-color: white;
  width: 90%;
  border: 1px solid #ddd;
  border-radius: 5px;
  max-height: 100px;
  overflow-y: auto;
  z-index: 800;
}

.dropdown-item {
  padding: 8px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}

.binary-choose{
  display: flex;
  gap: 5px;
}


.checkbox-list {
  display: flex;
  max-height: 120px; /* Fixed height for the container */
  overflow-y: auto; /* Enable vertical scrolling when the content overflows */
  /* border: 1px solid #ddd; */
  padding: 5px;
  gap: 5px;
  /* border-radius: 5px; */
}

.checkbox-item {
  display: flex;
  align-items: center;
  /* gap: 5px; */
}


.range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type=number]{
    font-size:1em;
    padding:3px;
    margin:0;
    border-radius:3px; 
    border: 1px solid #ddd;
    text-align:center;
}

.apply-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.apply-btn:hover {
  background-color: #45a049;
}

.conditions-list {
  border: 1px solid lightgray;
  border-radius: 5px;
  max-height: 60px;
  overflow: auto;
  padding-left: 2px;
}

.condition-item {
  display: flex;
  align-items: center;
}

.condition-item label {
  margin-left: 10px;
}
</style>
