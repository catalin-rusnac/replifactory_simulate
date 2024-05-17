// modelEquations.js

// Replaces the mu function in Python
function mu(dose, muMin, muMax, ic10Ic50Ratio, ic50) {
    const doseIc10 = ic50 * ic10Ic50Ratio;
    const kMu = Math.log(9) / (ic50 - doseIc10);
    return muMin + (muMax / (1 + Math.exp(-kMu * (ic50 - dose))));
}

// Replaces the doseEffective function in Python
function doseEffective(dose, lagTimeHrs, timeSinceAdditionHrs, slopeWidthHrs) {
    const k = Math.log(19) / (0.5 * slopeWidthHrs);
    const xValue = (timeSinceAdditionHrs - lagTimeHrs);
    const effectiveDose = dose / (1 + Math.exp(-k * xValue));
    return effectiveDose;
}

// Replaces the muEffective function in Python
function muEffective(dose, muMin, muMax, ic10Ic50Ratio, ic50, population, carryingCapacity) {
    const growthRate = mu(dose, 0, muMax, ic10Ic50Ratio, ic50);
    return muMin + growthRate * (1 - population / carryingCapacity);
}

// Replaces the adaptationRate function in Python
function adaptationRate(dose, adaptationRateMax, ic50, ic10Ic50Ratio, adaptationRateIc10Ic50Ratio) {
    const ic10 = ic50 * ic10Ic50Ratio;
    const kAdapt = -Math.log(adaptationRateIc10Ic50Ratio) / Math.pow((ic10 - ic50), 2);
    const adaptRate = adaptationRateMax * Math.exp(-kAdapt * Math.pow((dose - ic50), 2));
    return adaptRate;
}

// Export the functions to be used elsewhere in your application
export { mu, doseEffective, muEffective, adaptationRate };
