function onKeyDown(event) {
    if (!gState.pointerLocked || !INTERACTION_KEYS.includes(event.key.toLowerCase())) return;
    if (event.key.toLowerCase() === 'escape')
        document.exitPointerLock();
    else if (!gState.pressedKeys.includes(event.key.toLowerCase())) {
        gState.pressedKeys.push(event.key.toLowerCase());
        gCamera.move();
    }
}

function onKeyUp(event) {
    if (!INTERACTION_KEYS.includes(event.key.toLowerCase())) return;
    if (gState.pressedKeys.includes(event.key.toLowerCase())) {
        gState.pressedKeys = gState.pressedKeys.filter(key => key !== event.key.toLowerCase());
        gCamera.move();
    }
}

function onMouseMove(event) {
    if (!gState.pointerLocked) return;
    let deltaX = -event.movementX || event.mozMovementX || 0;
    let deltaY = event.movementY || event.mozMovementY || 0;
    deltaX = deltaX * CAMERA_SENSITIVITY;
    deltaY = deltaY * CAMERA_SENSITIVITY;

    gCamera.theta[1] += deltaX;
    gCamera.theta[0] += deltaY;
    gCamera.theta[0] = Math.max(-89, Math.min(89, gCamera.theta[0]));
}

function lockPointer() {
    if (!gState.pointerLocked) {
        gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
        gCanvas.requestPointerLock();
    }
}

function pointerLockChange() {
    gState.pointerLocked = (
        document.pointerLockElement === gCanvas ||
        document.mozPointerLockElement === gCanvas
    );
}