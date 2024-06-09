<template>
  <h1>Evolution Experiment Simulation</h1>
  <div id="plotDiv"></div>
  <div class="settings-container">
    <!-- Updater Settings -->
    <div class="settings-block">
      <h2>Culture Control Parameters</h2>
      <table class="settings-table">
        <tr v-for="(value, key) in updaterSettings" :key="'updater-' + key">
          <td>{{ key }}</td>
          <td>
            <input
              v-if="updaterSettings_bounds[key]"
              v-model.number="updaterSettings[key]"
              type="range"
              :min="updaterSettings_bounds[key][0]"
              :max="updaterSettings_bounds[key][1]"
              :step="updaterSettings_bounds[key][2] || 0.1"
            >
            <input
              v-else
              v-model.number="updaterSettings[key]"
              type="number"
            >
            {{ updaterSettings[key] }}
          </td>
        </tr>
      </table>
    </div>
    <!-- Model Settings -->
    <div class="settings-block">
      <h2>Culture Growth Model Parameters</h2>
      <table class="settings-table">
        <tr v-for="key in modelSettingsKeys" :key="'model-' + key">
          <td>{{ key }}</td>
          <td><input v-model.number="modelSettings[key]" type="number"></td>
        </tr>
      </table>
    </div>

    <div class="outcome">
      <h2>Outcome</h2>
      <!-- Highlight numbers in bold -->
      <p>Volume Used: {{ volumeUsed }} ml</p>
      <p>IC50 Fold Change: <b>{{ ic50FoldChange }}</b></p>
      <p>Volume per IC50 Doubling: <b>{{ volumePerIC50Doubling }}</b> ml</p>
      <p>Time per IC50 Doubling: <b>{{ timePerIC50Doubling }}</b> hours</p>

      <label>Duration [h]: </label>
      <input v-model.number="simulationHours" type="number">
      <br>
      <button class="run-button" @click="runSimulation">Recalculate</button>
    </div>
  </div>
  <div id="adaptation-rate-plot"></div>
  <div id="mu-plot"></div>
</template>

<script>
import BacteriaGrowthModel from '../models/BacteriaGrowthModel';
import MorbidostatUpdater from '../models/MorbidostatUpdater';
import ParameterPlotting from '@/models/ParameterPlotting';

