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

<!--    <div class="controls">-->
<!--      &lt;!&ndash; DNA animation speed slider &ndash;&gt;-->
<!--      <label for="adaptationRate">Adaptation rate: {{ adaptationRate }}</label>-->
<!--      <input type="range" id="adaptationRate" class="slider" :min="0" :max="0.1" :step="0.001" v-model="adaptationRate" />-->

<!--      <label for="growthRate">Growth Rate: {{ growthRate }}</label>-->
<!--      <input type="range" id="growthRate" class="slider" :min="-0.1" :max="2" :step="0.01" v-model="growthRate" />-->
<!--      <label for="dose">Current Concentration: {{ currentDose }}</label>-->
<!--      <input type="range" id="currentDose" class="slider" :min="0" :max="100" :step="1" v-model="currentDose" />-->
<!--      &lt;!&ndash; Slider for currentIC50&ndash;&gt;-->
<!--      <label for="IC50">Half-Inhibitory Concentration: {{ IC50 }}</label>-->
<!--      <input type="range" id="IC50" class="slider" :min="0" :max="100" :step="1" v-model="IC50" />-->
<!--    </div>-->

  </div>
</template>

<script>
import lottie from 'lottie-web';

export default {
  name: 'LottieAnimation',
  props: {
    IC50: {
      type: Number,
      default: 4,
    },
    IC50_initial: {
      type: Number,
      default: 5,
    },
    growthRate: {
      type: Number,
      default: 1,
    },
    adaptationRate: {
      type: Number,
      default: 0.005,
    },
    currentDose: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      bactPath: '/replifactory_simulate/bact.json', // Path to the animation file
      dnaPath: '/DNA3.json', // Path to the animation file
      hammerPath: '/hammer2.json', // Path to the animation file
      shieldPath: '/shield.json', // Path to the animation file
      shieldSize: 0, // Default size
      shieldOpacity: 0.7, // Default opacity

      deathPath: '/death.json', // Path to the animation file
      deathDistance: 1, // Default distance
      deathPosition: 900, // Default death position

      animationSize: 800, // Default size
      backgroundShade: 0, // Default green shade
      deathScale: 1, // Default death scale

      // growthRate: 1, // Default speed
      // currentDose: 0,
      // adaptationRate: 0.005, // Default speed
      // IC50_initial: 5,
      // IC50: 5,
    };
  },
  computed: {
    backgroundColor() {
      return `rgb(255, ${255 - this.backgroundShade},  ${255 - this.backgroundShade})`;
    },
  },
  watch: {
    IC50: 'updateShieldProperties',
    growthRate: 'updateGrowthRate',
    adaptationRate: 'updateAdaptation',
    currentDose: 'updateBackgroundShade',

  },
  mounted() {
    this.loadAllAnimations().then(() => {
      // Manually trigger watchers to set initial values
      this.updateShieldProperties(this.IC50);
      this.updateGrowthRate(this.growthRate);
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
    updateGrowthRate(newRate) {
      const minAnimationSize = 600;
      const maxAnimationSize = 800;
      const newSpeed = newRate * 10 / 2;

      if (newRate < 0) {
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
      const maxSpeed = 2;
      const minSpeed = 0.1;
      const maxRate = 0.1;
      const minRate = 0.01;
      const ratio = Math.abs((newRate - minRate) / (maxRate - minRate))
      const newSpeed = minSpeed + ratio * (maxSpeed - minSpeed);

      this.dnaAnimation.setSpeed(newSpeed);
      if (newRate > minRate) {
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
      this.dnaAnimation = await this.loadGenericAnimation(this.dnaPath, this.$refs.dnaAnimationContainer);
      this.hammerAnimation = await this.loadGenericAnimation(this.hammerPath, this.$refs.hammerAnimationContainer);
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
