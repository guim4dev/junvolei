import * as THREE from 'three';
import { GAME_CONFIG, COLORS } from '../utils/constants';

export class Court {
  public group: THREE.Group;

  constructor() {
    this.group = new THREE.Group();
    this.createCourt();
    this.createNet();
    this.createCourtLines();
  }

  private createCourt() {
    const { COURT_LENGTH, COURT_WIDTH } = GAME_CONFIG;

    // Sand court
    const courtGeometry = new THREE.PlaneGeometry(COURT_WIDTH, COURT_LENGTH);
    const courtMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SAND,
      roughness: 0.9
    });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.group.add(court);

    // Extended ground around court (beach)
    const beachSize = 40;
    const beachGeometry = new THREE.PlaneGeometry(beachSize, beachSize);
    const beachMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.SAND,
      roughness: 0.95
    });
    const beach = new THREE.Mesh(beachGeometry, beachMaterial);
    beach.rotation.x = -Math.PI / 2;
    beach.position.y = -0.01; // Slightly below court to avoid z-fighting
    beach.receiveShadow = true;
    this.group.add(beach);
  }

  private createNet() {
    const { COURT_WIDTH, NET_HEIGHT } = GAME_CONFIG;

    // Net mesh
    const netGeometry = new THREE.PlaneGeometry(COURT_WIDTH, NET_HEIGHT);
    const netMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.NET,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      wireframe: true
    });
    const net = new THREE.Mesh(netGeometry, netMaterial);
    net.position.y = NET_HEIGHT / 2;
    net.position.z = 0;
    this.group.add(net);

    // Posts
    const postRadius = 0.05;
    const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, NET_HEIGHT);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.POST,
      metalness: 0.5,
      roughness: 0.5
    });

    // Left post
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(-COURT_WIDTH / 2, NET_HEIGHT / 2, 0);
    leftPost.castShadow = true;
    this.group.add(leftPost);

    // Right post
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(COURT_WIDTH / 2, NET_HEIGHT / 2, 0);
    rightPost.castShadow = true;
    this.group.add(rightPost);

    // Top rope
    const ropeGeometry = new THREE.CylinderGeometry(0.03, 0.03, COURT_WIDTH);
    const rope = new THREE.Mesh(ropeGeometry, postMaterial);
    rope.rotation.z = Math.PI / 2;
    rope.position.y = NET_HEIGHT;
    this.group.add(rope);
  }

  private createCourtLines() {
    const { COURT_LENGTH, COURT_WIDTH } = GAME_CONFIG;

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF });

    // Court boundary
    const points = [];
    points.push(new THREE.Vector3(-COURT_WIDTH / 2, 0.01, -COURT_LENGTH / 2));
    points.push(new THREE.Vector3(COURT_WIDTH / 2, 0.01, -COURT_LENGTH / 2));
    points.push(new THREE.Vector3(COURT_WIDTH / 2, 0.01, COURT_LENGTH / 2));
    points.push(new THREE.Vector3(-COURT_WIDTH / 2, 0.01, COURT_LENGTH / 2));
    points.push(new THREE.Vector3(-COURT_WIDTH / 2, 0.01, -COURT_LENGTH / 2));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const courtLine = new THREE.Line(lineGeometry, lineMaterial);
    this.group.add(courtLine);

    // Center line (where the net is)
    const centerPoints = [
      new THREE.Vector3(-COURT_WIDTH / 2, 0.01, 0),
      new THREE.Vector3(COURT_WIDTH / 2, 0.01, 0)
    ];
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints(centerPoints);
    const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
    this.group.add(centerLine);
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.group);
  }
}
