var gl;
var gCanvas;
var gShader = {};

let gCamera = {
    "position": vec3(20, 20, 20),
    "at": vec3(0, 0, 0),
    "up": vec3(0, 0, 1),
    "perspective": perspective(60, 1, 0.1, 200),
    "view": lookAt(vec3(20, 20, 20), vec3(0, 0, 0), vec3(0, 0, 1)),
};

var gState = {
    lastTimeCapture: 0,
};

var gObjects = [];
var gAnimationController = new AnimationController();

window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

window.onload = function() {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    if (DEBUG) startFpsDisplay();

    window.onkeydown = callbackKeyDown;

    setupShaders();
    gObjects.push(new Object(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
    gObjects.push(new Object(mult(-1, vec3(10, 0, 0)), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
    gAnimationController.createAnimation(TEST_ANIMATION, gObjects[0]);

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

    if (DEBUG) updateFpsDisplay(delta);

    window.requestAnimationFrame(render);
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

    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCamera.perspective));
    gl.uniform4fv(gShader.uLightPosition, vec4(5, 5, 5, 1));
}

function callbackKeyDown(event) {

}

function startFpsDisplay() {
    let overlay = document.createElement("div");
    overlay.id = "overlay";
    let fpsDisplay = document.createElement("div");
    fpsDisplay.innerHTML = "FPS: <span id='fps'>0</span>";
    overlay.appendChild(fpsDisplay);
    let frametimeDisplay = document.createElement("div");
    frametimeDisplay.innerHTML = "Frame Time: <span id='frametime'>0</span> ms";
    overlay.appendChild(frametimeDisplay);
    document.body.appendChild(overlay);
    
    gState.overlay = document.getElementById("overlay");
    gState.overlayLastUpdate = Date.now();
    gState.fpsAverage = 0;
    gState.fpsCount = 0;
    gState.frameTimeAverage = 0;
    gState.frameTimeCount = 0;
}

function updateFpsDisplay(delta) {
    gState.fpsCount++;
    gState.fpsAverage += Math.round(1 / delta);
    gState.frameTimeCount++;
    gState.frameTimeAverage += delta;
    if (Date.now() - gState.overlayLastUpdate > DEBUG_UPDATE_INTERVAL) {
        gState.overlayLastUpdate = Date.now();
    
        gState.overlay.querySelector("#fps").innerText = Math.round(gState.fpsAverage / gState.fpsCount);
        gState.fpsAverage = 0;
        gState.fpsCount = 0;
        gState.overlay.querySelector("#frametime").innerText = Math.round((gState.frameTimeAverage / gState.frameTimeCount) * 1000); 
        gState.frameTimeAverage = 0;
        gState.frameTimeCount = 0;
    }
}

function modVec3(v, m) {
    return vec3((v[0] + m) % m, (v[1] + m) % m, (v[2] + m) % m);
}