import * as THREE from 'three';
import { Court } from './entities/Court';
import { Player } from './entities/Player';
import { NPC } from './entities/NPC';
import { Ball } from './entities/Ball';
import { InputSystem } from './systems/InputSystem';
import { ScoreSystem } from './systems/ScoreSystem';
import { ServeSystem } from './systems/ServeSystem';
import { TouchControls } from './controls/TouchControls';
import { HUD } from './ui/HUD';
import { Menu, GameState } from './ui/Menu';
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
const ball = new Ball(0, 0.5, 3); // Start on ground near player
ball.addToScene(scene);

// Create NPCs
const allyNPC = new NPC(3, 6, true, 'ally'); // Ally on player's side
allyNPC.addToScene(scene);

const opponent1 = new NPC(-3, -6, false, 'opponent1'); // Opponent on far side
opponent1.addToScene(scene);

const opponent2 = new NPC(3, -6, false, 'opponent2'); // Opponent on far side
opponent2.addToScene(scene);

// Score system, serve system, and HUD
const scoreSystem = new ScoreSystem();

// Input system
const inputSystem = new InputSystem(player, ball);
inputSystem.setScoreSystem(scoreSystem);

// Touch controls
const touchControls = new TouchControls(player, ball);
touchControls.setScoreSystem(scoreSystem);

// Wire up NPCs with score system
allyNPC.setScoreSystem(scoreSystem);
opponent1.setScoreSystem(scoreSystem);
opponent2.setScoreSystem(scoreSystem);
const serveSystem = new ServeSystem(ball, {
  ally: allyNPC,
  opponent1: opponent1,
  opponent2: opponent2,
});
const hud = new HUD();

// Menu system
const menu = new Menu();
let gameState: GameState = 'menu';
let ballWasInAir = true; // Track ball state to detect when it lands

scoreSystem.setOnScoreCallback((playerScore, opponentScore, scoringTeam) => {
  hud.updateScore(playerScore, opponentScore);

  const message = scoringTeam === 'player' ? 'POINT!' : 'Opponent scores!';
  hud.showMessage(message, 1500);

  // Start serve after brief pause (team that lost serves)
  setTimeout(() => {
    const servingTeam = scoreSystem.getServingTeam();
    serveSystem.startServe(servingTeam);
    ballWasInAir = true;
  }, 2000);

  // Check for game over
  if (scoreSystem.isGameOver()) {
    const winner = scoreSystem.getWinner();
    setTimeout(() => {
      gameState = 'gameover';
      menu.showGameOver(winner!, playerScore, opponentScore);
    }, 2500);
  }
});

menu.setOnStateChange((newState) => {
  gameState = newState;

  if (newState === 'playing') {
    // Reset game
    scoreSystem.reset();
    hud.updateScore(0, 0);

    // Start with player's team serving (first serve)
    serveSystem.startServe('player');
    ballWasInAir = true;
  }
});

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

  // Only update game if playing
  if (gameState === 'playing') {
    // Update serve system
    const serveCompleted = serveSystem.update(deltaTime);
    if (serveCompleted) {
      ballWasInAir = true;
    }

    // Only update gameplay if not serving
    if (!serveSystem.isCurrentlyServing()) {
      // Update input
      inputSystem.update();
      touchControls.update();

      // Update player
      player.update(deltaTime);

      // Update NPCs
      allyNPC.update(deltaTime, ball, currentTime);
      opponent1.update(deltaTime, ball, currentTime);
      opponent2.update(deltaTime, ball, currentTime);

      // Update ball
      ball.update(deltaTime);

      // Update score system
      const ballPos = ball.getPosition();
      const ballIsLow = ballPos.y < 0.5;

      // Detect when ball lands after being in air
      if (ballWasInAir && ballIsLow && ball.isStopped()) {
        scoreSystem.update(ball);
        ballWasInAir = false;
      }

      if (ballPos.y > 1.0) {
        ballWasInAir = true;
      }
    }
  }

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

console.log('JunVolei - Ready! Press JOGAR to start.');

// Add ESC key to pause
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && gameState === 'playing') {
    gameState = 'paused';
    menu.showPause();
  }
});
