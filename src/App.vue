<template>
  <div>
<!--  <TestAnimation/>-->
    <AnimatedBacteria />


  </div>
  <div>
  <SimulationControls msg="Welcome to Your Vue.js App"/>
  </div>

</template>

<script>
import SimulationControls from './components/SimulationControls.vue'
import AnimatedBacteria from './components/AnimatedBacteria.vue'
// import TestAnimation from './components/TestAnimation.vue'
export default {
  name: 'App',
  components: {
    SimulationControls,
    AnimatedBacteria,
    // TestAnimation
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
