<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Phaser from 'phaser'
import { MainScene } from '~/game/scenes/MainScene'

let game: Phaser.Game | null = null

onMounted(() => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: process.env.NODE_ENV !== 'production'
      }
    },
    scene: MainScene
  }
  
  game = new Phaser.Game(config)
})

onUnmounted(() => {
  if (game) {
    game.destroy(true)
    game = null
  }
})
</script>

<template>
  <div class="game-container">
    <div id="game"></div>
  </div>
</template>

<style scoped>
.game-container {
  width: 800px;
  height: 600px;
  margin: 0 auto;
}
</style>