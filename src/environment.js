function setupWorld() {
    setupFloorVAO();
    for (let i = 0; i < FISH_NUMBER; i++)
        spawnFish();

    for (let i = 0; i < ROCK_NUMBER; i++)
        spawnRock();

    for (let i = 0; i < KELP_NUMBER; i++)
        spawnKelp();

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
        vec2(64.0, 0.0),
        vec2(0.0, 64.0),
        vec2(64.0, 64.0)
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([234, 204, 111, 255]));

    var img = new Image();
    img.src = FLOOR_TEXTURE_URL;
    img.crossOrigin = "anonymous";
    img.addEventListener('load', function() {
        gl.bindTexture(gl.TEXTURE_2D, gFloorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    gl.bindVertexArray(null);
}

function renderFloor() {
    gl.bindVertexArray(gFloor);
    gl.useProgram(gShaders.textured.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gFloorTexture);
    gl.uniform1i(gl.getUniformLocation(gShaders.textured.program, "uTexture"), 0);

    gl.uniform4fv(gShaders.textured.uColorAmbient, mult(LIGHT.ambient, vec4(1, 1, 1, 1)));
    gl.uniform4fv(gShaders.textured.uColorDiffusion, mult(LIGHT.diffusion, vec4(1, 1, 1, 1)));
    gl.uniformMatrix4fv(gShaders.textured.uModel, false, flatten(mat4()));
    gl.uniformMatrix4fv(gShaders.textured.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(gShaders.textured.uProjection, false, flatten(gCamera.perspective));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
}

function spawnFish() {
    let randomModel = randomRange(0, 1);
    let randomColor = randomRange(0, 1);
    let model = null;
    if (randomModel < 0.5) // Spawn a small fish
        if (randomColor < 0.33)
            model = SMALLFISH_RED_MODEL;
        else if (randomColor < 0.66)
            model = SMALLFISH_BLUE_MODEL;
        else
            model = SMALLFISH_YELLOW_MODEL;
    else if (randomModel < 0.8) // Spawn a big fish
        if (randomColor < 0.33)
            model = BIGFISH_RED_MODEL;
        else if (randomColor < 0.66)
            model = BIGFISH_BLUE_MODEL;
        else
            model = BIGFISH_YELLOW_MODEL;
    else // Spawn a pufferfish
        if (randomColor < 0.33)
            model = PUFFERFISH_RED_MODEL;
        else if (randomColor < 0.66)
            model = PUFFERFISH_BLUE_MODEL;
        else
            model = PUFFERFISH_YELLOW_MODEL;

    let position = vec3(
        randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
        randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
        randomRange(0, (MAP_LIMIT-5))
    );
    gObjects.push(new Boid(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.toon, model));
}

function spawnRock() {
    let randomModel = randomRange(0, 1);
    let model = null;
    if (randomModel < 0.5) // Spawn a small rock
        model = SMALL_ROCK_MODEL;
    else // Spawn a big rock
        model = BIG_ROCK_MODEL;
    let position = vec3(
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(0, 5)
    );
    gObjects.push(new Object(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.textured, model));
}

function spawnKelp() {
    let randomModel = randomRange(0, 1);
    let position = vec3(
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(0, 5)
    );
    gObjects.push(new Object(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.textured, SMALL_KELP_MODEL));
}
