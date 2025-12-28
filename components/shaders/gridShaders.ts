export const gridVertexShader = `
uniform float uTime;
uniform float uMass;
uniform float uStiffness; // 0.0 to 1.0 (Newton to Verlinde)
uniform float uA0;        // Entropic acceleration scale

varying float vElevation;
varying vec2 vUv;

// Helper to smooth out the singularity at r=0
float smoothR(float r) {
    return max(r, 0.2);
}

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calculate distance from galaxy center (assumed 0,0,0)
    float r = length(pos.xy);
    float rSafe = smoothR(r);
    
    // 1. Newtonian Potential Depth (~ -1/r)
    float depthNewton = 1.0 / rSafe;
    
    // 2. Entropic/Verlinde Potential Depth
    // Verlinde gravity falls off slower (1/r force -> log(r) potential)
    // This creates the "deep well" effect at the edges
    float depthVerlinde = depthNewton + (sqrt(uA0) * 1.5 * log(rSafe + 1.0));
    
    // Mix based on "Entropic Stiffness" slider
    float finalDepth = mix(depthNewton, depthVerlinde, uStiffness);
    
    // Apply deformation to Z axis (vertical in our camera space for grid)
    // Negative because gravity is a well
    float zDeformation = -finalDepth * uMass * 0.5;
    
    // Gentle animation breathing based on A0/Redshift
    zDeformation *= 1.0 + (sin(uTime * 0.5) * 0.02 * uA0);

    pos.z += zDeformation;
    vElevation = zDeformation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const gridFragmentShader = `
uniform float uStiffness;
varying float vElevation;
varying vec2 vUv;

void main() {
    // Color based on depth
    // Deep (near mass) = Bright Gold/White
    // Edge (flat) = Blue/Cyan
    
    float depth = abs(vElevation);
    
    vec3 colorBase = vec3(0.0, 0.4, 0.8); // Cyan Blue
    vec3 colorDeep = vec3(1.0, 0.6, 0.1); // Golden
    
    // Highlight lines
    float gridLine = max(
        step(0.95, fract(vUv.x * 40.0)),
        step(0.95, fract(vUv.y * 40.0))
    );
    
    // Activity glow based on entropic stiffness
    vec3 entropicGlow = vec3(0.0, 1.0, 0.5) * uStiffness * 0.3;
    
    vec3 finalColor = mix(colorBase, colorDeep, clamp(depth * 0.2, 0.0, 1.0));
    finalColor += entropicGlow;
    
    // Alpha fade at edges of the disk
    float dist = distance(vUv, vec2(0.5));
    float alpha = (1.0 - smoothstep(0.4, 0.5, dist)) * gridLine;
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;
