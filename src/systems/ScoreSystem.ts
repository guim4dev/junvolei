import { Ball } from '../entities/Ball';
import { GAME_CONFIG } from '../utils/constants';

export type Team = 'player' | 'opponent';

export class ScoreSystem {
  private playerScore: number = 0;
  private opponentScore: number = 0;
  private touchCount: number = 0;
  private lastTouchPlayerId: string | null = null;
  private currentTeam: Team | null = null;
  private lastScoringTeam: Team | null = null;
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

    if (scoringTeam) {
      this.lastScoringTeam = scoringTeam;
      if (this.onScoreCallback) {
        this.onScoreCallback(this.playerScore, this.opponentScore, scoringTeam);
      }
    }

    // Reset for next rally
    this.resetRally();
  }

  private resetRally() {
    this.touchCount = 0;
    this.lastTouchPlayerId = null;
    this.currentTeam = null;

    if (this.onResetCallback) {
      this.onResetCallback();
    }
  }

  public registerTouch(playerId: string, team: Team): boolean {
    // If team changed, reset touch count
    if (this.currentTeam !== team) {
      this.touchCount = 0;
      this.lastTouchPlayerId = null;
      this.currentTeam = team;
    }

    // Check if same player touched twice in a row (FOUL!)
    if (this.lastTouchPlayerId === playerId) {
      console.log(`FOUL: Player ${playerId} touched the ball twice in a row!`);
      this.awardPointForFoul(team);
      return false;
    }

    // Increment touch count
    this.touchCount++;
    this.lastTouchPlayerId = playerId;

    // Check for too many touches (FOUL!)
    if (this.touchCount > GAME_CONFIG.MAX_TOUCHES) {
      console.log(`FOUL: More than ${GAME_CONFIG.MAX_TOUCHES} touches by ${team} team!`);
      this.awardPointForFoul(team);
      return false;
    }

    return true;
  }

  private awardPointForFoul(foulTeam: Team) {
    // Award point to other team
    const scoringTeam: Team = foulTeam === 'player' ? 'opponent' : 'player';

    if (scoringTeam === 'player') {
      this.playerScore++;
    } else {
      this.opponentScore++;
    }

    this.lastScoringTeam = scoringTeam;
    if (this.onScoreCallback) {
      this.onScoreCallback(this.playerScore, this.opponentScore, scoringTeam);
    }

    this.resetRally();
  }

  public getServingTeam(): Team {
    // Team that LOST the point serves (opponent of last scoring team)
    if (this.lastScoringTeam === 'player') {
      return 'opponent';
    } else {
      return 'player';
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
