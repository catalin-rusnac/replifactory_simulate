<template>
  <div>
  <GameComponent />
  </div>
  <div>
  <SimulationComponent msg="Welcome to Your Vue.js App"/>
  </div>

</template>

<script>
import SimulationComponent from './components/SimulationComponent.vue'
import GameComponent from './components/GameComponent.vue'
export default {
  name: 'App',
  components: {
    SimulationComponent,
    GameComponent
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
