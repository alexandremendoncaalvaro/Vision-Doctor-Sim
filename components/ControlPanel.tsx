import React, { useEffect } from 'react';
import { 
  SensorFormat, 
  LightColor, 
  LightFixture,
  LightPosition,
  LightConfig,
  ObjectType, 
  SimulationState,
  ViewFocus,
  ObjectOrientation,
  Language,
  GlobalEnv
} from '../types';
import { STANDARD_FOCAL_LENGTHS, STANDARD_APERTURES, OBJECT_GOALS } from '../constants';
import { TEXTS, GOAL_TRANSLATIONS } from '../translations';
import { getPreset } from '../presets';
import { Camera, Lightbulb, Box, Activity, Target, RotateCw, Wind, Palette, Scan, Signal, Eye, Move3d, Wand2, Sun } from 'lucide-react';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  language: Language;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange, language }) => {
  const t = TEXTS[language];
  
  const handleChange = (key: keyof SimulationState, value: any) => {
    onChange({ [key]: value });
  };

  const handleObjectChange = (type: ObjectType) => {
    // Reset goal when object changes
    onChange({ 
      objectType: type,
      inspectionGoal: OBJECT_GOALS[type][0]
    });
  };

  // Logic to ensure valid defaults when switching Light Types
  useEffect(() => {
    // Force specific positions for Dome/Tunnel
    if (state.lightType === LightFixture.Dome || state.lightType === LightFixture.Tunnel) {
        if (state.lightPosition !== LightPosition.Surrounding) {
             handleChange('lightPosition', LightPosition.Surrounding);
        }
    }
    // If Panel selected, but position is Camera Axis (invalid), force to Backlight
    else if (state.lightType === LightFixture.Panel) {
        if (state.lightPosition !== LightPosition.Back && state.lightPosition !== LightPosition.Top && state.lightPosition !== LightPosition.Side) {
             handleChange('lightPosition', LightPosition.Back);
        }
    }
    // If Coaxial, force Camera Axis
    else if (state.lightType === LightFixture.Coaxial && state.lightPosition !== LightPosition.Camera) {
         handleChange('lightPosition', LightPosition.Camera);
    }
    // If Ring, remove Backlight/Top option if selected
    else if (state.lightType === LightFixture.Ring && (state.lightPosition === LightPosition.Back || state.lightPosition === LightPosition.Top)) {
        handleChange('lightPosition', LightPosition.Camera);
    }
  }, [state.lightType]);

  const handleAutoTune = () => {
    const preset = getPreset(state.objectType, state.inspectionGoal);
    if (preset) {
      onChange(preset);
    }
  };

  const backgroundOptions = [
    { name: 'Dark', value: '#050505' },
    { name: 'Gray', value: '#475569' },
    { name: 'White', value: '#f1f5f9' },
    { name: 'Blue', value: '#1e3a8a' },
    { name: 'Green', value: '#064e3b' },
  ];

  const getTranslatedGoal = (goalKey: string) => {
    return GOAL_TRANSLATIONS[goalKey]?.[language] || goalKey;
  };

  // --- Dynamic Option Helpers ---
  const getValidPositions = () => {
      switch(state.lightType) {
          case LightFixture.Panel: 
            return [LightPosition.Back, LightPosition.Top, LightPosition.Side];
          case LightFixture.Ring:
            // Standard Ring is on Camera Axis. Low Angle Ring (Dark Field) is different.
            return [LightPosition.Camera, LightPosition.LowAngle];
          case LightFixture.Bar:
            return [LightPosition.Back, LightPosition.Top, LightPosition.Side, LightPosition.LowAngle];
          case LightFixture.Coaxial:
            return [LightPosition.Camera];
          case LightFixture.Spot:
            return [LightPosition.Top, LightPosition.Side];
          case LightFixture.Dome:
          case LightFixture.Tunnel:
            return [LightPosition.Surrounding];
          default:
            return Object.values(LightPosition);
      }
  };

  const getValidConfigs = () => {
      switch(state.lightType) {
          case LightFixture.Panel:
              return [LightConfig.Small, LightConfig.Medium, LightConfig.Large];
          case LightFixture.Bar:
              return [LightConfig.Single, LightConfig.Dual, LightConfig.Quad];
          case LightFixture.Spot:
              return [LightConfig.Narrow, LightConfig.Wide];
          default:
              return [LightConfig.Single];
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Activity className="text-blue-500" />
          {t.appTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-1">{t.appSubtitle}</p>
      </div>

      <div className="p-4 space-y-8 pb-20">
        
        {/* 1. Object Selection */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Box size={16} /> {t.sectionObject}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">{t.targetObject}</label>
            <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={state.objectType}
              onChange={(e) => handleObjectChange(e.target.value as ObjectType)}
            >
              {Object.values(ObjectType).map((type) => (
                <option key={type} value={type}>{t.objects[type] || type}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
             <div className="flex items-center gap-1 text-xs text-slate-500">
               <Target size={12} className="text-emerald-500" /> {t.inspectionGoal}
             </div>
             <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={state.inspectionGoal}
              onChange={(e) => handleChange('inspectionGoal', e.target.value)}
            >
              {OBJECT_GOALS[state.objectType].map((goal) => (
                <option key={goal} value={goal}>{getTranslatedGoal(goal)}</option>
              ))}
            </select>
          </div>
        </section>

        {/* 2. Environment & Motion (Moved Up) */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Wind size={16} /> {t.sectionEnv}
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center gap-1">
                <Sun size={10} /> {t.globalEnv}
             </label>
             <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 outline-none"
              value={state.globalEnv}
              onChange={(e) => handleChange('globalEnv', e.target.value)}
            >
              {Object.values(GlobalEnv).map((env) => (
                <option key={env} value={env}>{t.envs?.[env] || env}</option>
              ))}
            </select>
          </div>

          {state.globalEnv !== GlobalEnv.Studio && (
             <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
               <label className="text-xs text-slate-500">{t.globalIntensity} ({state.globalIntensity}%)</label>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={state.globalIntensity}
                 onChange={(e) => handleChange('globalIntensity', Number(e.target.value))}
                 className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
               />
            </div>
          )}

          <hr className="border-slate-800" />

          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center gap-1">
                <Palette size={10} /> {t.background}
             </label>
             <div className="flex gap-2">
                {backgroundOptions.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => handleChange('backgroundColor', bg.value)}
                    className={`w-6 h-6 rounded-full border border-slate-600 ${state.backgroundColor === bg.value ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: bg.value }}
                    title={bg.name}
                  />
                ))}
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.lineSpeed} ({state.objectSpeed} mm/s)</label>
             <input 
               type="range" 
               min="0" 
               max="2000" 
               step="50"
               value={state.objectSpeed}
               onChange={(e) => handleChange('objectSpeed', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.vibration} ({state.vibrationLevel}/10)</label>
             <input 
               type="range" 
               min="0" 
               max="10" 
               step="1"
               value={state.vibrationLevel}
               onChange={(e) => handleChange('vibrationLevel', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
             />
          </div>

           <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center gap-1"><Scan size={10} /> {t.roiSize}</label>
             <div className="flex gap-2">
                <input 
                 type="range" 
                 min="0.1" max="1" step="0.05"
                 value={state.roiW}
                 title="Width"
                 onChange={(e) => handleChange('roiW', Number(e.target.value))}
                 className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
               <input 
                 type="range" 
                 min="0.1" max="1" step="0.05"
                 value={state.roiH}
                 title="Height"
                 onChange={(e) => handleChange('roiH', Number(e.target.value))}
                 className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
               />
             </div>
          </div>
        </section>

        {/* 3. View & Orientation */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Move3d size={16} /> {t.sectionView}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1">
              <Eye size={10} /> {t.cameraFocus}
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800 rounded-md">
              {(['Top', 'Middle', 'Bottom', 'Whole'] as ViewFocus[]).map((focus) => (
                 <button
                   key={focus}
                   onClick={() => handleChange('viewFocus', focus)}
                   className={`text-[10px] py-1 rounded ${state.viewFocus === focus ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                   {t.focus[focus]}
                 </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.objOrientation}</label>
             <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.objectOrientation}
                onChange={(e) => handleChange('objectOrientation', e.target.value)}
             >
               {(['Front', 'Side', 'Back', 'Top', 'Bottom'] as ObjectOrientation[]).map((o) => (
                 <option key={o} value={o}>{t.orientation[o]}</option>
               ))}
             </select>
          </div>
        </section>

        {/* 4. Camera & Lens (Include Exposure/Gain here) */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Camera size={16} /> {t.sectionCamera}
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-slate-500">{t.sensorFormat}</label>
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
            <label className="text-xs text-slate-500">{t.focalLength}</label>
            <select
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
              value={state.focalLength}
              onChange={(e) => handleChange('focalLength', Number(e.target.value))}
            >
              {STANDARD_FOCAL_LENGTHS.map((fl) => (
                <option key={fl} value={fl}>{fl} mm</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.aperture}</label>
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
             <label className="text-xs text-slate-500">{t.workingDistance} ({state.workingDistance}mm)</label>
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
                  <RotateCw size={10} /> {t.tiltAngle}
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
          </div>

          <hr className="border-slate-700 my-2" />

          {/* Exposure Time - Moved to Camera */}
          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.exposureTime} ({state.exposureTime}µs)</label>
             <input 
               type="range" 
               min="100" 
               max="20000" 
               step="100"
               value={state.exposureTime}
               onChange={(e) => handleChange('exposureTime', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
          </div>

          {/* Gain - Moved to Camera */}
          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center gap-1"><Signal size={10} /> {t.sensorGain} ({state.gain}dB)</label>
             <input 
               type="range" 
               min="0" 
               max="24" 
               step="1"
               value={state.gain}
               onChange={(e) => handleChange('gain', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
             />
          </div>
        </section>

        {/* 5. Lighting */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Lightbulb size={16} /> {t.sectionLight}
          </div>
          
          <div className="space-y-1">
              <label className="text-xs text-slate-500">{t.lightType}</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.lightType}
                onChange={(e) => {
                    const newType = e.target.value as LightFixture;
                    // Reset Config/Position when type changes to avoid invalid states
                    let newPos = state.lightPosition;
                    if(newType === LightFixture.Panel) newPos = LightPosition.Back;
                    else if(newType === LightFixture.Coaxial) newPos = LightPosition.Camera;
                    else if(newType === LightFixture.Bar) newPos = LightPosition.Top;
                    else if(newType === LightFixture.Ring) newPos = LightPosition.Camera;
                    else if(newType === LightFixture.Dome || newType === LightFixture.Tunnel) newPos = LightPosition.Surrounding;
                    
                    onChange({ 
                        lightType: newType, 
                        lightPosition: newPos,
                        lightConfig: LightConfig.Single // Default
                    });
                }}
              >
                {Object.values(LightFixture).map((type) => (
                  <option key={type} value={type}>{t.fixtures[type] || type}</option>
                ))}
              </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-xs text-slate-500">{t.lightPos}</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                  value={state.lightPosition}
                  onChange={(e) => handleChange('lightPosition', e.target.value)}
                >
                  {getValidPositions().map((pos) => (
                    <option key={pos} value={pos}>{t.positions[pos] || pos}</option>
                  ))}
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-slate-500">{t.lightConfig}</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                  value={state.lightConfig}
                  onChange={(e) => handleChange('lightConfig', e.target.value)}
                  disabled={getValidConfigs().length <= 1}
                >
                  {getValidConfigs().map((c) => (
                     <option key={c} value={c}>{t.configs[c] || c}</option>
                  ))}
                </select>
            </div>
          </div>

          {/* Light Distance Slider */}
          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex justify-between">
                 <span>{t.lightDist}</span>
                 <span className="text-slate-300 font-mono">{state.lightDistance}mm</span>
             </label>
             <input 
               type="range" 
               min="50" 
               max="800" 
               step="10"
               value={state.lightDistance}
               onChange={(e) => handleChange('lightDistance', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.lightColor}</label>
             <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.lightColor}
                onChange={(e) => handleChange('lightColor', e.target.value)}
             >
                {Object.values(LightColor).map((c) => (
                  <option key={c} value={c}>{t.colors[c] || c}</option>
                ))}
             </select>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.lightIntensity} ({state.lightIntensity}%)</label>
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

      </div>
    </div>
  );
};

export default ControlPanel;