import * as THREE from 'three';
import { Ball } from '../entities/Ball';
import { NPC } from '../entities/NPC';
import { GAME_CONFIG } from '../utils/constants';

export class ServeSystem {
  private servingTeam: 'player' | 'opponent' | null = null;
  private isServing: boolean = false;
  private serveDelay: number = 1500; // ms before serve
  private serveTimer: number = 0;
  private serverNPC: NPC | null = null;
  private ball: Ball;
  private npcs: { ally: NPC; opponent1: NPC; opponent2: NPC };

  constructor(
    ball: Ball,
    npcs: { ally: NPC; opponent1: NPC; opponent2: NPC }
  ) {
    this.ball = ball;
    this.npcs = npcs;
  }

  public startServe(team: 'player' | 'opponent') {
    this.servingTeam = team;
    this.isServing = true;
    this.serveTimer = Date.now();

    // Select NPC that will serve
    this.serverNPC = team === 'player' ? this.npcs.ally : this.npcs.opponent1;

    // Position server behind the back line
    const serveZ =
      team === 'player'
        ? GAME_CONFIG.COURT_LENGTH / 2 + 1 // Behind player's side
        : -GAME_CONFIG.COURT_LENGTH / 2 - 1; // Behind opponent's side

    // Position server at center X, behind the line
    this.serverNPC.mesh.position.set(0, 0, serveZ);

    // Position ball on ground in front of server
    const ballZ = serveZ - Math.sign(serveZ) * 0.5;
    this.ball.reset(0, GAME_CONFIG.BALL_RADIUS, ballZ);
  }

  public update(_deltaTime: number): boolean {
    if (!this.isServing || !this.serverNPC) return false;

    // Check if delay has passed
    const elapsed = Date.now() - this.serveTimer;
    if (elapsed >= this.serveDelay) {
      this.executeServe();
      return true; // Serve completed
    }

    return false;
  }

  private executeServe() {
    if (!this.serverNPC || !this.servingTeam) return;

    // Calculate serve direction (toward opposite side)
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3, // Slight lateral variation
      0.8, // High arc to clear the net
      this.servingTeam === 'player' ? -1 : 1 // Toward opponent
    ).normalize();

    // Serve force
    const serveForce = 12;

    this.ball.setVelocity(direction.multiplyScalar(serveForce));

    // Reset serving state
    this.isServing = false;
    this.serverNPC = null;
  }

  public isCurrentlyServing(): boolean {
    return this.isServing;
  }

  public getServingTeam(): 'player' | 'opponent' | null {
    return this.servingTeam;
  }
}
