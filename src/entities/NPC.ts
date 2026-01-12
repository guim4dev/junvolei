import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { Ball } from './Ball';

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

  constructor(x: number, z: number, isAlly: boolean) {
    this.velocity = new THREE.Vector3();
    this.homePosition = new THREE.Vector3(x, 0, z);
    this.state = 'idle';
    this.reactionTime = GAME_CONFIG.NPC_REACTION_TIME;
    this.lastActionTime = 0;
    this.isAlly = isAlly;

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

  public update(deltaTime: number, ball: Ball, currentTime: number) {
    const ballPos = ball.getPosition();
    const npcPos = this.getPosition();
    const distanceToBall = ballPos.distanceTo(npcPos);

    // Simple AI state machine
    if (distanceToBall < 3 && !ball.isStopped()) {
      this.state = 'chase';
    } else if (distanceToBall < this.kickRange) {
      this.state = 'attack';
    } else {
      this.state = 'return';
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

    const speed = GAME_CONFIG.PLAYER_SPEED * 0.8; // NPCs slightly slower
    this.velocity.x = direction.x * speed;
    this.velocity.z = direction.z * speed;
  }

  private attackBall(ball: Ball, currentTime: number) {
    // Add reaction time delay
    if (currentTime - this.lastActionTime < this.reactionTime * 1000) {
      return;
    }

    const npcPos = this.getPosition();

    // Determine kick direction based on team
    let targetZ: number;
    if (this.isAlly) {
      // Ally kicks toward opponent side (negative Z)
      targetZ = -GAME_CONFIG.COURT_LENGTH / 2;
    } else {
      // Opponent kicks toward player side (positive Z)
      targetZ = GAME_CONFIG.COURT_LENGTH / 2;
    }

    const direction = new THREE.Vector3(0, 1, targetZ - npcPos.z).normalize();

    // Apply kick force
    const kickPower = 7;
    const force = direction.multiplyScalar(kickPower);
    ball.setVelocity(force);

    this.lastActionTime = currentTime;
    this.velocity.set(0, 0, 0); // Stop after kicking
  }

  private returnToHome(_deltaTime: number) {
    const npcPos = this.getPosition();
    const distanceToHome = npcPos.distanceTo(this.homePosition);

    if (distanceToHome < 0.5) {
      this.velocity.set(0, 0, 0);
      return;
    }

    const direction = new THREE.Vector3().subVectors(this.homePosition, npcPos).normalize();
    const speed = GAME_CONFIG.PLAYER_SPEED * 0.6;
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
