var gl;
var gCanvas;

var gAnimationController;
var gCamera;
var gFloor;

var gShaders = {};
var gObjects = [];

var gState = {
    lastTimeCapture: 0,
    pointerLocked: false,
    pressedKeys: []
};

var aspect;
var perspectiveMatrix;

window.onload = function() {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    aspect = gl.canvas.width / gl.canvas.height;
    perspectiveMatrix = perspective(CAMERA_FOVY, aspect, CAMERA_NEAR, CAMERA_FAR);

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

    const perspectiveView = mult(perspectiveMatrix, gCamera.view);
    
    renderFloor();

    gAnimationController.update();
    
    for (let object of gObjects) {
        object.update(delta);

        let perspectiveCoords = mult(perspectiveView, vec4(object.position[0], object.position[1], object.position[2], 1));
        perspectiveCoords = mult(1/perspectiveCoords[3], perspectiveCoords);

        if(perspectiveCoords[0] > -1 && perspectiveCoords[0] < 1 && 
           perspectiveCoords[1] > -1 && perspectiveCoords[1] < 1 && 
           perspectiveCoords[2] > -1 && perspectiveCoords[2] < 1) object.render();
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