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

window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

var gObjects = [];

window.onload = function () {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    window.onkeydown = callbackKeyDown;

    setupShaders();
    gObjects.push(new Object(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));
    gObjects.push(new Object(mult(-1, vec3(10, 0, 0)), vec3(0, 0, 0), vec3(0, 0, 0), TEST_MODEL));

    render();
}

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

    window.requestAnimationFrame(render);
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

function callbackKeyDown(event) {

}