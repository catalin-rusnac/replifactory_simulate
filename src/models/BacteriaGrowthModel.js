// Imports: Assuming you have separate modules for specific functionalities
import { doseEffective, muEffective, adaptationRate } from './ModelEquations.js';
import MorbidostatUpdater from './MorbidostatUpdater.js';
import Plotly from 'plotly.js-dist-min';

class BacteriaGrowthModel {
    constructor(options = {}) {
        // Default values
        this.defaults = {
            initialPopulation: 0.01,
            doublingTimeMins: 20,
            carryingCapacity: 0.9,
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
            timeCurrent: new Date(),  // This will handle the current time
            updater: new MorbidostatUpdater()  // Placeholder for an update method class
        };


        // Merge defaults with user-provided options
        Object.assign(this, this.defaults, options);

        // Calculate maximum growth rate from doubling time
        this.muMax = Math.log(2) / (this.doublingTimeMins / 60);

        // Initialize model state
        this.initializeModelState();
    }

    initializeModelState() {
        this.timeCurrent = new Date();
        this.population = [];
        this.generations = [];
        this.doses = [];
        this.effectiveDoses = [];
        this.ic50s = [[this.ic50Initial, this.timeCurrent]];
        this.effectiveGrowthRates = [];
        this.adaptationRates = [];
    }

    get growthRate() {
        return this.effectiveGrowthRates.length ? this.effectiveGrowthRates[this.effectiveGrowthRates.length - 1][0] : 0;
    }

    calculateEffectiveDose(timeCurrent) {
        // Check if there are any effective doses yet
        if (this.effectiveDoses.length === 0) {
            let currentEffectiveDose = this.doses.length > 0 ? this.doses[0][0] : 0;
            this.effectiveDoses.push([currentEffectiveDose, this.timeCurrent]);
        }

        let effectiveDose = this.effectiveDoses[0][0];  // Initial effective dose
        const initialEquilibriumDose = 0; // Define initial equilibrium dose
        if (this.doses.length > 1) {
            // Include initial equilibrium dose for calculation
            const doses = [initialEquilibriumDose].concat(this.doses.map(dose => dose[0]));
            const dilutionTimes = this.doses.map(dose => dose[1]);

            // Loop through all added doses starting from the first computed difference
            for (let i = 1; i < doses.length; i++) {
                let addedDose = doses[i] - doses[i - 1];
                if (addedDose === 0) continue;

                // Calculate hours since the drug was added
                let timeSinceAdditionHrs = (timeCurrent - dilutionTimes[i-1]) / 3600000;  // Convert milliseconds to hours
                effectiveDose += doseEffective(addedDose, this.timeLagDrugEffectMins / 60, timeSinceAdditionHrs, this.doseEffectiveSlopeWidthMins / 60);
            }
        }
        // this.effectiveDoses.push([effectiveDose, this.timeCurrent]);
        return effectiveDose;
    }



    simulateExperimentMinute() {
        let effectiveDose = this.calculateEffectiveDose(this.timeCurrent);
        this.effectiveDoses.push([effectiveDose, this.timeCurrent]);
        let effectiveGrowthRate = 0;
        if (this.population.length) {
            effectiveGrowthRate = muEffective(effectiveDose, this.muMin, this.muMax, this.ic10Ic50Ratio,
                                                  this.ic50s[this.ic50s.length - 1][0], this.population[this.population.length - 1][0], this.carryingCapacity);
            this.effectiveGrowthRates.push([effectiveGrowthRate, this.timeCurrent]);
        }

        if (effectiveDose > 0) {
            let adaptRate = adaptationRate(effectiveDose, this.adaptationRateMax, this.ic50s[this.ic50s.length - 1][0],
                                           this.ic10Ic50Ratio, this.adaptationRateIc10Ic50Ratio);
            this.adaptationRates.push([adaptRate, this.timeCurrent]);

            let ic50 = this.ic50s[this.ic50s.length - 1][0] * Math.exp(adaptRate / 60);
            this.ic50s.push([ic50, this.timeCurrent]);
        }

        let newPopulation = this.population.length ? this.population[this.population.length - 1][0] * Math.exp(effectiveGrowthRate / 60) : this.initialPopulation;
        this.population.push([newPopulation, this.timeCurrent]);
        this.updater.update(this);
    }

    diluteCulture(targetDose = 0, dilutionFactor = 1.6) {
        dilutionFactor = this.updater.dilutionFactor;
        // Assume updater object contains necessary properties and methods
        const addedVolume = this.updater.volumeVial * (dilutionFactor - 1);
        const stockConcentrationHigh = this.updater.pump2StockDrugConcentration;
        const stockConcentrationLow = this.updater.pump1StockDrugConcentration;
        const currentDose = this.drugConcentration;
        const currentVolume = this.updater.volumeVial;

        // Calculate the maximum and minimum possible new doses
        const maxDose = (currentDose * currentVolume + stockConcentrationHigh * addedVolume) / (currentVolume + addedVolume);
        const minDose = (currentDose * currentVolume + stockConcentrationLow * addedVolume) / (currentVolume + addedVolume);

        // Ensure the target dose is within the calculated range
        targetDose = Math.min(targetDose, maxDose);
        targetDose = Math.max(targetDose, minDose);

        // Calculate the added dose to reach the target dose
        const addedDose = targetDose - currentDose;
        this.drugConcentration += addedDose;

        // Update the model's doses record
        this.doses.push([this.drugConcentration, this.timeCurrent]);

        // Adjust the population size based on the dilution factor
        if (this.population.length > 0) {
            const lastPopulation = this.population[this.population.length - 1][0] / dilutionFactor;
            this.population[this.population.length - 1] = [lastPopulation, this.timeCurrent];
        }

        // Update generation number based on dilution
        let generationNumber = Math.log2(dilutionFactor);
        if (this.generations.length > 0) {
            generationNumber += this.generations[this.generations.length - 1][0];
        }
        this.generations.push([generationNumber, this.timeCurrent]);
    }


