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

    <!-- Sliders for size, speed, and specific element selection -->
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
      <label for="element">Element: {{ specificElementIndex }}</label>
      <input
        type="range"
        id="element"
        class="slider"
        :min="0"
        :max="maxElements - 1"
        :step="1"
        v-model="specificElementIndex"
        @input="onElementChange"
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
      specificElementIndex: 1, // Default element index
      maxElements: 1, // Maximum number of elements in the animation
      animationData: null, // Animation data
    };
  },
  watch: {
    animationSpeed(newSpeed) {
      this.setAnimationSpeed(newSpeed);
    },
    specificElementIndex() {
      this.renderSpecificElement();
    }
  },
  mounted() {
    this.loadAnimation();
  },
  methods: {
    async loadAnimation() {
      const response = await fetch(this.animationPath);
      const animationData = await response.json();
      this.animationData = animationData;

      // Store the total number of elements
      this.maxElements = this.animationData.layers.length;

      // Render the full animation
      this.animation = lottie.loadAnimation({
        container: this.$refs.animationContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData
      });
      this.animation.setSpeed(this.animationSpeed);

      // Render the specific element
      this.renderSpecificElement();
    },
    renderSpecificElement() {
      // Extract the specific element
      const layers = this.animationData.layers.filter((layer, index) => {
        return index === this.specificElementIndex;
      });

      if (layers.length > 0) {
        const specificElementData = {
          ...this.animationData,
          layers // Use only the specific layers
        };
        if (this.singleElementAnimation) {
          this.singleElementAnimation.destroy();
        }
        this.singleElementAnimation = lottie.loadAnimation({
          container: this.$refs.singleElementContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: specificElementData
        });

        // TODO: change the size of the container to the size of the specific element by using the layers' dimensions and position



        this.singleElementAnimation.setSpeed(this.animationSpeed);
      }
    },
    setAnimationSpeed(speed) {
      if (this.animation) {
        this.animation.setSpeed(speed);
      }
      if (this.singleElementAnimation) {
        this.singleElementAnimation.setSpeed(speed);
      }
    },
    onSpeedChange(event) {
      this.setAnimationSpeed(parseFloat(event.target.value));
    },
    onSizeChange(event) {
      const newSize = parseInt(event.target.value, 10);
      this.animationSize = newSize;
      this.$refs.animationContainer.style.width = `${newSize}px`;
      this.$refs.animationContainer.style.height = `${newSize}px`;
      this.$refs.singleElementContainer.style.width = `${newSize}px`;
      this.$refs.singleElementContainer.style.height = `${newSize}px`;
    },
    onElementChange(event) {
      this.specificElementIndex = parseInt(event.target.value, 10);
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
