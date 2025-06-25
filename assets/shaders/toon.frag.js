const TOON_FRAGMENT_SHADER = `#version 300 es

precision highp float;

in vec3 vLight;
in vec3 vNormal;
out vec4 outputColor;

uniform float uOutline;
uniform vec4 uColorAmbient;
uniform vec4 uColorDiffusion;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);

    float kd = max(0.0, dot(normalV, lightV) );

    // Define the toon shading steps
    // float nSteps = 4.0;
    // float step = sqrt(kd) * nSteps;
    // step = (floor(step) + smoothstep(0.28, 0.92, fract(step))) / nSteps;
    // vec4 diffusion = step * uColorDiffusion;
    if (kd > 0.9) {
        kd = 1.0;
    } else if(kd > 0.4) {
        kd = 0.7;
    } else if(kd > 0.1) {
        kd = 0.3;
    } else {
        kd = 0.1;
    }

    vec4 diffusion = kd * uColorDiffusion;

    outputColor = diffusion + uColorAmbient;
    outputColor *= uOutline;
    outputColor.a = 1.0;
}
`;
