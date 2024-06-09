<template>
  <div>
    <!-- Lottie animation container -->
    <div class="animation-wrapper" :style="{ backgroundColor: backgroundColor }">
      <div class="bact-wrapper">
        <div ref="bactAnimationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px` }" class="lottie-animation" />
        <div ref="dnaAnimationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px` }" class="lottie-animation dna-overlay" />
        <div ref="hammerAnimationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px` }" class="lottie-animation hammer-overlay" />
        <div ref="shieldAnimationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px`, transform: `scaleX(-1) translateY(50px) translateX(-200px) scale(${shieldSize})`, opacity: shieldOpacity }" class="lottie-animation shield-overlay" />
      </div>
      <div class="death-wrapper" :style="{ width: `${animationSize}px`, height: `${animationSize}px`,transform: `translateX(300px)` }">
        <div ref="deathAnimationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px`, transform: `translateX(${deathPosition}px) scale(${deathScale})` }" class="lottie-animation death-overlay" />
      </div>
    </div>

    <div class="controls">
      <!-- DNA animation speed slider -->
      <label for="adaptationRate">Adaptation rate: {{ adaptationRate }}</label>
      <input type="range" id="adaptationRate" class="slider" :min="0" :max="0.1" :step="0.001" v-model="adaptationRate" />

      <label for="bactGrowthRate">Growth Rate: {{ bactGrowthRate }}</label>
      <input type="range" id="bactGrowthRate" class="slider" :min="-0.1" :max="2" :step="0.01" v-model="bactGrowthRate" />
      <label for="dose">Current Concentration: {{ currentDose }}</label>
      <input type="range" id="currentDose" class="slider" :min="0" :max="100" :step="1" v-model="currentDose" />
      <!-- Slider for currentIC50-->
      <label for="IC50">Half-Inhibitory Concentration: {{ IC50 }}</label>
      <input type="range" id="IC50" class="slider" :min="0" :max="100" :step="1" v-model="IC50" />
    </div>
  </div>
</template>

<script>
import lottie from 'lottie-web';

