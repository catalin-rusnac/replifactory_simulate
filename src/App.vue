<template>
  <div>
    <AnimatedBacteria
      :IC50="animationParams.IC50"
      :IC50_initial="animationParams.IC50_initial"
      :growthRate="animationParams.growthRate"
      :adaptationRate="animationParams.adaptationRate"
      :currentDose="animationParams.currentDose"
    />
  </div>
  <div>
<!--    TODO: declare emit event to update the parameters in the parent component-->
    <SimulationControls @updateParams="updateParams" />

  </div>
</template>

<script>
import SimulationControls from './components/SimulationControls.vue'
import AnimatedBacteria from './components/AnimatedBacteria.vue'

export default {
  name: 'App',
  components: {
    SimulationControls,
    AnimatedBacteria
  },
  data() {
    return {
      animationParams: {
        IC50: 5,
        IC50_initial: 5,
        growthRate: 1,
        adaptationRate: 0.005,
        currentDose: 0
      }
    }
  },
  methods: {
    updateParams(newParams) {
      console.log(newParams);
      this.animationParams = { ...this.animationParams, ...newParams };
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
