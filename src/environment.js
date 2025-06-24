function setupWorld() {
    setupFloorVAO();
    gObjects.push(new Object(vec3(0, 4, 10), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, BIGFISH_RED_MODEL));
    gObjects.push(new Object(vec3(-10, 12, 10), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, BIGFISH_BLUE_MODEL));
    gObjects.push(new Object(vec3(21, 0, 20), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, BIGFISH_YELLOW_MODEL));
    gObjects.push(new Object(vec3(-20, 0, 25), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, SMALLFISH_RED_MODEL));
    gObjects.push(new Object(vec3(-25, -10, 15), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, SMALLFISH_BLUE_MODEL));
    gObjects.push(new Object(vec3(20, 10, 10), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, SMALLFISH_YELLOW_MODEL));
    gObjects.push(new Object(vec3(10, 35, 20), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, PUFFERFISH_RED_MODEL));
    gObjects.push(new Object(vec3(-10, 25, 20), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, PUFFERFISH_BLUE_MODEL));
    gObjects.push(new Object(vec3(10, 15, 20), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, PUFFERFISH_YELLOW_MODEL));
}

function setupFloorVAO() {
    gFloor = gl.createVertexArray();
    gl.bindVertexArray(gFloor);

    let vertices = [
        vec3(-MAP_LIMIT*3, -MAP_LIMIT*3, 0),
        vec3(MAP_LIMIT*3, -MAP_LIMIT*3, 0),
        vec3(-MAP_LIMIT*3, MAP_LIMIT*3, 0),
        vec3(MAP_LIMIT*3, MAP_LIMIT*3, 0),
    ];

    let normals = [ vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1) ];

    let textureCoords = [
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(1.0, 1.0)
    ];

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    let aPosition = gl.getAttribLocation(gShaders.textured.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    let aNormal = gl.getAttribLocation(gShaders.textured.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoords), gl.STATIC_DRAW);

    var aTextureCoord = gl.getAttribLocation(gShaders.textured.program, "aTextureCoord");
    gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTextureCoord);

    gFloorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, gFloorTexture);

    // placeholder floor texture (solid color)
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);


    var img = new Image();
    // img.src = 'https:upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flower_poster_2.jpg/1200px-Flower_poster_2.jpg';
    img.crossOrigin = "anonymous";
    // console.log("Carregando imagem", img.src);
    img.addEventListener('load', function() {
        // console.log("Carregou imagem", img.width, img.height);
        gl.bindTexture(gl.TEXTURE_2D, gFloorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });
    gl.bindVertexArray(null);
}

function renderFloor(view, perspective) {
    gl.bindVertexArray(gFloor);
    gl.useProgram(gShaders.textured.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gFloorTexture);
    gl.uniform1i(gl.getUniformLocation(gShaders.textured.program, "uTexture"), 0);

    gl.uniform4fv(gShaders.textured.uColorAmbient, mult(LIGHT.ambient, vec4(1, 1, 1, 1)));
    gl.uniform4fv(gShaders.textured.uColorDiffusion, mult(LIGHT.diffusion, vec4(1, 1, 1, 1)));
    gl.uniformMatrix4fv(gShaders.textured.uModel, false, flatten(mat4()));
    gl.uniformMatrix4fv(gShaders.textured.uView, false, flatten(view));
    gl.uniformMatrix4fv(gShaders.textured.uProjection, false, flatten(perspective));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}
