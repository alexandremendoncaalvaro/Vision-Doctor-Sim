import React, { useState } from 'react';
import { SimulationState, OpticalMetrics, LightFixture, LightPosition, LightColor, Language } from '../types';
import { SENSOR_SPECS, OBJECT_DIMS } from '../constants';
import { TEXTS } from '../translations';
import { RectangleHorizontal, RectangleVertical } from 'lucide-react';

interface SchematicViewProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  language: Language;
}

const SchematicView: React.FC<SchematicViewProps> = ({ state, metrics, language }) => {
  const [isVertical, setIsVertical] = useState(false);
  const t = TEXTS[language];

  // Scaling factor for drawing to fit SVG
  const MAX_WIDTH_MM = 1200;
  
  // ViewBox Dimensions based on orientation
  const VIEWBOX_W = isVertical ? 500 : 800;
  const VIEWBOX_H = isVertical ? 900 : 400;

  const scale = (val: number) => (val / MAX_WIDTH_MM) * 800; // Base scale on horizontal width
  
  // Logical Center (Drawing Coords are always Horizontal initially)
  // We draw in a 800x400 space, then transform it.
  const LOGICAL_W = 800;
  const LOGICAL_H = 400;
  const centerlineY = LOGICAL_H / 2;
  const objectX = LOGICAL_W * 0.75; 

  // Dimensions
  const sensorH = scale(SENSOR_SPECS[state.sensorFormat].h * 10);
  const objectPhysH = OBJECT_DIMS[state.objectType].h;
  const objectH = scale(objectPhysH);

  const distToLens = scale(state.workingDistance);
  const distToSensor = distToLens + scale(state.focalLength * 2);
  
  const lensLocalX = -distToLens;
  const sensorLocalX = -distToSensor;

  const getLightColorHex = (c: LightColor) => {
    switch(c) {
        case LightColor.Red: return "#ef4444";
        case LightColor.Blue: return "#3b82f6";
        case LightColor.IR: return "#a8a29e";
        case LightColor.UV: return "#a855f7";
        default: return "#facc15"; 
    }
  };
  const lightColorHex = getLightColorHex(state.lightColor);

  // --- RENDERING HELPERS ---
  
  // Wrapper for Text that counter-rotates if view is Vertical
  const Label: React.FC<React.SVGProps<SVGTextElement>> = (props) => {
    const { x, y, transform, ...rest } = props;
    // If Vertical, we rotated the whole scene 90deg.
    // To keep text upright, we rotate it -90deg around its own anchor (x,y).
    const rotation = isVertical ? `rotate(-90 ${x} ${y})` : '';
    return <text x={x} y={y} transform={`${transform || ''} ${rotation}`} {...rest} />;
  };

  const renderCameraAttachedLights = () => {
     // Only render if position is Camera
     if (state.lightPosition !== LightPosition.Camera) return null;

     if (state.lightType === LightFixture.Ring) {
        const ringX = lensLocalX + 10;
        const ringRadius = 40;
        return (
          <g>
             <rect x={ringX} y={-ringRadius - 10} width={10} height={20} fill="#334155" stroke="#94a3b8" />
             <circle cx={ringX + 5} cy={-ringRadius} r={4} fill={lightColorHex} />
             <rect x={ringX} y={ringRadius - 10} width={10} height={20} fill="#334155" stroke="#94a3b8" />
             <circle cx={ringX + 5} cy={ringRadius} r={4} fill={lightColorHex} />
             <path 
               d={`M ${ringX+5} ${-ringRadius} L 0 ${-objectH/2} L 0 ${objectH/2} L ${ringX+5} ${ringRadius} Z`} 
               fill={lightColorHex} 
               fillOpacity="0.1" 
             />
          </g>
        );
     }
     if (state.lightType === LightFixture.Coaxial) {
        const coaxX = lensLocalX - 25;
        const coaxY = -50;
        return (
          <g>
            <rect x={coaxX} y={coaxY} width={30} height={50} fill="#334155" stroke="#94a3b8" />
            <rect x={coaxX + 5} y={coaxY + 5} width={20} height={10} fill={lightColorHex} />
            <line x1={coaxX} y1={-20} x2={coaxX + 30} y2={-50} stroke="#94a3b8" strokeWidth="1" />
            <path d={`M ${coaxX + 15} ${coaxY + 10} L ${coaxX + 15} 0 L 0 0`} stroke={lightColorHex} strokeDasharray="5,5" strokeOpacity="0.8" fill="none" />
            <Label x={coaxX + 15} y={coaxY - 10} fill={lightColorHex} fontSize="12" textAnchor="middle">{t.schCoaxial}</Label>
          </g>
        );
     }
     return null;
  };

  const renderFixedLights = () => {
    // Render lights that are NOT attached to camera (World fixed relative to object)
    if (state.lightPosition === LightPosition.Camera) return null;

    if (state.lightPosition === LightPosition.Back) {
        return (
          <g transform={`translate(${objectX}, ${centerlineY})`}>
            <rect x={20} y={-scale(150)} width={10} height={scale(300)} fill={lightColorHex} fillOpacity="0.8" stroke={lightColorHex}/>
            <path d="M 20 -50 L 0 -20" stroke={lightColorHex} strokeDasharray="4,4" />
            <path d="M 20 50 L 0 20" stroke={lightColorHex} strokeDasharray="4,4" />
            <Label x={35} y={0} fill={lightColorHex} fontSize="12" textAnchor="start" dominantBaseline="middle">{t.schBacklight}</Label>
          </g>
        );
    }
    
    if (state.lightPosition === LightPosition.LowAngle) {
         const laRadius = 70;
         return (
          <g transform={`translate(${objectX}, ${centerlineY})`}>
             <rect x={-30} y={-laRadius - 5} width={10} height={15} fill="#334155" stroke="#94a3b8" />
             <circle cx={-25} cy={-laRadius + 2} r={4} fill={lightColorHex} />
             <rect x={-30} y={laRadius - 10} width={10} height={15} fill="#334155" stroke="#94a3b8" />
             <circle cx={-25} cy={laRadius - 2} r={4} fill={lightColorHex} />
             <line x1={-25} y1={-laRadius + 2} x2={0} y2={-5} stroke={lightColorHex} strokeWidth="2" strokeOpacity="0.6" />
             <line x1={-25} y1={laRadius - 2} x2={0} y2={5} stroke={lightColorHex} strokeWidth="2" strokeOpacity="0.6" />
             <Label x={-35} y={-laRadius - 15} fill={lightColorHex} fontSize="12" textAnchor="end">{t.schLowAngle}</Label>
          </g>
        );
    }

    if (state.lightPosition === LightPosition.Top) {
        return (
          <g transform={`translate(${objectX}, ${centerlineY})`}>
             <rect x={-50} y={-150} width={100} height={10} fill="#334155" stroke={lightColorHex} />
             <line x1={-40} y1={-140} x2={0} y2={-objectH/2} stroke={lightColorHex} strokeDasharray="4,4" />
             <line x1={40} y1={-140} x2={0} y2={-objectH/2} stroke={lightColorHex} strokeDasharray="4,4" />
             <Label x={0} y={-160} fill={lightColorHex} fontSize="12" textAnchor="middle">Top Light</Label>
          </g>
        );
    }

    // Side lights difficult to visualize in side profile if coming from Z axis, 
    // but if coming from Y axis (up/down in image), they are just Top/Bottom?
    // Let's assume Side is perpendicular to this view, maybe draw a circle with an X?
    if (state.lightPosition === LightPosition.Side) {
         return (
          <g transform={`translate(${objectX}, ${centerlineY})`}>
             <circle cx={0} cy={-objectH/2 - 50} r={10} fill="none" stroke={lightColorHex} />
             <text x={0} y={-objectH/2 - 47} textAnchor="middle" fontSize="10" fill={lightColorHex}>Side</text>
             {/* Abstract rays */}
             <line x1={0} y1={-objectH/2 - 40} x2={0} y2={-objectH/2} stroke={lightColorHex} strokeDasharray="2,2"/>
          </g>
         );
    }
    
    return null;
  };

  // Main Scene Transform
  const rootTransform = isVertical 
    ? `translate(${VIEWBOX_W/2}, 50) rotate(90) translate(0, -${centerlineY})` 
    : ``;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-4">
         
         {/* Rotate Button */}
         <button 
           onClick={() => setIsVertical(!isVertical)}
           className="absolute top-4 right-4 z-10 bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg border border-slate-700"
           title={isVertical ? "Switch to Horizontal View" : "Switch to Vertical View"}
         >
           {isVertical ? <RectangleHorizontal size={20} className="text-indigo-400" /> : <RectangleVertical size={20} />}
         </button>

         <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className={`max-w-full max-h-full select-none transition-all duration-500`}>
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
              </pattern>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* --- TRANSFORMED ROOT GROUP --- */}
            <g transform={rootTransform} className="transition-transform duration-500 ease-in-out">
              
              {/* Optical Axis */}
              <line x1="0" y1={centerlineY} x2={LOGICAL_W} y2={centerlineY} stroke="#334155" strokeDasharray="5,5" />

              {/* --- ROTATING CAMERA GROUP --- */}
              {/* Changed rotate(${-state.cameraAngle}) to rotate(${state.cameraAngle}) for UP direction */}
              <g transform={`translate(${objectX}, ${centerlineY}) rotate(${state.cameraAngle})`}>
                  
                  {/* FOV Cone */}
                  <path 
                    d={`M ${lensLocalX} 0 L 0 ${-scale(metrics.fovHeight/2)} L 0 ${scale(metrics.fovHeight/2)} Z`} 
                    fill="rgba(59, 130, 246, 0.1)" 
                    stroke="#3b82f6" 
                    strokeWidth="1"
                  />

                  {/* Camera Body */}
                  <rect x={sensorLocalX - 30} y={-25} width={30} height={50} fill="#475569" rx="4" />
                  <Label x={sensorLocalX - 45} y={0} fill="#94a3b8" fontSize="12" textAnchor="middle" dominantBaseline="middle">{t.schCamera}</Label>
                  
                  {/* Sensor */}
                  <line x1={sensorLocalX} y1={-sensorH/2} x2={sensorLocalX} y2={sensorH/2} stroke="#ef4444" strokeWidth="4" />

                  {/* Lens */}
                  <path d={`M ${lensLocalX-5} -15 L ${lensLocalX+5} 0 L ${lensLocalX-5} 15 Z`} fill="#94a3b8" />
                  <Label x={lensLocalX} y={-25} fill="#94a3b8" fontSize="12" textAnchor="middle">{t.schLens}</Label>
                  
                  {/* Camera Attached Lights */}
                  {renderCameraAttachedLights()}

                  {/* Axis Line for Camera */}
                  <line x1={sensorLocalX} y1={0} x2={0} y2={0} stroke="#3b82f6" strokeDasharray="2,2" strokeOpacity="0.5"/>
              </g>

              {/* --- FIXED ELEMENTS --- */}
              {renderFixedLights()}

              {/* Object */}
              <g transform={`translate(${objectX}, ${centerlineY})`}>
                  <rect 
                  x={0} 
                  y={-objectH/2} 
                  width={10} 
                  height={objectH} 
                  fill="#22c55e" 
                  />
                  <Label x={20} y={0} fill="#22c55e" fontSize="12" textAnchor="start" dominantBaseline="middle">{t.schObject}</Label>
              </g>
              
              {/* Angle Indicator Arc */}
              {state.cameraAngle > 0 && (
                  <g transform={`translate(${objectX}, ${centerlineY})`}>
                      <path d={`M -100 0 A 100 100 0 0 1 ${-100 * Math.cos(state.cameraAngle * Math.PI/180)} ${-100 * Math.sin(state.cameraAngle * Math.PI/180)}`} fill="none" stroke="#a855f7" strokeWidth="2" />
                      <Label x={-120} y={-20} fill="#a855f7" fontSize="12">{state.cameraAngle}°</Label>
                  </g>
              )}

              {/* Working Distance Marker */}
              {/* Needs special handling for rotation because it spans distance */}
              <line x1={objectX + lensLocalX} y1={centerlineY + 60} x2={objectX} y2={centerlineY + 60} stroke="#64748b" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
              <Label x={objectX + lensLocalX/2} y={centerlineY + 50} fill="#cbd5e1" fontSize="12" textAnchor="middle">{t.schWd}: {state.workingDistance}mm</Label>
            </g>

         </svg>
      </div>
      
      {/* Metrics Footer */}
      <div className="h-16 bg-slate-900 border-t border-slate-700 flex items-center justify-around px-4 text-sm z-20">
        <div className="text-center">
          <div className="text-slate-400 text-xs">{t.statFov}</div>
          <div className="text-blue-400 font-mono">{metrics.fovWidth.toFixed(1)} x {metrics.fovHeight.toFixed(1)} mm</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs">{t.statMag}</div>
          <div className="text-emerald-400 font-mono">{metrics.magnification.toFixed(3)}x</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs">{t.statDof}</div>
          <div className="text-orange-400 font-mono">~{metrics.dof.toFixed(1)} mm</div>
        </div>
      </div>
    </div>
  );
};

export default SchematicView;