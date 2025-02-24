import Phaser from 'phaser';

interface RoomConfig {
  leftSafe: boolean;
  rightSafe: boolean;
  leftReward: number;
  rightReward: number;
  revealed: boolean;
}

export class MainScene extends Phaser.Scene {
  private rooms: Phaser.GameObjects.Container[] = [];
  private player: Phaser.GameObjects.Rectangle;
  private currentRoomIndex: number = 0;
  private readonly ROOM_HEIGHT = 200;
  private readonly ROOM_WIDTH = 800;
  
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Set up initial scene
    this.cameras.main.setBackgroundColor('#000000');
    
    // Create player
    this.player = this.add.rectangle(400, 650, 32, 32, 0x00ff00);
    
    // Create starting room
    this.createRoom({ 
      leftSafe: true, 
      rightSafe: true, 
      leftReward: 0,
      rightReward: 0,
      revealed: true 
    }, 0);
    
    // Create first choice room (hidden)
    this.generateNextRoom();
    
    // Set up input
    this.input.keyboard.on('keydown-LEFT', () => this.makeChoice('left'));
    this.input.keyboard.on('keydown-RIGHT', () => this.makeChoice('right'));
  }

  private createRoom(config: RoomConfig, yPosition: number): Phaser.GameObjects.Container {
    const room = this.add.container(0, yPosition);

    // Room outline
    const outline = this.add.rectangle(400, 100, this.ROOM_WIDTH - 4, this.ROOM_HEIGHT - 4, 0x000000);
    outline.setStrokeStyle(4, 0x00ff00);
    room.add(outline);

    // Doors
    const leftDoor = this.add.rectangle(100, 180, 60, 100, 0x0000ff);
    const rightDoor = this.add.rectangle(700, 180, 60, 100, 0x0000ff);
    room.add(leftDoor);
    room.add(rightDoor);

    // If room is revealed, show safety indicators and rewards
    if (config.revealed) {
      // Left door indicators
      const leftColor = config.leftSafe ? 0x00ff00 : 0xff0000;
      const leftText = this.add.text(50, 50, [
        config.leftSafe ? '90% Safe' : '50% Safe',
        `+${config.leftReward} coins`
      ], { color: '#ffffff', align: 'center' });
      leftText.setOrigin(0.5);
      room.add(leftText);

      // Right door indicators
      const rightColor = config.rightSafe ? 0x00ff00 : 0xff0000;
      const rightText = this.add.text(750, 50, [
        config.rightSafe ? '90% Safe' : '50% Safe',
        `+${config.rightReward} coins`
      ], { color: '#ffffff', align: 'center' });
      rightText.setOrigin(0.5);
      room.add(rightText);
    } else {
      // Question marks for unrevealed room
      const leftText = this.add.text(50, 50, '???', { color: '#ffffff', fontSize: '24px' });
      const rightText = this.add.text(750, 50, '???', { color: '#ffffff', fontSize: '24px' });
      leftText.setOrigin(0.5);
      rightText.setOrigin(0.5);
      room.add(leftText);
      room.add(rightText);
    }

    this.rooms.push(room);
    return room;
  }

  private generateNextRoom() {
    // Determine room configuration
    const leftSafe = Math.random() < 0.3; // 30% chance of safe path
    const rightSafe = Math.random() < 0.3;
    
    const leftReward = leftSafe ? 1 : 5;
    const rightReward = rightSafe ? 1 : 5;
    
    // Create new room above current rooms
    const yPosition = -this.ROOM_HEIGHT;
    this.createRoom({
      leftSafe,
      rightSafe,
      leftReward,
      rightReward,
      revealed: false
    }, yPosition);
  }

  private makeChoice(choice: 'left' | 'right') {
    const currentRoom = this.rooms[this.currentRoomIndex + 1];
    if (!currentRoom) return;

    // Reveal the room
    currentRoom.destroy();
    const roomConfig = {
      leftSafe: Math.random() < 0.3,
      rightSafe: Math.random() < 0.3,
      leftReward: 1,
      rightReward: 5,
      revealed: true
    };
    this.rooms[this.currentRoomIndex + 1] = this.createRoom(roomConfig, currentRoom.y);

    // Check if player succeeds based on choice
    const success = choice === 'left' ? roomConfig.leftSafe : roomConfig.rightSafe;
    if (success) {
      // Move to next room
      this.currentRoomIndex++;
      this.moveToNextRoom();
      this.generateNextRoom();
    } else {
      // Game over
      this.gameOver();
    }
  }

  private moveToNextRoom() {
    // Move all rooms down
    this.tweens.add({
      targets: this.rooms.map(room => room),
      y: '+=200',
      duration: 500,
      ease: 'Power2'
    });
  }

  private gameOver() {
    const gameOverText = this.add.text(400, 300, 'Game Over!\nPress Space to restart', {
      color: '#ffffff',
      fontSize: '32px',
      align: 'center'
    });
    gameOverText.setOrigin(0.5);
    
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  update() {
    // Add any continuous updates here
  }
}