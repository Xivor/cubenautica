const TEXTURED_VERTEX_SHADER = `#version 300 es

in  vec4 aPosition;
in  vec3 aNormal;
in vec2 aTextureCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uModelViewInverseTranspose;

uniform vec4 uLightPosition;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;
out vec2 vTextureCoord;

void main() {
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * aPosition;

    vNormal = mat3(uModelViewInverseTranspose) * aNormal;
    vec4 position = modelView * aPosition;

    vLight = (uView * uLightPosition - position).xyz;
    vView = -(position.xyz);

    vTextureCoord = aTextureCoord;
}
`;
