var gl;
var gCanvas;

var gAnimationController;
var gCamera;
var gFloor;
var gFloorTexture;

var gShaders = {};
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
    setupFramebuffer();
    setupFullScreenQuad();
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
    gState.time = (gState.time || 0);
    gState.time += delta;

    gl.bindFramebuffer(gl.FRAMEBUFFER, gFramebuffer.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gCamera.update(delta);

    const viewMatrix = gCamera.view;
    const aspect = gl.canvas.width / gl.canvas.height;
    const perspectiveMatrix = perspective(CAMERA_FOVY, aspect, CAMERA_NEAR, CAMERA_FAR);
    renderFloor(viewMatrix, perspectiveMatrix);

    gAnimationController.update();
    
    let activeProgram = null;
    for (let object of gObjects) {
        object.update(delta);
        if (object.shader.program !== activeProgram) {
            activeProgram = object.shader.program;
            gl.useProgram(activeProgram);
            gl.uniformMatrix4fv(object.shader.uView, false, flatten(viewMatrix));
            gl.uniformMatrix4fv(object.shader.uPerspective, false, flatten(perspectiveMatrix));
            gl.uniform4fv(object.shader.uLightPosition, LIGHT.position);
            if (object.shader === gShaders.basic) {
                gl.uniform4fv(object.shader.uColorEspecular, LIGHT.especular);
                gl.uniform1f(object.shader.uAlphaEspecular, LIGHT.alpha);
            }
        }
        gl.bindVertexArray(object.vao);
        object.render();
        gl.bindVertexArray(null);
    }
    renderPostProcess();
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
