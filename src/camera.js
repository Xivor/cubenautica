class Camera {
    constructor() {
        this.position = vec3(0, 80, 20);
        this.at = vec3(0, 0, 0);
        this.up = vec3(0, 0, 1);
        this.translationVelocity = vec3(0, 0, 0);
        this.theta = vec3(0, 0, 0);
        this.view = lookAt(this.position, this.at, this.up);
        this.computePerspective();
    }

    move() {
        this.translationVelocity[0] = 0;
        if (gState.pressedKeys.includes('w'))
            this.translationVelocity[0] += PLAYER_SPEED;
        if (gState.pressedKeys.includes('s'))
            this.translationVelocity[0] += -PLAYER_SPEED;

        this.translationVelocity[1] = 0;
        if (gState.pressedKeys.includes('a'))
            this.translationVelocity[1] += PLAYER_SPEED;
        if (gState.pressedKeys.includes('d'))
            this.translationVelocity[1] += -PLAYER_SPEED;

        this.translationVelocity[2] = 0;
        if (gState.pressedKeys.includes(' '))
            this.translationVelocity[2] += PLAYER_SPEED;
        if (gState.pressedKeys.includes('shift'))
            this.translationVelocity[2] += -PLAYER_SPEED;
    }

    update(delta) {
        let rotation = mult(rotateZ(this.theta[1]), rotateX(this.theta[0]));

        let forward = mult(rotation, vec4(0, -1, 0, 0));
        forward = vec3(forward[0], forward[1], forward[2]);

        let front = mult(rotateZ(this.theta[1]), vec4(0, -1, 0, 0));
        front = vec3(front[0], front[1], front[2]);
        this.position = add(this.position, mult(this.translationVelocity[0] * delta, front));

        let right = mult(rotateZ(this.theta[1]), vec4(1, 0, 0, 0));
        right = vec3(right[0], right[1], right[2]);
        this.position = add(this.position, mult(this.translationVelocity[1] * delta, right));

        this.up = mult(rotation, vec4(0, 0, 1, 0));
        this.up = vec3(this.up[0], this.up[1], this.up[2]);
        this.position = add(this.position, mult(this.translationVelocity[2] * delta, vec3(0, 0, 1)));

        this.at = add(this.position, forward);
        this.view = lookAt(this.position, this.at, this.up);

        this.checkCollision();
    }

    checkCollision() {
        for (let dimension = 0; dimension < 3; dimension++) {
            if (this.position[dimension] < -(MAP_LIMIT+10)) {
                this.position[dimension] = -(MAP_LIMIT+10);
            } else if (this.position[dimension] > (MAP_LIMIT+10)) {
                this.position[dimension] = MAP_LIMIT+10;
            }
        }
        if (this.position[2] < 2) this.position[2] = 2;
    }

    computePerspective() {
        let aspect = window.innerWidth / window.innerHeight;
        this.perspective = perspective(CAMERA_FOVY, aspect, CAMERA_NEAR, CAMERA_FAR);
        for (let shader in gShaders) {
            gl.useProgram(gShaders[shader].program);
            gl.uniformMatrix4fv(gShaders[shader].uPerspective, false, flatten(this.perspective));
        }
    }
}
