<template>
  <div class="tree-info-box" :class="{'collapsed': isCollapsed }">
    <!-- Toggle Button -->
    <button class="toggle-button" @click.prevent="toggleCollapse">
      <!-- Arrow Icon: Pointing Left when expanded, Right when collapsed -->
      <!-- Left Arrow -->
      <span v-if="!isCollapsed">&#9664;</span> 
      <!-- Right Arrow -->
      <span v-else>&#9654;</span>
    </button>
    <router-view :is-collapsed="isCollapsed"/>
  </div>
</template>

<script setup>
import { ref, toRefs} from 'vue';



// Reactive state to track collapse
const isCollapsed = ref(false);


const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
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
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 10px;
  border-radius: 8.78px;
  background: rgba(105, 158, 250, 0.60);
  backdrop-filter: blur(0px); 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

</style>