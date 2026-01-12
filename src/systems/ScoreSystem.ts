import { Ball } from '../entities/Ball';
import { GAME_CONFIG } from '../utils/constants';

export type Team = 'player' | 'opponent';

export class ScoreSystem {
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private touchCount: number = 0;
  private lastTouchTeam: Team | null = null;
  private onScoreCallback?: (playerScore: number, opponentScore: number, scoringTeam: Team) => void;
  private onResetCallback?: () => void;

  constructor() {}

  public setOnScoreCallback(callback: (playerScore: number, opponentScore: number, scoringTeam: Team) => void) {
    this.onScoreCallback = callback;
  }

  public setOnResetCallback(callback: () => void) {
    this.onResetCallback = callback;
  }

  public update(ball: Ball) {
    // Check if ball hit the ground
    if (ball.isOnGround() && ball.isStopped()) {
      this.checkForScore(ball);
    }

    // Check if ball went out of bounds
    if (ball.getIsOutOfBounds()) {
      this.checkForScore(ball);
    }
  }

  private checkForScore(ball: Ball) {
    const ballPos = ball.getPosition();
    const { COURT_LENGTH } = GAME_CONFIG;

    let scoringTeam: Team | null = null;

    // Determine which side the ball landed on
    if (ballPos.z < 0) {
      // Ball landed on opponent's side - player scores
      scoringTeam = 'player';
      this.playerScore++;
    } else if (ballPos.z > 0) {
      // Ball landed on player's side - opponent scores
      scoringTeam = 'opponent';
      this.opponentScore++;
    }

    if (scoringTeam && this.onScoreCallback) {
      this.onScoreCallback(this.playerScore, this.opponentScore, scoringTeam);
    }

    // Reset for next rally
    this.resetRally();
  }

  private resetRally() {
    this.touchCount = 0;
    this.lastTouchTeam = null;

    if (this.onResetCallback) {
      this.onResetCallback();
    }
  }

  public registerTouch(team: Team) {
    if (this.lastTouchTeam === team) {
      this.touchCount++;
    } else {
      this.touchCount = 1;
      this.lastTouchTeam = team;
    }

    // Check for too many touches (violation)
    if (this.touchCount > GAME_CONFIG.MAX_TOUCHES) {
      // Award point to other team
      const scoringTeam: Team = team === 'player' ? 'opponent' : 'player';

      if (scoringTeam === 'player') {
        this.playerScore++;
      } else {
        this.opponentScore++;
      }

      if (this.onScoreCallback) {
        this.onScoreCallback(this.playerScore, this.opponentScore, scoringTeam);
      }

      this.resetRally();
    }
  }

  public getPlayerScore(): number {
    return this.playerScore;
  }

  public getOpponentScore(): number {
    return this.opponentScore;
  }

  public isGameOver(): boolean {
    return this.playerScore >= GAME_CONFIG.POINTS_TO_WIN ||
           this.opponentScore >= GAME_CONFIG.POINTS_TO_WIN;
  }

  public getWinner(): Team | null {
    if (this.playerScore >= GAME_CONFIG.POINTS_TO_WIN) return 'player';
    if (this.opponentScore >= GAME_CONFIG.POINTS_TO_WIN) return 'opponent';
    return null;
  }

  public reset() {
    this.playerScore = 0;
    this.opponentScore = 0;
    this.resetRally();
  }
}
