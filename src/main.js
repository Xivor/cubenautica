var gl;
var gCanvas;

var gBubbles;
var gAnimationController;
var gBoidController;
var gModelLoader;
var gCamera;
var gFloor;
var gFloorTexture;

var gShaders = {};
var gObjects = [];

var gState = {
    lastTimeCapture: 0,
    pointerLocked: false,
    pressedKeys: [],
    pausedTime: 0,
    pauseDelta: 0,
    paused: true,
};

window.onload = function() {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    if (DEBUG) startFpsDisplay();

    setupShaders();
    setupFramebuffer();
    setupLineRendering();
    setupFullScreenQuad();
    gBubbles = new Bubbles();
    gModelLoader = new ModelLoader();
    gCamera = new Camera();
    gAnimationController = new AnimationController();
    gBoidController = new BoidController();
    setupWorld();
    setupEventListeners();
  
    gState.lastTimeCapture = Date.now();
    gState.pausedTime = Date.now();
    render();
}


function render() {
    let now, delta;
    now = Date.now();
    delta = (now - gState.lastTimeCapture) / 1000;
    gState.lastTimeCapture = now;
    gState.time = (gState.time || 0);
    gState.time += delta;

    // gl.bindFramebuffer(gl.FRAMEBUFFER, gFramebuffer.fbo);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gCamera.update(delta);

    renderFloor();

    gAnimationController.update();
    gBoidController.update(delta);
    gBubbles.update(delta);
    gBubbles.render();

    let activeProgram = null;
    for (let object of gObjects) {
        if (!(object instanceof Boid)) {
            object.update(delta);
        }

        let perspectiveCoords = mult(mult(gCamera.perspective, gCamera.view), vec4(object.position[0], object.position[1], object.position[2], 1));
        perspectiveCoords = mult(1/perspectiveCoords[3], perspectiveCoords);

        if(!(perspectiveCoords[0] > -1 && perspectiveCoords[0] < 1 && 
           perspectiveCoords[1] > -1 && perspectiveCoords[1] < 1 && 
           perspectiveCoords[2] > -1 && perspectiveCoords[2] < 1)) continue;//object.render();

        if (object.shader.program !== activeProgram) {
            activeProgram = object.shader.program;
            gl.useProgram(activeProgram);
            gl.uniformMatrix4fv(object.shader.uView, false, flatten(gCamera.view));
            gl.uniformMatrix4fv(object.shader.uPerspective, false, flatten(gCamera.perspective));
            gl.uniform4fv(object.shader.uLightPosition, LIGHT.position);
            if (object.shader === gShaders.basic) {
                gl.uniform4fv(object.shader.uColorEspecular, LIGHT.especular);
                gl.uniform1f(object.shader.uAlphaEspecular, LIGHT.alpha);
            }
        }
        if (object.shader === gShaders.toon) {
            // draw back faces as black to create outline
            gl.uniform4fv(object.shader.uOutline, vec4(-1.0, -1.0, -1.0, 1.0));
            const scale = object.scale;
            object.scale = mult(1.05, scale);

            gl.cullFace(gl.FRONT);
            object.render();
            object.scale = scale;
            gl.uniform4fv(object.shader.uOutline, vec4(0.0, 0.0, 0.0, 0.0));
        }

        gl.cullFace(gl.BACK);
        object.render();
    }

    if (DEBUG) {
        for (let object of gObjects) {
            if (object instanceof Boid && length(object.velocity) > 0.1) {
                renderDirectionIndicator(
                    object.position,
                    object.velocity,
                    [1, 0, 0, 1],  // Red color
                    1
                );
            }
        }
    }
    // renderPostProcess();

    if (DEBUG) updateFpsDisplay(delta);
    if(!gState.paused) window.requestAnimationFrame(render);
}

function setupEventListeners() {
    gCanvas.addEventListener("click", lockPointer);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    document.addEventListener("mozpointerlockchange", pointerLockChange, false);
}
