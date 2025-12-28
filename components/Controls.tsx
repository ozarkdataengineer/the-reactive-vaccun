import React from 'react';
import { SimulationParams } from '../types';

interface ControlsProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
}

const Slider = ({ label, value, min, max, step, onChange, unit }: any) => (
  <div className="mb-4">
    <div className="flex justify-between text-xs font-mono text-sci-500 mb-1">
      <label>{label}</label>
      <span>{value.toFixed(2)} {unit}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-sci-800 rounded-lg appearance-none cursor-pointer accent-sci-accent"
    />
  </div>
);

export const Controls: React.FC<ControlsProps> = ({ params, setParams }) => {
  const update = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-sci-900/90 backdrop-blur-md border border-sci-800 p-6 rounded-xl shadow-2xl z-10 text-white">
      <h2 className="text-xl font-bold font-sans mb-1 text-white border-b border-sci-800 pb-2">
        Parameter Control
      </h2>
      <p className="text-xs text-gray-400 mb-6 font-mono">
        THE REACTIVE VACUUM LAB
      </p>

      {/* Entropic Stiffness */}
      <div className="mb-6 p-3 bg-sci-800/50 rounded border border-sci-500/30">
        <Slider
          label="ENTROPIC STIFFNESS (Verlinde)"
          value={params.stiffness}
          min={0}
          max={1}
          step={0.01}
          unit="%"
          onChange={(v: number) => update('stiffness', v)}
        />
        <p className="text-[10px] text-gray-400 leading-tight">
          0.0 = Newtonian Gravity (Matter only)<br/>
          1.0 = Emergent Gravity (Geometry acts as Mass)
        </p>
      </div>

      <Slider
        label="BARYONIC MASS (M)"
        value={params.mass}
        min={0.1}
        max={5.0}
        step={0.1}
        unit="M☉"
        onChange={(v: number) => update('mass', v)}
      />

      <Slider
        label="REDSHIFT (z) -> a0(H)"
        value={params.redshift}
        min={0}
        max={5}
        step={0.1}
        unit="z"
        onChange={(v: number) => update('redshift', v)}
      />
      
       <Slider
        label="LENSING STRENGTH"
        value={params.lensingStrength}
        min={0}
        max={2}
        step={0.1}
        unit="α"
        onChange={(v: number) => update('lensingStrength', v)}
      />

      <div className="mt-4 pt-4 border-t border-sci-800">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${params.stiffness > 0.5 ? 'bg-sci-accent animate-pulse' : 'bg-gray-600'}`}></div>
          <span className="text-xs font-mono text-gray-300">
            {params.stiffness > 0.5 ? 'EMERGENT GRAVITY ACTIVE' : 'NEWTONIAN REGIME'}
          </span>
        </div>
      </div>
    </div>
  );
};
