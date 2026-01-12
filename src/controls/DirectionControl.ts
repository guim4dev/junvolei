import * as THREE from 'three';

export class DirectionControl {
  private angle: number = 0; // Radians, 0 = forward
  private isActive: boolean = false;
  private startTouch: { x: number; y: number } | null = null;

  public start(touchX: number, touchY: number) {
    this.isActive = true;
    this.startTouch = { x: touchX, y: touchY };
    this.angle = 0; // Default: forward
  }

  public update(touchX: number, touchY: number) {
    if (!this.isActive || !this.startTouch) return;

    const dx = touchX - this.startTouch.x;
    const dy = touchY - this.startTouch.y;

    // Only update if dragged enough (dead zone)
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      this.angle = Math.atan2(dx, -dy); // Convert to game coordinates
    }
  }

  public getDirection(): THREE.Vector3 {
    // Convert angle to 3D vector
    // angle = 0 → forward (Z negative for opponent side)
    // angle = PI/2 → right
    // angle = -PI/2 → left
    return new THREE.Vector3(
      Math.sin(this.angle), // X
      0.5, // Y (always a bit upward)
      -Math.cos(this.angle) // Z (negative = opponent side)
    ).normalize();
  }

  public getAngle(): number {
    return this.angle;
  }

  public stop() {
    this.isActive = false;
    this.startTouch = null;
  }

  public isRunning(): boolean {
    return this.isActive;
  }
}
