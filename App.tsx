import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { SimulationParams } from './types';
import { Controls } from './components/Controls';
import { SceneContent } from './components/Visualizer';

const App = () => {
  const [params, setParams] = useState<SimulationParams>({
    mass: 1.0,
    stiffness: 0.0, // Start with Newtonian
    redshift: 0.0,
    lensingStrength: 1.0
  });

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Overlay Title */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold text-white tracking-tighter">
          THE REACTIVE <span className="text-sci-accent">VACUUM</span>
        </h1>
        <p className="text-sci-500 font-mono text-sm mt-2 max-w-md">
          Verlinde Entropic Gravity Visualization.
          <br/>
          Demonstrating "Information as Geometry".
        </p>
      </div>

      {/* Info Box */}
      <div className="absolute bottom-8 left-8 z-10 max-w-md pointer-events-none">
         <div className="bg-black/50 backdrop-blur border-l-2 border-sci-accent p-4 text-gray-300 text-sm font-sans">
            <h3 className="font-bold text-white mb-2">Observation Notes:</h3>
            <ul className="list-disc ml-4 space-y-1">
              <li>Increase <span className="text-sci-accent">Stiffness</span> to see the spacetime grid deepen at the edges (Dark Matter Halo effect).</li>
              <li>Observe background stars forming <span className="text-sci-accent">Einstein Rings</span> without adding invisible mass.</li>
              <li>Increase <span className="text-sci-accent">Redshift</span> to see the vacuum react to cosmic expansion ($a_0$ scaling).</li>
            </ul>
         </div>
      </div>

      {/* React Three Fiber Canvas */}
      <Canvas className="w-full h-full">
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={45} />
        <OrbitControls 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.5} 
            minDistance={2}
            maxDistance={20}
        />
        
        <SceneContent params={params} />
        
      </Canvas>

      {/* UI Layer */}
      <Controls params={params} setParams={setParams} />
    </div>
  );
};

export default App;
