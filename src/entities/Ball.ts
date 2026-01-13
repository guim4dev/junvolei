import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/constants';

export class Ball {
  public mesh: THREE.Mesh;
  public velocity: THREE.Vector3;
  private isOutOfBounds: boolean;

  constructor(x: number = 0, y: number = 2, z: number = 0) {
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isOutOfBounds = false;

    // Create ball mesh with Mikasa-style hexagonal pattern
    const geometry = new THREE.IcosahedronGeometry(GAME_CONFIG.BALL_RADIUS, 1);

    // Create vertex colors for alternating pattern
    const colors = [];
    const color1 = new THREE.Color(0xFFD700); // Golden yellow
    const color2 = new THREE.Color(0x000000); // Black

    // Color faces alternately (every 3rd face is black)
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const faceIndex = Math.floor(i / 3);
      const color = faceIndex % 3 === 0 ? color2 : color1;
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.4,
      metalness: 0.1,
      flatShading: true, // Makes the facets visible
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.mesh.castShadow = true;
  }

  public update(deltaTime: number) {
    if (this.isOutOfBounds) {
      return; // Don't update if ball is out of bounds
    }

    // Apply gravity
    this.velocity.y += GAME_CONFIG.GRAVITY * deltaTime;

    // Apply air resistance
    const airResistance = 0.02;
    this.velocity.x *= (1 - airResistance);
    this.velocity.z *= (1 - airResistance);

    // Update position
    this.mesh.position.x += this.velocity.x * deltaTime;
    this.mesh.position.y += this.velocity.y * deltaTime;
    this.mesh.position.z += this.velocity.z * deltaTime;

    // Ground collision
    if (this.mesh.position.y <= GAME_CONFIG.BALL_RADIUS) {
      this.mesh.position.y = GAME_CONFIG.BALL_RADIUS;
      this.velocity.y = Math.abs(this.velocity.y) * GAME_CONFIG.BALL_BOUNCE;

      // Dampen horizontal velocity on bounce
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;

      // Stop bouncing if velocity is too low
      if (Math.abs(this.velocity.y) < 0.5) {
        this.velocity.y = 0;
        this.velocity.x *= 0.95;
        this.velocity.z *= 0.95;
      }
    }

    // Net collision (simple check - if ball passes through net horizontally)
    if (Math.abs(this.mesh.position.z) < 0.2 &&
        this.mesh.position.y < GAME_CONFIG.NET_HEIGHT) {
      // Ball hit the net, bounce back
      this.velocity.z *= -0.5;
      this.velocity.y *= 0.5;
    }

    // Check out of bounds
    const { COURT_WIDTH, COURT_LENGTH } = GAME_CONFIG;
    const margin = 2; // Allow some margin beyond court

    if (Math.abs(this.mesh.position.x) > COURT_WIDTH / 2 + margin ||
        Math.abs(this.mesh.position.z) > COURT_LENGTH / 2 + margin) {
      this.isOutOfBounds = true;
    }
  }

  public applyForce(force: THREE.Vector3) {
    this.velocity.add(force);
  }

  public setVelocity(velocity: THREE.Vector3) {
    this.velocity.copy(velocity);
  }

  public reset(x: number = 0, y: number = 2, z: number = -3) {
    this.mesh.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.isOutOfBounds = false;
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  public isOnGround(): boolean {
    return this.mesh.position.y <= GAME_CONFIG.BALL_RADIUS + 0.1;
  }

  public isStopped(): boolean {
    return this.velocity.length() < 0.1 && this.isOnGround();
  }

  public getIsOutOfBounds(): boolean {
    return this.isOutOfBounds;
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }
}
