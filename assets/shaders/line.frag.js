const LINE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;
out vec4 outputColor;
uniform vec4 uColor;

void main() {
    outputColor = uColor;
}`;
