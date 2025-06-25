class Shader {
    constructor(vertexProgram, fragmentProgram) {
        this.program = makeProgram(gl, vertexProgram, fragmentProgram);

        this.uModel = gl.getUniformLocation(this.program, "uModel");
        this.uView = gl.getUniformLocation(this.program, "uView");
        this.uPerspective = gl.getUniformLocation(this.program, "uPerspective");
        this.uModelViewInverseTranspose = gl.getUniformLocation(this.program, "uModelViewInverseTranspose");
        this.uColorAmbient = gl.getUniformLocation(this.program, "uColorAmbient");
        this.uColorDiffusion = gl.getUniformLocation(this.program, "uColorDiffusion");
        this.uColorEspecular = gl.getUniformLocation(this.program, "uColorEspecular");
        this.uAlphaEspecular = gl.getUniformLocation(this.program, "uAlphaEspecular");
        this.uLightPosition = gl.getUniformLocation(this.program, "uLightPosition");
        this.uColor = gl.getUniformLocation(this.program, "uColor");
        this.uOutline = gl.getUniformLocation(this.program, "uOutline");
    }
}

function setupShaders() {
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2], BACKGROUND_COLOR[3]);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gShaders.basic = new Shader(BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
    gShaders.textured = new Shader(TEXTURED_VERTEX_SHADER, TEXTURED_FRAGMENT_SHADER);
    gShaders.toon = new Shader(BASIC_VERTEX_SHADER, TOON_FRAGMENT_SHADER);
    gShaders.line = new Shader(LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER);
    gShaders.postProcess = new Shader(POST_PROCESS_VERTEX_SHADER, POST_PROCESS_FRAGMENT_SHADER);
}

var gFramebuffer
function setupFramebuffer() {
const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    const sceneTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sceneTexture, 0);

    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, gl.canvas.width, gl.canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer is not complete!");
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gFramebuffer = {
        fbo: framebuffer,
        texture: sceneTexture
    };
}

var gFullScreenQuadVao;
function setupFullScreenQuad() {
    const quadPositions = new Float32Array([
        -1, -1,  -1, 1,  1, -1,
        1, -1,   -1, 1,  1, 1,
    ]);
    const quadTexCoords = new Float32Array([
        0, 0,  0, 1,  1, 0,
        1, 0,  0, 1,  1, 1,
    ]);

    gFullScreenQuadVao = gl.createVertexArray();
    gl.bindVertexArray(gFullScreenQuadVao);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);
    const posAttrib = gl.getAttribLocation(gShaders.postProcess.program, "aPosition");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadTexCoords, gl.STATIC_DRAW);
    const texCoordAttrib = gl.getAttribLocation(gShaders.postProcess.program, "aTexCoord");
    gl.enableVertexAttribArray(texCoordAttrib);
    gl.vertexAttribPointer(texCoordAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function renderPostProcess() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const postProcessShader = gShaders.postProcess;
    gl.useProgram(postProcessShader.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gFramebuffer.texture);

    gl.uniform1i(gl.getUniformLocation(postProcessShader.program, "uSceneTexture"), 0);
    gl.uniform1f(gl.getUniformLocation(postProcessShader.program, "uTime"), gState.time);

    gl.bindVertexArray(gFullScreenQuadVao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
}


// LINE RENDERING - this is a debug object / shader that is a line with
// given thickness, length and color, mainly used to indicate
// vector directions

var gLineVao;
var gLinePositionBuffer;
function setupLineRendering() {
    gLineVAO = gl.createVertexArray();
    gl.bindVertexArray(gLineVAO);

    gLinePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gLinePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(18), gl.DYNAMIC_DRAW); // 6 vertices * 3 components

    const aPosition = gl.getAttribLocation(gShaders.line.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindVertexArray(null);
}

function renderDirectionIndicator(position, direction, color = [1, 0, 0, 1], thickness = 0.1) {
    const LINE_LENGTH = 10;
    const aspect = gl.canvas.width / gl.canvas.height;
    const perspectiveMatrix = perspective(CAMERA_FOVY, aspect, CAMERA_NEAR, CAMERA_FAR);

    const endPoint = add(position, mult(LINE_LENGTH, normalize(direction)));
    const vertices = createThickLineGeometry(position, endPoint, thickness);

    gl.bindVertexArray(gLineVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, gLinePositionBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices.flatMap(v => [v[0], v[1], v[2]])));

    gl.useProgram(gShaders.line.program);
    gl.uniformMatrix4fv(gShaders.line.uModel, false, flatten(mat4()));
    gl.uniformMatrix4fv(gShaders.line.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(gShaders.line.uPerspective, false, flatten(perspectiveMatrix));
    gl.uniform4fv(gShaders.line.uColor, color);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);
}
