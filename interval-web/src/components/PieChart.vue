<template>
  <div>
    <canvas ref="pieChart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the necessary Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const pieChart = ref(null);

// Initialize the chart when the component is mounted
onMounted(() => {
  new Chart(pieChart.value, {
    type: 'pie',
    data: props.chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          enabled: true
        }
      }
    }
  });
});
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
