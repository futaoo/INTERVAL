<template>
  <div>
    <canvas ref="pieChart" ></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, watch } from 'vue';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

// Inject the globally provided 'speciesColors'
const speciesColors = inject('speciesColors');

// Register the necessary Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend);

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  }
});

const pieChart = ref(null);

const pieData = ref({});

// Initialize the chart when the component is mounted
onMounted(() => {
  initializePieChart();
});



function initializePieChart() {
  if (props.chartData && props.chartData.length>0){
    pieData.value = {
      labels: props.chartData.map(species => species.speciesCode),
      datasets: [
        {
          label: "Tree Species Composition",
          data: props.chartData.map(species => species.percentage),
          backgroundColor: props.chartData.map(species => speciesColors[species.speciesId] || '#CCCCCC'), // Use species color or default
          hoverBackgroundColor: props.chartData.map(species => speciesColors[species.speciesId] || '#CCCCCC') // Use species color or default
        }
      ]
    };

    new Chart(pieChart.value, {
      type: 'pie',
      data: pieData.value,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            // display:false
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });
  }
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>
