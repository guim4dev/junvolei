export class PowerMeter {
  private power: number = 0;
  private direction: number = 1; // 1 = increasing, -1 = decreasing
  private speed: number = 2.5; // Cycles per second
  private isActive: boolean = false;

  public start() {
    this.isActive = true;
    this.power = 0;
    this.direction = 1;
  }

  public update(deltaTime: number): number {
    if (!this.isActive) return 0;

    // Oscillate between 0 and 1
    this.power += this.direction * this.speed * deltaTime;

    if (this.power >= 1) {
      this.power = 1;
      this.direction = -1;
    } else if (this.power <= 0) {
      this.power = 0;
      this.direction = 1;
    }

    return this.power;
  }

  public stop(): number {
    this.isActive = false;
    return this.power; // Return power at the moment of release
  }

  public isRunning(): boolean {
    return this.isActive;
  }

  public getCurrentPower(): number {
    return this.power;
  }
}
