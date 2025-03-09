import Phaser from 'phaser'

export interface DoorData {
  id: string;
  x: number;
  y: number;
  chance: number; // Keep this for internal calculations
  reward: number;
  sprite?: Phaser.GameObjects.Sprite;
  text?: Phaser.GameObjects.Text;
  // New fraction properties
  numerator: number;
  denominator: number;
}