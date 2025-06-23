class Shader {
    constructor(vertexProgram, fragmentProgram) {
        this.program = makeProgram(gl, vertexProgram, fragmentProgram);
        gl.useProgram(this.program);

        this.uModel = gl.getUniformLocation(this.program, "uModel");
        this.uView = gl.getUniformLocation(this.program, "uView");
        this.uPerspective = gl.getUniformLocation(this.program, "uPerspective");
        this.uModelViewInverseTranspose = gl.getUniformLocation(this.program, "uModelViewInverseTranspose");
        this.uColorAmbient = gl.getUniformLocation(this.program, "uColorAmbient");
        this.uColorDiffusion = gl.getUniformLocation(this.program, "uColorDiffusion");
        this.uColorEspecular = gl.getUniformLocation(this.program, "uColorEspecular");
        this.uAlphaEspecular = gl.getUniformLocation(this.program, "uAlphaEspecular");
        this.uLightPosition = gl.getUniformLocation(this.program, "uLightPosition");

        gl.uniform4fv(this.uLightPosition, LIGHT.position);
        gl.uniform4fv(this.uColorEspecular, LIGHT.especular);
        gl.uniform1f(this.uAlphaEspecular, LIGHT.alpha);
    }
}


function setupShaders() {
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(BACKGROUND_COLOR[0], BACKGROUND_COLOR[1], BACKGROUND_COLOR[2], BACKGROUND_COLOR[3]);
    gl.enable(gl.DEPTH_TEST);

    gShaders.basic = new Shader(BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER);
    console.log(gShaders.basic)
    gShaders.textured = new Shader(TEXTURED_VERTEX_SHADER, TEXTURED_FRAGMENT_SHADER);
}