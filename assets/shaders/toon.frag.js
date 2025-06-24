const TOON_FRAGMENT_SHADER = `#version 300 es

precision highp float;

in vec3 vLight;
in vec3 vNormal;
out vec4 outputColor;

uniform vec4 uColorAmbient;
uniform vec4 uColorDiffusion;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);

    float kd = max(0.0, dot(normalV, lightV) );

    // Define the toon shading steps
    float nSteps = 4.0;
    float step = sqrt(kd) * nSteps;
    step = (floor(step) + smoothstep(0.48, 0.52, fract(step))) / nSteps;
    vec4 diffusion = step * uColorDiffusion;

    outputColor = diffusion + uColorAmbient;
}
`;
