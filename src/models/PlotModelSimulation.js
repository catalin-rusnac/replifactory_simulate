import Plotly from 'plotly.js-dist-min';

export function plotModelSimulation(model, simulationHours = 48) {
    model.simulateExperiment(simulationHours);
    model.getSimulationEfficiency();

    const times = model.population.map(item => item[1]);
    const ods = model.population.map(item => item[0]);
    const growthRates = model.effectiveGrowthRates.map(item => ({x: item[1], y: item[0]}));
    const ic50s = model.ic50s.map(item => ({x: item[1], y: item[0]}));
    const doses = model.doses.map(item => ({x: item[1], y: item[0]}));
    const adaptationRates = model.adaptationRates.map(item => ({x: item[1], y: item[0]}));
    const generations = model.generations.map(item => ({x: item[1], y: item[0]}));

    const tracePopulation = {
        x: times,
        y: ods,
        mode: 'markers',
        name: 'Bacteria Population',
        marker: {color: 'black', size: 5}
    };
    const traceGrowthRate = {
        x: growthRates.map(gr => gr.x),
        y: growthRates.map(gr => gr.y),
        mode: 'lines+markers',
        name: 'Effective Growth Rate',
        yaxis: 'y2',
        line: {color: 'blue'}
    };
    const traceIC50 = {
        x: ic50s.map(ic => ic.x),
        y: ic50s.map(ic => ic.y),
        mode: 'lines',
        name: 'IC50',
        yaxis: 'y4',
        line: {color: 'green', width: 1, dash: 'dot'}
    };
    const traceDoses = {
        x: doses.map(d => d.x),
        y: doses.map(d => d.y),
        mode: 'lines+markers',
        name: 'Dose',
        yaxis: 'y4',
        line: {color: 'green', shape: 'hv', width: 2}
    };
    const traceEffectiveDoses = {
        x: model.effectiveDoses.map(ed => ed[1]),
        y: model.effectiveDoses.map(ed => ed[0]),
        mode: 'lines',
        name: 'Effective Dose',
        yaxis: 'y4',
        line: {color: 'green', width: 1}
    };
    const traceAdaptationRates = {
        x: adaptationRates.map(ar => ar.x),
        y: adaptationRates.map(ar => ar.y),
        mode: 'lines',
        name: 'Adaptation Rate',
        yaxis: 'y5',
        line: {color: 'violet'}
    };
    const traceGenerations = {
        x: generations.map(g => g.x),
        y: generations.map(g => g.y),
        mode: 'lines+markers',
        name: 'Generations',
        yaxis: 'y6',
        line: {color: 'red'}
    };

    const layout = {
        title: '',
        xaxis: {title: 'Time'},
        yaxis: {title: 'Optical Density'},
        yaxis2: {title: 'Effective Growth Rate', overlaying: 'y', side: 'right'},
        yaxis4: {title: 'Dose', overlaying: 'y', side: 'right', position: 0.90},
        yaxis5: {title: 'Adaptation Rate', overlaying: 'y', side: 'right', position: 0.85},
        yaxis6: {title: 'Generations', overlaying: 'y', side: 'right', position: 0.80}
    };

    const data = [tracePopulation, traceGrowthRate, traceIC50, traceDoses, traceEffectiveDoses, traceAdaptationRates, traceGenerations];

    Plotly.newPlot('plotDiv', data, layout).then(() => {
    }).catch(error => {
        console.error('Error in plotSimulation:', error);
    });
}