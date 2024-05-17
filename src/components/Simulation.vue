<template>
    <!-- Sliders for Parameters -->
    <div class="slider-container">
      <label>Initial Population: {{ initial_population }}</label>
      <input type="range" v-model="initial_population" min="0" max="1" step="0.01">

      <label>Doubling Time: {{ doubling_time }}</label>
      <input type="range" v-model="doubling_time" min="1" max="120" step="1">

      <label>Dilution Threshold: {{ dilution_threshold }}</label>
      <input type="range" v-model="dilution_threshold" min="0.1" max="1" step="0.01">

      <label>Dilution Factor: {{ dilution_factor }}</label>
      <input type="range" v-model="dilution_factor" min="1" max="10" step="0.1">

      <label>Carrying Capacity: {{ carrying_capacity }}</label>
      <input type="range" v-model="carrying_capacity" min="0.1" max="2" step="0.01">

      <label>Delta: {{ delta }}</label>
      <input type="range" v-model="delta" min="0" max="0.1" step="0.001">

      <label>Resistant Fraction: {{ resistant_fraction }}</label>
      <input type="range" v-model="resistant_fraction" min="0" max="1" step="0.01">

      <label>Adaptation Rate: {{ adaptation_rate }}</label>
      <input type="range" v-model="adaptation_rate" min="0" max="0.01" step="0.001">
    </div>
  <div>
    <button @click="runSimulation">Run Simulation</button>
    <canvas id="simulationChart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'BacteriaSimulation',
  data() {
    return {
      initial_population: 0.1,
      doubling_time: 40,
      dilution_threshold: 0.3,
      dilution_factor: 1.6,
      carrying_capacity: 0.95,
      t: 0,
      g: 0,
      stress_added_time: -1,
      stress_added_generation: -1,
      stress_lag_time: 40,
      stress_full_effect_generations: 5,
      delta: 0.05,
      resistant_fraction: 0.02,
      adaptation_rate: 0.004,
    };
  },
  computed: {
  growth_rate() {
    return Math.log(2) / this.doubling_time;
  },
},

  methods: {
  resetSimulationState() {
    // Reset the simulation-specific parameters to their initial states
    this.t = 0;
    this.g = 0;
    this.stress_added_time = -1;
    this.stress_added_generation = -1;

    // Ensure any other state-specific variables are reset as needed
  },
    runSimulation() {
      // log initial state
      console.log('Initial state:', this.initial_population, this.doubling_time, this.dilution_threshold, this.dilution_factor, this.carrying_capacity, this.delta, this.resistant_fraction, this.adaptation_rate);
      this.resetSimulationState();
      // Convert the simulation logic from Python to JavaScript here
      const tMax = 2000;
      const results = this.simulate(tMax);
      this.plotResults(results);
      console.log('Final state:', this.initial_population, this.doubling_time, this.dilution_threshold, this.dilution_factor, this.carrying_capacity, this.delta, this.resistant_fraction, this.adaptation_rate);
    },

    antibiotic_potency() {
      // Add the antibiotic potency logic here
      if (this.stress_added_time < 0) {
        return 0;
      }
      const tStress = this.t - this.stress_added_time;
      if (tStress < this.stress_lag_time) {
        return 0;
      } else {
        const gStress = this.g - this.stress_added_generation;
        const effect = Math.min(1.0, gStress / this.stress_full_effect_generations);
        return effect;
      }
    },
    simulate(tMax) {
  const times = Array.from({ length: tMax + 1 }, (_, i) => i);
  const population = new Array(tMax + 1).fill(0);
  population[0] = this.initial_population;
  const dilutionTimes = [];
  let resistantFraction = this.resistant_fraction;

  for (let t = 1; t <= tMax; t++) {
    this.t = t;
    const potency = this.antibiotic_potency(t, resistantFraction);
    const growthFactor = 1 - (population[t - 1] / this.carrying_capacity);
    const effectiveGrowthRate = (this.growth_rate - this.delta * potency * (1 - resistantFraction)) * growthFactor;

    if (potency > 0) { // Antibiotic is effective, update resistant fraction
      resistantFraction += this.adaptation_rate * (1 - resistantFraction) * potency;
      resistantFraction = Math.min(resistantFraction, 1.0);
    }

    population[t] = population[t - 1] + population[t - 1] * effectiveGrowthRate;

    if (population[t] >= this.dilution_threshold) {
      population[t] /= this.dilution_factor;
      dilutionTimes.push(t);
    }

    if (dilutionTimes.length >= 3 && this.stress_added_time < 0) {
      this.stress_added_time = t;
      // Other updates related to stress can be added here as needed
    }
  }

  return { times, population, dilutionTimes };
},

    plotResults({ times, population, dilutionTimes }) {
  // Check if the chart already exists and destroy it to prevent duplicates
  if (this.chartInstance) {
    this.chartInstance.destroy();
  }

  const ctx = document.getElementById('simulationChart').getContext('2d');

  // Prepare the data for Chart.js
  const dataPoints = times.map((time, index) => ({
    x: time,
    y: population[index]
  }));

  // Filter the dilution points for plotting
  const dilutionPoints = dilutionTimes.map(time => ({
    x: time,
    y: population[time],
    pointStyle: 'triangle', // Customize the point style for dilution points
    radius: 6 // Customize the size of the dilution point markers
  }));

  // Combine population and dilution data
  const datasets = [{
    label: 'Bacteria Population',
    data: dataPoints,
    borderColor: 'rgb(75, 192, 192)',
    borderWidth: 2,
    fill: false,
    tension: 0.1 // Adjust for a smoother line
  }];

  // Optionally, add dilution points as a separate dataset if you want different styling
  if (dilutionPoints.length) {
    datasets.push({
      label: 'Dilution Events',
      data: dilutionPoints,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgb(255, 99, 132)',
      showLine: false, // Don't connect points with a line
      pointStyle: 'triangle',
      radius: 6
    });
  }

  // Create the chart
  this.chartInstance = new Chart(ctx, {
    type: 'scatter', // Using scatter to allow marking dilution points
    data: {
      datasets
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Time (minutes)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Population (OD)'
          }
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
},

  }
};
</script>

<style scoped>
/* Add styles if needed */
</style>
