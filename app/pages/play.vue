<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Define a flag to track if we're on client side
const isClient = ref(false)
const showOverlay = ref(true) // Start with overlay shown

const isDebug = ref(false)
const isFractions = ref(true)

const gameContainerRef = ref<HTMLElement | null>(null)
let game: any = null

defineShortcuts({
  meta_m: () => {
    isDebug.value = !isDebug.value
    // if (game) {
    //   game.scene.scenes[1].physics.world.debugGraphic.setVisible(isDebug.value)
    // }
  }
})

// Define a function to initialize Phaser
const initPhaser = async () => {
  if (process.server) return

  try {
    // Dynamically import Phaser and game components only on client side
    const Phaser = await import('phaser')
    const { default: Game } = await import('~/game/scenes/Game')
    const { default: Preloader } = await import('~/game/scenes/Preloader')

    const config = {
      type: Phaser.default.AUTO,
      width: 800,
      height: 600,
      parent: 'game',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
        }
      },
      scene: [Preloader, Game],
      pixelArt: true,
      scale: {
        zoom: 1,
        autoCenter: Phaser.default.Scale.CENTER_BOTH
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false
      }
    }

    game = new Phaser.default.Game(config)

    // Add a basic focus handler on the game
    game.events.on('ready', () => {
      console.log('Game is ready!')

      // Enable focus on canvas
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.setAttribute('tabindex', '0')

        // Add click handler directly to canvas
        canvas.addEventListener('click', focusGame)
        canvas.addEventListener('mousedown', focusGame)
      }
    })
  } catch (error) {
    console.error('Error initializing Phaser game:', error)
  }
}

// Function to focus the game
const focusGame = () => {
  try {
    // Hide the overlay when focusing the game
    showOverlay.value = false

    // Focus the canvas element
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.focus()
    }

    console.log('Game focused and overlay hidden')
  } catch (e) {
    console.error('Error focusing game:', e)
  }
}

// Handle click on the game container or overlay to focus
const handleGameClick = () => {
  focusGame()
}

// Handle keyboard input - this will hide the overlay but let the game handle the actual keys
const handleKeyPress = (e: KeyboardEvent) => {
  if (showOverlay.value) {
    // If overlay is showing, hide it and focus the game
    focusGame()

    // Prevent default behavior to avoid unwanted scrolling
    e.preventDefault()
  }
}

onMounted(() => {
  isClient.value = true
  initPhaser()

  // Add a simpler global keyboard listener just to hide the overlay
  window.addEventListener('keydown', handleKeyPress)

  watch(isDebug, (newValue) => {
    if (game && game.scene.scenes.length > 1) {
      game.scene.scenes[1].setDebugMode(newValue)
    }
  })
  watch(isFractions, (newValue) => {
    if (game && game.scene.scenes.length > 1) {
      game.scene.scenes[1].setFractions(newValue)
    }
  })
})

onUnmounted(() => {
  if (game) {
    game.destroy(true)
    game = null
  }

  // Clean up all event listeners
  window.removeEventListener('keydown', handleKeyPress)

  const canvas = document.querySelector('canvas')
  if (canvas) {
    canvas.removeEventListener('click', focusGame)
    canvas.removeEventListener('mousedown', focusGame)
  }
})
</script>

<template>
  <div class="game-container mt-12 mx-auto">
    <!-- Use client-only to ensure Phaser only runs on client -->
    <client-only>
      <div id="game" ref="gameContainerRef" class="focus:outline-none focus:border-none" tabindex="0" @click="handleGameClick" @touchstart="handleGameClick"></div>

      <!-- Game overlay - hidden when showOverlay is false -->
      <div v-if="isClient && showOverlay" class="game-overlay" @click="handleGameClick" @touchstart="handleGameClick">
        <div class="overlay-content">
          <p>Click to start game</p>
        </div>
      </div>

      <div v-if="!isClient" class="loading">Loading game...</div>
    </client-only>
  </div>
      <div class="mt-4 mx-auto flex flex-row justify-between gap-4 w-[800px]">
        <UButton @click="isFractions = !isFractions" :icon="isFractions ? 'i-mdi-fraction-one-half' : 'i-mdi-percent'"
          size="xl" />
        <HowToPlay />
        <UButton @click="isDebug = !isDebug" :icon="isDebug ? 'i-mdi-bug-stop' : 'i-mdi-bug-play'" size="xl" />
      </div>
</template>

<style scoped>
.game-container {
  width: 800px;
  height: 600px;
  position: relative;
  background-color: #000;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
}

#game {
  width: 100%;
  height: 100%;
  outline: none;
  /* Remove outline when focused */
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
}

.overlay-content {
  color: white;
  font-size: 24px;
  text-align: center;
  background-color: rgba(249, 130, 255, 0.8);
  padding: 20px 40px;
  border-radius: 10px;
  border: 2px solid white;
}
</style>