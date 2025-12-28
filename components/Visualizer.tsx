import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SimulationParams } from '../types';
import { gridVertexShader, gridFragmentShader } from './shaders/gridShaders';
import { lensVertexShader, lensFragmentShader } from './shaders/lensingShaders';

interface VisualizerProps {
  params: SimulationParams;
}

// Helper to safely set scalar uniforms
const setUniform = (material: THREE.ShaderMaterial, key: string, value: number) => {
  if (material.uniforms && material.uniforms[key]) {
    material.uniforms[key].value = value;
  }
};

// 1. The Spacetime Grid (Wireframe)
const SpacetimeGrid: React.FC<VisualizerProps> = ({ params }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate a0 based on Redshift (Reactive Cosmology)
  // Higher z (past) = Higher H = Higher a0
  const a0 = useMemo(() => 0.5 + params.redshift * 0.5, [params.redshift]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMass: { value: params.mass },
    uStiffness: { value: params.stiffness },
    uA0: { value: a0 }
  }), []);

  // Update uniforms every frame
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      // Defensive updates
      setUniform(material, 'uTime', state.clock.getElapsedTime());
      setUniform(material, 'uMass', params.mass);
      setUniform(material, 'uStiffness', params.stiffness);
      setUniform(material, 'uA0', a0);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[20, 20, 128, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={gridVertexShader}
        fragmentShader={gridFragmentShader}
        transparent={true}
        side={THREE.DoubleSide}
        wireframe={true}
      />
    </mesh>
  );
};

// 2. The Background Lensing Effect (Screen Space Raymarching)
const LensingBackground: React.FC<VisualizerProps> = ({ params }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Removed size/resolution dependency as it was unused in shader
  
  const a0 = useMemo(() => 0.5 + params.redshift * 0.5, [params.redshift]);

  // Removed uTime and uResolution as they were unused in the fragment shader
  // causing Three.js to strip them, leading to errors when trying to update them.
  const uniforms = useMemo(() => ({
    uMass: { value: params.mass },
    uStiffness: { value: params.stiffness },
    uA0: { value: a0 },
    uLensStrength: { value: params.lensingStrength }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      setUniform(material, 'uMass', params.mass);
      setUniform(material, 'uStiffness', params.stiffness);
      setUniform(material, 'uA0', a0);
      setUniform(material, 'uLensStrength', params.lensingStrength);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      {/* Full viewport plane */}
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={lensVertexShader}
        fragmentShader={lensFragmentShader}
        depthWrite={false}
      />
    </mesh>
  );
};

// 3. The Baryonic Galaxy (Center Mass)
const GalaxyCenter: React.FC<{ mass: number }> = ({ mass }) => {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[mass * 0.2, 32, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={2}
          roughness={0.4}
        />
      </mesh>
      {/* Halo Glow */}
      <pointLight position={[0, 0, 0]} intensity={mass * 5} distance={10} color="#fbbf24" />
    </group>
  );
};

export const SceneContent: React.FC<VisualizerProps> = ({ params }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <GalaxyCenter mass={params.mass} />
      <SpacetimeGrid params={params} />
      <LensingBackground params={params} />
    </>
  );
};
