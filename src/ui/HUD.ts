export class HUD {
  private container: HTMLDivElement;
  private scoreDisplay: HTMLDivElement;

  constructor() {
    // Create HUD container
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.top = '20px';
    this.container.style.left = '50%';
    this.container.style.transform = 'translateX(-50%)';
    this.container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.container.style.color = 'white';
    this.container.style.fontSize = '24px';
    this.container.style.fontWeight = 'bold';
    this.container.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    this.container.style.zIndex = '1000';
    this.container.style.pointerEvents = 'none';

    // Score display
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.textAlign = 'center';
    this.scoreDisplay.style.padding = '10px 20px';
    this.scoreDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.scoreDisplay.style.borderRadius = '10px';
    this.scoreDisplay.innerHTML = '0 - 0';

    this.container.appendChild(this.scoreDisplay);
    document.body.appendChild(this.container);
  }

  public updateScore(playerScore: number, opponentScore: number) {
    this.scoreDisplay.innerHTML = `${playerScore} - ${opponentScore}`;
  }

  public showMessage(message: string, duration: number = 2000) {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.fontSize = '48px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.color = 'white';
    messageDiv.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
    messageDiv.style.zIndex = '2000';
    messageDiv.innerHTML = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, duration);
  }
}
