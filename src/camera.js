class Camera {
  constructor() {
    this.pos = vec3(20, 20, 20);
    this.at = vec3(0, 0, 0);
    this.up = vec3(0, 0, 1);
    this.fovy = 45.0;
    this.aspect = 1.0;
    this.near = 1;
    this.far = 2000;
    this.transVel = vec3(0, 0, 0);
    this.theta = vec3(-45, 180, 0);
    this.angVel = vec3(0, 0, 0);
    this.sensitivity = 0.05;
    this.moveSpeed = 50;
  }

  move(delta) {
    let rx = rotateX(this.theta[0]);
    let ry = rotateY(this.theta[1]);
    let rotation = mult(ry, rx);

    let forward_v4 = mult(rotation, vec4(0, -1, 0, 0));
    let up_v4 = mult(rotation, vec4(0, 0, 1, 0));
    let right_v4 = mult(rotation, vec4(1, 0, 0, 0));

    let forward = vec3(forward_v4[0], forward_v4[1], forward_v4[2]);
    let up = vec3(up_v4[0], up_v4[1], up_v4[2]);
    let right = vec3(right_v4[0], right_v4[1], right_v4[2]);

    let moveF = mult(this.transVel[0] * delta, forward);
    let moveR = mult(this.transVel[1] * delta, right);
    let moveU = mult(this.transVel[2] * delta, up);

    this.pos = add(this.pos, moveF);
    this.pos = add(this.pos, moveR);
    this.pos = add(this.pos, moveU);

    this.at = add(this.pos, forward);
    this.up = up;
  }
}
