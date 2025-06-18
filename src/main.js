var gl;
var gCanvas;
var gShader = {};

var gState = {
    lastTimeCapture: 0,
};

window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

let pos = vec3(10, 0, 0);
let rot = vec3(0, 0, 0);
let sce = vec3(0, 0, 0);
var amgs;
var a2;
window.onload = function () {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext('webgl2');
    gl.canvas.width  = window.innerWidth;
    gl.canvas.height = window.innerHeight;

    window.onkeydown = callbackKeyDown;

    setupShaders();
    amgs = new Object(pos, rot, sce, untitled);
    amgs.setupShader(gl, gShader);
    a2 = new Object(mult(-1, pos), rot, sce, untitled);
    a2.setupShader(gl, gShader);

    render();
}

var teste = 0;
function render() {
    let now, delta;
    now = Date.now();
    delta = (now - gState.lastTimeCapture) / 1000;
    gState.lastTimeCapture = now;
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let camera = {
        "eye": vec3(20, 20, 20),
        "at": vec3(0, 0, 0),
        "up": vec3(0, 0, 1)
    };

    amgs.render(gl, camera);
    teste += 1;
    amgs.rotation = add(amgs.rotation, vec3(0, 1, 0));

    a2.render(gl, camera);
    a2.rotation = add(a2.rotation, vec3(0, 1, 1));
    
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
}

function callbackKeyDown(event) {

}