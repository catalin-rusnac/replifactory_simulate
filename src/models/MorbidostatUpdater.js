class MorbidostatUpdater {
    constructor(options = {}) {
        const defaults = {
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
        };

        Object.assign(this, defaults, options);
    }

    rescueConditionIsMet(model) {
        if (model.doses.length < 1) {
            return false;
        }

        const lastDilutionTime = model.doses[model.doses.length - 1][1];
        const hoursSinceLastDilution = (model.timeCurrent - lastDilutionTime) / 3600000;
        if (hoursSinceLastDilution < this.delayDilutionMaxHours) {
            return false;
        }

        if (model.growthRate > this.thresholdGrowthRateDecreaseStress) {
            return false;
        }

        console.log(model.growthRate, this.thresholdGrowthRateDecreaseStress, "Rescue condition met");
        return true;
    }
    diluteToWashIfNeeded(model) {
        // Ensure there's at least one population data point before proceeding
        if (!model.population || model.population.length === 0) {
            return;
        }

        // Start with a base target dose based on pump2 stock concentration
        let targetDose = this.pump2StockDrugConcentration * 0.02;

        // Determine the last pump time
        let lastPumpTime = model.population[0][1]; // Default to the first population entry if no doses
        if (model.doses.length > 0) {
            lastPumpTime = model.doses[model.doses.length - 1][1];
            targetDose = Math.max(targetDose, model.doses[model.doses.length - 1][0]);
        }

        // Calculate the time difference in hours between the current time and the last pump time
        const timeDifference = (model.timeCurrent.getTime() - lastPumpTime.getTime()) / 3600000; // Convert ms to hours

        // Check if the time difference exceeds the maximum allowed delay for dilution
        if (timeDifference > this.delayDilutionMaxHours) {
            console.log("Washing dilution", targetDose, "time", model.timeCurrent);
            model.diluteCulture(targetDose, 1.2);
        }
    }


    update(model) {
        if (model.population.length === 0) {
            return;
        }

        if (model.population[model.population.length - 1][0] >= this.odDilutionThreshold) {
            let targetDose = 0;
            if (model.doses.length === this.dilutionNumberInitialDose) {
                targetDose = this.doseInitialAdded;
            } else if (model.doses.length > this.dilutionNumberInitialDose) {
                targetDose = model.doses[model.doses.length - 1][0];
                // const lastDoseChangeTime = model.doses.reduceRight((acc, dose) => (dose[0] !== model.doses[model.doses.length - 1][0] ? dose[1] : acc), 0);

                const lastDoseChangeTime = model.doses.reduceRight((acc, dose, index, array) => {
                    if (acc !== null) {
                        return acc;  // If already found, keep returning the found value
                    }
                    // Check if the current dose is different from the last dose and not already found
                    if (index > 0 && dose[0] !== array[index - 1][0]) {
                        return dose[1];  // Return the timestamp of the dose change
                    }
                    return null;  // Continue if no change is found yet
                }, null);


                console.log("Last dose change time", lastDoseChangeTime);
                const generationAtLastDoseChange = model.generations.find(gen => gen[1] >= lastDoseChangeTime)[0];
                const generationsSinceLastDoseChange = model.generations[model.generations.length - 1][0] - generationAtLastDoseChange;
                const generationsPerDilution = Math.log(this.dilutionFactor) / Math.log(2);
                if (model.growthRate > this.thresholdGrowthRateIncreaseStress &&
                    generationsSinceLastDoseChange + generationsPerDilution > this.delayStressIncreaseMinGenerations) {
                    targetDose *= this.doseIncreaseFactor;
                    console.log("Stress increase from", model.doses[model.doses.length - 1][0], "to", targetDose, "due to growth rate increase");
                    targetDose = Math.round(targetDose * 1000) / 1000;  // Keep three decimals
                }
            }
            console.log("Dilution to target dose", targetDose,"time", model.timeCurrent);
            model.diluteCulture(targetDose);
        } else if (this.rescueConditionIsMet(model)) {
            console.log("Rescue dilution");
            model.diluteCulture(0);
        }
        this.diluteToWashIfNeeded(model);
    }
}

export default MorbidostatUpdater;