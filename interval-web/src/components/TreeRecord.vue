<template>
  <div v-if="!isCollapsed" class="edit-record-container">
    <h2>Edit Record for Tree</h2>
    <form @submit.prevent="submitRecord">

      <!-- Activity Type -->
      <div class="form-group">
        <label for="record-type">Record Type</label>
        <select id="record-type" v-model="form.activityType" required>
          <option value="">Select record type</option>
          <option value="Issue">Issue</option>
          <option value="Activity">Tree Care Activity</option>
        </select>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="form.description" placeholder="Enter details..." required></textarea>
      </div>

      <!-- Date Picker -->
      <div class="form-group">
        <label for="date">Date</label>
        <VueDatePicker v-model="form.date" :format="formatDate" placeholder="Select date" />
      </div>

      <!-- Submit Button -->
      <div class="form-group">
        <button type="submit" class="submit-btn">Submit</button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { useRoute} from 'vue-router';

const route = useRoute(); // Get the current route

const form = ref({
  recordType: '',
  description: '',
  date: null
});

const props = defineProps({
  isCollapsed: Boolean,
})

// Date format function
const formatDate = (date) => {
  if (!date) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

// dateValue should be a JavaScript Date object
const formatDateForPostgres = (dateValue) => {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
  const day = String(dateValue.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const submitRecord = async () => {
  if (form.value.activityType && form.value.description && form.value.date) {
    const treeId = route.params.treeId;
    
    const paramsBody = {
      recordType: form.value.activityType,
      recordDescription: form.value.description,
      recordDate: formatDateForPostgres(form.value.date)
    }

    createRecord(treeId, paramsBody);

    alert('Record submitted successfully');
    console.log('Submitted Record:', form.value);
    
    // Reset form after submission
    form.value = {
      activityType: '',
      description: '',
      date: null
    };
  }
};

const createRecord = async (treeId, newRecord) => {
  try {
    const response = await fetch(`http://localhost:3001/api/trees/${treeId}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecord), // Send the new record in the body
    });
    const data = await response.json();
    console.log('Record created:', data);
  } catch (error) {
    console.error('Error creating record:', error);
  }
};
</script>

<style scoped>
.edit-record-container {
  /* width: 80%; */
  top: 50px;
  left: 20px;
  right: 20px;
  position: absolute;
  /* margin: 0 auto; */
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
  color: #45a049;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;
}

.submit-btn:hover {
  background-color: #45a049;
}
</style>
