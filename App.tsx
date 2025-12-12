import React, { useState, useMemo } from 'react';
import { 
  SimulationState, 
  SensorFormat, 
  LightColor, 
  LightType, 
  ObjectType,
  OpticalMetrics,
  DoctorAdvice,
  ValidationResult
} from './types';
import { SENSOR_SPECS, OBJECT_DIMS, OBJECT_GOALS } from './constants';
import { analyzeSetup } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import SchematicView from './components/SchematicView';
import SimulatedImage from './components/SimulatedImage';
import { Play, Grid, MessageSquare, AlertCircle, Box, Video, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
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
    
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    lightIntensity: 60,
    exposureTime: 5000,
    gain: 0,
    // New Fields
    backgroundColor: '#050505',
    objectSpeed: 0,
    vibrationLevel: 0,
    roiX: 0.5,
    roiY: 0.5,
    roiW: 0.6,
    roiH: 0.6
  });

  const [viewMode, setViewMode] = useState<'schematic' | 'simulation'>('schematic');
  const [simulationViewType, setSimulationViewType] = useState<'camera' | 'free'>('camera');
  const [advice, setAdvice] = useState<DoctorAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvicePanel, setShowAdvicePanel] = useState(false);

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
    // 1. Line Speed shift
    const speedShiftMm = state.objectSpeed * (state.exposureTime / 1000000);
    
    // 2. Vibration shift
    // Assume Level 10 vibration ~ 200mm/s effective random velocity
    const vibVelocity = state.vibrationLevel * 20; 
    const vibShiftMm = vibVelocity * (state.exposureTime / 1000000);
    
    const totalShiftMm = speedShiftMm + vibShiftMm;
    const pixelDensity = 2448 / fovWidth; // Assuming 5MP sensor width for density calc
    const motionBlurPx = totalShiftMm * pixelDensity;

    // Calc Exposure Value (Simplistic brightness ratio)
    // Base: 5000us, f/2.8, 0dB gain = 1.0
    const gainFactor = Math.pow(10, state.gain / 20); // Linearize dB
    const exposureValue = (state.exposureTime / 5000) * (Math.pow(2.8, 2) / Math.pow(state.aperture, 2)) * gainFactor;

    return {
      fovWidth,
      fovHeight,
      magnification,
      dof,
      pixelDensity,
      motionBlurPx,
      exposureValue
    };
  }, [state]);

  // --- VALIDATION LOGIC ---
  const validation = useMemo<ValidationResult>(() => {
    const res: ValidationResult = {
      roi: 'good',
      contrast: 'good',
      stability: 'good',
      exposure: 'good'
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
    if (metrics.exposureValue < 0.25) res.exposure = 'dark';
    else if (metrics.exposureValue > 4.0) res.exposure = 'bright';
    else if (metrics.exposureValue < 0.5 || metrics.exposureValue > 2.0) res.exposure = 'good'; // Actually lets say acceptable range 0.5 - 2.0
    
    // 4. Contrast Check (Simulated)
    const bg = state.backgroundColor;
    const obj = state.objectType;
    const isDarkBg = bg === '#050505' || bg === '#064e3b' || bg === '#1e3a8a';
    
    if (obj === ObjectType.PCB && isDarkBg) res.contrast = 'poor';
    if (obj === ObjectType.MatteBlock && bg === '#475569') res.contrast = 'poor'; // Gray on Gray
    if (obj === ObjectType.AluminumCan && !isDarkBg) res.contrast = 'poor'; // Silver on White/Gray

    return res;
  }, [state, metrics]);


  // --- HANDLERS ---
  const handleStateChange = (updates: Partial<SimulationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowAdvicePanel(true);
    const result = await analyzeSetup(state, metrics);
    setAdvice(result);
    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'good') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'acceptable') return <AlertTriangle size={16} className="text-yellow-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Left Sidebar: Controls */}
      <div className="w-80 shrink-0 h-full">
        <ControlPanel 
          state={state} 
          onChange={handleStateChange} 
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Main Content: Viewport */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Tabs */}
        <div className="h-12 bg-slate-900 border-b border-slate-700 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('schematic')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'schematic' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Grid size={16} /> Schematic
              </button>
              <button 
                onClick={() => setViewMode('simulation')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === 'simulation' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Play size={16} /> Simulator
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
                  <Video size={14} /> Camera View
                </button>
                <button 
                  onClick={() => setSimulationViewType('free')}
                  title="Free 3D View"
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${simulationViewType === 'free' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Box size={14} /> Free View
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAdvicePanel(!showAdvicePanel)}
            className={`p-2 rounded-full hover:bg-slate-800 transition-colors ${advice ? 'text-indigo-400' : 'text-slate-500'}`}
            title="Toggle Doctor Advice"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* View Canvas */}
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
          {viewMode === 'schematic' ? (
            <SchematicView state={state} metrics={metrics} />
          ) : (
            <SimulatedImage 
              state={state} 
              metrics={metrics} 
              viewType={simulationViewType}
            />
          )}

          {/* Automatic Validation Panel */}
          {viewMode === 'simulation' && simulationViewType === 'camera' && (
             <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 shadow-xl pointer-events-none">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Scenario Check</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Framing (ROI)</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.roi)} {validation.roi}
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Stability</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.stability)} {validation.stability}
                      </div>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Contrast</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {getStatusIcon(validation.contrast)} {validation.contrast}
                      </div>
                   </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Exposure</span>
                      <div className="flex items-center gap-1 capitalize text-xs">
                        {validation.exposure === 'good' ? getStatusIcon('good') : getStatusIcon('poor')} {validation.exposure}
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Floating Doctor Panel */}
        {showAdvicePanel && (
          <div className="absolute right-4 top-16 w-80 bg-slate-900/95 backdrop-blur-md border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-100px)] animate-in fade-in slide-in-from-right-10 duration-200 z-50">
            <div className="p-4 bg-indigo-900/30 border-b border-indigo-500/20 flex justify-between items-center">
              <h3 className="font-semibold text-indigo-100 flex items-center gap-2">
                <AlertCircle size={16} /> 
                Dr. Vision's Report
              </h3>
              <button 
                onClick={() => setShowAdvicePanel(false)}
                className="text-indigo-300 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              {!advice ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>Click "Ask Doctor AI" to generate a report.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path 
                          className={`${advice.score > 80 ? 'text-emerald-500' : advice.score > 50 ? 'text-yellow-500' : 'text-red-500'}`}
                          strokeDasharray={`${advice.score}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                        />
                      </svg>
                      <span className="absolute text-sm font-bold">{advice.score}</span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Suitability</div>
                      <div className="font-medium text-slate-200">{advice.score > 80 ? 'Excellent' : advice.score > 50 ? 'Acceptable' : 'Poor'}</div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-800/50 p-3 rounded border-l-2 border-indigo-500">
                    <p className="text-sm text-slate-200 leading-relaxed">{advice.summary}</p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2">
                    {advice.details.map((point, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="mt-1 block w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
