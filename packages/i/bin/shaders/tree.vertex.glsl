precision highp float;

attribute float alpha; // Assuming alpha value as attribute

uniform vec3 gc_camRight;
uniform vec3 gc_camUp;

varying vec2 vTexCoord;
varying float vAlpha;

void main() {
    vec3 sCornerRight[4];
    sCornerRight[0] = vec3(-0.5, 0.0, 0.0);
    sCornerRight[1] = vec3(0.5, 0.0, 0.0);
    sCornerRight[2] = vec3(0.5, 1.0, 0.0);
    sCornerRight[3] = vec3(-0.5, 1.0, 0.0);

    vec3 sCornerUp[4];
    sCornerUp[0] = vec3(0.0, 0.0, 1.0);
    sCornerUp[1] = vec3(0.0, 0.0, 1.0);
    sCornerUp[2] = vec3(1.0, 0.0, 1.0);
    sCornerUp[3] = vec3(1.0, 0.0, 1.0);

    vec2 sUVCornerExtent[4];
    sUVCornerExtent[0] = vec2(0.0, 1.0);
    sUVCornerExtent[1] = vec2(1.0, 1.0); 
    sUVCornerExtent[2] = vec2(1.0, 0.0); 
    sUVCornerExtent[3] = vec2(0.0, 0.0);

    // Calculate the corner based on uv coordinates
    int corner = int(uv.x * 3.0); // Assuming uv.x is between 0 and 1

    // Calculate size and type (assuming these are uniform across vertices)
    vec2 size = vec2(1.0); // Example size
    int type = 0; // Example type

    // Calculate right and up vectors based on camera vectors and corners
    vec3 rightVec = gc_camRight * sCornerRight[corner].x;
    vec3 upVec = gc_camUp * sCornerUp[corner].y;

    // Calculate final position in world space
    vec3 outPos = position + upVec * size.y + rightVec * size.x;

    // Calculate alpha based on distance or other factors (example)
    vAlpha = alpha;

    // Pass texture coordinates to fragment shader
    vTexCoord = uv * sUVCornerExtent[corner];

    // Transform position to clip space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(outPos, 1.0);
}
