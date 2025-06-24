const POST_PROCESS_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 outputColor;

uniform sampler2D uSceneTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    float waveFrequency = 5.0;
    float waveAmplitude = 0.01;
    float speed = 2.0;

    // dual wave pattern with phase offset
    float distortionX = sin(vTexCoord.y * waveFrequency + uTime * speed) * waveAmplitude;
    distortionX += cos(vTexCoord.y * waveFrequency * 0.7 + uTime * speed * 1.3) * waveAmplitude * 0.5;

    float distortionY = cos(vTexCoord.x * waveFrequency * 0.8 + uTime * speed * 0.9) * waveAmplitude;
    distortionY += sin(vTexCoord.x * waveFrequency * 1.2 + uTime * speed * 1.1) * waveAmplitude * 0.6;

    vec2 distortedTexCoord = vTexCoord + vec2(distortionX, distortionY);

    // Sample with distortion
    vec4 sceneColor = texture(uSceneTexture, distortedTexCoord);

    float blueIntensity = 0.3;

    outputColor = vec4(
        sceneColor.r * (0.8 - blueIntensity * 0.5),
        sceneColor.g * (0.9 - blueIntensity * 0.3),
        sceneColor.b * (1.0 + blueIntensity),
        sceneColor.a
    );

    // vignette effect
    vec2 uv = vTexCoord * (1.0 - vTexCoord);
    float vignette = uv.x * uv.y * 15.0;
    vignette = pow(vignette, 0.15);
    outputColor.rgb *= vignette;
}
`;
