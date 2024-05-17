import { muEffective, adaptationRate } from './ModelEquations.js';

import Plotly from 'plotly.js-dist-min';


// usage in vue:
// import ParameterPlotting from '@/models/ParameterPlotting';
// const parameterPlotting = new ParameterPlotting(model);
// parameterPlotting.plot_mu();

export default class ParameterPlotting {
    constructor(model = null) {
        this.model = model;
    }

    plot_mu() {
        const doses = Array.from({ length: 1000 }, (_, i) => i * 0.1);
        const muMin = this.model.muMin;
        const muMax = this.model.muMax;
        const ic50 = this.model.ic50Initial;
        const ic10Ic50Ratio = this.model.ic10Ic50Ratio;

        const muValues = doses.map(dose => muEffective(dose, muMin, muMax, ic10Ic50Ratio, ic50, 0.5, 1));

        const data = [
        {
            x: doses,
            y: muValues,
            type: 'scatter',
            mode: 'lines',
            line: {
            color: 'blue',
            },
        },
        ];

        const layout = {
        title: 'Effect of Drug Dose on Growth Rate',
        xaxis: {
            title: 'Effective Drug Dose',
        },
        yaxis: {
            title: 'Growth Rate [1/hour]',
        },
        };

        Plotly.newPlot('mu-plot', data, layout);
    }

    plot_adaptation_rate() {
    const doses = Array.from({ length: 1000 }, (_, i) => i * 0.1);
    const adaptationRateMax = this.model.adaptationRateMax;
    const ic50 = this.model.ic50Initial;
    const ic10Ic50Ratio = this.model.ic10Ic50Ratio;
    const adaptationRateIc10Ic50Ratio = this.model.adaptationRateIc10Ic50Ratio;

    // Generate y values for each dose using the adaptationRate function
    const yValues = doses.map(dose => adaptationRate(dose, adaptationRateMax, ic50, ic10Ic50Ratio, adaptationRateIc10Ic50Ratio));

    const data = [{
        x: doses,
        y: yValues,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'black',
        },
    }];

    const layout = {
        title: 'Effect of Antibiotic Dose on Adaptation Rate',
        xaxis: {
            title: 'Effective Antibiotic Dose',
        },
        yaxis: {
            title: 'Adaptation Rate [1/hour]',
        },
    };

    Plotly.newPlot('adaptation-rate-plot', data, layout);
}
}
