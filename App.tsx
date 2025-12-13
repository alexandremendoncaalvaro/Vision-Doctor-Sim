
import React, { useState, useMemo } from 'react';
import { 
  SimulationState, 
  SensorFormat, 
  LightColor, 
  LightFixture,
  LightPosition,
  LightConfig,
  ObjectType,
  OpticalMetrics,
  ValidationResult,
  Language,
  GlobalEnv,
  BackgroundPattern,
  LensFilter,
  ActiveSection
} from './types';
import { SENSOR_SPECS, OBJECT_DIMS, OBJECT_GOALS } from './constants';
import ControlPanel from './components/ControlPanel';
import SchematicView from './components/SchematicView';
import SimulatedImage from './components/SimulatedImage';
import { TEXTS } from './translations';
import { Play, Grid, Box, Video, CheckCircle, XCircle, AlertTriangle, Globe } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [language, setLanguage] = useState<Language>('pt-BR');
  const t = TEXTS[language];

  const [activeSection, setActiveSection] = useState<ActiveSection>('all');

  const [state, setState] = useState<SimulationState>({
    sensorFormat: SensorFormat.Type_2_3,
    focalLength: 16,
    aperture: 2.8,
    workingDistance: 300,
    cameraAngle: 0,
    lensFilter: LensFilter.None,
    objectType: ObjectType.PCB,
    inspectionGoal: OBJECT_GOALS[ObjectType.PCB][0], 
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    objectShiftX: 0, objectShiftY: 0, objectShiftZ: 0, objectRotX: 0, objectRotY: 0, objectRotZ: 0,
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightDistance: 200,
    lightColor: LightColor.White,
    lightIntensity: 60,
    lightMultiplier: 100, // Reverted to 100 as requested for stronger default visuals
    globalEnv: GlobalEnv.Studio,
    globalIntensity: 0,
    exposureTime: 5000,
    gain: 0,
    backgroundColor: '#050505',
    backgroundPattern: BackgroundPattern.None,
    objectSpeed: 0,
    vibrationLevel: 0,
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  });

  const [viewMode, setViewMode] = useState<'schematic' | 'simulation'>('schematic');
  const [simulationViewType, setSimulationViewType] = useState<'camera' | 'free'>('camera');

  // --- OPTICAL CALCULATIONS ---
  const metrics = useMemo<OpticalMetrics>(() => {
    const sensor = SENSOR_SPECS[state.sensorFormat];
    const fovWidth = (sensor.w * state.workingDistance) / state.focalLength;
    const fovHeight = (sensor.h * state.workingDistance) / state.focalLength;
    const magnification = sensor.w / fovWidth; 
    const pixelSize = 0.00345; 
    const coc = pixelSize * 2; 
    const dof = (2 * state.aperture * coc) / (magnification * magnification);
    const speedShiftMm = state.objectSpeed * (state.exposureTime / 1000000);
    const vibVelocity = state.vibrationLevel * 20; 
    const vibShiftMm = vibVelocity * (state.exposureTime / 1000000);
    const pixelDensity = 2448 / fovWidth; 
    const linearBlurPx = speedShiftMm * pixelDensity;
    const vibrationBlurPx = vibShiftMm * pixelDensity;
    const motionBlurPx = linearBlurPx + vibrationBlurPx; 
    const gainFactor = Math.pow(10, state.gain / 20); 
    const globalLightAdd = (state.globalIntensity / 100) * 0.5;
    
    // Light Factors - Normalized for Validation
    // We treat "100" as the standard base multiplier for calculation (Factor 1.0)
    // allowing the visual simulation to be bright while keeping validation math consistent.
    const normalizedMultiplier = (state.lightMultiplier || 1) / 100;
    const lightFactor = (state.lightIntensity / 60) * normalizedMultiplier;
    
    // Distance Factor (Inverse Square Law Approximation)
    let distFactor = 1.0;
    if (state.lightType === LightFixture.Bar || state.lightType === LightFixture.Ring || state.lightType === LightFixture.Spot) {
        distFactor = Math.pow(200 / Math.max(state.lightDistance, 1), 2);
    }

    let filterFactor = 1.0;
    if (state.lensFilter === LensFilter.Polarizer) filterFactor = 0.4;
    else if (state.lensFilter !== LensFilter.None) filterFactor = 0.8;
    
    const exposureValue = (state.exposureTime / 5000) * (Math.pow(2.8, 2) / Math.pow(state.aperture, 2)) * gainFactor * (1 + globalLightAdd) * lightFactor * distFactor * filterFactor;

    return {
      fovWidth, fovHeight, magnification, dof, pixelDensity,
      motionBlurPx, linearBlurPx, vibrationBlurPx, exposureValue
    };
  }, [state]);

  // --- VISION DOCTOR VALIDATION (THE TRUTH TABLE) ---
  const validation = useMemo<ValidationResult>(() => {
    const res: ValidationResult = {
      roi: 'good', resolution: 'good', focus: 'good', contrast: 'good',
      stability: 'good', exposure: 'good', glare: 'none', technique: 'good'
    };

    // 1. TECHNIQUE VALIDATION (Based on Guide Table)
    // Map goals to allowed geometries
    const goal = state.inspectionGoal;
    
    // Categories based on Guide Table
    const isSilhouette = goal.includes('Fill Level') || goal.includes('Measure Dimensions');
    const isDarkField = goal.includes('Scratches') || goal.includes('Etched Text') || goal.includes('Dot Peen');
    const isBrightField = goal.includes('Print Code') || goal.includes('Label Text');
    const isMetal = state.objectType === ObjectType.AluminumCan || state.objectType === ObjectType.PCB; // PCB Bridges

    // Check Geometry
    if (isSilhouette) {
        if (state.lightPosition !== LightPosition.Back) {
            res.technique = 'wrong_geometry';
            res.techniqueReason = "reqBacklight";
        }
    } else if (isDarkField) {
        // Dark Field typically requires Low Angle, BUT for curved metal (like Cans), Dome/Diffuse is also acceptable/superior.
        const isAcceptableAlternative = isMetal && (state.lightPosition === LightPosition.Surrounding);
        
        if (state.lightPosition !== LightPosition.LowAngle && !isAcceptableAlternative) {
            res.technique = 'wrong_geometry';
            res.techniqueReason = "reqDarkfield";
        }
    } else if (isBrightField) {
        if (state.lightPosition === LightPosition.Back) {
             res.technique = 'wrong_geometry';
             res.techniqueReason = "backlightWashout";
        }
    }

    // Check Metal/Glare
    const isCoaxialOrDome = state.lightType === LightFixture.Coaxial || state.lightType === LightFixture.Dome;
    // We allow Low Angle (Dark Field) on metal without warning.
    const isLowAngle = state.lightPosition === LightPosition.LowAngle;
    
    if (isMetal && !isCoaxialOrDome && !isLowAngle && state.lightPosition === LightPosition.Camera) {
         res.glare = 'warning'; // Direct ring light on metal causes hot spots
    }

    // 2. STANDARD CHECKS
    const objDim = OBJECT_DIMS[state.objectType];
    const objPctW = objDim.w / metrics.fovWidth;
    const objPctH = objDim.h / metrics.fovHeight;
    
    // Check if Object fits in FOV (Optical Framing)
    if (objPctW > 1 || objPctH > 1) {
       res.roi = 'poor';
    } 
    // Check if User ROI is cutting off the object (Digital Framing)
    // Tolerance: Allow ROI to be slightly smaller (90% of object) for specific inspections, 
    // but ideally should cover meaningful area.
    else if (state.roiW < objPctW * 0.9 || state.roiH < objPctH * 0.9) {
       res.roi = 'poor';
    }

    if (metrics.pixelDensity < 2) res.resolution = 'poor';
    
    if (metrics.exposureValue < 0.25) res.exposure = 'dark';
    else if (metrics.exposureValue > 8.0) res.exposure = 'bright';

    return res;
  }, [state, metrics]);

  // --- HANDLERS ---
  const handleStateChange = (updates: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const getStatusIcon = (status: string) => {
    if (status === 'good' || status === 'good' || status === 'none') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'acceptable') return <AlertTriangle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusText = (status: string) => {
      // @ts-ignore
      return t.status[status] || status;
  };
  
  const getReasonText = (reason?: string) => {
      if (!reason) return null;
      // @ts-ignore
      return t.reasons[reason] || reason;
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      <div className="w-80 shrink-0 h-full">
        <ControlPanel 
          state={state} 
          onChange={handleStateChange} 
          language={language} 
          activeSection={activeSection}
          onSectionSelect={setActiveSection}
        />
      </div>
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setViewMode('schematic')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'schematic' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Grid size={16} /> {t.schematic}
              </button>
              <button onClick={() => setViewMode('simulation')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'simulation' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                <Play size={16} /> {t.simulator}
              </button>
            </div>
            {viewMode === 'simulation' && (
              <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 ml-4 animate-in fade-in slide-in-from-left-4">
                 <button onClick={() => setSimulationViewType('camera')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${simulationViewType === 'camera' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                  <Video size={14} /> {t.cameraView}
                </button>
                <button onClick={() => setSimulationViewType('free')} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${simulationViewType === 'free' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
                  <Box size={14} /> {t.freeView}
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-800 rounded-md p-1">
                  <Globe size={16} className="text-slate-400 mx-2" />
                  <select className="bg-transparent text-sm text-slate-300 outline-none" value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
                      <option value="pt-BR">Português (BR)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                  </select>
              </div>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          {viewMode === 'schematic' ? (
            <SchematicView 
              state={state} 
              metrics={metrics} 
              language={language}
              onSectionSelect={setActiveSection}
              activeSection={activeSection}
            />
          ) : (
            <SimulatedImage 
              state={state} 
              metrics={metrics} 
              viewType={simulationViewType} 
              language={language} 
              onSectionSelect={setActiveSection}
            />
          )}
          {viewMode === 'simulation' && simulationViewType === 'camera' && (
             <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.scenarioCheck}</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   <div className="flex items-center justify-between gap-4"><span className="text-slate-300">{t.valFraming}</span><div className="flex items-center gap-1 capitalize text-xs">{getStatusIcon(validation.roi)} {getStatusText(validation.roi)}</div></div>
                   <div className="flex items-center justify-between gap-4"><span className="text-slate-300">{t.valExposure}</span><div className="flex items-center gap-1 capitalize text-xs">{getStatusIcon(validation.exposure)} {getStatusText(validation.exposure)}</div></div>
                   <div className="flex items-center justify-between gap-4 col-span-2 border-t border-slate-700 pt-1 mt-1">
                      <span className="text-slate-300">{t.valTechnique}</span>
                      <div className="flex flex-col items-end">
                         <div className="flex items-center gap-1 capitalize text-xs">{getStatusIcon(validation.technique)} {getStatusText(validation.technique)}</div>
                         {validation.techniqueReason && <span className="text-[10px] text-red-400">{getReasonText(validation.techniqueReason)}</span>}
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default App;
