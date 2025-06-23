function setupWorld() {
    setupFloorVAO();
    gObjects.push(new Object(vec3(10, 0, 10), vec3(0, 0, 0), vec3(0, 0, 0), gShader.basic, TEST_MODEL));
    gAnimationController.createAnimation(TEST_ANIMATION, gObjects[0]);
    gObjects.push(new Object(mult(-1, vec3(10, 0, -5)), vec3(0, 0, 0), vec3(0, 0, 0), gShader.basic, TEST_MODEL));
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

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    let aPosition = gl.getAttribLocation(gShader.textured.program, "aPosition");
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    let aNormal = gl.getAttribLocation(gShader.textured.program, "aNormal");
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    var img = new Image();
    img.src = 'assets/floor.png';
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
    gl.bindVertexArray(null);
}

function renderFloor() {
    gl.bindVertexArray(gFloor);
    gl.uniform4fv(gShader.textured.uColorAmbient, mult(LIGHT.ambient, vec4(1, 1, 1, 1)));
    gl.uniform4fv(gShader.textured.uColorDiffusion, mult(LIGHT.diffusion, vec4(1, 1, 1, 1)));
    gl.uniformMatrix4fv(gShader.textured.uModel, false, flatten(mat4()));
    gl.uniformMatrix4fv(gShader.textured.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(gShader.textured.uProjection, false, flatten(perspective(CAMERA_FOVY, CAMERA_ASPECT, CAMERA_NEAR, CAMERA_FAR)));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}