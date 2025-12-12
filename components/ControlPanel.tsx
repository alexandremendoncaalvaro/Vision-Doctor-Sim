import React from 'react';
import { 
  SensorFormat, 
  LightColor, 
  LightType, 
  ObjectType, 
  SimulationState,
  ViewFocus,
  ObjectOrientation,
  Language
} from '../types';
import { STANDARD_FOCAL_LENGTHS, STANDARD_APERTURES, OBJECT_GOALS } from '../constants';
import { TEXTS, GOAL_TRANSLATIONS } from '../translations';
import { getPreset } from '../presets';
import { Camera, Lightbulb, Box, Activity, Target, RotateCw, Wind, Palette, Scan, Signal, Eye, Move3d, Wand2 } from 'lucide-react';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  language: Language;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange, onAnalyze, isAnalyzing, language }) => {
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
        
        {/* Object Selection */}
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

          <button
            onClick={handleAutoTune}
            className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 shadow-md transition-all border border-white/10"
            title={t.autoTuneDesc}
          >
            <Wand2 size={14} /> {t.autoTune}
          </button>
        </section>

        {/* View & Orientation */}
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

        {/* Camera & Lens */}
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
        </section>

        {/* Lighting & Exposure */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Lightbulb size={16} /> {t.sectionLight}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
              <label className="text-xs text-slate-500">{t.lightType}</label>
              <select 
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200"
                value={state.lightType}
                onChange={(e) => handleChange('lightType', e.target.value)}
              >
                {Object.values(LightType).map((type) => (
                  <option key={type} value={type}>{t.lights[type] || type}</option>
                ))}
              </select>
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

        {/* Environment & Motion */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Wind size={16} /> {t.sectionEnv}
          </div>

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

        {/* Action */}
        <div className="pt-4">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
          >
             {isAnalyzing ? (
               <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.analyzing}</span>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <span>{t.analyzeBtn}</span>
               </div>
             )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;