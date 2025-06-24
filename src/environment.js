function setupWorld() {
    setupFloorVAO();
    // gObjects.push(new Object(vec3(10, 0, 5), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.basic, TEST_MODEL));
    // gAnimationController.createAnimation(TEST_ANIMATION, gObjects[0]);
    // gObjects.push(new Object(mult(-1, vec3(10, 0, -5)), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.basic, TEST_MODEL));
    // gObjects.push(new Object(mult(-1, vec3(30, -30, -5)), vec3(0, 0, 0), vec3(0, 0, 0), gShaders.toon, TEST_MODEL));
    // gAnimationController.createAnimation(TEST_ANIMATION, gObjects[2]);
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
        vec3(-MAP_LIMIT*2, -MAP_LIMIT*2, 0),
        vec3(MAP_LIMIT*2, -MAP_LIMIT*2, 0),
        vec3(-MAP_LIMIT*2, MAP_LIMIT*2, 0),
        vec3(MAP_LIMIT*2, MAP_LIMIT*2, 0),
    ];

    let normals = [ vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1) ];

    let textureCoords = [
        vec2(0.0, 0.0),
        vec2(16.0, 0.0),
        vec2(0.0, 16.0),
        vec2(16.0, 16.0)
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

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    var img = new Image();
    img.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRIFznsJS37WaQCbXa4UJ8L51DLAnJQ1hvEA&s';
    img.crossOrigin = "anonymous";
    console.log("Carregando imagem", img.src);
    img.addEventListener('load', function() {
        console.log("Carregou imagem", img.width, img.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });
    gl.bindVertexArray(null);
}

function renderFloor() {
    gl.bindVertexArray(gFloor);
    gl.useProgram(gShaders.textured.program);
    gl.uniform4fv(gShaders.textured.uColorAmbient, mult(LIGHT.ambient, vec4(1, 1, 1, 1)));
    gl.uniform4fv(gShaders.textured.uColorDiffusion, mult(LIGHT.diffusion, vec4(1, 1, 1, 1)));
    gl.uniformMatrix4fv(gShaders.textured.uModel, false, flatten(mat4()));
    gl.uniformMatrix4fv(gShaders.textured.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(gShaders.textured.uProjection, false, flatten(perspective(CAMERA_FOVY, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}
