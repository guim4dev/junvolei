export const GAME_CONFIG = {
  // Match settings
  POINTS_TO_WIN: 12,
  MAX_TOUCHES: 3,

  // Physics
  GRAVITY: -9.8,
  BALL_BOUNCE: 0.7,
  BALL_RADIUS: 0.45, // Increased size for better visibility (diameter: 0.9m)

  // Court dimensions (in meters, 1:1 scale)
  COURT_LENGTH: 18,
  COURT_WIDTH: 9,
  NET_HEIGHT: 2.2,

  // Players
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.3,
  PLAYER_SPEED: 5,
  PLAYER_SPRINT_MULTIPLIER: 1.5,

  // AI
  NPC_REACTION_TIME: 0.3, // seconds
  NPC_ACCURACY: 0.8, // 0-1

  // Camera
  CAMERA_DISTANCE: 8,
  CAMERA_HEIGHT: 4,
  CAMERA_SMOOTHING: 0.1,
};

export const COLORS = {
  SKY: 0x87CEEB,
  SAND: 0xC2B280,
  NET: 0xFFFFFF,
  POST: 0x696969,
  TEAM_PLAYER: 0x00FF00,
  TEAM_ALLY: 0x00AA00,
  TEAM_OPPONENT: 0xFF0000,
  BALL_PRIMARY: 0xFFD700, // Golden yellow
  BALL_SECONDARY: 0x000000, // Black (for diamonds)
};
