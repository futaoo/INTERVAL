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
          type="text"
          v-model="searchQuery"
          @input="showDropdown = true"
          placeholder="Search species..."
          class="search-input"
        />
        
        <!-- Dropdown for Search Query -->
        <ul v-if="showDropdown && queriedSpecies.length && searchQuery" class="dropdown">
          <li
            v-for="species in queriedSpecies"
            :key="species"
            @click="selectSpecies(species)"
            class="dropdown-item"
          >
            {{ species }}
          </li>
        </ul>

        <!-- Scrollable List of Selected Species -->
        <div class="checkbox-list">
          <div
            v-for="species in filters.species"
            :key="species"
            class="checkbox-item"
            @click="toggleSpecies(species)"
          >
            <input
              type="checkbox"
              :id="species"
              :value="species"
              v-model="filters.species"
              checked
            />
            <label :for="species">{{ species }}</label>
          </div>
        </div>

      </div>
      
      <!-- Public or Private Filter -->
      <div class="filter-item">
        <label>Ownership:</label>
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

      <!-- Native or Non-native Filter -->
      <div class="filter-item">
        <label>Origin:</label>
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

      <!-- Height Range Filter -->
      <div class="filter-item">
        <label>Height Range (m):</label>
        <div class="range-inputs">
          <input type="number" v-model.number="filters.height.min" min="1" max="100" step="1" />
          <span>to</span>
          <input type="number" v-model.number="filters.height.max" min="1" max="100" step="1" />
        </div>
      </div>

      <!-- Trunk Range Filter -->
      <div class="filter-item">
        <label>Trunk Range (m):</label>
        <div class="range-inputs">
          <input type="number" v-model.number="filters.diameter.min" min="1" max="100" step="1" />
          <span>to</span>
          <input type="number" v-model.number="filters.diameter.max" min="1" max="100" step="1" />
        </div>
      </div>

      <!-- Apply Filter Button -->
      <button @click="applyFilters" class="apply-btn">Apply Filter</button>
    </div>
  </div>
</template>

<script setup>
import { ref , computed} from 'vue';

// Reactive state for popover visibility and filters
const isPopoverOpen = ref(false);
const filters = ref({
  species: [],
  ownership: '',
  origin: '',
  height: {
    min: 0,
    max: 100
  },
  diameter:{
    min: 0,
    max: 100
  }
});

// Dummy species list for the select dropdown
const speciesList = [
  'Sycamore', 'Oak', 'Maple', 'Pine', 'Birch', 'Willow', 'Chestnut', 'Elm', 'Ash', 'Beech'
];

// Search query for filtering species
const searchQuery = ref('');
const showDropdown = ref(false);

// Computed property to filter species based on search query
const queriedSpecies = computed(() => {
  return speciesList.filter(species =>
    species.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Function to toggle a species in the filters
const toggleSpecies = (species) => {
  if (filters.value.species.includes(species)) {
    filters.value.species = filters.value.species.filter(s => s !== species);
  } else {
    filters.value.species.push(species);
  }
};

// Function to select a species from the dropdown
const selectSpecies = (species) => {
  if (!filters.value.species.includes(species)){
    filters.value.species.push(species);
  }
  searchQuery.value = ''; // Clear the search query
  showDropdown.value = false; // Hide the dropdown
};

// Function to apply the filters
const applyFilters = () => {
  console.log('Filters applied:', filters.value);
  // Here handle the logic to filter the tree data
  isPopoverOpen.value = false;
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
  border: none;
  cursor: pointer;
  border-radius: 5px;
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
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.dropdown {
  position: absolute;
  background-color: white;
  width: 100%;
  top: 0;
  right: 100%;
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
</style>
