window.onresize = function() {
    gCanvas.width = window.innerWidth;
    gCanvas.height = window.innerHeight;

    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gCamera.computePerspective();
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

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function modVec3(v, m) {
    return vec3((v[0] + m) % m, (v[1] + m) % m, (v[2] + m) % m);
}

function distance(posFrom, posTo) {
    let dx = posFrom[0] - posTo[0];
    let dy = posFrom[1] - posTo[1];
    let dz = posFrom[2] - posTo[2];
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

function limit(v, max) {
    const len = length(v);
    if (len > max) {
        return mult(max / len, v);
    }
    return v;
}

function div(v, a) {
    for (let i = 0; i < v.length; i++) {
        v[i] = v[i] / a;
    }
    return v;
}

function createThickLineGeometry(start, end, thickness = 0.1) {
    const direction = normalize(subtract(end, start));
    const perpendicular = normalize(cross(direction, vec3(0, 0, 1)));
    const halfThickness = thickness / 2;

    const vertices = [
        add(start, mult(halfThickness, perpendicular)),
        add(end, mult(halfThickness, perpendicular)),
        add(start, mult(-halfThickness, perpendicular)),

        add(end, mult(halfThickness, perpendicular)),
        add(end, mult(-halfThickness, perpendicular)),
        add(start, mult(-halfThickness, perpendicular))
    ];

    return vertices;
}
