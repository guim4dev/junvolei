import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { Ball } from './Ball';

export class Player {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  private moveDirection: THREE.Vector2;
  private kickRange: number = 1.0;
  private headerRange: number = 1.2;
  public readonly id: string = 'player';
  public readonly team: 'player' | 'opponent' = 'player';

  constructor(x: number, z: number, color: number = COLORS.TEAM_PLAYER) {
    this.velocity = new THREE.Vector3();
    this.moveDirection = new THREE.Vector2();

    // Create player mesh (capsule-like shape using cylinder + spheres)
    const height = GAME_CONFIG.PLAYER_HEIGHT;
    const radius = GAME_CONFIG.PLAYER_RADIUS;

    const group = new THREE.Group();

    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(radius, radius, height * 0.6);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height * 0.3;
    body.castShadow = true;
    group.add(body);

    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(radius * 0.8);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBAC }); // Skin tone
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = height * 0.7;
    head.castShadow = true;
    group.add(head);

    this.mesh = new THREE.Mesh();
    this.mesh.add(group);
    this.mesh.position.set(x, 0, z);
  }

  public setMoveDirection(x: number, z: number) {
    this.moveDirection.set(x, z);
  }

  public update(deltaTime: number) {
    const speed = GAME_CONFIG.PLAYER_SPEED;

    // Apply movement
    if (this.moveDirection.length() > 0) {
      const normalized = this.moveDirection.clone().normalize();
      this.velocity.x = normalized.x * speed;
      this.velocity.z = normalized.y * speed;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // Update position
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.z += this.velocity.z * deltaTime;

    // Constrain to court boundaries (player's side - back half)
    const { COURT_WIDTH, COURT_LENGTH } = GAME_CONFIG;
    const margin = 0.5;

    this.mesh.position.x = Math.max(
      -COURT_WIDTH / 2 + margin,
      Math.min(COURT_WIDTH / 2 - margin, this.mesh.position.x)
    );

    this.mesh.position.z = Math.max(
      0 + margin,
      Math.min(COURT_LENGTH / 2 - margin, this.mesh.position.z)
    );
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public canKick(ball: Ball): boolean {
    const ballPos = ball.getPosition();
    const playerPos = this.getPosition();
    const distance = ballPos.distanceTo(playerPos);

    // Ball must be close and low (below header height)
    return distance < this.kickRange && ballPos.y < 1.2;
  }

  public canHeader(ball: Ball): boolean {
    const ballPos = ball.getPosition();
    const playerPos = this.getPosition();
    const distance = ballPos.distanceTo(playerPos);

    // Ball must be close and high (at header height or above)
    return distance < this.headerRange && ballPos.y >= 1.2 && ballPos.y < 3.0;
  }

  public kick(ball: Ball, direction: THREE.Vector3, power: number = 1.0) {
    if (!this.canKick(ball)) return;

    const force = direction.clone().normalize();
    const kickPower = 8 * power; // Base kick power
    force.multiplyScalar(kickPower);
    force.y = Math.max(force.y, 3); // Add upward component

    ball.setVelocity(force);
  }

  public header(ball: Ball, direction: THREE.Vector3, power: number = 1.0) {
    if (!this.canHeader(ball)) return;

    const force = direction.clone().normalize();
    const headerPower = 6 * power; // Headers are less powerful
    force.multiplyScalar(headerPower);
    force.y = Math.max(force.y, 2); // Add upward component

    ball.setVelocity(force);
  }
}
