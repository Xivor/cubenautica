const LINE_VERTEX_SHADER = `#version 300 es
in vec3 aPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;

void main() {
    gl_Position = uPerspective * uView * uModel * vec4(aPosition, 1.0);
}`;
