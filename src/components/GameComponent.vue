<script setup>
// from simulation/src/components/SimulationComponent.vue:


// simulateExperimentMinute() {
//         let effectiveDose = this.calculateEffectiveDose(this.timeCurrent);
//         this.effectiveDoses.push([effectiveDose, this.timeCurrent]);
//         let effectiveGrowthRate = 0;
//         if (this.population.length) {
//             effectiveGrowthRate = muEffective(effectiveDose, this.muMin, this.muMax, this.ic10Ic50Ratio,
//                                                   this.ic50s[this.ic50s.length - 1][0], this.population[this.population.length - 1][0], this.carryingCapacity);
//             this.effectiveGrowthRates.push([effectiveGrowthRate, this.timeCurrent]);
//         }
//
//         if (effectiveDose > 0) {
//             let adaptRate = adaptationRate(effectiveDose, this.adaptationRateMax, this.ic50s[this.ic50s.length - 1][0],
//                                            this.ic10Ic50Ratio, this.adaptationRateIc10Ic50Ratio);
//             this.adaptationRates.push([adaptRate, this.timeCurrent]);
//
//             let ic50 = this.ic50s[this.ic50s.length - 1][0] * Math.exp(adaptRate / 60);
//             this.ic50s.push([ic50, this.timeCurrent]);
//         }
//
//         let newPopulation = this.population.length ? this.population[this.population.length - 1][0] * Math.exp(effectiveGrowthRate / 60) : this.initialPopulation;
//         this.population.push([newPopulation, this.timeCurrent]);
//         this.updater.update(this);
//     }

// The function above are used to simulate the experiment minute by minute.
// We propose creating a game where the user can simulate the experiment and see the results in real time.
// To make the game more playful, we can add graphics and animations to the simulation.
// The following parameters used above can be used in the graphics and animations:
//     - effectiveDoses, ic50s: effective_dose/IC50 tells us how stressful the environment is for the bacteria.
//     a graphical element can be used to represent the stress level, such as a thermometer or a color scale or a stress-o-meter.
//     - effectiveGrowthRates: effective_growth_rate tells us how fast the bacteria are growing. A graphical element can be used to represent the growth rate, such as a speedometer or a growth-o-meter,
//     or the speed of an animation of dividing bacteria.
//     - adaptationRates: adaptation_rate tells us how fast the bacteria are adapting to the stress.
//     A graphical element can be used to represent the adaptation rate, such as the speed of an animated bacteria lifting weights.

</script>

<template>

</template>

<style scoped>

</style>