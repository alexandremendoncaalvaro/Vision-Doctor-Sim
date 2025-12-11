import React from 'react';
import { 
  SensorFormat, 
  LightColor, 
  LightType, 
  ObjectType, 
  SimulationState 
} from '../types';
import { STANDARD_FOCAL_LENGTHS, STANDARD_APERTURES, OBJECT_GOALS } from '../constants';
import { Sliders, Camera, Lightbulb, Box, Eye, Activity, Target, RotateCw } from 'lucide-react';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange, onAnalyze, isAnalyzing }) => {
  
  const handleChange = (key: keyof SimulationState, value: any) => {
    onChange({ [key]: value });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-y-auto">
      <div className="p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="text-blue-500" />
          Vision Doctor
        </h1>
        <p className="text-xs text-slate-400 mt-1">Industrial Optical Simulator</p>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Object Selection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Box size={16} /> Object & Scenario
          </div>
          <select 
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={state.objectType}
            onChange={(e) => handleChange('objectType', e.target.value)}
          >
            {Object.values(ObjectType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Scenario Goal Hint */}
          <div className="bg-slate-800/50 rounded p-3 border-l-2 border-emerald-500">
             <div className="flex items-start gap-2 text-xs text-slate-300">
               <Target size={14} className="mt-0.5 text-emerald-400 shrink-0" />
               <p>{OBJECT_GOALS[state.objectType]}</p>
             </div>
          </div>
        </section>

        {/* Camera & Lens */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Camera size={16} /> Camera & Lens
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Sensor Format</label>
            <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
              value={state.sensorFormat}
              onChange={(e) => handleChange('sensorFormat', e.target.value)}
            >
              {Object.values(SensorFormat).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Focal Length (mm)</label>
            <div className="grid grid-cols-4 gap-2">
              {STANDARD_FOCAL_LENGTHS.map((fl) => (
                <button
                  key={fl}
                  onClick={() => handleChange('focalLength', fl)}
                  className={`text-xs py-1 rounded border ${state.focalLength === fl ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                >
                  {fl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">Aperture (f-stop)</label>
             <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
              value={state.aperture}
              onChange={(e) => handleChange('aperture', Number(e.target.value))}
            >
              {STANDARD_APERTURES.map((a) => (
                <option key={a} value={a}>f/{a}</option>
              ))}
            </select>
          </div>

           <div className="space-y-1">
             <label className="text-xs text-slate-500">Working Distance ({state.workingDistance}mm)</label>
             <input 
               type="range" 
               min="50" 
               max="1000" 
               step="10"
               value={state.workingDistance}
               onChange={(e) => handleChange('workingDistance', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
          </div>

          <div className="space-y-1">
             <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 flex items-center gap-1">
                  <RotateCw size={10} /> Tilt Angle
                </label>
                <span className="text-xs text-slate-300 font-mono">{state.cameraAngle}°</span>
             </div>
             <input 
               type="range" 
               min="0" 
               max="45" 
               step="1"
               value={state.cameraAngle}
               onChange={(e) => handleChange('cameraAngle', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
             />
             <div className="text-[10px] text-slate-500 text-right">Tilt to reduce glare</div>
          </div>
        </section>

        {/* Lighting */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Lightbulb size={16} /> Illumination
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
              <label className="text-xs text-slate-500">Type</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.lightType}
                onChange={(e) => handleChange('lightType', e.target.value)}
              >
                {Object.values(LightType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Color</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.lightColor}
                onChange={(e) => handleChange('lightColor', e.target.value)}
              >
                {Object.values(LightColor).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">Intensity ({state.lightIntensity}%)</label>
             <input 
               type="range" 
               min="0" 
               max="100" 
               value={state.lightIntensity}
               onChange={(e) => handleChange('lightIntensity', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
             />
          </div>
        </section>

        {/* Action */}
        <div className="pt-4">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
          >
             {isAnalyzing ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Eye size={18} />
             )}
             Analyze Setup
          </button>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;