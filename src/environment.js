function setupWorld() {
    setupFloorVAO();
    for (let i = 0; i < FISH_GROUP_NUMBER; i++)
        spawnFishGroup();

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

function spawnFish(position) {
    let randomModel = randomRange(0, 1);
    let randomColor = randomRange(0, 1);
    let model = null;
    if (randomModel < 0.5) // Spawn a small fish
        if (randomColor < 0.33)
            model = gModelLoader.models["smallfish_red"];
        else if (randomColor < 0.66)
            model = gModelLoader.models["smallfish_blue"];
        else
            model = gModelLoader.models["smallfish_yellow"];
    else if (randomModel < 0.8) // Spawn a big fish
        if (randomColor < 0.33)
            model = gModelLoader.models["bigfish_red"];
        else if (randomColor < 0.66)
            model = gModelLoader.models["bigfish_blue"];
        else
            model = gModelLoader.models["bigfish_yellow"];
    else // Spawn a pufferfish
        if (randomColor < 0.33)
            model = gModelLoader.models["pufferfish_red"];
        else if (randomColor < 0.66)
            model = gModelLoader.models["pufferfish_blue"];
        else
            model = gModelLoader.models["pufferfish_yellow"];

    gObjects.push(new Boid(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.toon, model));
}

function spawnFishGroup() {
    let groupPosition = vec3(
        randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
        randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
        randomRange(FISH_GROUP_RADIUS+10, (MAP_LIMIT-5))
    );

    let groupSize = randomRange(FISH_GROUP_MIN_SIZE, FISH_GROUP_MAX_SIZE);

    for (let i = 0; i < groupSize; i++) {
        let fishPosition = vec3(
            randomRange(0, FISH_GROUP_RADIUS),
            randomRange(0, FISH_GROUP_RADIUS),
            randomRange(0, FISH_GROUP_RADIUS),
        );
        fishPosition = add(fishPosition, groupPosition);
        spawnFish(fishPosition);
    }
}

function spawnRock() {
    let randomModel = randomRange(0, 1);
    let model = null;
    if (randomModel < 0.5) // Spawn a small rock
        model = gModelLoader.models["small_rock"];
    else // Spawn a big rock
        model = gModelLoader.models["big_rock"];
    let position = vec3(
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        (randomModel < 0.5) ? randomRange(0, 2) : // Small rock
                              randomRange(0, 5)   // Big rock
    );
    gObjects.push(new BaseObject(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.textured, model));
}

function spawnKelp() {
    let position = vec3(
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(-(MAP_LIMIT*3-20), (MAP_LIMIT*3-20)),
        randomRange(0, 5)
    );
    gObjects.push(new BaseObject(position, vec3(0, 0, 0), vec3(1, 1, 1), gShaders.textured, gModelLoader.models["small_kelp"]));
}