export default {
  name: 'LottieAnimation',
  data() {
    return {
      bactPath: '/bact.json', // Path to the animation file
      bactGrowthRate: 1, // Default speed

      dnaPath: '/DNA3.json', // Path to the animation file
      adaptationRate: 0.005, // Default speed

      hammerPath: '/hammer2.json', // Path to the animation file
      hammerSpeed: 1, // Default speed

      shieldPath: '/shield.json', // Path to the animation file
      shieldSize: 0, // Default size
      shieldOpacity: 0.7, // Default opacity

      deathPath: '/death.json', // Path to the animation file
      deathDistance: 1, // Default distance
      deathPosition: 900, // Default death position

      animationSize: 800, // Default size
      currentDose: 0,

      backgroundShade: 0, // Default green shade
      deathScale: 1, // Default death scale
      IC50_initial: 5,
      IC50: 5,
    };
  },
  computed: {
    backgroundColor() {
      return `rgb(255, ${255 - this.backgroundShade},  ${255 - this.backgroundShade})`;
    },
  },
  watch: {
    IC50(newIC50) {
      this.updateShieldProperties(newIC50);
    },
    bactGrowthRate(newRate) {
      this.updateBactGrowth(newRate);
    },
    adaptationRate(newRate) {
      this.updateAdaptation(newRate);
    },
    currentDose(newDose) {
      this.updateBackgroundShade(newDose);
    },
  },
  mounted() {
    this.loadAllAnimations().then(() => {
      // Manually trigger watchers to set initial values
      this.updateShieldProperties(this.IC50);
      this.updateBactGrowth(this.bactGrowthRate);
      this.updateAdaptation(this.adaptationRate);
      this.updateBackgroundShade(this.currentDose);
    });
  },
  methods: {
    updateShieldProperties(newIC50) {
      const Adaptation = newIC50 / this.IC50_initial;
      const MaxShieldSize = 1.5;
      const MinShieldSize = 0.2;
      const MaxMaxAdaptation = 15;
      const MaxAdaptation = 10;
      const MinAdaptation = 2;
      const MaxOpacity = 0.9;
      const MinOpacity = 0.7;

      if (Adaptation < MinAdaptation) {
        this.shieldSize = 0;
      } else if (Adaptation < MaxAdaptation) {
        this.shieldSize = (Adaptation - MinAdaptation) * (MaxShieldSize - MinShieldSize) / (MaxAdaptation - MinAdaptation) + MinShieldSize;
      } else {
        this.shieldSize = MaxShieldSize;
      }

      if (Adaptation < MaxAdaptation) {
        this.shieldOpacity = MinOpacity;
      } else if (Adaptation < MaxMaxAdaptation) {
        this.shieldOpacity = (Adaptation - MaxAdaptation) * (MaxOpacity - MinOpacity) / (MaxMaxAdaptation - MaxAdaptation) + MinOpacity;
      } else {
        this.shieldOpacity = MaxOpacity;
      }
    },
    updateBactGrowth(newRate) {
      const newSpeed = newRate * 30 / 2;
      if (newSpeed < 0) {
        const minAnimationSize = 600;
        const maxAnimationSize = 800;
        const minRate = -0.1;
        const maxRate = 0;
        this.animationSize = minAnimationSize + (newRate - minRate) * (maxAnimationSize - minAnimationSize) / (maxRate - minRate);
        this.bactAnimation.setSpeed(0);
      } else {
        this.bactAnimation.setSpeed(newSpeed);
      }
      if (newRate > 0.1) {
        this.deathPosition = 1200;
      } else if (newRate < -0.1) {
        this.deathPosition = 0;
      } else {
        this.deathPosition = 600 + (newRate * 6000);
      }
    },
    updateAdaptation(newRate) {
      const newSpeed = this.convertAdaptationRateToSpeed(newRate);
      this.dnaAnimation.setSpeed(newSpeed);
      if (newRate > 0.01) {
        if (this.hammerAnimation.currentFrame === 90) {
          this.hammerAnimation.playSegments([0, 69], true);
        }
        this.hammerAnimation.setSpeed(newSpeed);
      } else {
        this.hammerAnimation.goToAndStop(90, true);
      }
    },
    updateBackgroundShade(newDose) {
      this.backgroundShade = Math.round((newDose / 100) * 255);
    },
    convertAdaptationRateToSpeed(rate) {
      const maxSpeed = 10;
      const maxRate = 0.1;
      const ratio = maxSpeed / maxRate;
      return rate * ratio;
    },
    async loadGenericAnimation(path, container) {
      const response = await fetch(path);
      const animationData = await response.json();
      return lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData,
      });
    },
    async loadAllAnimations() {
      this.bactAnimation = await this.loadGenericAnimation(this.bactPath, this.$refs.bactAnimationContainer);
      this.bactAnimation.setSpeed(0);
      this.dnaAnimation = await this.loadGenericAnimation(this.dnaPath, this.$refs.dnaAnimationContainer);
      this.dnaAnimation.setSpeed(this.convertAdaptationRateToSpeed(this.adaptationRate));
      this.hammerAnimation = await this.loadGenericAnimation(this.hammerPath, this.$refs.hammerAnimationContainer);
      this.hammerAnimation.setSpeed(0); // Initial hammer speed is 0
      const hammerAnimationData = this.hammerAnimation.animationData;
      hammerAnimationData.layers.splice(1, 1); // Assuming layer index 1 to be removed
      this.hammerAnimation.destroy();
      this.hammerAnimation = lottie.loadAnimation({
        container: this.$refs.hammerAnimationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: hammerAnimationData,
      });
      this.shieldAnimation = await this.loadGenericAnimation(this.shieldPath, this.$refs.shieldAnimationContainer);
      const shieldAnimationData = this.shieldAnimation.animationData;
      shieldAnimationData.layers.splice(3, 1); // Assuming layer index 3 to be removed
      shieldAnimationData.layers.splice(4, 1); // Assuming layer index 4 to be removed
      shieldAnimationData.layers.splice(5, 1); // Assuming layer index 5 to be removed
      this.shieldAnimation.destroy();
      this.shieldAnimation = lottie.loadAnimation({
        container: this.$refs.shieldAnimationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: shieldAnimationData,
      });
      this.deathAnimation = await this.loadGenericAnimation(this.deathPath, this.$refs.deathAnimationContainer);
      const deathAnimationData = this.deathAnimation.animationData;
      deathAnimationData.layers.splice(39, 1); // Assuming layer index 39 to be removed
      this.deathAnimation.destroy();
      this.deathAnimation = lottie.loadAnimation({
        container: this.$refs.deathAnimationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: deathAnimationData,
      });
    },
  },
};
</script>

<style scoped>
.animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 600px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
}

.bact-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 600px;
  margin-bottom: 20px;
}

.lottie-animation {
  width: 100%;
  height: 100%;
}

.dna-overlay {
  position: absolute;
  transform: scale(0.25);
}
.hammer-overlay {
  transform: scaleX(-1) translateY(100px) translateX(-100px) scale(0.3);
  position: absolute;
}

.shield-overlay {
  position: absolute;
}

.death-wrapper {
  position: absolute;
}

.death-overlay {
  position: absolute;
}

.controls {
  margin-top: 20px;
}

.slider {
  width: 100%;
  margin: 10px 0;
}
</style>
