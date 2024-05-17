<template>
    <h1>Evolution Experiment Simulation</h1>
    <div class="settings-container">
      <!-- Updater Settings -->
      <div class="settings-block">
        <h2>Culture Control Parameters</h2>
        <table class="settings-table">
          <tr v-for="(value, key) in updaterSettings" :key="'updater-' + key">
            <td>{{ key }}</td>
            <td><input v-model="updaterSettings[key]" type="number"></td>
          </tr>
        </table>
      </div>
      <!-- Model Settings -->
      <div class="settings-block">
        <h2>Culture Growth Model Parameters</h2>
        <table class="settings-table">
          <tr v-for="key in modelSettingsKeys" :key="'model-' + key">
            <td>{{ key }}</td>
            <td><input v-model="modelSettings[key]" type="number"></td>
          </tr>
        </table>
      </div>

    <div class="outcome">
      <h2>Outcome</h2>
<!--      highlight numbers in bold-->
      <p>Volume Used: {{ volumeUsed }} ml</p>
      <p>IC50 Fold Change: <b>{{ ic50FoldChange }}</b></p>
      <p>Volume per IC50 Doubling: <b>{{ volumePerIC50Doubling }}</b> ml</p>
      <p>Time per IC50 Doubling: <b>{{ timePerIC50Doubling }}</b> hours</p>

      <text>Duration [h]: </text>
    <input v-model="simulationHours" type="number">
    <br>
          <button class="run-button" @click="runSimulation">Recalculate</button>

    </div>

          </div>
    <div id="plotDiv"></div>
    <div id="adaptation-rate-plot"></div>
    <div id="mu-plot"></div>
</template>



<script>
import BacteriaGrowthModel from '../models/BacteriaGrowthModel';
import MorbidostatUpdater from '../models/MorbidostatUpdater';
import ParameterPlotting from '@/models/ParameterPlotting';
export default {
  name: 'SimulationComponent',
  data() {
    return {
      updaterSettings: {
        odDilutionThreshold: 0.3,
        dilutionFactor: 1.6,
        dilutionNumberInitialDose: 1,
        doseInitialAdded: 10,
        doseIncreaseFactor: 2,
        thresholdGrowthRateIncreaseStress: 0.15,
        thresholdGrowthRateDecreaseStress: -0.1,
        delayDilutionMaxHours: 3,
        delayStressIncreaseMinGenerations: 3,
        volumeVial: 12,
        pump1StockDrugConcentration: 0,
        pump2StockDrugConcentration: 300
      },
      modelSettings: {
        initialPopulation: 0.01,
        doublingTimeMins: 20,
        carryingCapacity: 2,
        muMin: -0.1,
        ic50Initial: 5,
        ic10Ic50Ratio: 0.5,
        doseEffectiveSlopeWidthMins: 120,
        timeLagDrugEffectMins: 30,
        adaptationRateMax: 0.08,
        adaptationRateIc10Ic50Ratio: 0.8,
        generationCurrent: 0,
        drugConcentration: 0,
        effectiveDose: 0,
        timeCurrent: new Date()
      },
      settingsTsv: '', // To store the TSV data
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
        'adaptationRateIc10Ic50Ratio',]

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
      const model = new BacteriaGrowthModel({
        ...this.modelSettings,
        updater: updater
      });
      model.plotSimulation(this.simulationHours);
      // [volumeUsed, totalTime, ic50FoldChange] = model.getSimulationEfficiency();
      let [volumeUsed, totalTime, ic50FoldChange] = model.getSimulationEfficiency();
      const volumePerIC50Doubling = volumeUsed / Math.log2(ic50FoldChange);
      const timePerIC50Doubling = totalTime / Math.log2(ic50FoldChange);
      // console.log(`Volume Used: ${volumeUsed.toFixed(1)} ml, Total Time: ${totalTime.toFixed(1)} hours, IC50 fold change: ${ic50FoldChange.toFixed(2)}`);
      // console.log(`Volume per IC50 doubling: ${volumePerIC50Doubling.toFixed(1)} ml`);
      // console.log(`Time per IC50 doubling: ${timePerIC50Doubling.toFixed(1)} hours`);
      this.volumeUsed = volumeUsed.toFixed(1);
      this.totalTime = totalTime.toFixed(1);
      this.ic50FoldChange = ic50FoldChange.toFixed(2);
      this.volumePerIC50Doubling = volumePerIC50Doubling.toFixed(1);
      this.timePerIC50Doubling = timePerIC50Doubling.toFixed(1);

      const parameterPlotting = new ParameterPlotting(model);
      parameterPlotting.plot_mu();
      parameterPlotting.plot_adaptation_rate();

      this.generateTsv();

    },
    generateTsv() {
      const allSettings = { ...this.updaterSettings, ...this.modelSettings };
      this.settingsTsv = Object.entries(allSettings)
                               .map(([key, value]) => `${key}\t${value}`)
                               .join('\n');
    },

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

input {
  width: 80px;
  padding: 8px;
  border: 1px solid #BDC3C7;
  border-radius: 4px;
  box-sizing: border-box; /* Added to include padding in the width */
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
