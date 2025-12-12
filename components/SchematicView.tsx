import React, { useMemo } from 'react';
import { SimulationState, OpticalMetrics, LightFixture, LightPosition, LightColor, Language, GlobalEnv, LightConfig } from '../types';
import { OBJECT_DIMS } from '../constants';
import { TEXTS } from '../translations';

interface SchematicViewProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  language: Language;
}

const SchematicView: React.FC<SchematicViewProps> = ({ state, metrics, language }) => {
  const t = TEXTS[language];

  // --- 1. SETUP CANVAS ---
  const VIEW_W = 800;
  const VIEW_H = 600;
  const CENTER_X = VIEW_W / 2;
  const CENTER_Y = VIEW_H / 2;

  // --- 2. CALCULATE POSITIONS (LOGICAL MM) ---
  
  // Camera is conceptually at 180 degrees (Left) when Angle is 0.
  // We subtract the camera angle to rotate "up" or "down" from the left side.
  const camBaseAngleRad = Math.PI; // 180 degrees
  const camUserAngleRad = (state.cameraAngle * Math.PI) / 180;
  const totalCamAngle = camBaseAngleRad + camUserAngleRad;

  const camX = state.workingDistance * Math.cos(totalCamAngle);
  const camY = state.workingDistance * Math.sin(totalCamAngle);

  // --- LIGHTING POSITION LOGIC (POLAR) ---
  // Everything is calculated relative to Object Center (0,0)
  
  let lightX = 0;
  let lightY = 0;
  let lightRot = 0; // Rotation of the fixture graphic
  let showLight = true;

  const lightDist = state.lightDistance || 200;

  // Helper to place light at specific angle
  const placeLight = (degrees: number) => {
      const rad = (degrees * Math.PI) / 180;
      lightX = lightDist * Math.cos(rad);
      lightY = lightDist * Math.sin(rad);
      // The fixture should point TO the center (0,0)
      // So its rotation is angle + 180 degrees (since 0 rotation usually points right +X)
      lightRot = degrees + 180;
  };

  if (state.lightPosition === LightPosition.Back) {
      // Backlight: BEHIND object (Right side, 0 degrees)
      placeLight(0);
  } else if (state.lightPosition === LightPosition.Top) {
      // Top: Above object (-90 degrees)
      placeLight(-90);
  } else if (state.lightPosition === LightPosition.Side) {
      // Side: 2D representation. 
      // To avoid overlapping Camera (Left) or Top (-90), we use -45 (Top-Right Oblique).
      // This is a standard way to represent "Side" in a 2D elevation diagram.
      placeLight(-45);
  } else if (state.lightPosition === LightPosition.Camera) {
      // Camera Axis
      const camDeg = (totalCamAngle * 180) / Math.PI;
      placeLight(camDeg);
      
      // Hide if attached to camera
      if (Math.abs(state.workingDistance - lightDist) < 50 && state.lightType !== LightFixture.Spot) {
          showLight = false; 
      }
  } else if (state.lightPosition === LightPosition.LowAngle) {
      // Centered 
      lightX = 0;
      lightY = 0;
      showLight = true; 
  } else if (state.lightPosition === LightPosition.Surrounding) {
      lightX = 0;
      lightY = 0;
  }

  // --- 3. STABILIZED SCALE LOGIC ---
  const scale = useMemo(() => {
    const BASE_RADIUS_MM = 600; 

    const requiredRadius = Math.max(
        state.workingDistance + 150, 
        (state.lightDistance || 0) + 150,
        300 
    );

    const effectiveRadius = Math.max(BASE_RADIUS_MM, requiredRadius);
    const minScreenDim = Math.min(VIEW_W, VIEW_H);
    
    return (minScreenDim / 2) / effectiveRadius; 
  }, [state.workingDistance, state.lightDistance]);

  const px = (mm: number) => mm * scale;

  // Object Dimensions (MM)
  const objDim = OBJECT_DIMS[state.objectType];

  // --- COLORS ---
  const getLightColor = (c: LightColor) => {
    switch(c) {
        case LightColor.Red: return "#ef4444"; 
        case LightColor.Blue: return "#3b82f6";
        case LightColor.IR: return "#94a3b8";
        case LightColor.UV: return "#a855f7";
        default: return "#facc15"; 
    }
  };
  const lightColorHex = getLightColor(state.lightColor);

  // --- RENDERERS ---

  const strokeProps = {
      vectorEffect: "non-scaling-stroke",
      strokeWidth: 1.5
  };

  const DimensionLine = ({ x1, y1, x2, y2, label, offset = 20, color = "#64748b" }: any) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx*dx + dy*dy);
      if (len < 10) return null; 

      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      
      const ox = nx * offset;
      const oy = ny * offset;

      let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angleDeg > 90 || angleDeg < -90) {
          angleDeg += 180;
      }

      return (
          <g>
              <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} stroke={color} strokeWidth="1" />
              <line x1={x1} y1={y1} x2={x1 + ox} y2={y1 + oy} stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="4,4"/>
              <line x1={x2} y1={y2} x2={x2 + ox} y2={y2 + oy} stroke={color} strokeWidth="1" opacity="0.3" strokeDasharray="4,4"/>
              
              <g transform={`translate(${(x1+x2)/2 + ox}, ${(y1+y2)/2 + oy}) rotate(${angleDeg})`}>
                  <rect x="-25" y="-8" width="50" height="16" fill="#0f172a" rx="4" opacity="0.9" />
                  <text x="0" y="4" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontWeight="500">{label}</text>
              </g>
          </g>
      );
  };

  const renderAngleIndicator = () => {
      if (Math.abs(state.cameraAngle) < 1) return null;

      const r = px(100); 
      const startRad = Math.PI;
      const endRad = startRad + camUserAngleRad;
      
      const x1 = CENTER_X + r * Math.cos(startRad);
      const y1 = CENTER_Y + r * Math.sin(startRad);
      const x2 = CENTER_X + r * Math.cos(endRad);
      const y2 = CENTER_Y + r * Math.sin(endRad);
      
      const largeArc = Math.abs(camUserAngleRad) > Math.PI ? 1 : 0;
      const sweep = camUserAngleRad > 0 ? 1 : 0;

      return (
          <g>
              <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`} fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="4,2"/>
              <text x={x2 + (sweep ? 10 : -10)} y={y2 + (sweep ? 10 : -10)} fill="#eab308" fontSize="10">{state.cameraAngle}°</text>
          </g>
      );
  };

  const renderFOV = () => {
      const cx = CENTER_X + px(camX);
      const cy = CENTER_Y + px(camY);
      const tx = CENTER_X;
      const ty = CENTER_Y;
      
      const vx = tx - cx;
      const vy = ty - cy;
      const dist = Math.sqrt(vx*vx + vy*vy);
      if (dist < 1) return null;

      const ux = vx / dist;
      const uy = vy / dist;
      const px_vec = -uy;
      const py_vec = ux;
      
      const halfFov = px(metrics.fovWidth / 2);
      
      const t1x = tx + px_vec * halfFov;
      const t1y = ty + py_vec * halfFov;
      const t2x = tx - px_vec * halfFov;
      const t2y = ty - py_vec * halfFov;
      
      return (
          <path d={`M ${cx} ${cy} L ${t1x} ${t1y} L ${t2x} ${t2y} Z`} fill={lightColorHex} fillOpacity="0.05" stroke="none" />
      );
  };

  const renderCameraGroup = () => {
      const txtSize = 12 / scale;
      return (
          <g transform={`translate(${CENTER_X + px(camX)}, ${CENTER_Y + px(camY)}) rotate(${state.cameraAngle}) scale(${scale})`}>
              <path d="M 0 -15 L -10 -20 L -25 -20 L -25 20 L -10 20 L 0 15 Z" fill="#334155" stroke="#94a3b8" {...strokeProps} />
              <line x1="-18" y1="-18" x2="-18" y2="18" stroke="#475569" {...strokeProps} />
              <rect x="-65" y="-25" width="40" height="50" fill="#1e293b" stroke="#64748b" rx="4" {...strokeProps} />
              <line x1="-55" y1="-20" x2="-55" y2="20" stroke="#10b981" {...strokeProps} strokeWidth={3} />
              <text 
                  x="-45" y="-35" 
                  fill="#94a3b8" 
                  fontSize={txtSize}
                  textAnchor="middle" 
                  transform={`rotate(${-state.cameraAngle}, -45, -35)`}
              >
                  Camera
              </text>
              
              {!showLight && state.lightPosition === LightPosition.Camera && (
                  <>
                      {state.lightType === LightFixture.Ring && (
                          <g>
                              <rect x="-5" y="-30" width="10" height="10" fill="#334155" stroke={lightColorHex} {...strokeProps}/>
                              <rect x="-5" y="20" width="10" height="10" fill="#334155" stroke={lightColorHex} {...strokeProps}/>
                              <circle cx="0" cy="-25" r="3" fill={lightColorHex} {...strokeProps}/>
                              <circle cx="0" cy="25" r="3" fill={lightColorHex} {...strokeProps}/>
                          </g>
                      )}
                      {state.lightType === LightFixture.Coaxial && (
                          <g transform="translate(15, -30)">
                              <rect x="0" y="0" width="20" height="20" fill="#1e293b" stroke={lightColorHex} {...strokeProps}/>
                              <line x1="0" y1="0" x2="20" y2="20" stroke={lightColorHex} strokeDasharray="4,4" {...strokeProps}/>
                              <text 
                                  x="10" y="-5" 
                                  fill={lightColorHex} 
                                  fontSize={txtSize * 0.8} 
                                  textAnchor="middle" 
                                  transform={`rotate(${-state.cameraAngle}, 10, -5)`}
                              >
                                  Coax
                              </text>
                          </g>
                      )}
                  </>
              )}
          </g>
      );
  };

  const renderLightGroup = () => {
      if (!showLight) return null;
      
      const txtSize = 12 / scale;

      // Special Case: Low Angle (Centered)
      if (state.lightPosition === LightPosition.LowAngle) {
          const r_mm = (objDim.w / 2) + 20; 
          
          if (state.lightType === LightFixture.Ring) {
             return (
              <g transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}>
                  <circle cx="0" cy="0" r={r_mm} fill="none" stroke={lightColorHex} strokeDasharray="4,4" {...strokeProps}/>
                  <text x="0" y={r_mm + 20} fill={lightColorHex} fontSize={txtSize} textAnchor="middle">Low Angle Ring</text>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                      <g key={deg} transform={`rotate(${deg})`}>
                         <line x1={r_mm} y1="0" x2={objDim.w/2} y2="0" stroke={lightColorHex} opacity="0.5" strokeDasharray="2,2" {...strokeProps} />
                         <path d={`M ${objDim.w/2 + 5} -2 L ${objDim.w/2} 0 L ${objDim.w/2 + 5} 2`} fill={lightColorHex} stroke="none" />
                      </g>
                  ))}
              </g>
            );
          }
          
          if (state.lightType === LightFixture.Bar) {
              // Low Angle Bar: Usually placed flat on table, surrounding object.
              // In this view, we'll place them at compass points pointing IN.
              const angles = [];
              if (state.lightConfig === LightConfig.Single) angles.push(-90); // Top (looking down from top of diagram)
              else if (state.lightConfig === LightConfig.Dual) { angles.push(-90); angles.push(90); } // Top/Bottom
              else { angles.push(0); angles.push(90); angles.push(180); angles.push(270); } // Quad

              return (
                  <g transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}>
                       {angles.map(ang => (
                           <g key={ang} transform={`rotate(${ang}) translate(${r_mm}, 0)`}>
                               {/* Bar Shape: Rect pointing IN */}
                               {/* Face is at x=0 (relative to translation). Body is behind (x>0 since we rotated) */}
                               {/* No, translate moves it out to radius. We want it pointing to center. */}
                               {/* At angle 0 (Right), translate(r,0) puts it at right. We want face at left. Rotation 180? */}
                               {/* Simpler: Rotate the group to the angle, translate out. Then draw bar facing -X */}
                               <rect x="0" y="-15" width="10" height="30" fill="#334155" stroke={lightColorHex} {...strokeProps} />
                               <line x1="0" y1="-10" x2="0" y2="10" stroke={lightColorHex} strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                               
                               {/* Rays pointing to center (-X direction) */}
                               <line x1="0" y1="0" x2={-(r_mm - objDim.w/2)} y2="0" stroke={lightColorHex} strokeDasharray="2,2" opacity="0.5" {...strokeProps}/>
                               <path d={`M ${-(r_mm - objDim.w/2) + 5} -2 L ${-(r_mm - objDim.w/2)} 0 L ${-(r_mm - objDim.w/2) + 5} 2`} fill={lightColorHex} stroke="none" />
                           </g>
                       ))}
                       <text x="0" y={r_mm + 35} fill={lightColorHex} fontSize={txtSize} textAnchor="middle">Low Angle Bar ({state.lightConfig})</text>
                  </g>
              );
          }
      }
      
      // Special Case: Dome/Tunnel (Surrounding)
      if (state.lightPosition === LightPosition.Surrounding) {
           const r_mm = state.lightDistance || 200;
           return (
              <g transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}>
                  <circle cx="0" cy="0" r={r_mm} fill={lightColorHex} fillOpacity="0.05" stroke={lightColorHex} strokeDasharray="8,8" {...strokeProps}/>
                  <text x="0" y={-r_mm - 10} fill={lightColorHex} fontSize={txtSize} textAnchor="middle">Dome / Tunnel</text>
                  {[0, 90, 180, 270].map(deg => (
                      <g key={deg} transform={`rotate(${deg})`}>
                          <line x1={r_mm} y1="0" x2={r_mm - 30} y2="0" stroke={lightColorHex} strokeDasharray="2,2" {...strokeProps}/>
                          <path d={`M ${r_mm-30} -2 L ${r_mm-35} 0 L ${r_mm-30} 2`} fill={lightColorHex} stroke="none" />
                      </g>
                  ))}
              </g>
           );
      }

      // --- STANDARD DIRECTIONAL LIGHTS ---

      // SPECIAL DRAWING FOR BAR LIGHT (Side/Top)
      if (state.lightType === LightFixture.Bar) {
          return (
            <g transform={`translate(${CENTER_X + px(lightX)}, ${CENTER_Y + px(lightY)}) rotate(${lightRot}) scale(${scale})`}>
                {/* Bar Light Shape: Rectangular, emitting face at x=0, body extends backwards (x < 0) */}
                <rect x="-15" y="-30" width="15" height="60" fill="#334155" stroke={lightColorHex} {...strokeProps} />
                {/* Emitting Face */}
                <line x1="0" y1="-28" x2="0" y2="28" stroke={lightColorHex} strokeWidth={3} vectorEffect="non-scaling-stroke"/>
                
                {/* Rays - emanating from 0 towards positive X? No, towards Object. */}
                {/* lightRot is calculated to point towards center. So Rays go +X in local space. */}
                <g opacity="0.5">
                    <line x1="0" y1="-20" x2="50" y2="-15" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                    <line x1="0" y1="20" x2="50" y2="15" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                    <line x1="0" y1="0" x2="60" y2="0" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                    {/* Arrow heads */}
                    <path d="M 50 -15 L 45 -17 L 45 -13 Z" fill={lightColorHex} />
                    <path d="M 50 15 L 45 13 L 45 17 Z" fill={lightColorHex} />
                    <path d="M 60 0 L 55 -2 L 55 2 Z" fill={lightColorHex} />
                </g>

                {/* Label behind the light */}
                 <text 
                  x="-20" y="0" 
                  fill={lightColorHex} 
                  fontSize={txtSize} 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  transform={`rotate(${-lightRot}, -20, 0)`}
                >
                  Bar Light
                </text>
            </g>
          );
      }

      // GENERIC / SPOT / PANEL
      let fixtureShape = (
          <g>
              <rect x="-20" y="-30" width="20" height="60" fill="#334155" stroke={lightColorHex} {...strokeProps}/>
              <line x1="0" y1="-25" x2="0" y2="25" stroke={lightColorHex} strokeWidth={4} vectorEffect="non-scaling-stroke"/>
          </g>
      );

      if (state.lightType === LightFixture.Panel) {
          fixtureShape = (
              <g>
                  <rect x="-10" y="-50" width="10" height="100" fill="#334155" stroke={lightColorHex} {...strokeProps}/>
                  <rect x="0" y="-45" width="2" height="90" fill={lightColorHex} />
              </g>
          );
      } else if (state.lightType === LightFixture.Spot) {
          fixtureShape = (
              <g>
                   <path d="M -20 -10 L 0 -15 L 0 15 L -20 10 Z" fill="#334155" stroke={lightColorHex} {...strokeProps}/>
                   <ellipse cx="0" cy="0" rx="2" ry="15" fill={lightColorHex} />
              </g>
          );
      }

      return (
          <g transform={`translate(${CENTER_X + px(lightX)}, ${CENTER_Y + px(lightY)}) rotate(${lightRot}) scale(${scale})`}>
              {fixtureShape}

              <g opacity="0.5">
                  <line x1="5" y1="-20" x2="60" y2="-15" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                  <line x1="5" y1="20" x2="60" y2="15" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                  <line x1="5" y1="0" x2="80" y2="0" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                  <path d="M 60 -15 L 55 -17 L 55 -13 Z" fill={lightColorHex} />
                  <path d="M 60 15 L 55 13 L 55 17 Z" fill={lightColorHex} />
                  <path d="M 80 0 L 75 -2 L 75 2 Z" fill={lightColorHex} />
              </g>
              
              <text 
                  x="-30" y="0" 
                  fill={lightColorHex} 
                  fontSize={txtSize} 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  transform={`rotate(${-lightRot}, -30, 0)`}
              >
                  {state.lightType === LightFixture.Panel ? 'Backlight' : 'Light'}
              </text>
          </g>
      );
  };

  const renderMeasurements = () => {
      const cx = CENTER_X + px(camX);
      const cy = CENTER_Y + px(camY);
      const lx = CENTER_X + px(lightX);
      const ly = CENTER_Y + px(lightY);
      
      const objW_px = px(objDim.w);
      const objH_px = px(objDim.h);
      
      return (
          <g>
               {/* Working Distance */}
               <DimensionLine 
                   x1={cx} y1={cy} 
                   x2={CENTER_X} y2={CENTER_Y} 
                   label={`WD: ${state.workingDistance}mm`} 
                   offset={40}
                />
               
               {/* Light Distance */}
               {showLight && state.lightPosition !== LightPosition.Surrounding && state.lightPosition !== LightPosition.LowAngle && (
                   <DimensionLine 
                       x1={lx} y1={ly} 
                       x2={CENTER_X} y2={CENTER_Y} 
                       label={`L: ${state.lightDistance}mm`} 
                       offset={-40}
                       color={lightColorHex}
                   />
               )}

               {/* Object Size (Horizontal) */}
               <DimensionLine 
                   x1={CENTER_X - objW_px/2} y1={CENTER_Y}
                   x2={CENTER_X + objW_px/2} y2={CENTER_Y}
                   label={`Size: ${objDim.w}mm`}
                   offset={objH_px/2 + 30}
               />

               {renderAngleIndicator()}
          </g>
      );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      
      {/* HEADER */}
      <div className="h-8 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 text-[10px] text-slate-400">
         <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"/> {t.schObject}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> {t.schCamera}</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: lightColorHex}}/> {t.sectionLight}</span>
         </div>
         <div className="font-mono">
            {metrics.fovWidth.toFixed(1)} x {metrics.fovHeight.toFixed(1)} mm FOV
         </div>
      </div>

      {/* CANVAS */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair">
         <svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
            
            <defs>
              <pattern id="grid" width={px(50)} height={px(50)} patternUnits="userSpaceOnUse">
                <path d={`M ${px(50)} 0 L 0 0 0 ${px(50)}`} fill="none" stroke="#1e293b" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
            
            {/* Center Origin Mark & Floor Line */}
            <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
                 <line x1="-10" y1="0" x2="10" y2="0" stroke="#334155"/>
                 <line x1="0" y1="-10" x2="0" y2="10" stroke="#334155"/>
                 {/* Table/Axis Line */}
                 <line x1="-400" y1="0" x2="400" y2="0" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2"/>
            </g>

            {renderFOV()}
            {renderMeasurements()}
            {renderLightGroup()}
            {renderCameraGroup()}
            
            {/* OBJECT (Physical Coordinates Scaled) */}
            <g transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}>
                <rect 
                    x={-objDim.w/2} y={-objDim.h/2} width={objDim.w} height={objDim.h} 
                    fill="#cbd5e1" stroke="#475569" {...strokeProps} strokeWidth={2}
                    transform={`rotate(${state.objectOrientation === 'Side' ? 90 : 0})`}
                />
                <text 
                  x="0" 
                  y={0} 
                  fontSize={10/scale} 
                  fill="#64748b" 
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.5"
                >
                  {t.schObject}
                </text>
            </g>

         </svg>
         
         <div className="absolute bottom-2 right-2 text-[10px] text-slate-500 font-mono">
             Grid: 50mm | Scale: {(scale).toFixed(2)}x
         </div>
      </div>
    </div>
  );
};

export default SchematicView;