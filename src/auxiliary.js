window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gCamera.aspect = gCanvas.width / gCanvas.height;
    gCamera.perspective = perspective(CAMERA_FOVY, gCamera.aspect, CAMERA_NEAR, CAMERA_FAR);
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCamera.perspective));
}

function startFpsDisplay() {
    let overlay = document.createElement("div");
    overlay.id = "overlay";
    let fpsDisplay = document.createElement("div");
    fpsDisplay.innerHTML = "FPS: <span id='fps'>0</span>";
    overlay.appendChild(fpsDisplay);
    let frametimeDisplay = document.createElement("div");
    frametimeDisplay.innerHTML = "Frame Time: <span id='frametime'>0</span> ms";
    overlay.appendChild(frametimeDisplay);
    document.body.appendChild(overlay);
    
    gState.overlay = document.getElementById("overlay");
    gState.overlayLastUpdate = Date.now();
    gState.fpsAverage = 0;
    gState.fpsCount = 0;
    gState.frameTimeAverage = 0;
    gState.frameTimeCount = 0;
}

function updateFpsDisplay(delta) {
    gState.fpsCount++;
    gState.fpsAverage += Math.round(1 / delta);
    gState.frameTimeCount++;
    gState.frameTimeAverage += delta;
    if (Date.now() - gState.overlayLastUpdate > DEBUG_UPDATE_INTERVAL) {
        gState.overlayLastUpdate = Date.now();
    
        gState.overlay.querySelector("#fps").innerText = Math.round(gState.fpsAverage / gState.fpsCount);
        gState.fpsAverage = 0;
        gState.fpsCount = 0;
        gState.overlay.querySelector("#frametime").innerText = Math.round((gState.frameTimeAverage / gState.frameTimeCount) * 1000); 
        gState.frameTimeAverage = 0;
        gState.frameTimeCount = 0;
    }
}

function modVec3(v, m) {
    return vec3((v[0] + m) % m, (v[1] + m) % m, (v[2] + m) % m);
}