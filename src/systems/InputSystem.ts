import * as THREE from 'three';
import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { ScoreSystem } from '../systems/ScoreSystem';

export class InputSystem {
  private keys: Map<string, boolean>;
  private keysPressed: Map<string, boolean>; // Track key press events (not held)
  private player: Player;
  private ball: Ball;
  private scoreSystem: ScoreSystem | null = null;

  constructor(player: Player, ball: Ball) {
    this.player = player;
    this.ball = ball;
    this.keys = new Map();
    this.keysPressed = new Map();

    this.setupKeyboardListeners();
  }

  public setScoreSystem(scoreSystem: ScoreSystem) {
    this.scoreSystem = scoreSystem;
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.get(key)) {
        this.keysPressed.set(key, true);
      }
      this.keys.set(key, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.key.toLowerCase(), false);
    });
  }

  public update() {
    let x = 0;
    let z = 0;

    // WASD controls
    if (this.keys.get('w') || this.keys.get('arrowup')) {
      z -= 1; // Move forward (negative Z)
    }
    if (this.keys.get('s') || this.keys.get('arrowdown')) {
      z += 1; // Move backward (positive Z)
    }
    if (this.keys.get('a') || this.keys.get('arrowleft')) {
      x -= 1; // Move left
    }
    if (this.keys.get('d') || this.keys.get('arrowright')) {
      x += 1; // Move right
    }

    this.player.setMoveDirection(x, z);

    // Action buttons - kick and header
    if (this.keysPressed.get(' ') || this.keysPressed.get('space')) {
      this.handleKick();
      this.keysPressed.set(' ', false);
      this.keysPressed.set('space', false);
    }

    if (this.keysPressed.get('e')) {
      this.handleHeader();
      this.keysPressed.set('e', false);
    }
  }

  private handleKick() {
    if (!this.player.canKick(this.ball)) return;

    // Register touch with score system
    if (this.scoreSystem) {
      const isValidTouch = this.scoreSystem.registerTouch(this.player.id, this.player.team);
      if (!isValidTouch) {
        // Foul! Don't execute the action
        return;
      }
    }

    // Kick direction: towards opponent's side (negative Z)
    const direction = new THREE.Vector3(0, 1, -1).normalize();

    this.player.kick(this.ball, direction, 1.0);
    console.log('Kick!');
  }

  private handleHeader() {
    if (!this.player.canHeader(this.ball)) return;

    // Register touch with score system
    if (this.scoreSystem) {
      const isValidTouch = this.scoreSystem.registerTouch(this.player.id, this.player.team);
      if (!isValidTouch) {
        // Foul! Don't execute the action
        return;
      }
    }

    // Header direction: towards opponent's side (negative Z)
    const direction = new THREE.Vector3(0, 0.5, -1).normalize();

    this.player.header(this.ball, direction, 1.0);
    console.log('Header!');
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }
}
