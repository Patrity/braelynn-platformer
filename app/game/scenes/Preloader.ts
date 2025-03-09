import Phaser from "phaser"

export default class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader')
  }

  preload() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)
    
    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })
    
    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
    })

    // Load all tilesets
    this.load.image('A4', 'game/A4.png')
    this.load.image('A5', 'game/A5.png')
    // Load additional tilesets that are referenced in your code
    this.load.image('Inside_B', 'game/Inside_B.png')
    this.load.image('Inside_C', 'game/Inside_C.png')
    this.load.image('Inside_D', 'game/Inside_D.png')
    this.load.image('Inside_E', 'game/Inside_E.png')
    
    // Load character spritesheet
    this.load.atlas('character', 'game/tilemaps/character.png', 'game/tilemaps/character.json')
    // Load door spritesheet
    this.load.atlas('door', 'game/tilemaps/door.png', 'game/tilemaps/door.json')

    // Load tilemaps
    this.load.tilemapTiledJSON('start', 'game/tilemaps/start.json')
    this.load.tilemapTiledJSON('success', 'game/tilemaps/success.json')
    this.load.tilemapTiledJSON('failure', 'game/tilemaps/failure.json')
  }

  create() {
    this.scene.start('Game')
  }
}

