var gl;
var gCanvas;
var gAnimationController;
var gCamera;
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

    setupEventListeners();
    setupWorld();
  
    gState.lastTimeCapture = Date.now();
    render();
}

function render() {
    let now, delta;
    now = Date.now();
    delta = (now - gState.lastTimeCapture) / 1000;
    gState.lastTimeCapture = now;
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gAnimationController.update();
    
    for (let object of gObjects) {
        object.update(delta);
        object.render();
    }
    
    gCamera.update(delta);
  
    if (DEBUG) updateFpsDisplay(delta);
  
    window.requestAnimationFrame(render);
}

function setupWorld() {
    gCamera = new Camera();
    gAnimationController = new AnimationController();
    setupShaders();
    gObjects.push(new Object(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
    gAnimationController.createAnimation(TEST_ANIMATION, gObjects[0]);
    gObjects.push(new Object(mult(-1, vec3(10, 0, 0)), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
}

function setupShaders() {
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2], BACKGROUND_COLOR[3]);
    gl.enable(gl.DEPTH_TEST);

    gShader.program = makeProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    gl.useProgram(gShader.program);
    
    gShader.uModel = gl.getUniformLocation(gShader.program, "uModel");
    gShader.uView = gl.getUniformLocation(gShader.program, "uView");
    gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
    gShader.uModelViewInverseTranspose = gl.getUniformLocation(gShader.program, "uModelViewInverseTranspose");
    gShader.uColorAmbient = gl.getUniformLocation(gShader.program, "uColorAmbient");
    gShader.uColorDiffusion = gl.getUniformLocation(gShader.program, "uColorDiffusion");
    gShader.uColorEspecular = gl.getUniformLocation(gShader.program, "uColorEspecular");
    gShader.uAlphaEspecular = gl.getUniformLocation(gShader.program, "uAlphaEspecular");
    gShader.uLightPosition = gl.getUniformLocation(gShader.program, "uLightPosition");
    
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCamera.perspective));
    gl.uniform4fv(gShader.uLightPosition, LIGHT.position);
    gl.uniform4fv(gShader.uColorEspecular, LIGHT.especular);
    gl.uniform1f(gShader.uAlphaEspecular, LIGHT.alpha);
}

function setupEventListeners() {
    gCanvas.addEventListener("click", lockPointer);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    document.addEventListener("mozpointerlockchange", pointerLockChange, false);
}