<template>
    <main class="content">
        <IntervalMap />
        <TreeFilter />
        <router-view />
    </main>
</template>



<script setup>

import InfoPage from './InfoPage.vue';
import IntervalMap from './IntervalMap.vue';
import TreeFilter from './TreeFilter.vue';

</script>
