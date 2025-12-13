
import React, { useEffect, useMemo } from 'react';
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
  GlobalEnv,
  BackgroundPattern,
  LensFilter,
  ActiveSection
} from '../types';
import { STANDARD_FOCAL_LENGTHS, STANDARD_APERTURES, OBJECT_GOALS } from '../constants';
import { TEXTS, GOAL_TRANSLATIONS } from '../translations';
import { getPreset } from '../presets';
import { Camera, Lightbulb, Box, Activity, Target, RotateCw, Wind, Palette, Scan, Signal, Eye, Move3d, Wand2, Sun, Zap, Move, Factory, Grip, Disc, Info, Sliders, Maximize, Gauge, ChevronLeft, Layers } from 'lucide-react';

interface ControlPanelProps {
  state: SimulationState;
  onChange: (newState: Partial<SimulationState>) => void;
  language: Language;
  activeSection: ActiveSection;
  onSectionSelect: (section: ActiveSection) => void;
}

const OBJECT_ORIENTATIONS: ObjectOrientation[] = ['Front', 'Side', 'Back', 'Top', 'Bottom', 'Custom'];

// DEFINITIVE GUIDE MAPPING
const GEOMETRY_OPTIONS = [
  { id: 'silhouette', label: { 'pt-BR': 'Silhueta (Backlight)', 'en': 'Silhouette (Backlight)', 'es': 'Silueta (Contraluz)' }, positions: [LightPosition.Back] },
  { id: 'darkfield', label: { 'pt-BR': 'Campo Escuro (Rasante)', 'en': 'Dark Field (Grazing)', 'es': 'Campo Oscuro (Rasante)' }, positions: [LightPosition.LowAngle] },
  { id: 'brightfield', label: { 'pt-BR': 'Campo Claro (Coaxial/Frontal)', 'en': 'Bright Field (Coaxial/Frontal)', 'es': 'Campo Claro (Coaxial)' }, positions: [LightPosition.Camera, LightPosition.Top] },
  { id: 'diffuse', label: { 'pt-BR': 'Difusa (Domo/Envolvente)', 'en': 'Diffuse (Dome/Surrounding)', 'es': 'Difusa (Domo)' }, positions: [LightPosition.Surrounding] },
  { id: 'directional', label: { 'pt-BR': 'Direcional (Relevo/Sombra)', 'en': 'Directional (Relief/Shadow)', 'es': 'Direccional (Relieve)' }, positions: [LightPosition.Side, LightPosition.Top] },
];

const FIXTURE_BY_GEOMETRY: Record<string, LightFixture[]> = {
  'silhouette': [LightFixture.Panel],
  'darkfield': [LightFixture.Bar, LightFixture.Ring],
  'brightfield': [LightFixture.Coaxial, LightFixture.Ring, LightFixture.Spot],
  'diffuse': [LightFixture.Dome, LightFixture.Tunnel],
  'directional': [LightFixture.Bar, LightFixture.Spot]
};

const QUALITY_COLOR: Record<string, string> = {
  [LightFixture.Panel]: 'text-blue-400',
  [LightFixture.Bar]: 'text-orange-400',
  [LightFixture.Ring]: 'text-orange-400',
  [LightFixture.Spot]: 'text-orange-400',
  [LightFixture.Coaxial]: 'text-blue-400',
  [LightFixture.Dome]: 'text-emerald-400',
  [LightFixture.Tunnel]: 'text-emerald-400',
};

