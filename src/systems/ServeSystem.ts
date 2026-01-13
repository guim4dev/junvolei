import * as THREE from 'three';
import { Ball } from '../entities/Ball';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import { GAME_CONFIG } from '../utils/constants';

export class ServeSystem {
  private servingTeam: 'player' | 'opponent' | null = null;
  private isServing: boolean = false;
  private serveDelay: number = 1500; // ms before serve
  private serveTimer: number = 0;
  private serverNPC: NPC | null = null;
  private ball: Ball;
  private player: Player;
  private npcs: { ally: NPC; opponent1: NPC; opponent2: NPC };
  private isPlayerServing: boolean = false;

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
    this.isServing = true;
    this.serveTimer = Date.now();

    // Position server behind the back line, at a CORNER (not center)
    const serveZ =
      team === 'player'
        ? GAME_CONFIG.COURT_LENGTH / 2 + 1.5 // Behind player's side
        : -GAME_CONFIG.COURT_LENGTH / 2 - 1.5; // Behind opponent's side

    // Random side (left or right corner)
    const side = Math.random() > 0.5 ? 1 : -1;
    const serveX = side * (GAME_CONFIG.COURT_WIDTH / 2 - 1);

    console.log(`[ServeSystem] Server position: x=${serveX.toFixed(2)}, z=${serveZ.toFixed(2)}`);

    if (team === 'player') {
      // PLAYER serves (user controls)
      this.isPlayerServing = true;
      this.serverNPC = null;
      console.log(`[ServeSystem] PLAYER serving - waiting for player to kick ball`);

      // Position player at corner
      this.player.mesh.position.set(serveX, 0, serveZ);
    } else {
      // Opponent NPC serves
      this.isPlayerServing = false;
      this.serverNPC = this.npcs.opponent1;
      console.log(`[ServeSystem] NPC serving - will auto-serve after ${this.serveDelay}ms`);

      // Position NPC at corner
      this.serverNPC.mesh.position.set(serveX, 0, serveZ);
    }

    // Position ball on ground in front of server
    const ballZ = serveZ - Math.sign(serveZ) * 0.5;
    this.ball.reset(serveX, GAME_CONFIG.BALL_RADIUS, ballZ);
    console.log(`[ServeSystem] Ball positioned: x=${serveX.toFixed(2)}, y=${GAME_CONFIG.BALL_RADIUS}, z=${ballZ.toFixed(2)}`);
  }

  public update(_deltaTime: number): boolean {
    if (!this.isServing) return false;

    // Check if delay has passed
    const elapsed = Date.now() - this.serveTimer;
    if (elapsed >= this.serveDelay) {
      if (this.isPlayerServing) {
        // Player serves - just end the serving state, player controls the ball now
        console.log(`[ServeSystem] Serve delay complete - PLAYER can now control ball`);
        this.isServing = false;
        this.isPlayerServing = false;
        return true; // Player can now kick the ball
      } else if (this.serverNPC) {
        // NPC serves automatically
        console.log(`[ServeSystem] Serve delay complete - executing NPC auto-serve`);
        this.executeServe();
        return true; // Serve completed
      }
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
      ? -GAME_CONFIG.COURT_LENGTH / 4  // Middle of opponent's side
      : GAME_CONFIG.COURT_LENGTH / 4;   // Middle of player's side

    // Random lateral variation (not too predictable)
    const targetX = (Math.random() - 0.5) * GAME_CONFIG.COURT_WIDTH * 0.6;

    console.log(`[ServeSystem] Serve target: x=${targetX.toFixed(2)}, z=${targetZ.toFixed(2)}`);

    // Get current ball position
    const ballPos = this.ball.getPosition();
    const dx = targetX - ballPos.x;
    const dz = targetZ - ballPos.z;

    // Desired flight time (~1.5 seconds)
    const flightTime = 1.5;

    // Calculate horizontal velocities
    const vx = dx / flightTime;
    const vz = dz / flightTime;

    // Calculate vertical velocity to reach desired height
    // Using physics: at peak, vy = 0, so initial vy = sqrt(2*g*h)
    const maxHeight = 4; // meters
    const gravity = Math.abs(GAME_CONFIG.GRAVITY);
    const vy = Math.sqrt(2 * gravity * maxHeight);

    const velocity = new THREE.Vector3(vx, vy, vz);
    console.log(`[ServeSystem] Serve velocity: vx=${vx.toFixed(2)}, vy=${vy.toFixed(2)}, vz=${vz.toFixed(2)}`);

    this.ball.setVelocity(velocity);

    // Reset serving state
    this.isServing = false;
    this.serverNPC = null;
    console.log(`[ServeSystem] Serve executed! Ball is in motion.`);
  }

  public isCurrentlyServing(): boolean {
    return this.isServing;
  }

  public getServingTeam(): 'player' | 'opponent' | null {
    return this.servingTeam;
  }
}
