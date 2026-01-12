export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export class Menu {
  private container: HTMLDivElement;
  private currentState: GameState = 'menu';
  private onStateChangeCallback?: (state: GameState) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.zIndex = '3000';
    this.container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    document.body.appendChild(this.container);

    this.showMenu();
  }

  public setOnStateChange(callback: (state: GameState) => void) {
    this.onStateChangeCallback = callback;
  }

  private changeState(newState: GameState) {
    this.currentState = newState;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  private showMenu() {
    this.container.innerHTML = '';
    this.container.style.display = 'flex';

    const title = document.createElement('h1');
    title.innerHTML = 'JunVolei';
    title.style.color = 'white';
    title.style.fontSize = '72px';
    title.style.marginBottom = '20px';
    title.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';

    const subtitle = document.createElement('p');
    subtitle.innerHTML = 'Futev\u00f4lei 3D';
    subtitle.style.color = 'rgba(255,255,255,0.8)';
    subtitle.style.fontSize = '24px';
    subtitle.style.marginBottom = '50px';

    const playButton = this.createButton('JOGAR', () => {
      this.changeState('playing');
      this.hide();
    });

    const instructions = document.createElement('div');
    instructions.style.color = 'rgba(255,255,255,0.6)';
    instructions.style.fontSize = '16px';
    instructions.style.marginTop = '40px';
    instructions.style.textAlign = 'center';
    instructions.style.maxWidth = '400px';
    instructions.innerHTML = `
      <p style="margin: 10px 0;"><strong>Desktop:</strong> WASD para mover, ESPA\u00c7O para chutar, E para cabe\u00e7a</p>
      <p style="margin: 10px 0;"><strong>Mobile:</strong> Use os bot\u00f5es na tela</p>
      <p style="margin: 10px 0;"><strong>Objetivo:</strong> Primeiro time a marcar 12 pontos vence!</p>
    `;

    this.container.appendChild(title);
    this.container.appendChild(subtitle);
    this.container.appendChild(playButton);
    this.container.appendChild(instructions);
  }

  public showPause() {
    this.currentState = 'paused';
    this.container.innerHTML = '';
    this.container.style.display = 'flex';

    const title = document.createElement('h2');
    title.innerHTML = 'PAUSADO';
    title.style.color = 'white';
    title.style.fontSize = '48px';
    title.style.marginBottom = '40px';

    const resumeButton = this.createButton('CONTINUAR', () => {
      this.changeState('playing');
      this.hide();
    });

    const menuButton = this.createButton('MENU PRINCIPAL', () => {
      this.changeState('menu');
      this.showMenu();
    }, 'rgba(100, 100, 100, 0.5)');

    this.container.appendChild(title);
    this.container.appendChild(resumeButton);
    this.container.appendChild(menuButton);
  }

  public showGameOver(winner: 'player' | 'opponent', playerScore: number, opponentScore: number) {
    this.currentState = 'gameover';
    this.container.innerHTML = '';
    this.container.style.display = 'flex';

    const title = document.createElement('h1');
    title.innerHTML = winner === 'player' ? 'VIT\u00d3RIA!' : 'DERROTA';
    title.style.color = winner === 'player' ? '#00ff00' : '#ff0000';
    title.style.fontSize = '64px';
    title.style.marginBottom = '20px';
    title.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';

    const score = document.createElement('p');
    score.innerHTML = `Placar Final: ${playerScore} - ${opponentScore}`;
    score.style.color = 'white';
    score.style.fontSize = '32px';
    score.style.marginBottom = '40px';

    const playAgainButton = this.createButton('JOGAR NOVAMENTE', () => {
      this.changeState('playing');
      this.hide();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('playing');
      }
    });

    const menuButton = this.createButton('MENU PRINCIPAL', () => {
      this.changeState('menu');
      this.showMenu();
    }, 'rgba(100, 100, 100, 0.5)');

    this.container.appendChild(title);
    this.container.appendChild(score);
    this.container.appendChild(playAgainButton);
    this.container.appendChild(menuButton);
  }

  private createButton(text: string, onClick: () => void, bgColor: string = 'rgba(255, 100, 100, 0.6)'): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.style.padding = '15px 40px';
    button.style.fontSize = '24px';
    button.style.fontWeight = 'bold';
    button.style.color = 'white';
    button.style.backgroundColor = bgColor;
    button.style.border = '3px solid rgba(255, 255, 255, 0.6)';
    button.style.borderRadius = '10px';
    button.style.cursor = 'pointer';
    button.style.margin = '10px';
    button.style.transition = 'all 0.2s';

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.backgroundColor = 'rgba(255, 120, 120, 0.8)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.backgroundColor = bgColor;
    });

    button.addEventListener('click', onClick);

    return button;
  }

  public hide() {
    this.container.style.display = 'none';
  }

  public show() {
    this.container.style.display = 'flex';
  }

  public getState(): GameState {
    return this.currentState;
  }
}
