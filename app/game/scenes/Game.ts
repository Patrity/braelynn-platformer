import Phaser from 'phaser'
import type { DoorData } from '../model/Objects'

export class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private player!: Phaser.Physics.Arcade.Sprite
  private doors: DoorData[] = []
  private activeDoor: DoorData | null = null
  private infoText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private coordsText!: Phaser.GameObjects.Text
  private playerScore: number = 0
  private isDead: boolean = false

  // Track current map/level
  private currentLevel: string = 'start'
  private levelMaps: { [key: string]: string } = {
    start: 'start',
    success: 'success',
    failure: 'failure'
  }

  // Flag to prevent multiple door selections
  private doorSelectionActive: boolean = false

  // Interaction distance (increased to make it easier to interact)
  private interactionDistance: number = 60

  // Track room positions
  private currentRoomY: number = 0
  private currentRoomX: number = 0
  private roomHeight: number = 360 // Default room height
  private rooms: Array<{ level: string, y: number, x: number }> = []

  constructor() {
    super({ key: 'Game' })
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys()
  }

  create() {

    // Add R key for reset
    this.input.keyboard!.addKey('R').on('down', () => {
      this.resetGame()
    })

    // Initialize UI elements FIRST before calling createLevel
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

    // Add instructions text
    this.add.text(10, 70, 'Press R to reset game', {
      font: '14px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100)

    this.coordsText = this.add.text(10, 100, '', {
      font: '16px Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    }).setScrollFactor(0).setDepth(100)

    // Set VERY large world bounds to ensure no boundaries are hit
    // This is a critical fix - we're setting the boundaries much larger than needed
    // to ensure the player never hits an invisible wall
    this.physics.world.setBounds(-2000, -2000, 4000, 4000)
    console.log("Set world bounds: 0, -2000, 800, 4000")

    // Now create the level
    try {
      this.createLevel(this.currentLevel, 0, 0) // Initial room at y=0
    } catch (error) {
      console.error('Error creating level:', error)
      this.infoText.setText('Error loading map!')
    }
  }

  // Reset game with proper world boundary reset
  resetGame() {
    // Reset game state when restarting
    this.isDead = false
    this.playerScore = 0
    this.scoreText.setText(`Score: ${this.playerScore}`)

    // Clear all existing rooms
    this.clearAllRooms()

    // Reset room tracking
    this.currentRoomY = 0
    this.currentRoomX = 0
    this.rooms = []

    // Reset to start level
    this.currentLevel = 'start'

    // Set large world bounds again to be safe
    this.physics.world.setBounds(-2000, -2000, 4000, 4000)

    // Create the level
    this.createLevel(this.currentLevel, 0, 0)

    // Show reset message
    this.infoText.setText('Game reset! Approach a door to continue.')
  }
  clearAllRooms() {
    // Destroy all doors and other room elements
    this.doors.forEach(door => {
      if (door.sprite) door.sprite.destroy()
      if (door.text) door.text.destroy()
    })
    this.doors = []

    // Destroy all colliders
    this.physics.world.colliders.destroy()

    // Destroy all layers from previous rooms
    this.children.list.forEach(child => {
      if (child instanceof Phaser.Tilemaps.TilemapLayer) {
        child.destroy()
      }
    })

    // Reset door selection state
    this.doorSelectionActive = false
    this.activeDoor = null
  }


  createLevel(levelKey: string, yPosition: number, xPosition: number) {
    try {
      // Load the tilemap for the current level
      const map = this.make.tilemap({ key: this.levelMaps[levelKey] })

      // Track this room
      this.rooms.push({
        level: levelKey,
        y: yPosition,
        x: xPosition
      })
      this.currentRoomY = yPosition
      this.currentRoomX = xPosition

      // Get the tilesets that are ACTUALLY used in this map
      const tilesets: Phaser.Tilemaps.Tileset[] = []

      // Check which tilesets are needed for this specific map
      if (map.tilesets.find(tileset => tileset.name === 'A4')) {
        tilesets.push(map.addTilesetImage('A4', 'A4')!)
      }

      if (map.tilesets.find(tileset => tileset.name === 'A5')) {
        tilesets.push(map.addTilesetImage('A5', 'A5')!)
      }

      if (map.tilesets.find(tileset => tileset.name === 'Inside_B')) {
        tilesets.push(map.addTilesetImage('Inside_B', 'Inside_B')!)
      }

      if (map.tilesets.find(tileset => tileset.name === 'Inside_C')) {
        tilesets.push(map.addTilesetImage('Inside_C', 'Inside_C')!)
      }

      if (map.tilesets.find(tileset => tileset.name === 'Inside_D')) {
        tilesets.push(map.addTilesetImage('Inside_D', 'Inside_D')!)
      }

      if (map.tilesets.find(tileset => tileset.name === 'Inside_E')) {
        tilesets.push(map.addTilesetImage('Inside_E', 'Inside_E')!)
      }

      // Check if layers exist before creating them
      let groundLayer, wallsLayer, objectsLayer

      // Set appropriate depth values for each layer
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

      // Only create player for the first room
      if (this.rooms.length === 1) {
        this.setupPlayer(levelKey, yPosition)
      }

      // IMPORTANT: This section only adds colliders if this.player exists
      // During room transitions, this.player may be temporarily null to skip this section
      if (this.player) {
        // Add collisions with walls and objects
        if (wallsLayer) {
          this.physics.add.collider(this.player, wallsLayer)
        }

        if (objectsLayer) {
          this.physics.add.collider(this.player, objectsLayer)
        }
      }

      // Setup doors based on current level
      if (levelKey === 'start' || levelKey === 'success') {
        // Generate doors with varying chances and rewards
        const doorConfigs = this.generateDoors(levelKey)
        this.setupDoors(doorConfigs, yPosition)

        // Update info text
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

  // Convert interactive doors to static decorative sprites
  this.doors.forEach(door => {
    if (door.sprite) {
      // Remove interactivity but keep the sprite
      door.sprite.disableInteractive();
      
      // Ensure door is in closed state
      door.sprite.anims.play('door-closed');
      
      // Reset any highlighting
      door.sprite.setTint(0xffffff);
      
      // Remove associated text displays
      if (door.text) {
        door.text.destroy();
      }
    }
  });
  
  // Clear the doors array - doors are still visible but not tracked for interaction
  this.doors = [];
  
  // Reset door selection state
  this.doorSelectionActive = false;
  this.activeDoor = null;
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
    if (this.player) {
      this.player.destroy()
    }

    // Create a fresh player sprite
    this.player = this.physics.add.sprite(playerX, playerY, 'character', 'Idle_Down-0.png')
    this.player.setScale(2)

    // IMPORTANT: Set player's depth to ensure it renders above the room tiles
    // The higher the number, the more "on top" the sprite will be
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

    // Start with idle animation
    this.player.anims.play('idle', true)

    // Setup camera in a separate method so it can be called independently
    this.setupCamera()
  }

  setupCamera() {
    // Camera setup - follows player through all rooms
    this.cameras.main.startFollow(this.player)
    this.cameras.main.setDeadzone(20, 20)
    this.cameras.main.setLerp(0.1, 0.1)

    // Calculate room bounds to ensure camera knows about all rooms
    let lowestY = 0
    let highestY = 0

    this.rooms.forEach(room => {
      if (room.y < lowestY) lowestY = room.y
      if (room.y > highestY) highestY = room.y
    })
  }

  generateDoors(levelKey: string) {
    // Base positions for doors in the start and success levels
    const xPosition = this.currentRoomX
    const yPosition = this.currentRoomY + 54
    if (levelKey === 'start') {
      // First level doors - fixed chances/rewards
      return [
        { id: 'doorLeft', x: xPosition + 56, y: yPosition, chance: 70, reward: 10 },
        { id: 'doorRight', x: xPosition + 516, y: yPosition, chance: 70, reward: 10 }
      ]
    } else {
      // Success level doors - increase difficulty with each success
      const doorCount = 2 // Add a third door at higher scores
      const doors: DoorData[] = []

      // Generate doors with varying chances and rewards
      for (let i = 0; i < doorCount; i++) {
        // Make doors progressively harder as score increases
        const difficultyFactor = Math.min(0.5, this.playerScore / 200) // Max 50% reduction
        const baseChance = 70 - (this.playerScore / 5) // Decrease by 1% per 5 points
        const chance = Math.max(20, Math.floor(baseChance * (1 - difficultyFactor))) // Min 20% chance

        // Higher reward for harder doors
        const reward = Math.floor(10 + (100 - chance) / 2)

        // Position doors evenly
        const x = (i === 0) ? this.currentRoomX + 56 : this.currentRoomX + 516

        doors.push({
          id: `door${i}`,
          x,
          y: 54,
          chance,
          reward
        })
        console.log(`new door: ${x}, ${yPosition}, ${chance}, ${reward}`)
        
      }

      return doors
    }
  }


  // Update setupDoors to ensure doors have proper depth
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

        doorSprite.anims.play('door-closed')

        // Text to display door stats - position above door
        const doorText = this.add.text(
          doorConfig.x,
          doorY - 40,
          `${doorConfig.chance}%\n${doorConfig.reward} coins`,
          { font: '12px Arial', align: 'center', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }
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
          // d.sprite.anims.play('door-closed')
        }
      })

      this.activeDoor = door
      this.infoText.setText(`Press E to use this door (${door.chance}% chance, ${door.reward} coins)`)

      // Highlight the active door
      if (door.sprite) {
        door.sprite.setTint(0xffff00)
        door.sprite.anims.play('door-open')
      }
    }
  }

  selectDoor(door: DoorData) {
    if (this.doorSelectionActive) return

    // Set flag to prevent multiple selections
    this.doorSelectionActive = true

    // Calculate if the player succeeds based on door chance
    const roll = Phaser.Math.Between(1, 100)
    const success = roll <= door.chance

    // Update player score if successful
    if (success) {
      this.playerScore += door.reward
      this.scoreText.setText(`Score: ${this.playerScore}`)
    }

    // Show result message
    this.infoText.setText(success ?
      `Success! You rolled ${roll}, needed ${door.chance} or less. Earned ${door.reward} coins.` :
      `Failed! You rolled ${roll}, needed ${door.chance} or less.`)

    // Determine the next level
    const nextLevel = success ? 'success' : 'failure'

    // Create the new room above the current one
    const nextRoomY = this.currentRoomY - 256 // 256 units above current room
    const nextRoomX = this.currentRoomX - (success ? 288 : 128) +54 // Move left if success

    // Initiate room transition after a delay
    this.time.delayedCall(1000, () => {
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
    const targetY = nextRoomY + 115

    console.log(`Planning teleport to y=${targetY} (room at y=${nextRoomY})`)

    // Create the new level
    this.createLevel(nextLevel, nextRoomY, nextRoomX)

    // Immediate teleport
    playerRef.setPosition(playerX, targetY)

    if (nextLevel === 'failure') {
      // Reset player score on failure
      this.isDead = true
      this.playerScore = 0
      this.scoreText.setText(`Score: ${this.playerScore}`)
      this.infoText.setText('You have failed! Your score has been reset.')

      this.player.anims.play('death')
      this.time.delayedCall(3000, () => {
        this.resetGame()
      })
    }

    // Critical: Update the physics body position
    if (playerRef.body) {
      playerRef.body.reset(playerX, targetY)
    }

    // IMPORTANT: Ensure player depth is maintained after teleport
    playerRef.setDepth(playerDepth)

    console.log(`Teleported player to x=${playerX}, y=${targetY}, depth=${playerRef.depth}`)

    // Reset door selection flag
    this.doorSelectionActive = false

    // Update camera
    this.setupCamera()
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
    if (!this.cursors || !this.player) {
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
          door.sprite.setTint(0xffffff)
          door.sprite.anims.play('door-closed')
          this.activeDoor = null
          this.infoText.setText('')
        }
      }
    }

    // Handle movement if not in door selection
    if (!this.doorSelectionActive) {
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
      if (this.player.body!.velocity.x === 0 && this.player.body!.velocity.y === 0 && !this.isDead)  {
        this.player.anims.play('idle', true)
      }

      // Door interaction with E key
      const eKey = this.input.keyboard!.addKey('E')
      if (Phaser.Input.Keyboard.JustDown(eKey) && this.activeDoor) {
        this.selectDoor(this.activeDoor)
      }
      this.coordsText.setText(`x: ${this.player.x.toFixed(2)}, y: ${this.player.y.toFixed(2)}`)
    }
  }
}

export default Game