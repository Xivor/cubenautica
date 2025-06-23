const TEXTURED_FRAGMENT_SHADER = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
out vec4 outputColor;

uniform vec4 uColorAmbient;
uniform vec4 uColorDiffusion;
uniform vec4 uColorEspecular;
uniform float uAlphaEspecular;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
  
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 diffusion = kd * uColorDiffusion;

    float ks = 0.0;
    if (kd > 0.0) {
        ks = pow(max(0.0, dot(normalV, halfV)), uAlphaEspecular);
    }
    
    vec4 especular = ks * uColorEspecular;
    outputColor = diffusion + especular + uColorAmbient;    
    outputColor.a = 1.0;
}
`;