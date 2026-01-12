import * as THREE from 'three';

export class DirectionIndicator {
  private arrow: THREE.Mesh;
  private ring: THREE.Mesh;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Create ring (shows area of influence)
    const ringGeometry = new THREE.RingGeometry(1.5, 1.7, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial);
    this.ring.rotation.x = -Math.PI / 2; // Make it horizontal

    // Create arrow shape
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.5);
    arrowShape.lineTo(0.3, 0);
    arrowShape.lineTo(0, -0.5);
    arrowShape.lineTo(-0.3, 0);
    arrowShape.closePath();

    const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      opacity: 0.8,
      transparent: true,
    });
    this.arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

    scene.add(this.ring);
    scene.add(this.arrow);
    this.hide();
  }

  public show(position: THREE.Vector3, angle: number) {
    // Position ring at player position
    this.ring.position.copy(position);
    this.ring.position.y = 0.1; // Slightly above ground

    // Position arrow at the edge of the ring
    const arrowDistance = 1.6;
    this.arrow.position.set(
      position.x + Math.sin(angle) * arrowDistance,
      0.5,
      position.z - Math.cos(angle) * arrowDistance
    );
    this.arrow.rotation.z = -angle;

    this.ring.visible = true;
    this.arrow.visible = true;
  }

  public hide() {
    this.ring.visible = false;
    this.arrow.visible = false;
  }

  public cleanup() {
    this.scene.remove(this.ring);
    this.scene.remove(this.arrow);
    this.ring.geometry.dispose();
    this.arrow.geometry.dispose();
    (this.ring.material as THREE.Material).dispose();
    (this.arrow.material as THREE.Material).dispose();
  }
}