    simulateExperiment(simulationHours = 48) {
        for (let t = 1; t <= simulationHours * 60; t++) {
            this.timeCurrent = new Date(this.timeCurrent.getTime() + 60000);  // Add one minute
            this.simulateExperimentMinute();
        }
    }
plotSimulation(simulationHours) {
    this.simulateExperiment(simulationHours);
    this.getSimulationEfficiency();

    // Prepare the data for plotting
    const times = this.population.map(item => item[1]);
    const ods = this.population.map(item => item[0]);
    const growthRates = this.effectiveGrowthRates.map(item => ({ x: item[1], y: item[0] }));
    const ic50s = this.ic50s.map(item => ({ x: item[1], y: item[0] }));
    const doses = this.doses.map(item => ({ x: item[1], y: item[0] }));
    const adaptationRates = this.adaptationRates.map(item => ({ x: item[1], y: item[0] }));
    const generations = this.generations.map(item => ({ x: item[1], y: item[0] }));

    // Create traces
    const tracePopulation = {
        x: times,
        y: ods,
        mode: 'markers',
        name: 'Bacteria Population',
        marker: { color: 'black', dash: 'dot', width: 1 }
    };
    const traceGrowthRate = {
        x: growthRates.map(gr => gr.x),
        y: growthRates.map(gr => gr.y),
        mode: 'lines+markers',
        name: 'Effective Growth Rate',
        yaxis: 'y2',
        line: { color: 'blue' }
    };
    const traceIC50 = {
        x: ic50s.map(ic => ic.x),
        y: ic50s.map(ic => ic.y),
        mode: 'lines',
        name: 'IC50',
        yaxis: 'y4',
        // small transparent line to show the IC50 value, no dots
        line: { color: 'green', width: 1, dash: 'dot' }
    };
    const traceDoses = {
        x: doses.map(d => d.x),
        y: doses.map(d => d.y),
        mode: 'lines+markers',
        name: 'Dose',
        yaxis: 'y4',
        line: {
            color: 'green',
            shape: 'hv', // Sets the line to be horizontal then vertical
            width: 2
        }
    };
        // trace effective dose
    const traceEffectiveDoses = {
        x: this.effectiveDoses.map(ed => ed[1]),
        y: this.effectiveDoses.map(ed => ed[0]),
        mode: 'lines',
        name: 'Effective Dose',
        yaxis: 'y4',
        line: { color: 'green', width: 1 }
    };

    const traceAdaptationRates = {
        x: adaptationRates.map(ar => ar.x),
        y: adaptationRates.map(ar => ar.y),
        mode: 'lines',
        name: 'Adaptation Rate',
        yaxis: 'y5',
        line: { color: 'violet' }
    };
    const traceGenerations = {
        x: generations.map(g => g.x),
        y: generations.map(g => g.y),
        mode: 'lines+markers',
        name: 'Generations',
        yaxis: 'y6',
        line: { color: 'red' }
    };

    // Setup layout
    const layout = {
        title: '',
        xaxis: { title: 'Time' },
        yaxis: { title: 'Optical Density' },
        yaxis2: {
            title: 'Effective Growth Rate',
            overlaying: 'y',
            side: 'right'
        },
        // yaxis3: {
        //     title: 'IC50',
        //     overlaying: 'y',
        //     side: 'right',
        //     position: 0.95
        // },
        yaxis4: {
            title: 'Dose',
            overlaying: 'y',
            side: 'right',
            position: 0.90
        },
        yaxis5: {
            title: 'Adaptation Rate',
            overlaying: 'y',
            side: 'right',
            position: 0.85
        },
        yaxis6: {
            title: 'Generations',
            overlaying: 'y',
            side: 'right',
            position: 0.80
        }
    };

    // Plotting
    const data = [tracePopulation, traceGrowthRate, traceIC50, traceDoses,traceEffectiveDoses, traceAdaptationRates, traceGenerations];
    Plotly.newPlot('plotDiv', data, layout);
}

getSimulationEfficiency() {
    const dilutionFactor = this.updater.dilutionFactor;
    const addedVolume = this.updater.volumeVial * (dilutionFactor - 1);
    const volumeUsed = this.doses.length * addedVolume;
    const ic50FoldChange = this.ic50s[this.ic50s.length - 1][0] / this.ic50s[0][0];
    const totalTime = (this.population[this.population.length - 1][1] - this.population[0][1]) / 3600000;
    // const volumePerIC50Doubling = volumeUsed / Math.log2(ic50FoldChange);
    // const timePerIC50Doubling = totalTime / Math.log2(ic50FoldChange);
    // console.log(`Volume Used: ${volumeUsed.toFixed(1)} ml, Total Time: ${totalTime.toFixed(1)} hours, IC50 fold change: ${ic50FoldChange.toFixed(2)}`);
    // console.log(`Volume per IC50 doubling: ${volumePerIC50Doubling.toFixed(1)} ml`);
    // console.log(`Time per IC50 doubling: ${timePerIC50Doubling.toFixed(1)} hours`);
    return [volumeUsed, totalTime, ic50FoldChange];
}
}

export default BacteriaGrowthModel;
