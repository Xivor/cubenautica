function lockPointer() {
    if (!gState.pointerLocked) {
        gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
        gCanvas.requestPointerLock();
    }
}

function onKeyDown(event) {
    if (!gState.pointerLocked) return;
    switch(event.key.toLowerCase()) {
        case 'w':
            gCamera.translationVelocity[0] = CAMERA_ACCELERATION;
            break;
        case 's':
            gCamera.translationVelocity[0] = -CAMERA_ACCELERATION;
            break;
        case 'a':
            gCamera.translationVelocity[1] = CAMERA_ACCELERATION;
            break;
        case 'd':
            gCamera.translationVelocity[1] = -CAMERA_ACCELERATION;
            break;
        case ' ':
            gCamera.translationVelocity[2] = CAMERA_ACCELERATION;
            break;
        case 'shift':
            gCamera.translationVelocity[2] = -CAMERA_ACCELERATION;
            break;
        case 'escape':
            document.exitPointerLock();
            break;
    }
}

function onKeyUp(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
        case 's':
            gCamera.translationVelocity[0] = 0;
            break;
        case 'a':
        case 'd':
            gCamera.translationVelocity[1] = 0;
            break;
        case ' ':
        case 'shift':
            gCamera.translationVelocity[2] = 0;
            break;
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

function pointerLockChange() {
    gState.pointerLocked = (
        document.pointerLockElement === gCanvas ||
        document.mozPointerLockElement === gCanvas
    );
}