const ControlPanel: React.FC<ControlPanelProps> = ({ state, onChange, language, activeSection, onSectionSelect }) => {
  const t = TEXTS[language];
  
  const getTranslatedGoal = (goal: string) => {
    return GOAL_TRANSLATIONS[goal]?.[language] || goal;
  };

  const handleChange = (key: keyof SimulationState, value: any) => {
    onChange({ [key]: value });
  };

  const handleObjectChange = (type: ObjectType) => {
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

  const currentGeometryId = useMemo(() => {
    const pos = state.lightPosition;
    const type = state.lightType;
    if (pos === LightPosition.Back) return 'silhouette';
    if (pos === LightPosition.LowAngle) return 'darkfield';
    if (pos === LightPosition.Surrounding) return 'diffuse';
    if (pos === LightPosition.Camera && type === LightFixture.Coaxial) return 'brightfield';
    if (pos === LightPosition.Camera && type === LightFixture.Ring) return 'brightfield';
    if (pos === LightPosition.Side) return 'directional';
    if (pos === LightPosition.Top) return 'directional';
    return 'brightfield'; 
  }, [state.lightPosition, state.lightType]);

  const handleGeometryChange = (geoId: string) => {
    const validFixtures = FIXTURE_BY_GEOMETRY[geoId];
    const defaultFixture = validFixtures[0];
    let newPos = LightPosition.Camera;
    if (geoId === 'silhouette') newPos = LightPosition.Back;
    else if (geoId === 'darkfield') newPos = LightPosition.LowAngle;
    else if (geoId === 'diffuse') newPos = LightPosition.Surrounding;
    else if (geoId === 'directional') newPos = LightPosition.Side;
    else if (geoId === 'brightfield') newPos = LightPosition.Camera;

    onChange({
      lightType: defaultFixture,
      lightPosition: newPos,
      lightConfig: LightConfig.Single
    });
  };

  const getValidConfigs = () => {
      switch(state.lightType) {
          case LightFixture.Panel: return [LightConfig.Small, LightConfig.Medium, LightConfig.Large];
          case LightFixture.Bar: return [LightConfig.Single, LightConfig.Dual, LightConfig.Quad];
          case LightFixture.Spot: return [LightConfig.Narrow, LightConfig.Wide];
          default: return [LightConfig.Single];
      }
  };

  // Helper to determine visibility based on active section
  const isVisible = (section: ActiveSection) => {
    if (activeSection === 'all') return true;
    return activeSection === section;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 overflow-y-auto custom-scrollbar transition-colors duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-900 sticky top-0 z-10 shadow-md">
        {activeSection !== 'all' ? (
           <button 
             onClick={() => onSectionSelect('all')}
             className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium mb-1 group"
           >
             <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             Back to Overview
           </button>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="text-blue-500" />
              {t.appTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">{t.appSubtitle}</p>
          </>
        )}
        
        {/* Active Section Indicator */}
        {activeSection !== 'all' && (
          <div className="flex items-center gap-2 mt-2 text-slate-200 font-bold text-lg capitalize animate-in slide-in-from-left-2">
              {activeSection === 'object' && <Box className="text-blue-500" />}
              {activeSection === 'light' && <Lightbulb className="text-yellow-500" />}
              {activeSection === 'camera' && <Camera className="text-emerald-500" />}
              {activeSection === 'environment' && <Wind className="text-slate-400" />}
              {activeSection} Settings
          </div>
        )}
      </div>

      <div className="p-4 space-y-8 pb-20">
        
        {/* 1. OBJECT & GOAL */}
        {isVisible('object') && (
        <section className={`space-y-3 ${activeSection === 'all' ? '' : 'animate-in fade-in zoom-in-95 duration-200'}`}>
          <div className="flex items-center gap-2 text-slate-300 font-medium border-l-2 border-blue-500 pl-2">
            <Box size={16} /> {t.sectionObject}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{t.targetObject}</label>
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
             <div className="flex items-center justify-between">
               <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold flex items-center gap-1">
                  {t.inspectionGoal}
               </label>
               <button onClick={handleAutoTune} className="text-[10px] flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 px-2 py-0.5 rounded" title={t.autoTuneDesc}>
                  <Wand2 size={10} /> {t.autoTune}
               </button>
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

          {/* OBJECT ORIENTATION & 6-DOF */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
             <div className="space-y-1">
                <label className="text-xs text-slate-500">{t.objOrientation}</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200"
                  value={state.objectOrientation}
                  onChange={(e) => handleChange('objectOrientation', e.target.value)}
                >
                  {OBJECT_ORIENTATIONS.map((o) => (
                    <option key={o} value={o}>{t.orientation[o] || o}</option>
                  ))}
                </select>
             </div>

             {state.objectOrientation === 'Custom' && (
               <div className="bg-slate-800/50 p-2 rounded border border-slate-700 space-y-2 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase"><Move3d size={10}/> 6-DOF Control</div>
                  
                  {/* Position */}
                  <div className="grid grid-cols-3 gap-1">
                     {['X', 'Y', 'Z'].map(axis => (
                       <div key={`pos-${axis}`} className="space-y-1">
                          <label className="text-[10px] text-slate-500">Pos {axis}</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-700 text-[10px] px-1 py-0.5 rounded" 
                            value={state[`objectShift${axis}` as keyof SimulationState]}
                            onChange={(e) => handleChange(`objectShift${axis}` as keyof SimulationState, Number(e.target.value))}
                          />
                       </div>
                     ))}
                  </div>
                   {/* Rotation */}
                  <div className="grid grid-cols-3 gap-1">
                     {['X', 'Y', 'Z'].map(axis => (
                       <div key={`rot-${axis}`} className="space-y-1">
                          <label className="text-[10px] text-slate-500">Rot {axis}°</label>
                          <input type="number" className="w-full bg-slate-900 border border-slate-700 text-[10px] px-1 py-0.5 rounded" 
                             value={state[`objectRot${axis}` as keyof SimulationState]}
                             onChange={(e) => handleChange(`objectRot${axis}` as keyof SimulationState, Number(e.target.value))}
                          />
                       </div>
                     ))}
                  </div>
               </div>
             )}
          </div>
        </section>
        )}

        {/* 2. LIGHTING STRATEGY */}
        {isVisible('light') && (
        <section className={`space-y-4 ${activeSection === 'all' ? '' : 'animate-in fade-in zoom-in-95 duration-200'}`}>
           <div className="flex items-center gap-2 text-slate-300 font-medium border-l-2 border-yellow-500 pl-2">
            <Lightbulb size={16} /> {t.sectionLight}
          </div>
          
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4">
              {/* A. GEOMETRY SELECTION */}
              <div className="space-y-1">
                  <label className="text-xs text-yellow-500 font-bold uppercase tracking-wide flex items-center gap-1">
                      1. {t.valTechnique || 'Geometry / Strategy'}
                  </label>
                  <select 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-yellow-500 outline-none shadow-sm"
                    value={currentGeometryId}
                    onChange={(e) => handleGeometryChange(e.target.value)}
                  >
                    {GEOMETRY_OPTIONS.map((geo) => (
                      <option key={geo.id} value={geo.id}>{geo.label[language] || geo.label['en']}</option>
                    ))}
                  </select>
              </div>

              {/* B. FIXTURE SELECTION */}
              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wide font-semibold">2. {t.lightType}</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200"
                        value={state.lightType}
                        onChange={(e) => onChange({ lightType: e.target.value as LightFixture })}
                      >
                        {FIXTURE_BY_GEOMETRY[currentGeometryId].map((type) => (
                          <option key={type} value={type}>{t.fixtures[type] || type}</option>
                        ))}
                      </select>
                  </div>

                   <div className="space-y-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wide font-semibold">3. {t.lightConfig}</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200"
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

              {/* C. QUALITY INDICATOR */}
              <div className="flex items-center gap-2 text-[10px] bg-slate-900 p-2 rounded border border-slate-800">
                  <Info size={12} className="text-slate-500"/>
                  <span className="text-slate-400">{t.lightQualityLabel}</span>
                  <span className={`font-mono font-bold ${QUALITY_COLOR[state.lightType]}`}>
                      {t.qualityDesc[state.lightType]}
                  </span>
              </div>
          </div>

          {/* LIGHT PARAMETERS */}
          <div className="space-y-3 px-1">
             <div className="space-y-1">
                 <label className="text-xs text-slate-500">{t.lightDist}</label>
                 <div className="flex items-center gap-2">
                    <input 
                       type="range" min="50" max="800" step="10"
                       value={state.lightDistance}
                       onChange={(e) => handleChange('lightDistance', Number(e.target.value))}
                       className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                     />
                    <span className="text-xs font-mono w-10 text-right">{state.lightDistance}</span>
                 </div>
             </div>
             
             <div className="space-y-1">
                 <label className="text-xs text-slate-500">{t.lightColor}</label>
                 <div className="flex gap-1">
                     {Object.values(LightColor).map(c => {
                         let bg = 'bg-gray-400';
                         if (c.includes('Red')) bg = 'bg-red-500';
                         if (c.includes('Blue')) bg = 'bg-blue-500';
                         if (c.includes('White')) bg = 'bg-white';
                         if (c.includes('UV')) bg = 'bg-purple-500';
                         if (c.includes('Infrared')) bg = 'bg-slate-700';
                         
                         return (
                             <button 
                                key={c}
                                onClick={() => handleChange('lightColor', c)}
                                className={`w-5 h-5 rounded-full border border-slate-600 ${bg} ${state.lightColor === c ? 'ring-2 ring-yellow-400 scale-110' : 'opacity-50 hover:opacity-100'}`}
                                title={t.colors[c] || c}
                             />
                         )
                     })}
                 </div>
             </div>

             <div className="space-y-1">
                 <div className="flex justify-between items-center">
                     <label className="text-xs text-slate-500 flex items-center gap-1">
                         <Zap size={10} className="text-yellow-400" /> 
                         {t.lightIntensity}
                     </label>
                     <div className="flex gap-1 text-[10px]">
                        {[1, 10, 100].map(mult => (
                            <button
                                key={mult}
                                onClick={() => handleChange('lightMultiplier', mult)}
                                className={`px-1.5 rounded ${
                                    (state.lightMultiplier || 1) === mult 
                                    ? 'bg-yellow-600 text-white' 
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                            >
                                x{mult}
                            </button>
                        ))}
                     </div>
                 </div>
                 <input 
                   type="range" min="0" max="100" 
                   value={state.lightIntensity}
                   onChange={(e) => handleChange('lightIntensity', Number(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                 />
             </div>
          </div>
        </section>
        )}

        {/* 3. CAMERA & LENS */}
        {isVisible('camera') && (
        <section className={`space-y-4 ${activeSection === 'all' ? '' : 'animate-in fade-in zoom-in-95 duration-200'}`}>
           <div className="flex items-center gap-2 text-slate-300 font-medium border-l-2 border-emerald-500 pl-2">
            <Camera size={16} /> {t.sectionCamera}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-xs text-slate-500">{t.focalLength}</label>
                <select
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200"
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
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-200"
                  value={state.aperture}
                  onChange={(e) => handleChange('aperture', Number(e.target.value))}
                >
                  {STANDARD_APERTURES.map((a) => (
                    <option key={a} value={a}>f/{a}</option>
                  ))}
                </select>
            </div>
          </div>

           <div className="space-y-1">
             <label className="text-xs text-slate-500">{t.workingDistance} ({state.workingDistance}mm)</label>
             <input 
               type="range" min="50" max="1000" step="10"
               value={state.workingDistance}
               onChange={(e) => handleChange('workingDistance', Number(e.target.value))}
               className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
             />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center justify-between">
                <span>{t.tiltAngle}</span> 
                <span className="font-mono text-emerald-500">{state.cameraAngle}°</span>
             </label>
             <div className="flex items-center gap-2">
                <RotateCw size={12} className="text-slate-500"/>
                <input 
                  type="range" min="-85" max="85" step="5"
                  value={state.cameraAngle}
                  onChange={(e) => handleChange('cameraAngle', Number(e.target.value))}
                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
             </div>
          </div>
          
          <div className="space-y-1 pt-2 border-t border-slate-800">
             <label className="text-xs text-slate-500 flex items-center gap-1"><Maximize size={10}/> {t.valFraming} (ROI)</label>
             <div className="flex gap-2">
                 <input 
                   type="range" min="0.1" max="1.0" step="0.05"
                   value={state.roiW}
                   onChange={(e) => handleChange('roiW', Number(e.target.value))}
                   className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                   title="ROI Width"
                 />
                 <input 
                   type="range" min="0.1" max="1.0" step="0.05"
                   value={state.roiH}
                   onChange={(e) => handleChange('roiH', Number(e.target.value))}
                   className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                   title="ROI Height"
                 />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs text-slate-500 flex items-center gap-1"><Disc size={10} /> {t.lensFilter}</label>
             <select 
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs text-slate-200"
              value={state.lensFilter}
              onChange={(e) => handleChange('lensFilter', e.target.value)}
            >
              {Object.values(LensFilter).map((f) => (
                <option key={f} value={f}>{t.filters[f] || f}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-xs text-slate-500">Exp ({(state.exposureTime/1000).toFixed(1)}ms)</label>
                 <input 
                   type="range" min="100" max="20000" step="100"
                   value={state.exposureTime}
                   onChange={(e) => handleChange('exposureTime', Number(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-xs text-slate-500">Gain ({state.gain}dB)</label>
                 <input 
                   type="range" min="0" max="24" step="1"
                   value={state.gain}
                   onChange={(e) => handleChange('gain', Number(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                 />
              </div>
          </div>
        </section>
        )}
        
        {/* 4. ENVIRONMENT & MOTION */}
        {isVisible('environment') && (
        <section className={`space-y-3 ${activeSection === 'all' ? 'opacity-90 hover:opacity-100' : 'animate-in fade-in zoom-in-95 duration-200'}`}>
           <div className="flex items-center gap-2 text-slate-400 font-medium text-xs uppercase tracking-widest border-t border-slate-800 pt-2">
             <Wind size={12} /> {t.sectionEnv}
           </div>
           
           <div className="space-y-1">
             <label className="text-[10px] text-slate-500">{t.globalEnv}</label>
             <select 
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400"
              value={state.globalEnv}
              onChange={(e) => handleChange('globalEnv', e.target.value)}
            >
              {Object.values(GlobalEnv).map((env) => (
                <option key={env} value={env}>{t.envs?.[env] || env}</option>
              ))}
            </select>
           </div>
           
           {state.globalEnv !== GlobalEnv.Studio && (
              <input 
                type="range" min="0" max="100" 
                value={state.globalIntensity}
                onChange={(e) => handleChange('globalIntensity', Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
              />
           )}

           <div className="pt-2 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 flex items-center gap-1"><Move size={10}/> {t.lineSpeed}</label>
                 <input 
                   type="range" min="0" max="5000" step="100"
                   value={state.objectSpeed}
                   onChange={(e) => handleChange('objectSpeed', Number(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                   title={`${state.objectSpeed} mm/s`}
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] text-slate-500 flex items-center gap-1"><Activity size={10}/> {t.vibration}</label>
                 <input 
                   type="range" min="0" max="10" step="1"
                   value={state.vibrationLevel}
                   onChange={(e) => handleChange('vibrationLevel', Number(e.target.value))}
                   className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                 />
              </div>
           </div>
        </section>
        )}

      </div>
    </div>
  );
};

export default ControlPanel;
