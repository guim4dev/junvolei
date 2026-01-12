import { Player } from '../entities/Player';

export class InputSystem {
  private keys: Map<string, boolean>;
  private player: Player;

  constructor(player: Player) {
    this.player = player;
    this.keys = new Map();

    this.setupKeyboardListeners();
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.key.toLowerCase(), true);
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
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }
}
