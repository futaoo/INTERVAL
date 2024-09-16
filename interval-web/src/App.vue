<script setup>
import IntervalHeader  from './components/IntervalHeader.vue';
import IntervalFooter from './components/IntervalFooter.vue';
import IntervalContent from './components/IntervalContent.vue';

</script>

<template>
 <div id="app">
    <IntervalHeader />
    <IntervalContent />
    <IntervalFooter />
    <router-view></router-view>
  </div>
</template>


<style>
  body {
    height: 100vh;
  }


  header {
    height: 100px;
  }

  footer {
    height: 30px;
  }


  main {
    height: -moz-calc(100vh - (100px + 30px));
    height: -webkit-calc(100vh - (100px + 30px));
    height: calc(100vh - (100px + 30px));
  }
</style>


