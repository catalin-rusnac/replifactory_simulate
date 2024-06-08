<template>
  <div>
    <!-- Lottie animation container -->
    <div class="animation-wrapper">
      <div ref="animationContainer" :style="{ width: `${animationSize}px`, height: `${animationSize}px` }" class="lottie-animation"></div>
    </div>

    <!-- Container for the specific element -->
    <div class="single_element" ref="singleElementContainer">
      <!-- The specific element will be rendered here -->
    </div>

    <!-- Sliders for size and speed -->
    <div class="controls">
      <label for="speed">Speed: {{ animationSpeed }}</label>
      <input
        type="range"
        id="speed"
        class="slider"
        :min="0.1"
        :max="10"
        :step="0.1"
        v-model="animationSpeed"
        @input="onSpeedChange"
      />
      <label for="size">Size: {{ animationSize }}px</label>
      <input
        type="range"
        id="size"
        class="slider"
        :min="600"
        :max="1800"
        :step="10"
        v-model="animationSize"
        @input="onSizeChange"
      />
    </div>
  </div>
</template>

<script>
import lottie from 'lottie-web';

export default {
  name: 'LottieAnimation',
  data() {
    return {
      animationSpeed: 1, // Default speed
      animationSize: 800, // Default size
      animationPath: '/pop.json', // Path to the animation file
    };
  },
  watch: {
    animationSpeed(newSpeed) {
      this.setAnimationSpeed(newSpeed);
    }
  },
  mounted() {
    this.loadAnimation();
  },
  methods: {
    async loadAnimation() {
      const response = await fetch(this.animationPath);
      const animationData = await response.json();

      // Render the full animation
      this.animation = lottie.loadAnimation({
        container: this.$refs.animationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData
      });
      this.animation.setSpeed(this.animationSpeed);

      // Extract and render the specific element
      this.renderSpecificElement(animationData);
    },
    renderSpecificElement(animationData) {
      // Extract the second g clip path element
      console.log(animationData.layers)
      const layers = animationData.layers.filter((layer, index) => {
        // Use index 1 for the second element (index starts from 0)
        return index === 87; // TODO: add slider to select the specific element, watch for changes and update the specific element
      });

      if (layers.length > 0) {
        const specificElementData = {
          ...animationData,
          layers // Use only the specific layers
        };

        lottie.loadAnimation({
          container: this.$refs.singleElementContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: specificElementData
        }).setSpeed(this.animationSpeed);
      }
    },
    setAnimationSpeed(speed) {
      if (this.animation) {
        this.animation.setSpeed(speed);
      }
    },
    onSpeedChange(event) {
      this.setAnimationSpeed(parseFloat(event.target.value));
    },
    onSizeChange(event) {
      const newSize = parseInt(event.target.value, 10);
      this.$refs.animationContainer.style.width = `${newSize}px`;
      this.$refs.animationContainer.style.height = `${newSize}px`;
      this.$refs.singleElementContainer.style.width = `${newSize}px`;
      this.$refs.singleElementContainer.style.height = `${newSize}px`;
    }
  }
};
</script>

<style scoped>
.animation-wrapper {
  display: flex;
  justify-content: center; /* Centers the animation horizontally */
  height: 600px;
  margin-bottom: 20px;
}
.lottie-animation {
  width: 100%;
  height: 100%;
}
.single_element {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
  margin-bottom: 20px;
}
.controls {
  margin-top: 20px;
}
.slider {
  width: 100%;
  margin: 10px 0;
}
</style>
