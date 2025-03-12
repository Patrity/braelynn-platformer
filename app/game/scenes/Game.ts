import Phaser from 'phaser'
import type { DoorData } from '../model/Objects'
import { debugDraw } from '~/game/util'

export class Game extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite

  // Track room positions
  private currentRoomY: number = 0
  private currentRoomX: number = 0
  private rooms: Array<{ level: string, y: number, x: number }> = []
  private doors: DoorData[] = []
  private activeDoor: DoorData | null = null
  private doorSelectionActive: boolean = false
  private interactionDistance: number = 60
  private currentLevel: string = 'start'
  private levelMaps: { [key: string]: string } = {
    start: 'start',
    success: 'success',
    failure: 'failure'
  }

  // Text elements
  private infoText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private debugText!: Phaser.GameObjects.Text

  // Keyboard input
  private eKey!: Phaser.Input.Keyboard.Key // Interact
  private tKey!: Phaser.Input.Keyboard.Key // Debug door output
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys

  // Misc game state
  private playerScore: number = 0
  private isDead: boolean = false
  private isDebugMode: boolean = false
  private isFractionsMode: boolean = true
  private fps: number = 0 

  //function to toggle debug mode externally
  setDebugMode(isDebug: boolean) {
    this.isDebugMode = isDebug
    this.physics.world.debugGraphic.setVisible(isDebug)
    if (this.debugText) {
      this.debugText.setVisible(isDebug)
    }
    console.log(`Debug mode set to: ${isDebug}`)
  }

  //function to toggle fractions mode externally
  setFractions(isFractions: boolean) {
    this.isFractionsMode = isFractions
    if (this.doors && this.doors.length > 0) {
      for (const door of this.doors) {
        if (door.text && isFractions) {
          door.text.setText(`${door.numerator}/${door.denominator}\n${door.reward} points`)
        } else {
          door.text?.setText(`${door.chance}%\n${door.reward} points`)
        }
      }
    }
    console.log(`Fractions mode set to: ${isFractions}`)
  }

  constructor() {
    super({ key: 'Game' })
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  create() {
    this.rooms = []
    
    this.physics.world.debugGraphic.setVisible(false)

    this.input.keyboard!.addKey('R').on('down', () => {
      this.clearDoors()
      this.resetGame()
    })
    this.eKey = this.input.keyboard!.addKey('E')
    this.tKey = this.input.keyboard!.addKey('T').on('down', () => {
      console.log(this.doors)
    })
    
    this.infoText = this.add.text(10, 10, '', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100)

    this.scoreText = this.add.text(10, 40, 'Score: 0', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100)

    this.add.text(10, 70, 'Press R to reset game', {
      font: '14px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100)

    this.debugText = this.add.text(10, 300, '', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
    }).setScrollFactor(0).setDepth(100)

    this.physics.world.setBounds(-8000, -8000, 9000, 9000)

    try {
      this.createLevel(this.currentLevel, 0, 0) // Initial room at y=0
    } catch (error) {
      console.error('Error creating level:', error)
      this.infoText.setText('Error loading map!')
    }
    this.setupAnimations()
  }

  resetGame() {    
    // Stop all timers and animations immediately
    const debug = this.isDebugMode
    const fractions = this.isFractionsMode

    this.time.removeAllEvents()
    this.tweens.killAll()
    
    // Cancel all input events
    this.input.keyboard!.enabled = false
    this.scene.restart()
    
    this.events.once('create', () => {
      // Reset score and related UI
      this.playerScore = 0
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${this.playerScore}`)
      }
      
      this.isDead = false
      
      if (this.infoText) {
        this.infoText.setText('Game reset! Approach a door to continue.')
      }
      
      this.input.keyboard!.enabled = true
      this.setDebugMode(debug)
      this.setFractions(fractions)
    })
  }
  
  shutdown() {
    this.doors.forEach(door => {
      if (door.sprite) {
        door.sprite.removeAllListeners()
        door.sprite.destroy()
      }
      if (door.text) {
        door.text.destroy()
      }
    })
    
    this.doors = []
    this.activeDoor = null
    this.doorSelectionActive = false
    
    this.physics.world.colliders.destroy()
    
    this.rooms = []
  }

// Complete scene cleanup
performThoroughCleanup() {
  this.doors.forEach(door => {
    if (door.sprite) {
      door.sprite.removeAllListeners() // Remove all event listeners
      door.sprite.destroy(true) // Force immediate destruction
    }
    if (door.text) {
      door.text.destroy(true) // Force immediate destruction
    }
  })
  this.doors = []

  this.physics.world.colliders.destroy()
  this.physics.world.bodies.getArray().forEach(body => {
    if (body.gameObject && body.gameObject !== this.player) {
      body.gameObject.destroy()
    }
  })

  this.children.list.forEach(child => {
    if (child instanceof Phaser.GameObjects.Sprite && 
        child.alpha === 0 && 
        child.texture.key === 'door') {
      child.destroy()
    }
  })

  this.children.list.forEach(child => {
    if (child instanceof Phaser.Tilemaps.TilemapLayer) {
      child.destroy()
    }
  })

  this.children.list.forEach(child => {
    if (child instanceof Phaser.GameObjects.Sprite && 
        child !== this.player && 
        child.anims) {
      child.destroy()
    }
  })
  
  if (this.player) {
    this.player.destroy()
    this.player = null as any
  }
}

  clearAllRooms() {
    this.doors.forEach(door => {
      if (door.sprite) door.sprite.destroy()
      if (door.text) door.text.destroy()
    })
    this.doors = []

    this.physics.world.colliders.destroy()

    this.children.list.forEach(child => {
      if (child instanceof Phaser.Tilemaps.TilemapLayer) {
        child.destroy()
      }
    })

    this.doorSelectionActive = false
    this.activeDoor = null
  }


  createLevel(levelKey: string, yPosition: number, xPosition: number) {
    try {
      const map = this.make.tilemap({ key: this.levelMaps[levelKey] })

      this.rooms.push({
        level: levelKey,
        y: yPosition,
        x: xPosition
      })
      this.currentRoomY = yPosition
      this.currentRoomX = xPosition

      const tilesets: Phaser.Tilemaps.Tileset[] = []

      // Check which tilesets are needed for this specific map
      if (map.tilesets.find(tileset => tileset.name === 'A4'))
        tilesets.push(map.addTilesetImage('A4', 'A4')!)
      if (map.tilesets.find(tileset => tileset.name === 'A5'))
        tilesets.push(map.addTilesetImage('A5', 'A5')!)
      if (map.tilesets.find(tileset => tileset.name === 'Inside_B')) 
        tilesets.push(map.addTilesetImage('Inside_B', 'Inside_B')!)
      if (map.tilesets.find(tileset => tileset.name === 'Inside_C')) 
        tilesets.push(map.addTilesetImage('Inside_C', 'Inside_C')!)
      if (map.tilesets.find(tileset => tileset.name === 'Inside_D'))
        tilesets.push(map.addTilesetImage('Inside_D', 'Inside_D')!)
      if (map.tilesets.find(tileset => tileset.name === 'Inside_E'))
        tilesets.push(map.addTilesetImage('Inside_E', 'Inside_E')!)
      
      let groundLayer, wallsLayer, objectsLayer

      // Set appropriate depth values for each layer to ensure proper rendering order
      if (map.layers.find(layer => layer.name === 'Ground')) {
        groundLayer = map.createLayer('Ground', tilesets, xPosition, yPosition)
        // Ground layer at the bottom
        groundLayer?.setDepth(1)
      }

      if (map.layers.find(layer => layer.name === 'Walls')) {
        wallsLayer = map.createLayer('Walls', tilesets, xPosition, yPosition)
        wallsLayer?.setCollisionByProperty({ collides: true })
        // Walls above ground but below player
        wallsLayer?.setDepth(2)
      }

      if (map.layers.find(layer => layer.name === 'Objects')) {
        objectsLayer = map.createLayer('Objects', tilesets, xPosition, yPosition)
        objectsLayer?.setCollisionByProperty({ collides: true })
        // Most objects should be below player
        objectsLayer?.setDepth(3)
      }

      // Create player if it's the first room OR if player doesn't exist
      if (this.rooms.length === 1 || !this.player) {
        this.setupPlayer(levelKey, yPosition)
      }

      // During room transitions, this.player may be temporarily null to skip this section
      if (this.player) {
        if (wallsLayer)
          this.physics.add.collider(this.player, wallsLayer)
        if (objectsLayer)
          this.physics.add.collider(this.player, objectsLayer)
      }

      // Setup doors based on current level
      if (levelKey === 'start' || levelKey === 'success') {
        // Generate doors with varying chances and rewards
        const doorConfigs = this.generateDoors(levelKey)
        this.setupDoors(doorConfigs, yPosition)

        this.infoText.setText('Approach a door to see your options')
      }
      else if (levelKey === 'failure') {
        // Game over state - no doors in failure room
        this.infoText.setText('Game Over! Press R to play again.')
      }

    } catch (error) {
      console.error('Error in createLevel:', error)
      this.infoText.setText(`Error: Could not load the ${levelKey} map`)
    }
  }

  clearDoors() {
    // Destroy all door-related objects
    this.doors.forEach(door => {
      if (door.sprite) {
        door.sprite.removeAllListeners()
        door.sprite.destroy()
      }
      
      if (door.text)
        door.text.destroy()
    })
  
    // Clear the doors array
    this.doors = []
  
    // Reset door selection state
    this.doorSelectionActive = false
    this.activeDoor = null
  }

  setupPlayer(levelKey: string, yPosition: number = 0) {
    // Get player position based on level
    let playerX = 300
    let playerY = yPosition + 125

    if (levelKey === 'success' || levelKey === 'failure') {
      playerX = 100
      playerY = yPosition + 100
    }

    // If player exists, destroy it to prevent issues
    if (this.player)
      this.player.destroy()

    // Create a fresh player sprite
    this.player = this.physics.add.sprite(playerX, playerY, 'character', 'Idle_Down-0.png')
    this.player.setScale(2)

    this.player.setDepth(10)

    // Set player's hitbox size to be just at the feet
    const bodyWidth = this.player.width * 0.7
    const bodyHeight = 4

    const offsetX = (this.player.width - bodyWidth) / 2
    const offsetY = this.player.height - bodyHeight - 1

    this.player.body!.setSize(bodyWidth, bodyHeight)
    this.player.body!.setOffset(offsetX, offsetY)

    this.player.body!.debugBodyColor = 0xff0000
    this.player.setCollideWorldBounds(true)

    // Always setup animations for the new player instance
    this.setupAnimations()

    this.player.anims.play('idle', true)

    this.setupCamera()
  }

  setupCamera() {
    // Camera setup - follows player through all rooms
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setDeadzone(20, 20)
    this.cameras.main.setLerp(0.05, 0.05)
  }


  generateDoors(levelKey: string) {
    const fractionOptions = this.generateFractionOptions()
      const doors: DoorData[] = []

      // Create two doors with different difficulties
      const doorOptions: Omit<DoorData, 'x' | 'id'>[] = []

      // Create an easier door option
      const easyFractionIndex = Math.min(
        Math.floor(this.playerScore / 50),
        fractionOptions.length - (Math.random() > 0.5 ? 3 : 1)
      )
      const easyFraction = fractionOptions[easyFractionIndex]
      const easyChance = Math.floor((easyFraction!.numerator / easyFraction!.denominator) * 100)
      const easyReward = Math.floor(10 + (100 - easyChance) * 0.75)

      // Create a harder door option
      const hardFractionIndex = Math.min(
        easyFractionIndex + (Math.random() > 0.5 ? 1 : 3),
        fractionOptions.length - 1
      )
      const hardFraction = fractionOptions[hardFractionIndex]
      const hardChance = Math.floor((hardFraction!.numerator / hardFraction!.denominator) * 100)
      const hardReward = Math.floor(10 + (100 - hardChance) * 0.75)

      doorOptions.push({
        y: 54,
        numerator: easyFraction!.numerator,
        denominator: easyFraction!.denominator,
        chance: easyChance,
        reward: easyReward
      })

      doorOptions.push({
        y: 54,
        numerator: hardFraction!.numerator,
        denominator: hardFraction!.denominator,
        chance: hardChance,
        reward: hardReward
      })

      // Randomly determine which door goes on the left
      const shouldSwap = Math.random() > 0.5

      // Create the doors with positions
      const leftDoorOption = shouldSwap ? doorOptions[1] : doorOptions[0]
      const rightDoorOption = shouldSwap ? doorOptions[0] : doorOptions[1]

      // Add to the doors array
      doors.push({
        id: 'doorLeft',
        x: this.currentRoomX + 56,
        ...leftDoorOption
      })

      doors.push({
        id: 'doorRight',
        x: this.currentRoomX + 516,
        ...rightDoorOption
      })

      return doors
    
  }

  generateFractionOptions() {
    return [
      { numerator: 7, denominator: 8 },  // 87.5%
      { numerator: 4, denominator: 5 },  // 80%
      { numerator: 7, denominator: 9 },  // 77.8%
      { numerator: 3, denominator: 4 },  // 75%
      { numerator: 5, denominator: 7 },  // 71%
      { numerator: 2, denominator: 3 },  // 67%
      { numerator: 7, denominator: 11 }, // 63.6%
      { numerator: 5, denominator: 8 },  // 62.5%
      { numerator: 3, denominator: 5 },  // 60%
      { numerator: 7, denominator: 12 }, // 58%
      { numerator: 4, denominator: 7 },  // 57%
      { numerator: 5, denominator: 9 },  // 56%
      { numerator: 6, denominator: 11 }, // 54%
      { numerator: 1, denominator: 2 },  // 50%
      { numerator: 6, denominator: 13 }, // 46%
      { numerator: 5, denominator: 11 }, // 45%
      { numerator: 4, denominator: 9 },  // 44%
      { numerator: 2, denominator: 5 },  // 40%
      { numerator: 3, denominator: 8 },  // 37.5%
      { numerator: 4, denominator: 11 }, // 36%
      { numerator: 1, denominator: 3 },  // 33%
      { numerator: 1, denominator: 4 },  // 25%
      { numerator: 3, denominator: 13 }, // 23%
      { numerator: 1, denominator: 5 },  // 20%
      { numerator: 1, denominator: 6 },  // 17%
      { numerator: 1, denominator: 8 },  // 12.5%
      { numerator: 1, denominator: 10 }  // 10%
    ]
  }

  setupDoors(doorConfigs: DoorData[], yPosition: number = 0) {
    doorConfigs.forEach(doorConfig => {
      try {
        // Adjust door Y position based on the room position
        const doorY = doorConfig.y + yPosition

        // Visual indicator for the door
        const doorSprite = this.add.sprite(doorConfig.x, doorY, 'door')
          .setScale(1)
          .setInteractive()

        // IMPORTANT: Set door depth to be equal to or slightly below player
        doorSprite.setDepth(9)
        if (doorSprite.anims) {
          doorSprite.anims.play('door-closed')
        } else {
          console.log('Warning: Door animations not available for sprite')
          // Make sure door appears in closed state (use frame directly if anims not available)
          doorSprite.setFrame('Door1-3.png')
        }

        // Text to display door stats - position above door with fraction
        const text = this.isFractionsMode ?
          `${doorConfig.numerator}/${doorConfig.denominator}\n${doorConfig.reward} points` :
          `${doorConfig.chance}%\n${doorConfig.reward} points`
        const doorText = this.add.text(
          doorConfig.x,
          doorY - 40,
          text,
          { font: '14px Arial', align: 'center', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
        ).setOrigin(0.5)

        // Text should be above everything
        doorText.setDepth(20)

        // Store the door data with adjusted Y
        const door: DoorData = {
          ...doorConfig,
          y: doorY,
          sprite: doorSprite,
          text: doorText
        }

        this.doors.push(door)

        // Create interactive zone for the door
        const doorZone = this.physics.add.sprite(doorConfig.x, doorY, 'door')
          .setScale(2) // Increased interaction area
          .setAlpha(0) // Invisible

        doorZone.body.setSize(70, 70) // Larger interaction area

        // Add overlap detection
        this.physics.add.overlap(
          this.player,
          doorZone,
          () => this.handleDoorOverlap(door),
          undefined,
          this
        )

        // Add click handler
        doorSprite.on('pointerdown', () => {
          if (this.activeDoor === door && !this.doorSelectionActive) {
            this.selectDoor(door)
          }
        })
      } catch (error) {
        console.error('Error setting up door:', error)
      }
    })
  }

  handleDoorOverlap(door: DoorData) {
    if (this.activeDoor !== door && !this.doorSelectionActive) {
      // Reset all doors to normal tint
      this.doors.forEach(d => {
        if (d.sprite) {
          d.sprite.setTint(0xffffff)
        }
      })

      this.activeDoor = door
      // Update info text to show fraction
      const text = this.isFractionsMode ?
        `${door.numerator}/${door.denominator} chance, ${door.reward} points` :
        `${door.chance}% chance, ${door.reward} points`
      this.infoText.setText('Press E to choose - ' + text)
      
      // Highlight the active door
      if (door.sprite) {
        door.sprite.setTint(0xffff00)
        if (door.sprite.anims) {
          door.sprite.anims.play('door-open')
        }
      }
    }
  }

  selectDoor(door: DoorData) {
    if (this.doorSelectionActive) return

    // Set flag to prevent multiple selections
    this.doorSelectionActive = true

    // Calculate if the player succeeds based on fraction
    const roll = Phaser.Math.Between(1, door.denominator)
    const success = roll <= door.numerator

    // Update player score if successful
    if (success) {
      this.playerScore += door.reward
      this.scoreText.setText(`Score: ${this.playerScore}`)
    }

    // Show result message with fraction details
    let text = ''
    if (this.isFractionsMode) {
      text = success ?
        `Success! You rolled ${roll} of ${door.denominator}, needed ${door.numerator} or less. Earned ${door.reward} points.` :
        `Failed! You rolled ${roll} of ${door.denominator}, needed ${door.numerator} or less.`
    } else {
      const rollPercent = Math.floor((roll / door.denominator) * 100)
      const minPercent = Math.floor((door.numerator / door.denominator) * 100)
      text = success ?
        `Success! You rolled ${rollPercent}%, needed ${minPercent}% or more. Earned ${door.reward} points.` :
        `Failed! You rolled ${rollPercent}%, needed ${minPercent}% or more.`
    }
    this.infoText.setText(text)

    // Determine the next level
    const nextLevel = success ? 'success' : 'failure'
    const isLeftDoor = door.x - this.currentRoomX < 100

    // Create the new room above the current one
    const nextRoomY = this.currentRoomY - 256 // 256 units above current room
    const nextRoomX = this.currentRoomX - (success ? 288 : 128) + (isLeftDoor ? 54 : 516) // Move left if success

    // Initiate room transition after a delay
    this.time.delayedCall(1000, () => {
      if (this.activeDoor && this.activeDoor.sprite && this.activeDoor.sprite.anims) {
        this.activeDoor.sprite.anims.stop()
      }
      this.transitToNewRoom(nextLevel, nextRoomY, nextRoomX)
    })
  }

transitToNewRoom(nextLevel: string, nextRoomY: number, nextRoomX: number) {
  // First, completely destroy all colliders in the scene
  this.physics.world.colliders.destroy()

  // Clear all doors and other room elements
  this.clearDoors()

  const xOffset = nextLevel === 'success' ? 288 : 128
  
  // Store player reference
  const playerRef = this.player
  const playerX = nextRoomX + xOffset

  // Save the player's current depth
  const playerDepth = playerRef.depth

  // Calculate target Y position
  const targetY = nextRoomY + (nextLevel === 'success' ? 130 : 150)

  // Create the new level
  this.createLevel(nextLevel, nextRoomY, nextRoomX)

  
  playerRef.setPosition(playerX, targetY)

  if (nextLevel === 'failure') {
    // Game over state
    this.isDead = true
    this.scoreText.setText(`Score: ${this.playerScore}`)
    this.infoText.setText('You have failed! Your score has been reset.')

    this.player.anims.play('death')

    this.time.delayedCall(2000, () => {
    this.add.text(400, 300, `You died :(\nYour score was: ${this.playerScore}\nPress R to restart!`, {
      align: 'center',
      font: '32px Arial',
      color: '#080808',
      backgroundColor: '#f6339a',
      resolution: 50,
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100).setOrigin(0.5, 0.5)
    })
    
    return // Exit early to prevent further processing
  }

  // Critical: Update the physics body position
  if (playerRef.body) {
    playerRef.body.reset(playerX, targetY)
  }

  // Ensure player depth is maintained after teleport
  playerRef.setDepth(playerDepth)

  // Reset door selection flag
  this.doorSelectionActive = false

  // Update camera
  // this.setupCamera()
}

  setupAnimations() {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'Idle_Down-', suffix: '.png' }),
      frameRate: 7,
      repeat: -1
    })
    this.anims.create({
      key: 'walk-down',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'walk_Down-', suffix: '.png' }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'walk-left',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'walk_Left_Down-', suffix: '.png' }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'walk-right',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'walk_Right_Down-', suffix: '.png' }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'walk_Up-', suffix: '.png' }),
      frameRate: 10,
      repeat: -1
    })
    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNames('character', { start: 0, end: 7, zeroPad: 0, prefix: 'death_Down-', suffix: '.png' }),
      frameRate: 5,
      repeat: 0
    })

    try {
      this.anims.create({
        key: 'door-open',
        frames: this.anims.generateFrameNames('door', { start: 0, end: 3, zeroPad: 0, prefix: 'Door1-', suffix: '.png' }),
        frameRate: 6,
        repeat: 0
      })
      this.anims.create({
        key: 'door-closed',
        frames: this.anims.generateFrameNames('door', { start: 3, end: 0, zeroPad: 0, prefix: 'Door1-', suffix: '.png' }),
        frameRate: 6,
        repeat: 0
      })
    } catch (error) {
      console.error('Error creating door animations:', error)
    }

    if (!this.isDead)
      this.player.anims.play('idle')
  }

  update(t: number, dt: number) {
    debugDraw(this.children.list.find(child => child instanceof Phaser.Tilemaps.TilemapLayer) as Phaser.Tilemaps.TilemapLayer, this)
    
    // Add more thorough null checks to prevent errors
    if (!this.cursors || !this.player || !this.player.body) {
      return
    }

    const speed = 120

    // Reset velocity
    this.player.setVelocity(0)

    // Check for door proximity and clear active door if moved away
    if (this.activeDoor && !this.doorSelectionActive) {
      let stillNearDoor = false

      // Find the active door
      const door = this.doors.find(d => d.id === this.activeDoor?.id)
      if (door && door.sprite) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          door.sprite.x, door.sprite.y
        )
        stillNearDoor = dist < this.interactionDistance

        if (!stillNearDoor) {
          if (door.sprite) {
            door.sprite.setTint(0xffffff)
            // Add null check here for door.sprite.anims
            if (door.sprite.anims) {
              door.sprite.anims.play('door-closed')
            }
          }
          this.activeDoor = null
          this.infoText.setText('')
        }
      }
    }

    // Handle movement if not in door selection
    if (!this.doorSelectionActive && !this.isDead) {
      if (this.cursors.left!.isDown) {
        this.player.setVelocityX(-speed)
        this.player.anims.play('walk-left', true)
      } else if (this.cursors.right!.isDown) {
        this.player.setVelocityX(speed)
        this.player.anims.play('walk-right', true)
      }

      if (this.cursors.up?.isDown) {
        this.player.setVelocityY(-speed)
        if (!this.cursors.left?.isDown && !this.cursors.right?.isDown) {
          this.player.anims.play('walk-up', true)
        }
      } else if (this.cursors.down?.isDown) {
        this.player.setVelocityY(speed)
        if (!this.cursors.left?.isDown && !this.cursors.right?.isDown) {
          this.player.anims.play('walk-down', true)
        }
      }

      // Play idle animation if not moving
      if (this.player.body!.velocity.x === 0 && this.player.body!.velocity.y === 0 && !this.isDead) {
        this.player.anims.play('idle', true)
      }

      // Door interaction with E key
      if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.activeDoor) {
        this.selectDoor(this.activeDoor)
      }

      // Fix this line with proper null checking
      if (this.physics.world && this.physics.world.debugGraphic) {
        this.isDebugMode = this.physics.world.debugGraphic.visible
      }
    
      // Make coordinate text only visible in debug mode
      if (this.debugText) {
        this.debugText.visible = this.isDebugMode
        // Add null check before setting text - important fix!
        this.fps = Math.round(1000 / dt)
        this.debugText.setText(
          `x: ${this.player.x.toFixed(2)}, y: ${this.player.y.toFixed(2)}\nFPS: ${this.fps}`
        )
      }
    }
  }
}

export default Game