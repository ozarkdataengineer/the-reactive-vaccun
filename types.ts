export interface SimulationParams {
  mass: number;         // Baryonic Mass
  stiffness: number;    // 0 = Newton, 1 = Verlinde (Entropic)
  redshift: number;     // Affects a0 (Hubble scale)
  lensingStrength: number;
}

export interface Uniforms {
  [key: string]: { value: any };
}
