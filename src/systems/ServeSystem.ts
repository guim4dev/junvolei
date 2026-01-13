import * as THREE from 'three';
import { Ball } from '../entities/Ball';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import { GAME_CONFIG } from '../utils/constants';

export class ServeSystem {
  private servingTeam: 'player' | 'opponent' | null = null;
  private serveState: 'waiting' | 'positioning' | 'ready' | 'serving' = 'waiting';
  private serveTimer: number = 0;
  private readonly POSITION_TIME = 1000; // 1s for positioning
  private readonly SERVE_DELAY = 1000; // 1s before serve
  private serverNPC: NPC | null = null;
  private ball: Ball;
  private player: Player;
  private npcs: { ally: NPC; opponent1: NPC; opponent2: NPC };

  constructor(
    ball: Ball,
    player: Player,
    npcs: { ally: NPC; opponent1: NPC; opponent2: NPC }
  ) {
    this.ball = ball;
    this.player = player;
    this.npcs = npcs;
  }

  public startServe(team: 'player' | 'opponent') {
    console.log(`[ServeSystem] startServe() - Team: ${team}`);
    this.servingTeam = team;
    this.serveState = 'positioning';
    this.serveTimer = 0;

    // Select server NPC (always NPC serves, even for player team)
    if (team === 'player') {
      this.serverNPC = this.npcs.ally; // Ally NPC serves for player team
      console.log(`[ServeSystem] Ally NPC will serve for player team`);
    } else {
      this.serverNPC = this.npcs.opponent1; // Opponent NPC serves
      console.log(`[ServeSystem] Opponent NPC will serve`);
    }

    // Position server at corner behind back line
    const serveZ =
      team === 'player'
        ? GAME_CONFIG.COURT_LENGTH / 2 + 1.5 // Behind player's side
        : -GAME_CONFIG.COURT_LENGTH / 2 - 1.5; // Behind opponent's side

    const side = Math.random() > 0.5 ? 1 : -1;
    const serveX = side * (GAME_CONFIG.COURT_WIDTH / 2 - 1);

    console.log(`[ServeSystem] Positioning server at: x=${serveX.toFixed(2)}, z=${serveZ.toFixed(2)}`);

    // Position NPC at serve position
    this.serverNPC.mesh.position.set(serveX, 0, serveZ);

    // Position ball in the AIR in front of server (not on ground!)
    const ballX = serveX;
    const ballY = 1.5; // Comfortable height for kicking
    const ballZ = serveZ - Math.sign(serveZ) * 0.5;

    this.ball.reset(ballX, ballY, ballZ);
    this.ball.setVelocity(new THREE.Vector3(0, 0, 0)); // Ball suspended in air
    console.log(`[ServeSystem] Ball suspended in air at: x=${ballX.toFixed(2)}, y=${ballY}, z=${ballZ.toFixed(2)}`);
  }

  public update(deltaTime: number): boolean {
    if (this.serveState === 'waiting') return false;

    this.serveTimer += deltaTime * 1000; // Convert to ms

    switch (this.serveState) {
      case 'positioning':
        // Wait for NPC to get into position
        if (this.serveTimer > this.POSITION_TIME) {
          console.log(`[ServeSystem] Positioning complete - preparing serve`);
          this.serveState = 'ready';
          this.serveTimer = 0;
        }
        break;

      case 'ready':
        // Ball is suspended in air, wait before serving
        if (this.serveTimer > this.SERVE_DELAY) {
          console.log(`[ServeSystem] Delay complete - executing auto-serve`);
          this.executeServe();
          this.serveState = 'waiting';
          return true; // Serve completed
        }
        break;
    }

    return false;
  }

  private executeServe() {
    if (!this.serverNPC || !this.servingTeam) {
      console.log(`[ServeSystem] ERROR - executeServe() called but serverNPC or servingTeam is null`);
      return;
    }

    // Calculate target position in opponent's side
    const targetZ = this.servingTeam === 'player'
      ? -GAME_CONFIG.COURT_LENGTH / 3  // Deeper in opponent's side
      : GAME_CONFIG.COURT_LENGTH / 3;   // Deeper in player's side

    // Random lateral variation
    const targetX = (Math.random() - 0.5) * GAME_CONFIG.COURT_WIDTH * 0.5;

    console.log(`[ServeSystem] Serve target: x=${targetX.toFixed(2)}, z=${targetZ.toFixed(2)}`);

    // Get current ball position
    const ballPos = this.ball.getPosition();
    const startY = ballPos.y; // Ball starts at 1.5m
    const dx = targetX - ballPos.x;
    const dz = targetZ - ballPos.z;

    // Calculate horizontal distance
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

    // Use VERY high speeds to ensure ball crosses court
    // Direct calculation: just give the ball enough velocity
    const direction = new THREE.Vector3(dx, 0, dz).normalize();

    // Horizontal velocity: very fast to cover distance quickly
    const horizontalVelocity = 16; // m/s - very fast
    const vx = direction.x * horizontalVelocity;
    const vz = direction.z * horizontalVelocity;

    // Vertical velocity: high enough to keep ball in air
    // For a distance of ~16m at 16 m/s, we need ~1 second flight time
    // To clear net (2.2m) and land at 0.5m, we need good arc
    const vy = 8; // m/s upward - creates nice arc

    const velocity = new THREE.Vector3(vx, vy, vz);

    console.log(`[ServeSystem] Serve velocity: vx=${vx.toFixed(2)}, vy=${vy.toFixed(2)}, vz=${vz.toFixed(2)}, dist=${horizontalDistance.toFixed(2)}`);

    this.ball.setVelocity(velocity);

    this.serverNPC = null;
    console.log(`[ServeSystem] Serve executed! Ball is in motion.`);
  }

  public isCurrentlyServing(): boolean {
    return this.serveState !== 'waiting';
  }

  public getServingTeam(): 'player' | 'opponent' | null {
    return this.servingTeam;
  }
}
