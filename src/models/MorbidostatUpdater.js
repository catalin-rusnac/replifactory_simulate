class MorbidostatUpdater {
    constructor(options = {}) {
        const defaults = {
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
        };

        Object.assign(this, defaults, options);
    }

    rescueIfNecessary(model) {
        if (model.doses.length < 1) {
            return; // First dilution has not occurred yet, no need to rescue
        }

        const lastDilutionTime = model.doses[model.doses.length - 1][1];
        const hoursSinceLastDilution = (model.timeCurrent - lastDilutionTime) / 3600000;
        if (hoursSinceLastDilution < this.delayDilutionMaxHours) {
            return; // Last dilution was too recent
        }

        if (model.growthRate > this.thresholdGrowthRateDecreaseStress) {
            return; // Growth rate is too high, no need to rescue
        }

        console.log("Rescue dilution"); // All conditions for rescue are met
        model.diluteCulture(0, this.dilutionFactor);
    }

    calculateIncreasedDose(currentDose) {
        const newDose = currentDose * this.doseIncreaseFactor + this.doseIncreaseAmount;
        return Math.round(newDose * 1000) / 1000; // Keep three decimals
    }

    diluteToWashIfNeeded(model) {
        const minimumPumpedVolume = 0.1;
        const washingDilutionFactor = 1.2;
        const pump2Volume = minimumPumpedVolume;
        const pump1Volume = this.volumeVial * washingDilutionFactor - pump2Volume;
        const currentDose = model.doses.length > 0 ? model.doses[model.doses.length - 1][0] : 0;
        const totalVolume = this.volumeVial + pump1Volume + pump2Volume;
        const targetDose = (this.volumeVial * currentDose + pump1Volume * this.pump1StockDrugConcentration +
            pump2Volume * this.pump2StockDrugConcentration) / totalVolume;

        if (!model.population || model.population.length === 0) {
            return;
        }

        if (this.delayDilutionMaxHours < 0) { // Time triggered dilution disabled
            return;
        }

        const lastPumpTime = model.doses.length > 0 ? model.doses[model.doses.length - 1][1] : model.firstOdTimestamp;
        const timeDifference = (model.timeCurrent - lastPumpTime) / 3600000;

        if (timeDifference > this.delayDilutionMaxHours) {
            console.log("Washing dilution, target dose", targetDose, "time_current", model.timeCurrent);
            model.diluteCulture(targetDose, washingDilutionFactor);
        }
    }

    isTimeToIncreaseDose(model) {
        let timeToIncreaseDose = true;

        if ([this.thresholdGrowthRateIncreaseStress, this.delayStressIncreaseMinGenerations, this.doseIncreaseFactor, this.dilutionNumberFirstDrugAddition].includes(-1)) {
            timeToIncreaseDose = false; // Stress increase disabled
        }

        if (model.population[model.population.length - 1][0] < this.thresholdOdMinIncreaseStress) {
            timeToIncreaseDose = false; // OD too low
        }

        if (model.growthRate < this.thresholdGrowthRateIncreaseStress) {
            timeToIncreaseDose = false; // Growth rate too low
        }

        if (this.delayStressIncreaseMinGenerations !== -1 && model.doses.length > 0) {
            const lastDoseChangeTime = model.doses.reduceRight((acc, dose, index, array) => {
                if (acc !== null) {
                    return acc;  // If already found, keep returning the found value
                }
                if (index > 0 && dose[0] !== array[index - 1][0]) {
                    return dose[1];  // Return the timestamp of the dose change
                }
                return null;  // Continue if no change is found yet
            }, null);

            const generationAtLastDoseChange = model.generations.find(gen => gen[1] >= lastDoseChangeTime)[0];
            const generationsSinceLastDoseChange = model.generations[model.generations.length - 1][0] - generationAtLastDoseChange;

            if (generationsSinceLastDoseChange <= this.delayStressIncreaseMinGenerations) {
                timeToIncreaseDose = false; // Stress increase too recent
            }
        }

        if (model.doses.length < this.dilutionNumberFirstDrugAddition) {
            timeToIncreaseDose = false; // No stress increase before initial drug addition
        }

        return timeToIncreaseDose;
    }

    isTooEarlyForRegularDilution(model) {
        if (model.population.length === 0) {
            return true; // No OD measurements yet
        }

        if (model.doses.length > 0) {
            const odTimestamp = model.population[model.population.length - 1][1];
            const dosesTimestamp = model.doses[model.doses.length - 1][1];
            const minimumDurationMinutes = 1;

            if (odTimestamp < dosesTimestamp + minimumDurationMinutes * 60000) {
                return true; // No OD measurement since the last dilution
            }
        }

        return false;
    }

    isTimeToDilute(model) {
        if (this.odDilutionThreshold !== -1 && model.population[model.population.length - 1][0] >= this.odDilutionThreshold) {
            return true; // OD threshold reached
        }

        if (this.delayDilutionMaxHours !== -1) {
            if (model.doses.length > 0) {
                const timeDifference = (model.timeCurrent - model.doses[model.doses.length - 1][1]) / 3600000;
                if (timeDifference > this.delayDilutionMaxHours) {
                    return true; // Time threshold reached
                }
            } else {
                const timeSinceLastDilution = (model.timeCurrent - model.firstOdTimestamp) / 3600000;
                if (timeSinceLastDilution > this.delayDilutionMaxHours) {
                    return true; // Time threshold reached
                }
            }
        }

        return false;
    }

    update(model) {
        // Initialization dose immediately after experiment start
        if (this.doseInitialization > 0 && model.doses.length === 0) {
            model.diluteCulture(this.doseInitialization);
            return;
        }

        // Check if it is too early for regular dilution
        if (this.isTooEarlyForRegularDilution(model)) {
            return;
        }

        // Regular dilution
        if (this.isTimeToDilute(model)) {
            let targetDose;
            if (this.dilutionNumberFirstDrugAddition < 0) {
                targetDose = this.pump1StockDrugConcentration;
            } else if (model.doses.length === this.dilutionNumberFirstDrugAddition - 1) {
                targetDose = this.doseFirstDrugAddition;
            } else {
                targetDose = model.doses.length > 0 ? model.doses[model.doses.length - 1][0] : this.pump1StockDrugConcentration;
                if (model.doses.length > this.dilutionNumberFirstDrugAddition && this.isTimeToIncreaseDose(model)) {
                    targetDose = this.calculateIncreasedDose(model.doses[model.doses.length - 1][0]);
                }
            }
            model.diluteCulture(targetDose);
            return;
        }
        this.rescueIfNecessary(model);
        this.diluteToWashIfNeeded(model);
    }
}

export default MorbidostatUpdater;
