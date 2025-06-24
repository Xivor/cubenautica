function setupWorld() {
    setupFloorVAO();
    for (let i = 0; i < 15; i++) {
        let randomModelNum = Math.floor(randomRange(0, 3));

        let fishmodel = SMALLFISH_BLUE_MODEL;
        switch (randomModelNum) {
            case 0:
                fishmodel = SMALLFISH_RED_MODEL;
                break;
            case 1:
                fishmodel = SMALLFISH_BLUE_MODEL;
                break;
            case 2:
                fishmodel = SMALLFISH_YELLOW_MODEL;
                break;
        }
        gObjects.push(new Boid(
            vec3(
                randomRange(0, 30),
                randomRange(0, 30),
                randomRange(0, 30)
            ),
            vec3(0, 0, 0),
            vec3(1,1,1),
            gShaders.basic,
            fishmodel
        ));
    }

    for (const obj of gObjects) {
        if (obj instanceof Boid) {
            gBoidController.addBoid(obj);
        }
    }
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
    img.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRIFznsJS37WaQCbXa4UJ8L51DLAnJQ1hvEA&s';
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
