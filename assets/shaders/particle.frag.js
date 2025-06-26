const PARTICLE_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec4 uColor;
out vec4 outputColor;

void main() {
    // Point sprite circle effect
    vec2 coord = gl_PointCoord * 2.0 - 1.0;
    float len = length(coord);
    if (len > 1.0) discard;

    outputColor = uColor;
    outputColor.a *= 1.0 - smoothstep(0.6, 1.0, len); // Fade edges
}
`;
