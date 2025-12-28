export const lensVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const lensFragmentShader = `
uniform float uMass;
uniform float uA0;
uniform float uStiffness;
uniform float uLensStrength;

varying vec2 vUv;

// Pseudo-random function for stars
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Procedural Starfield
vec3 getStarField(vec2 uv) {
    float n = noise(uv * 200.0);
    float star = step(0.98, n) * n;
    return vec3(star);
}

// The Paper's Interpolation Formula
float getEntropicCorrection(float r, float mass, float a0) {
    // Newton acceleration: gN ~ M / r^2
    // To avoid infinity at r=0, we clamp r
    float rSafe = max(r, 0.05);
    float gN = mass / (rSafe * rSafe);
    
    // Verlinde/MOND Interpolation: g = gN * (1 + sqrt(a0/gN)) approx for deep MOND
    // Or the specific formula: g = (gN + sqrt(gN^2 + 4 gN a0)) / 2
    
    float term = sqrt(gN * gN + 4.0 * gN * a0);
    float gEntropic = (gN + term) / 2.0;
    
    // Ratio of Entropic to Newton
    return gEntropic / gN;
}

void main() {
    // Center of screen is (0.5, 0.5)
    vec2 center = vec2(0.5);
    vec2 uv = vUv;
    
    // Vector from center to current pixel
    vec2 offset = uv - center;
    float r = length(offset);
    
    // 1. Calculate Standard Lensing (Newtonian)
    // Deflection angle alpha ~ 4GM / (c^2 * r)
    // In screen space displacement: displacement ~ 1/r
    float baseDeflection = uMass * 0.02 / max(r, 0.01);
    
    // 2. Calculate Entropic Correction Factor
    float correction = getEntropicCorrection(r * 10.0, uMass, uA0); // Scale r for physics simulation
    
    // 3. Mix based on Stiffness Slider
    // If stiffness 0: correction is ignored (multiply by 1.0)
    // If stiffness 1: multiply by calculated correction
    float activeCorrection = mix(1.0, correction, uStiffness);
    
    // 4. Apply Distortion
    // We look up the texture from a coordinate shifted TOWARDS the mass
    // "Pulling" the light inward
    vec2 distortedUV = uv - normalize(offset) * baseDeflection * activeCorrection * uLensStrength;
    
    // 5. Render Starfield
    vec3 color = getStarField(distortedUV);
    
    // Add a subtle accretion disk glow
    float glow = 0.02 / (r * r) * uMass * 0.5;
    color += vec3(1.0, 0.8, 0.4) * glow;

    // Visual Debug for Einstein Ring (Optional, subtle blue hint)
    if (uStiffness > 0.5) {
        float ringRadius = sqrt(uMass * uA0) * 0.2; // Rough approximation of critical radius
        float ringDist = abs(r - ringRadius);
        color += vec3(0.0, 0.2, 0.5) * exp(-ringDist * 20.0) * uStiffness * 0.2;
    }

    gl_FragColor = vec4(color, 1.0);
}
`;