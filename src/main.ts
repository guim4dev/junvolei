import * as THREE from 'three';
import { Court } from './entities/Court';
import { Player } from './entities/Player';
import { Ball } from './entities/Ball';
import { InputSystem } from './systems/InputSystem';
import { COLORS, GAME_CONFIG } from './utils/constants';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.SKY);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, GAME_CONFIG.CAMERA_HEIGHT, GAME_CONFIG.CAMERA_DISTANCE);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')?.appendChild(renderer.domElement);

// Lighting - Sun simulation
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffcc, 1.0);
sunLight.position.set(10, 15, 5);
sunLight.castShadow = true;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
sunLight.shadow.camera.near = 0.1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Create the futevolei court
const court = new Court();
court.addToScene(scene);

// Create player
const player = new Player(0, 6); // Start at center, back of player's side
player.addToScene(scene);

// Create ball
const ball = new Ball(0, 3, 2); // Start in air near player
ball.addToScene(scene);

// Input system
const inputSystem = new InputSystem(player);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game clock
let lastTime = performance.now();

// Camera follow target
const cameraOffset = new THREE.Vector3(0, GAME_CONFIG.CAMERA_HEIGHT, GAME_CONFIG.CAMERA_DISTANCE);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;

  // Update input
  inputSystem.update();

  // Update player
  player.update(deltaTime);

  // Update ball
  ball.update(deltaTime);

  // Update camera to follow player smoothly
  const playerPos = player.getPosition();
  const targetCameraPos = new THREE.Vector3(
    playerPos.x,
    playerPos.y + cameraOffset.y,
    playerPos.z + cameraOffset.z
  );

  camera.position.lerp(targetCameraPos, GAME_CONFIG.CAMERA_SMOOTHING);
  camera.lookAt(playerPos.x, 0, playerPos.z - 2);

  renderer.render(scene, camera);
}

animate();

console.log('JunVolei - Ball physics ready! Watch it fall and bounce.');
