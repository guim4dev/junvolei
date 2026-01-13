import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { Ball } from './Ball';
import { ScoreSystem } from '../systems/ScoreSystem';

type NPCState = 'idle' | 'chase' | 'attack' | 'return';

export class NPC {
  public mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private homePosition: THREE.Vector3;
  private state: NPCState;
  private reactionTime: number;
  private lastActionTime: number;
  private kickRange: number = 1.0;
  private isAlly: boolean;
  public readonly id: string;
  public readonly team: 'player' | 'opponent';
  private scoreSystem: ScoreSystem | null = null;

  constructor(x: number, z: number, isAlly: boolean, id: string) {
    this.velocity = new THREE.Vector3();
    this.homePosition = new THREE.Vector3(x, 0, z);
    this.state = 'idle';
    this.reactionTime = GAME_CONFIG.NPC_REACTION_TIME;
    this.lastActionTime = 0;
    this.isAlly = isAlly;
    this.id = id;
    this.team = isAlly ? 'player' : 'opponent';

    // Create NPC mesh (similar to player but different color)
    const height = GAME_CONFIG.PLAYER_HEIGHT;
    const radius = GAME_CONFIG.PLAYER_RADIUS;

    const group = new THREE.Group();

    // Body
    const color = isAlly ? COLORS.TEAM_ALLY : COLORS.TEAM_OPPONENT;
    const bodyGeometry = new THREE.CylinderGeometry(radius, radius, height * 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height * 0.3;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(radius * 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = height * 0.7;
    head.castShadow = true;
    group.add(head);

    this.mesh = new THREE.Mesh();
    this.mesh.add(group);
    this.mesh.position.copy(this.homePosition);
  }

  public setScoreSystem(scoreSystem: ScoreSystem) {
    this.scoreSystem = scoreSystem;
  }

  public update(deltaTime: number, ball: Ball, currentTime: number) {
    const ballPos = ball.getPosition();
    const npcPos = this.getPosition();
    const distanceToBall = ballPos.distanceTo(npcPos);

    const oldState = this.state;

    // Check if ball is on my side OR heading toward my side (predictive)
    const ballVelocity = ball.getVelocity();
    const ballOnMySide = (this.isAlly && ballPos.z > 0) || (!this.isAlly && ballPos.z < 0);
    const ballHeadingToMySide = (this.isAlly && ballVelocity.z > 0) || (!this.isAlly && ballVelocity.z < 0);
    const shouldChase = ballOnMySide || ballHeadingToMySide;

    // Simple AI state machine
    if (shouldChase && distanceToBall < 15 && !ball.isStopped()) { // Much larger range to catch serves
      this.state = 'chase';
    } else if (distanceToBall < this.kickRange) {
      this.state = 'attack';
    } else {
      this.state = 'return';
    }

    // Log state changes
    if (oldState !== this.state) {
      console.log(`[NPC ${this.id}] State changed: ${oldState} -> ${this.state} (distToBall: ${distanceToBall.toFixed(2)})`);
    }

    // Execute state behavior
    switch (this.state) {
      case 'chase':
        this.chaseBall(ballPos, deltaTime);
        break;
      case 'attack':
        this.attackBall(ball, currentTime);
        break;
      case 'return':
        this.returnToHome(deltaTime);
        break;
    }

    // Apply movement with constraints
    this.applyMovement(deltaTime);
  }

  private chaseBall(ballPos: THREE.Vector3, _deltaTime: number) {
    const npcPos = this.getPosition();
    const direction = new THREE.Vector3().subVectors(ballPos, npcPos).normalize();

    const speed = GAME_CONFIG.PLAYER_SPEED * 2.0; // NPCs much faster to catch serves
    this.velocity.x = direction.x * speed;
    this.velocity.z = direction.z * speed;
  }

  private attackBall(ball: Ball, currentTime: number) {
    // Add reaction time delay
    if (currentTime - this.lastActionTime < this.reactionTime * 1000) {
      return;
    }

    const npcPos = this.getPosition();
    const ballPos = ball.getPosition();

    console.log(`[NPC ${this.id}] Attempting to attack - Ball at z=${ballPos.z.toFixed(2)}, NPC at z=${npcPos.z.toFixed(2)}`);

    // Register touch with score system
    if (this.scoreSystem) {
      const isValidTouch = this.scoreSystem.registerTouch(this.id, this.team);
      if (!isValidTouch) {
        // Foul! Don't execute the action
        console.log(`[NPC ${this.id}] FOUL - Touch not valid, skipping attack`);
        this.lastActionTime = currentTime;
        return;
      }
    }

    // Determine target position on opponent's side
    let targetZ: number;
    if (this.isAlly) {
      // Ally kicks toward opponent side (negative Z)
      targetZ = -GAME_CONFIG.COURT_LENGTH / 3; // Deep in opponent court
    } else {
      // Opponent kicks toward player side (positive Z)
      targetZ = GAME_CONFIG.COURT_LENGTH / 3; // Deep in player court
    }

    // Add some lateral variation (don't always aim center)
    const targetX = (Math.random() - 0.5) * GAME_CONFIG.COURT_WIDTH * 0.6;

    console.log(`[NPC ${this.id}] Attacking - Team: ${this.team}, Target: x=${targetX.toFixed(2)}, z=${targetZ.toFixed(2)}`);

    // Calculate direction vector from ball to target
    const dx = targetX - npcPos.x;
    const dz = targetZ - npcPos.z;
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz);

    // Calculate kick power based on distance (farther = more power)
    const basePower = 10; // Reduced from 12 to 10 for better accuracy
    const kickPower = Math.min(basePower + horizontalDistance * 0.3, 14); // Cap at 14

    // Calculate horizontal direction
    const horizontalDirection = new THREE.Vector3(dx, 0, dz).normalize();

    // Apply horizontal velocity
    const force = horizontalDirection.multiplyScalar(kickPower);

    // Add vertical component for arc (must clear net!)
    // Simple heuristic: higher arc for longer distances
    force.y = Math.max(6, horizontalDistance * 0.4);

    console.log(`[NPC ${this.id}] Kick force: x=${force.x.toFixed(2)}, y=${force.y.toFixed(2)}, z=${force.z.toFixed(2)}, power=${kickPower.toFixed(2)}, dist=${horizontalDistance.toFixed(2)}`);

    ball.setVelocity(force);

    this.lastActionTime = currentTime;
    this.velocity.set(0, 0, 0); // Stop after kicking

    console.log(`[NPC ${this.id}] Ball kicked! Velocity applied.`);
  }

  private returnToHome(_deltaTime: number) {
    const npcPos = this.getPosition();
    const distanceToHome = npcPos.distanceTo(this.homePosition);

    if (distanceToHome < 0.5) {
      this.velocity.set(0, 0, 0);
      return;
    }

    const direction = new THREE.Vector3().subVectors(this.homePosition, npcPos).normalize();
    const speed = GAME_CONFIG.PLAYER_SPEED * 1.5; // Faster return to position
    this.velocity.x = direction.x * speed;
    this.velocity.z = direction.z * speed;
  }

  private applyMovement(deltaTime: number) {
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.z += this.velocity.z * deltaTime;

    // Constrain to appropriate court side
    const { COURT_WIDTH, COURT_LENGTH } = GAME_CONFIG;
    const margin = 0.5;

    this.mesh.position.x = Math.max(
      -COURT_WIDTH / 2 + margin,
      Math.min(COURT_WIDTH / 2 - margin, this.mesh.position.x)
    );

    if (this.isAlly) {
      // Ally stays on player's side (positive Z)
      this.mesh.position.z = Math.max(
        0 + margin,
        Math.min(COURT_LENGTH / 2 - margin, this.mesh.position.z)
      );
    } else {
      // Opponents stay on their side (negative Z)
      this.mesh.position.z = Math.max(
        -COURT_LENGTH / 2 + margin,
        Math.min(0 - margin, this.mesh.position.z)
      );
    }
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}
