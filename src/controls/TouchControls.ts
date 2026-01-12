import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import * as THREE from 'three';

export class TouchControls {
  private player: Player;
  private ball: Ball;
  private moveButtons: { up: HTMLButtonElement, down: HTMLButtonElement, left: HTMLButtonElement, right: HTMLButtonElement } | null = null;
  private actionButtons: { kick: HTMLButtonElement, header: HTMLButtonElement } | null = null;
  private moveX: number = 0;
  private moveZ: number = 0;
  private isMobile: boolean;

  constructor(player: Player, ball: Ball) {
    this.player = player;
    this.ball = ball;
    this.isMobile = this.detectMobile();

    // Only create controls if on mobile
    if (this.isMobile) {
      this.moveButtons = this.createMovementControls();
      this.actionButtons = this.createActionButtons();
    }
  }

  private detectMobile(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || 'ontouchstart' in window
    );
  }

  private createMovementControls() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.left = '20px';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(3, 60px)';
    container.style.gridTemplateRows = 'repeat(3, 60px)';
    container.style.gap = '10px';
    container.style.zIndex = '1000';

    const buttonStyle = `
      background: rgba(255, 255, 255, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 10px;
      color: white;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    const up = document.createElement('button');
    up.innerHTML = '↑';
    up.style.cssText = buttonStyle;
    up.style.gridColumn = '2';
    up.style.gridRow = '1';

    const left = document.createElement('button');
    left.innerHTML = '←';
    left.style.cssText = buttonStyle;
    left.style.gridColumn = '1';
    left.style.gridRow = '2';

    const right = document.createElement('button');
    right.innerHTML = '→';
    right.style.cssText = buttonStyle;
    right.style.gridColumn = '3';
    right.style.gridRow = '2';

    const down = document.createElement('button');
    down.innerHTML = '↓';
    down.style.cssText = buttonStyle;
    down.style.gridColumn = '2';
    down.style.gridRow = '3';

    // Touch event handlers
    const handleTouchStart = (x: number, z: number) => () => {
      this.moveX = x;
      this.moveZ = z;
    };

    const handleTouchEnd = () => {
      this.moveX = 0;
      this.moveZ = 0;
    };

    up.addEventListener('touchstart', handleTouchStart(0, -1));
    up.addEventListener('touchend', handleTouchEnd);
    down.addEventListener('touchstart', handleTouchStart(0, 1));
    down.addEventListener('touchend', handleTouchEnd);
    left.addEventListener('touchstart', handleTouchStart(-1, 0));
    left.addEventListener('touchend', handleTouchEnd);
    right.addEventListener('touchstart', handleTouchStart(1, 0));
    right.addEventListener('touchend', handleTouchEnd);

    // Also support mouse for testing
    up.addEventListener('mousedown', handleTouchStart(0, -1));
    up.addEventListener('mouseup', handleTouchEnd);
    down.addEventListener('mousedown', handleTouchStart(0, 1));
    down.addEventListener('mouseup', handleTouchEnd);
    left.addEventListener('mousedown', handleTouchStart(-1, 0));
    left.addEventListener('mouseup', handleTouchEnd);
    right.addEventListener('mousedown', handleTouchStart(1, 0));
    right.addEventListener('mouseup', handleTouchEnd);

    container.appendChild(up);
    container.appendChild(left);
    container.appendChild(right);
    container.appendChild(down);

    document.body.appendChild(container);

    return { up, down, left, right };
  }

  private createActionButtons() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    container.style.zIndex = '1000';

    const buttonStyle = `
      width: 80px;
      height: 80px;
      background: rgba(255, 100, 100, 0.4);
      border: 3px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      color: white;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const kick = document.createElement('button');
    kick.innerHTML = 'KICK';
    kick.style.cssText = buttonStyle;

    const header = document.createElement('button');
    header.innerHTML = 'HEAD';
    header.style.cssText = buttonStyle;

    const handleKick = () => {
      if (!this.player.canKick(this.ball)) return;
      const direction = new THREE.Vector3(0, 1, -1).normalize();
      this.player.kick(this.ball, direction, 1.0);
    };

    const handleHeader = () => {
      if (!this.player.canHeader(this.ball)) return;
      const direction = new THREE.Vector3(0, 0.5, -1).normalize();
      this.player.header(this.ball, direction, 1.0);
    };

    kick.addEventListener('touchstart', handleKick);
    kick.addEventListener('mousedown', handleKick);
    header.addEventListener('touchstart', handleHeader);
    header.addEventListener('mousedown', handleHeader);

    container.appendChild(kick);
    container.appendChild(header);

    document.body.appendChild(container);

    return { kick, header };
  }

  public update() {
    // Only update if on mobile
    if (!this.isMobile) return;
    this.player.setMoveDirection(this.moveX, this.moveZ);
  }

  public hide() {
    // Hide controls (useful for desktop)
    if (!this.isMobile) return;

    if (this.moveButtons) {
      Object.values(this.moveButtons).forEach(btn => {
        if (btn.parentElement) btn.parentElement.style.display = 'none';
      });
    }

    if (this.actionButtons) {
      Object.values(this.actionButtons).forEach(btn => {
        if (btn.parentElement) btn.parentElement.style.display = 'none';
      });
    }
  }
}
