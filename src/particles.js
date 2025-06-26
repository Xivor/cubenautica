class Bubbles {
  constructor() {
    this.bubbles = [];
    this.maxBubbles = 100;
    this.posBuffer = gl.createBuffer();
    this.vao = gl.createVertexArray();
    this.setupShaders();
  }

  setupShaders() {
    this.shader = gShaders.particle;
    gl.useProgram(this.shader.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);

    this.aPosition = gl.getAttribLocation(this.shader.program, "aPosition");
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  update(delta) {
    if (this.bubbles.length < this.maxBubbles && Math.random() > 0.7) {
      this.bubbles.push({
        position: [
          randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
          randomRange(-(MAP_LIMIT-5), (MAP_LIMIT-5)),
          randomRange(0, (MAP_LIMIT/3))
        ],
        size: 0.1 + Math.random() * 0.3,
        speed: 1.0 + Math.random() * 2.0,
        life: 2.0 + Math.random() * 3.0
      });
    }

    this.bubbles.forEach(bubble => {
      bubble.position[2] += bubble.speed * delta;
      bubble.life -= delta;
    });

    this.bubbles = this.bubbles.filter(bubble => bubble.life > 0);
  }

  render() {
    if (this.bubbles.length === 0) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.shader.program);

    const positions = new Float32Array(this.bubbles.length * 3);
    this.bubbles.forEach((bubble, i) => {
      positions[i * 3] = bubble.position[0];
      positions[i * 3 + 1] = bubble.position[1];
      positions[i * 3 + 2] = bubble.position[2];
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(this.aPosition);
    gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(this.shader.uView, false, flatten(gCamera.view));
    gl.uniformMatrix4fv(this.shader.uPerspective, false, flatten(gCamera.perspective));
    gl.uniform4fv(this.shader.uColor, [0.5, 0.5, 0.8, 0.2]);

    const baseSize = 5.0;
    gl.uniform1f(this.shader.uPointSize, baseSize);

    gl.drawArrays(gl.POINTS, 0, this.bubbles.length);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }
}