export default {
  data() {
    return {
      updaterSettings: {
        doseInitialization: 1,
        odDilutionThreshold: 0.3,
        dilutionFactor: 1.6,
        dilutionNumberFirstDrugAddition: 2,
        doseFirstDrugAddition: 3,
        doseIncreaseFactor: 2,
        doseIncreaseAmount: 0,
        thresholdOdMinIncreaseStress: 0.1,
        thresholdGrowthRateIncreaseStress: 0.15,
        thresholdGrowthRateDecreaseStress: -0.1,
        delayDilutionMaxHours: 4,
        delayStressIncreaseMinGenerations: 2,
        volumeVial: 12,
        pump1StockDrugConcentration: 0,
        pump2StockDrugConcentration: 100
      },
      updaterSettings_bounds: {
        doseInitialization: [0, 10, 0.1],
        odDilutionThreshold: [0, 1, 0.01],
        dilutionFactor: [1, 3, 0.1],
        dilutionNumberFirstDrugAddition: [0, 10, 1],
        doseFirstDrugAddition: [0, 10, 0.1],
        doseIncreaseFactor: [1, 5, 0.1],
        doseIncreaseAmount: [0, 10, 0.1],
        thresholdOdMinIncreaseStress: [0, 1, 0.01],
        thresholdGrowthRateIncreaseStress: [0, 1, 0.01],
        thresholdGrowthRateDecreaseStress: [-1, 0, 0.01],
        delayDilutionMaxHours: [1, 24, 1],
        delayStressIncreaseMinGenerations: [1, 10, 1],
        volumeVial: [1, 20, 0.1],
        pump1StockDrugConcentration: [0, 100, 1],
        pump2StockDrugConcentration: [0, 500, 1]
      },
      modelSettings: {
        initialPopulation: 0.05,
        doublingTimeMins: 20,
        carryingCapacity: 0.9,
        muMin: -0.1,
        ic50Initial: 5,
        ic10Ic50Ratio: 0.5,
        doseEffectiveSlopeWidthMins: 120,
        timeLagDrugEffectMins: 30,
        adaptationRateMax: 0.08,
        adaptationRateIc10Ic50Ratio: 0.8,
        timeCurrent: new Date()
      },
      volumeUsed: 0,
      totalTime: 0,
      ic50FoldChange: 0,
      volumePerIC50Doubling: 0,
      timePerIC50Doubling: 0,
      simulationHours: 48,
      modelSettingsKeys: [
        'initialPopulation',
        'doublingTimeMins',
        'carryingCapacity',
        'muMin',
        'ic50Initial',
        'ic10Ic50Ratio',
        'doseEffectiveSlopeWidthMins',
        'timeLagDrugEffectMins',
        'adaptationRateMax',
        'adaptationRateIc10Ic50Ratio'
      ]
    };
  },
  watch: {
    updaterSettings: {
      handler: 'runSimulation',
      deep: true // This ensures that changes in object properties are detected
    },
    modelSettings: {
      handler: 'runSimulation',
      deep: true
    }
  },
  mounted() {
    this.runSimulation();
  },
  methods: {
    runSimulation() {
      const updater = new MorbidostatUpdater(this.updaterSettings);
      this.model = new BacteriaGrowthModel({
        ...this.modelSettings,
        updater: updater
      });
      this.model.plotSimulation(this.simulationHours);
      let [volumeUsed, totalTime, ic50FoldChange] = this.model.getSimulationEfficiency();
      const volumePerIC50Doubling = volumeUsed / Math.log2(ic50FoldChange);
      const timePerIC50Doubling = totalTime / Math.log2(ic50FoldChange);
      this.volumeUsed = volumeUsed.toFixed(1);
      this.totalTime = totalTime.toFixed(1);
      this.ic50FoldChange = ic50FoldChange.toFixed(2);
      this.volumePerIC50Doubling = volumePerIC50Doubling.toFixed(1);
      this.timePerIC50Doubling = timePerIC50Doubling.toFixed(1);

      const parameterPlotting = new ParameterPlotting(this.model);

      parameterPlotting.plot_mu();
      parameterPlotting.plot_adaptation_rate();
    },
    parametersAtTimepoint(timepoint_index) {
          return {
              population: this.model.population[timepoint_index][0],
              generation: this.model.generations[timepoint_index][0],
              drugConcentration: this.model.doses[timepoint_index][0],
              ic50: this.model.ic50s[timepoint_index][0],
              effectiveGrowthRate: this.model.effectiveGrowthRates[timepoint_index][0],
              adaptationRate: this.model.adaptationRates[timepoint_index][0],
              time: this.model.population[timepoint_index][1]
          };
      }
    }
};
</script>

<style>
.container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding: 20px;
}

h1, h2 {
  color: #2C3E50;
}

.settings-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  font-size: 16px;
}

.settings-block {
  background: #ECF0F1;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.settings-table {
  width: 100%;
  border-collapse: collapse;
}

.settings-table td {
  padding: 8px;
  border-top: 1px solid #BDC3C7;
}

input[type="number"] {
  width: 80px;
  padding: 8px;
  border: 1px solid #BDC3C7;
  border-radius: 4px;
  box-sizing: border-box; /* Added to include padding in the width */
}

input[type="range"] {
  width: 100%;
}

.outcome {
  background: #ECF0F1;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  font-size: 26px;
}

.run-button {
  background-color: #3498DB;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.run-button:hover {
  background-color: #2980B9;
}

#plotDiv {
  width: 100%;
  height: 800px;
  margin-top: 20px;
}
</style>
