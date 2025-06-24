const POST_PROCESS_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vTexCoord;
out vec4 outputColor;

uniform sampler2D uSceneTexture;
uniform float uTime;
uniform vec2 uResolution;

void main() {
    float waveFrequency = 5.0;
    float waveAmplitude = 0.010;
    float speed = 1.5;

    // Calculate distortion based on sine and cosine waves
    float distortionX = sin(vTexCoord.y * waveFrequency + uTime * speed) * waveAmplitude;
    float distortionY = cos(vTexCoord.x * waveFrequency + uTime * speed) * waveAmplitude;

    // Apply the distortion to the texture coordinates
    vec2 distortedTexCoord = vTexCoord + vec2(distortionX, distortionY);

    // Sample the scene texture with the distorted coordinates
    vec4 sceneColor = texture(uSceneTexture, distortedTexCoord);

    // Blue tint parameters
    float blueIntensity = 0.3;

    // Apply a blue tint
    outputColor = vec4(
        sceneColor.r * (1.0 - blueIntensity),
        sceneColor.g * (1.0 - blueIntensity * 0.7),
        sceneColor.b + blueIntensity,
        sceneColor.a
    );
}
`;
