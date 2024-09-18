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
  /* body {
    height: 100vh;
  } */


  header {
    position: fixed;
    width: 100%;
    height: 100px;
    box-shadow: 0 4px 2px -2px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  footer {
    position: fixed;
    width: 100%;
    height: 30px;
    bottom: 0;
  }


  main {
    position: fixed;
    bottom: 30px;
    top:100px;
    width: 100%;
    box-shadow: 0 4px 2px -2px rgba(0, 0, 0, 0.2);
    z-index: 80;
    /* height: -moz-calc(100vh - (100px + 30px));
    height: -webkit-calc(100vh - (100px + 30px));
    height: calc(100vh - (100px + 30px)); */
  }
</style>


