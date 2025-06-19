var gl;
var gCanvas;
var gCamera = null;
var gShader = {};

var gCtx = {
    pointerLocked: false,
};
var gState = {
    lastTimeCapture: 0,
};

var gObjects = [];

window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

window.onload = function () {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    setupEventListeners();
    lockPointer();
    setupWorld();
    setupShaders();
    gObjects.push(new Object(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
    gObjects.push(new Object(mult(-1, vec3(10, 0, 0)), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));

    render();
}

function setupEventListeners() {
    gCanvas.addEventListener('click', lockPointer);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener('pointerlockchange', pointerLockChange, false);
    document.addEventListener('mozpointerlockchange', pointerLockChange, false);
}

function setupWorld() {
    gCamera = new Camera();
}

var teste = 0;
function render() {
    let now, delta;
    now = Date.now();
    delta = (now - gState.lastTimeCapture) / 1000;
    gState.lastTimeCapture = now;
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let object of gObjects) {
        object.update(delta);
        object.render();
    }
    
    // WIP
    gObjects[0].rotation = add(gObjects[0].rotation, vec3(0, 1, 0));
    gObjects[1].rotation = add(gObjects[1].rotation, vec3(0, 1, 1));   

    let camera = getCamera();

    amgs.render(gl, camera);
    teste += 1;
    amgs.rotation = add(amgs.rotation, vec3(0, 1, 0));

    a2.render(gl, camera);
    a2.rotation = add(a2.rotation, vec3(0, 1, 1));

    gCamera.move(delta);

    window.requestAnimationFrame(render);
}

function getCamera() {
    if (gCamera == null) {
      return {
        "eye": vec3(20, 20, 20),
        "at": vec3(0, 0, 0),
        "up": vec3(0, 0, 1)
      }
    }

    return {
        "eye": gCamera.pos,
        "at": gCamera.at,
        "up": gCamera.up
    }
}

function lockPointer() {
    if (!gCtx.pointerLocked) {
        gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
        gCanvas.requestPointerLock();
    }
}

function setupShaders() {
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2], BACKGROUND_COLOR[3]);
    gl.enable(gl.DEPTH_TEST);

    gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
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

// --------------------
// CALLBACKS
// --------------------

function onKeyDown(event) {
    if (!gCtx.pointerLocked) return;
    switch(event.key.toLowerCase()) {
        case 'w':
            gCamera.transVel[0] = gCamera.moveSpeed;
            break;
        case 's':
            gCamera.transVel[0] = -gCamera.moveSpeed;
            break;
        case 'a':
            gCamera.transVel[1] = gCamera.moveSpeed;
            break;
        case 'd':
            gCamera.transVel[1] = -gCamera.moveSpeed;
            break;
        case ' ':
            gCamera.transVel[2] = gCamera.moveSpeed;
            break;
        case 'shift':
            gCamera.transVel[2] = -gCamera.moveSpeed;
            break;
        case 'escape':
            document.exitPointerLock();
            break;
  }
}

function onKeyUp(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
        case 's':
            gCamera.transVel[0] = 0;
            break;
        case 'a':
        case 'd':
            gCamera.transVel[1] = 0;
            break;
        case ' ':
        case 'shift':
            gCamera.transVel[2] = 0;
            break;
    }
}

function onMouseMove(event) {
    if (!gCtx.pointerLocked) return;
  let deltaX = -event.movementX || event.mozMovementX || 0;
  let deltaY = event.movementY || event.mozMovementY || 0;
  deltaX = deltaX * gCamera.sensitivity;
  deltaY = deltaY * gCamera.sensitivity;

  gCamera.theta[1] += deltaX;
  gCamera.theta[0] += deltaY;
  gCamera.theta[0] = Math.max(-89, Math.min(89, gCamera.theta[0]));
}

function pointerLockChange() {
    gCtx.pointerLocked = (
        document.pointerLockElement === gCanvas ||
        document.mozPointerLockElement === gCanvas
    );
}
