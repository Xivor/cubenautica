var gl;
var gCanvas;

var gAnimationController;
var gCamera;
var gFloor;

var gShader = {};
var gObjects = [];

var gState = {
    lastTimeCapture: 0,
    pointerLocked: false,
    pressedKeys: []
};

window.onload = function() {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    if (DEBUG) startFpsDisplay();

    setupShaders();
    gCamera = new Camera();
    gAnimationController = new AnimationController();
    setupWorld();
    setupEventListeners();
  
    gState.lastTimeCapture = Date.now();
    render();
}

function render() {
    let now, delta;
    now = Date.now();
    delta = (now - gState.lastTimeCapture) / 1000;
    gState.lastTimeCapture = now;
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gCamera.update(delta);
    
    renderFloor();

    gAnimationController.update();
    
    for (let object of gObjects) {
        object.update(delta);
        object.render();
    }
  
    if (DEBUG) updateFpsDisplay(delta);
  
    window.requestAnimationFrame(render);
}

function setupEventListeners() {
    gCanvas.addEventListener("click", lockPointer);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    document.addEventListener("mozpointerlockchange", pointerLockChange, false);
}