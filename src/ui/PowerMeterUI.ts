export class PowerMeterUI {
  private container: HTMLDivElement;
  private fill: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 200px;
      right: 30px;
      width: 30px;
      height: 150px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid white;
      border-radius: 5px;
      display: none;
      z-index: 1001;
    `;

    this.fill = document.createElement('div');
    this.fill.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0%;
      background: linear-gradient(to top, #00ff00, #ffff00, #ff0000);
      border-radius: 3px;
      transition: height 0.05s linear;
    `;

    this.container.appendChild(this.fill);
    document.body.appendChild(this.container);
  }

  public show() {
    this.container.style.display = 'block';
  }

  public hide() {
    this.container.style.display = 'none';
  }

  public update(power: number) {
    // power: 0 to 1
    this.fill.style.height = `${power * 100}%`;

    // Change color based on power
    if (power < 0.3) {
      this.fill.style.background = '#00ff00'; // Green (weak)
    } else if (power < 0.7) {
      this.fill.style.background = '#ffff00'; // Yellow (medium)
    } else {
      this.fill.style.background = '#ff6600'; // Orange (strong)
    }
  }

  public cleanup() {
    if (this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
  }
}
