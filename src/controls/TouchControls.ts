import { Player } from '../entities/Player';
import { Ball } from '../entities/Ball';
import { ScoreSystem } from '../systems/ScoreSystem';
import * as THREE from 'three';

export class TouchControls {
  private player: Player;
  private ball: Ball;
  private scoreSystem: ScoreSystem | null = null;
  private joystickBase: HTMLDivElement | null = null;
  private joystickThumb: HTMLDivElement | null = null;
  private actionButtons: { kick: HTMLButtonElement, header: HTMLButtonElement } | null = null;
  private moveX: number = 0;
  private moveZ: number = 0;
  private isMobile: boolean;
  private joystickActive: boolean = false;
  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private isSprinting: boolean = false;

  constructor(player: Player, ball: Ball) {
    this.player = player;
    this.ball = ball;
    this.isMobile = this.detectMobile();

    // Only create controls if on mobile
    if (this.isMobile) {
      this.createJoystick();
      this.actionButtons = this.createActionButtons();
    }
  }

  public setScoreSystem(scoreSystem: ScoreSystem) {
    this.scoreSystem = scoreSystem;
  }

  private detectMobile(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || 'ontouchstart' in window
    );
  }

  private createJoystick() {
    // Base of the joystick
    this.joystickBase = document.createElement('div');
    this.joystickBase.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 40px;
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      touch-action: none;
      z-index: 1000;
    `;

    // Thumb (movable part)
    this.joystickThumb = document.createElement('div');
    this.joystickThumb.style.cssText = `
      position: absolute;
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    this.joystickBase.appendChild(this.joystickThumb);
    document.body.appendChild(this.joystickBase);

    this.setupJoystickEvents();
  }

  private setupJoystickEvents() {
    if (!this.joystickBase || !this.joystickThumb) return;

    const handleStart = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      this.joystickActive = true;
      const rect = this.joystickBase!.getBoundingClientRect();
      this.joystickCenter = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      if (e instanceof TouchEvent) {
        this.updateJoystick(e.touches[0]);
      } else {
        this.updateJoystick(e);
      }
    };

    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!this.joystickActive) return;
      e.preventDefault();

      if (e instanceof TouchEvent) {
        this.updateJoystick(e.touches[0]);
      } else {
        this.updateJoystick(e);
      }
    };

    const handleEnd = () => {
      this.joystickActive = false;
      this.moveX = 0;
      this.moveZ = 0;
      this.isSprinting = false;
      if (this.joystickThumb) {
        this.joystickThumb.style.transform = 'translate(-50%, -50%)';
      }
    };

    this.joystickBase.addEventListener('touchstart', handleStart as EventListener);
    this.joystickBase.addEventListener('touchmove', handleMove as EventListener);
    this.joystickBase.addEventListener('touchend', handleEnd);
    this.joystickBase.addEventListener('touchcancel', handleEnd);

    // Also support mouse for testing
    this.joystickBase.addEventListener('mousedown', handleStart as EventListener);
    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
  }

  private updateJoystick(touch: Touch | MouseEvent) {
    const dx = touch.clientX - this.joystickCenter.x;
    const dy = touch.clientY - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 60; // Radius of joystick

    // Limit to max distance
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    // Position thumb
    const thumbX = Math.cos(angle) * clampedDistance;
    const thumbY = Math.sin(angle) * clampedDistance;
    if (this.joystickThumb) {
      this.joystickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;
    }

    // Calculate movement with dead zone
    const deadZone = maxDistance * 0.1;
    if (distance < deadZone) {
      this.moveX = 0;
      this.moveZ = 0;
      return;
    }

    // Normalize direction
    const normalizedDistance = (clampedDistance - deadZone) / (maxDistance - deadZone);
    this.moveX = Math.cos(angle) * normalizedDistance;
    this.moveZ = Math.sin(angle) * normalizedDistance;

    // Sprint if beyond 70% of max distance
    this.isSprinting = normalizedDistance > 0.7;
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

      // Register touch with score system
      if (this.scoreSystem) {
        const isValidTouch = this.scoreSystem.registerTouch(this.player.id, this.player.team);
        if (!isValidTouch) {
          // Foul! Don't execute the action
          return;
        }
      }

      const direction = new THREE.Vector3(0, 1, -1).normalize();
      this.player.kick(this.ball, direction, 1.0);
    };

    const handleHeader = () => {
      if (!this.player.canHeader(this.ball)) return;

      // Register touch with score system
      if (this.scoreSystem) {
        const isValidTouch = this.scoreSystem.registerTouch(this.player.id, this.player.team);
        if (!isValidTouch) {
          // Foul! Don't execute the action
          return;
        }
      }

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

    // Apply sprint multiplier if joystick is pushed far
    const speed = this.isSprinting ? 1.5 : 1.0;
    this.player.setMoveDirection(this.moveX * speed, this.moveZ * speed);
  }

  public hide() {
    // Hide controls
    if (!this.isMobile) return;

    if (this.joystickBase) {
      this.joystickBase.style.display = 'none';
    }

    if (this.actionButtons) {
      Object.values(this.actionButtons).forEach(btn => {
        if (btn.parentElement) btn.parentElement.style.display = 'none';
      });
    }
  }
}
