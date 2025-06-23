INTERACTION_KEYS = ['w', 'a', 's', 'd', ' ', 'shift', 'escape'];
DEBUG = true;
DEBUG_UPDATE_INTERVAL = 500; // ms
DISTANCE_ACCURACY = 0.5; // Margin for error in animations

CAMERA_FOVY = 45.0;
CAMERA_ASPECT = 2.0;
CAMERA_NEAR = 1.0;
CAMERA_FAR = 2000.0;
CAMERA_SENSITIVITY = 0.08;

BACKGROUND_COLOR = [0.2, 0.2, 0.6, 1.0];
MAP_LIMIT = 200;
LIGHT = {
    position: vec4(5, 5, 5, 1),
    ambient: vec4(0.47, 0.47, 0.47, 1.0),
    diffusion: vec4(0.68, 0.68, 0.68, 1.0),
    especular: vec4(0.39, 0.39, 0.39, 1.0),
    alpha: 10.0
}

PLAYER_SPEED = 70.0;