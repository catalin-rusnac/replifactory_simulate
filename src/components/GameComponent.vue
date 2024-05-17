<script>
// this.effectiveGrowthRates - array of [growth rate, time] (growth rate animated as bacteria dividing faster and growth-o-meter increasing)
// this.ic50s - array of [ic50, time]  (half-inhibitory concentration - animated as bacteria muscle size (or medal count or something))
// this.adaptationRates - array of [adaptation rate, time] (adaptation rate animated as bacteria becoming more muscular)
// stress_level = this.effectiveDoses[time] / this.ic50s[time] (stress level animated as bacteria turning red or changing smile curvature or sweating or something)

// this.population - array of [population, time] (population animated as number of bacteria -
// for example arranged in corners of a 16x16 grid - as they double they move to the next corner and become more opaque - from 2x2 to 4x4 to 8x8 to 16x16)
  </script>

<template>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Bacterium Body -->
  <ellipse cx="100" cy="100" rx="40" ry="20" fill="green" stroke="black" stroke-width="2"/>

  <!-- Eyes -->
  <circle cx="90" cy="95" r="5" fill="white"/>
  <circle cx="110" cy="95" r="5" fill="white"/>
  <circle cx="90" cy="95" r="2" fill="black"/>
  <circle cx="110" cy="95" r="2" fill="black"/>

  <!-- Mouth -->
  <path d="M85 110 Q100 120 115 110" stroke="black" stroke-width="2" fill="none"/>

  <!-- Arms -->
  <path id="left-arm" d="M60,100 Q45,85 30,70" stroke="black" stroke-width="4" fill="none"/>
  <path id="right-arm" d="M140,100 Q155,85 170,70" stroke="black" stroke-width="4" fill="none"/>

  <!-- Weights -->
  <rect id="left-barbell" x="20" y="60" width="20" height="20" fill="gray" stroke="black" stroke-width="2"/>
  <rect id="right-barbell" x="160" y="60" width="20" height="20" fill="gray" stroke="black" stroke-width="2"/>
  <line id="bar" x1="30" y1="70" x2="170" y2="70" stroke="black" stroke-width="4"/>
</svg>

</template>

<style scoped>
@keyframes lift {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

#left-barbell, #right-barbell, #bar {
  animation: lift 1s infinite;
}

@keyframes leftArmLift {
  0%, 100% {
    d: path("M60,100 Q45,85 30,70");
  }
  50% {
    d: path("M60,100 Q45,75 30,60");
  }
}

@keyframes rightArmLift {
  0%, 100% {
    d: path("M140,100 Q155,85 170,70");
  }
  50% {
    d: path("M140,100 Q155,75 170,60");
  }
}

#left-arm {
  animation: leftArmLift 1s infinite;
}

#right-arm {
  animation: rightArmLift 1s infinite;
}
</style>
