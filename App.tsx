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
  BackgroundPattern
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

  const [state, setState] = useState<SimulationState>({
    sensorFormat: SensorFormat.Type_2_3,
    focalLength: 16,
    aperture: 2.8,
    workingDistance: 300,
    cameraAngle: 0,
    objectType: ObjectType.PCB,
    // Initialize with first available goal for PCB
    inspectionGoal: OBJECT_GOALS[ObjectType.PCB][0], 
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    
    // 6-DOF Defaults
    objectShiftX: 0,
    objectShiftY: 0,
    objectShiftZ: 0,
    objectRotX: 0,
    objectRotY: 0,
    objectRotZ: 0,
    
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightDistance: 200,
    lightColor: LightColor.White,
    lightIntensity: 60,
    lightMultiplier: 100,
    
    // New Global Environment States
    globalEnv: GlobalEnv.Studio,
    globalIntensity: 0,

    exposureTime: 5000,
    gain: 0,
    // New Fields
    backgroundColor: '#050505',
    backgroundPattern: BackgroundPattern.None,
    objectSpeed: 0,
    vibrationLevel: 0,
    roiX: 0.5,
    roiY: 0.5,
    roiW: 0.6,
    roiH: 0.6
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

    // Calc Motion Blur (Total = Line Speed + Vibration Speed)
    // 1. Line Speed shift (Linear)
    const speedShiftMm = state.objectSpeed * (state.exposureTime / 1000000);
    
    // 2. Vibration shift (Random/Gaussian)
    // Assume Level 10 vibration ~ 200mm/s effective random velocity
    const vibVelocity = state.vibrationLevel * 20; 
    const vibShiftMm = vibVelocity * (state.exposureTime / 1000000);
    
    const pixelDensity = 2448 / fovWidth; // Assuming 5MP sensor width for density calc
    
    const linearBlurPx = speedShiftMm * pixelDensity;
    const vibrationBlurPx = vibShiftMm * pixelDensity;
    const motionBlurPx = linearBlurPx + vibrationBlurPx; // Combined magnitude for validation checks

    // Calc Exposure Value (Simplistic brightness ratio)
    // Base: 5000us, f/2.8, 0dB gain = 1.0
    const gainFactor = Math.pow(10, state.gain / 20); // Linearize dB
    
    // Account for global light in exposure estimate roughly (simplified)
    const globalLightAdd = (state.globalIntensity / 100) * 0.5;
    
    // Intensity factor now includes multiplier
    const lightFactor = (state.lightIntensity / 60) * (state.lightMultiplier || 1);

    const exposureValue = (state.exposureTime / 5000) * (Math.pow(2.8, 2) / Math.pow(state.aperture, 2)) * gainFactor * (1 + globalLightAdd) * lightFactor;

    return {
      fovWidth,
      fovHeight,
      magnification,
      dof,
      pixelDensity,
      motionBlurPx,
      linearBlurPx,
      vibrationBlurPx,
      exposureValue
    };
  }, [state]);

  // --- VALIDATION LOGIC ---
  const validation = useMemo<ValidationResult>(() => {
    const res: ValidationResult = {
      roi: 'good',
      contrast: 'good',
      stability: 'good',
      exposure: 'good',
      technique: 'good'
    };

    // 1. ROI Check (Is object fully inside ROI?)
    const objDim = OBJECT_DIMS[state.objectType];
    const fovW = metrics.fovWidth;
    const fovH = metrics.fovHeight;
    // Object size in FOV Percentage
    const objPctW = objDim.w / fovW;
    const objPctH = objDim.h / fovH;
    
    // Check if object fits in FOV first
    if (objPctW > 1 || objPctH > 1) {
       res.roi = 'poor'; // Object larger than FOV
    } else {
       // Check if ROI rect covers the object (assuming centered for now)
       if (state.roiW < objPctW || state.roiH < objPctH) {
          res.roi = 'poor'; // ROI cuts object
       } else if (state.roiW > objPctW * 2) {
          res.roi = 'acceptable'; // ROI too loose
       }
    }

    // 2. Stability Check (Based on calculated blur)
    if (metrics.motionBlurPx > 6) {
      res.stability = 'poor';
    } else if (metrics.motionBlurPx > 1) {
      res.stability = 'acceptable';
    }

    // 3. Exposure Check
    // Adjust thresholds for exposure check to be more lenient with high power
    if (metrics.exposureValue < 0.25) res.exposure = 'dark';
    else if (metrics.exposureValue > 8.0) res.exposure = 'bright';
    else if (metrics.exposureValue < 0.5 || metrics.exposureValue > 4.0) res.exposure = 'good'; 
    
    // 4. Contrast Check (Simulated)
    const bg = state.backgroundColor;
    const pattern = state.backgroundPattern;
    const obj = state.objectType;
    const isDarkBg = (bg === '#050505' || bg === '#064e3b' || bg === '#1e3a8a') && pattern === BackgroundPattern.None;
    
    // Logic: If inspecting outline/shape (Presence, Dimensions), contrast with BG is critical.
    // If inspecting surface (OCR, Codes, Scratches), BG contrast matters less.
    const isSurfaceGoal = 
       state.inspectionGoal.includes('Text') || 
       state.inspectionGoal.includes('Code') || 
       state.inspectionGoal.includes('Bridges') || 
       state.inspectionGoal.includes('Flatness') || 
       state.inspectionGoal.includes('Seal');

    if (!isSurfaceGoal) {
        if (obj === ObjectType.PCB && isDarkBg) res.contrast = 'poor';
        if (obj === ObjectType.MatteBlock && bg === '#475569' && pattern === BackgroundPattern.None) res.contrast = 'poor'; // Gray on Gray
        if (obj === ObjectType.AluminumCan && !isDarkBg) res.contrast = 'poor'; // Silver on White/Gray
    }

    // High clutter patterns always impact contrast for transparent objects or edge checks
    if (pattern !== BackgroundPattern.None && !isSurfaceGoal) {
        if (obj === ObjectType.GlassBottle) res.contrast = 'poor';
    }

    // 5. Technique & Geometry Check
    // A. Blocking View Check
    // If Position is Camera Axis, only Ring and Coaxial are physically valid without blocking view.
    if (state.lightPosition === LightPosition.Camera) {
        if (state.lightType !== LightFixture.Ring && state.lightType !== LightFixture.Coaxial) {
            res.technique = 'wrong_geometry'; // "Light Blocking Camera"
        }
    }

    // B. Goal Specific Logic (The "Vision Doctor" Truth Table)
    // Only verify if we haven't already failed the geometry check
    if (res.technique !== 'wrong_geometry') {
        const goal = state.inspectionGoal;
        const lightPos = state.lightPosition;

        // Rules for Backlight requirements
        if (goal.includes('Fill Level') || goal.includes('Dimensions (Backlight)')) {
            if (lightPos !== LightPosition.Back) {
                res.technique = 'wrong_geometry'; // Should be 'wrong_technique' but using existing status logic
                // Override technically to 'poor' for simpler UI handling or map specific string
            }
        }
        // Rules against Backlight (Surface inspections)
        else if (goal.includes('Etched Text') || goal.includes('Solder Bridges') || goal.includes('Surface Flatness') || goal.includes('Label Text') || goal.includes('Dot Peen')) {
             if (lightPos === LightPosition.Back) {
                 res.technique = 'poor';
             }
             // Prefer Low Angle for Etched/Dot Peen
             if ((goal.includes('Etched Text') || goal.includes('Dot Peen')) && lightPos !== LightPosition.LowAngle && state.lightType !== LightFixture.Coaxial) {
                  res.technique = 'acceptable'; // Not ideal
             }
        }
    }

    return res;
  }, [state, metrics]);


  // --- HANDLERS ---
  const handleStateChange = (updates: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const getStatusIcon = (status: string) => {
    if (status === 'good') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'acceptable') return <AlertTriangle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  const getTranslatedValidation = (val: string) => {
      switch(val) {
          case 'good': return t.valGood;
          case 'acceptable': return t.valAcceptable;
          case 'poor': return t.valPoor;
          case 'dark': return t.valDark;
          case 'bright': return t.valBright;
          case 'wrong_geometry': return t.valWrongGeo;
          case 'wrong_technique': return t.valWrongTech;
          default: return val;
      }
  }

  // --- RENDER ---
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Left Sidebar: Controls */}
      <div className="w-80 shrink-0 h-full">
        <ControlPanel 
          state={state} 
          onChange={handleStateChange} 
          language={language}
        />
      </div>

      {/* Main Content: Viewport */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Tabs & Language */}
        <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('schematic')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'schematic' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Grid size={16} /> {t.schematic}
              </button>
              <button 
                onClick={() => setViewMode('simulation')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'simulation' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Play size={16} /> {t.simulator}
              </button>
            </div>

            {/* Simulation Sub-Controls */}
            {viewMode === 'simulation' && (
              <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 ml-4 animate-in fade-in slide-in-from-left-4">
                 <button 
                  onClick={() => setSimulationViewType('camera')}
                  title="Camera POV"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${simulationViewType === 'camera' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Video size={14} /> {t.cameraView}
                </button>
                <button 
                  onClick={() => setSimulationViewType('free')}
                  title="Free 3D View"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${simulationViewType === 'free' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Box size={14} /> {t.freeView}
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center bg-slate-800 rounded-md p-1">
                  <Globe size={16} className="text-slate-400 mx-2" />
                  <select 
                    className="bg-transparent text-sm text-slate-300 outline-none"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                  >
                      <option value="pt-BR">Português (BR)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                  </select>
              </div>
          </div>
        </div>

        {/* View Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          {viewMode === 'schematic' ? (
            <SchematicView state={state} metrics={metrics} language={language} />
          ) : (
            <SimulatedImage 
              state={state} 
              metrics={metrics} 
              viewType={simulationViewType}
              language={language}
            />
          )}

          {/* Automatic Validation Panel */}
          {viewMode === 'simulation' && simulationViewType === 'camera' && (
             <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{t.scenarioCheck}</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">{t.valFraming}</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.roi)} {getTranslatedValidation(validation.roi)}
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">{t.valStability}</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.stability)} {getTranslatedValidation(validation.stability)}
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">{t.valContrast}</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.contrast)} {getTranslatedValidation(validation.contrast)}
                      </div>
                   </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">{t.valExposure}</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {validation.exposure === 'good' ? getStatusIcon('good') : getStatusIcon('poor')} {getTranslatedValidation(validation.exposure)}
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-4 col-span-2 border-t border-slate-700 pt-1 mt-1">
                      <span className="text-slate-300">{t.valTechnique}</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {validation.technique === 'good' ? getStatusIcon('good') : getStatusIcon('poor')} {getTranslatedValidation(validation.technique)}
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