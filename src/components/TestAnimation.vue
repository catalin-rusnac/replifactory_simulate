<template>
  <div id="myDiv"></div>
</template>

<script>
import Plotly from 'plotly.js-dist-min';

export default {
  name: 'LorenzAttractor',
  data() {
    return {
      n: 100,
      x: [],
      y: [],
      z: [],
      dt: 0.015
    };
  },
  mounted() {
    // Initialize data arrays
    for (let i = 0; i < this.n; i++) {
      this.x[i] = Math.random() * 2 - 1;
      this.y[i] = Math.random() * 2 - 1;
      this.z[i] = 30 + Math.random() * 10;
    }

    // Initialize the plot
    Plotly.newPlot('myDiv', [{
      x: this.x,
      y: this.z,
      mode: 'markers'
    }], {
      xaxis: { range: [-40, 40] },
      yaxis: { range: [0, 60] }
    });

    // Start the animation
    requestAnimationFrame(this.update);
  },
  methods: {
    compute() {
      const s = 10, b = 8 / 3, r = 28;
      let dx, dy, dz;
      let xh, yh, zh;
      for (let i = 0; i < this.n; i++) {
        dx = s * (this.y[i] - this.x[i]);
        dy = this.x[i] * (r - this.z[i]) - this.y[i];
        dz = this.x[i] * this.y[i] - b * this.z[i];

        xh = this.x[i] + dx * this.dt * 0.5;
        yh = this.y[i] + dy * this.dt * 0.5;
        zh = this.z[i] + dz * this.dt * 0.5;

        dx = s * (yh - xh);
        dy = xh * (r - zh) - yh;
        dz = xh * yh - b * zh;

        this.x[i] += dx * this.dt;
        this.y[i] += dy * this.dt;
        this.z[i] += dz * this.dt;
      }
    },
    update() {
      this.compute();

      Plotly.animate('myDiv', {
        data: [{ x: this.x, y: this.z }]
      }, {
        transition: {
          duration: 0
        },
        frame: {
          duration: 0,
          redraw: false
        }
      });

      requestAnimationFrame(this.update);
    }
  }
};
</script>

<style scoped>
#myDiv {
  width: 100%;
  height: 100%;
}
</style>
