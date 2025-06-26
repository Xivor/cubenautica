INTERACTION_KEYS = ['w', 'a', 's', 'd', ' ', 'shift', 'escape'];
DEBUG = false;
DEBUG_UPDATE_INTERVAL = 500; // ms
DISTANCE_ACCURACY = 0.5; // Margin for error in animations

CAMERA_FOVY = 45.0;
CAMERA_ASPECT = 2.0;
CAMERA_NEAR = 1.0;
CAMERA_FAR = 2000.0;
CAMERA_SENSITIVITY = 0.08;

BACKGROUND_COLOR = [70/255, 91/255, 101/255, 1.0];
FLOOR_TEXTURE_URL = "https://raw.githubusercontent.com/Xivor/cubenautica/refs/heads/main/assets/images/floor.png";
MAP_LIMIT = 200;
LIGHT = {
    position: vec4(5, 5, 50, 1),
    ambient: vec4(0.47, 0.47, 0.47, 1.0),
    diffusion: vec4(0.68, 0.68, 0.68, 1.0),
    especular: vec4(0.39, 0.39, 0.39, 1.0),
    alpha: 10.0
}

PLAYER_SPEED = 70.0;
FISH_GROUP_NUMBER = 20;
FISH_GROUP_MAX_SIZE = 3;
FISH_GROUP_MIN_SIZE = 2;
FISH_GROUP_RADIUS = 50;
ROCK_NUMBER = 30;
KELP_NUMBER = 30;