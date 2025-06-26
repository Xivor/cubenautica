const PARTICLE_VERTEX_SHADER = `#version 300 es
in vec3 aPosition;

uniform mat4 uView;
uniform mat4 uPerspective;
uniform float uPointSize;

void main() {
    gl_Position = uPerspective * uView * vec4(aPosition, 1.0);
    gl_PointSize = uPointSize;
}
`;
