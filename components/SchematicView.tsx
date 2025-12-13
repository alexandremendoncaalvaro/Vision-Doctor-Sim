
import React, { useMemo } from 'react';
import { SimulationState, OpticalMetrics, LightFixture, LightPosition, LightColor, Language, GlobalEnv, LightConfig, ActiveSection } from '../types';
import { OBJECT_DIMS } from '../constants';
import { TEXTS } from '../translations';

interface SchematicViewProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  language: Language;
  activeSection: ActiveSection;
  onSectionSelect: (section: ActiveSection) => void;
}

const SchematicView: React.FC<SchematicViewProps> = ({ state, metrics, language, activeSection, onSectionSelect }) => {
  const t = TEXTS[language];

  // --- 1. SETUP CANVAS ---
  const VIEW_W = 800;
  const VIEW_H = 600;
  const CENTER_X = VIEW_W / 2;
  const CENTER_Y = VIEW_H / 2;

  // --- 2. CALCULATE POSITIONS (LOGICAL MM) ---
  const camBaseAngleRad = Math.PI; 
  const camUserAngleRad = (state.cameraAngle * Math.PI) / 180;
  const totalCamAngle = camBaseAngleRad + camUserAngleRad;

  const camX = state.workingDistance * Math.cos(totalCamAngle);
  const camY = state.workingDistance * Math.sin(totalCamAngle);

  // --- LIGHTING POSITION LOGIC (POLAR) ---
  let lightX = 0;
  let lightY = 0;
  let lightRot = 0; 
  let showLight = true;

  const lightDist = state.lightDistance || 200;

  const placeLight = (degrees: number) => {
      const rad = (degrees * Math.PI) / 180;
      lightX = lightDist * Math.cos(rad);
      lightY = lightDist * Math.sin(rad);
      lightRot = degrees + 180;
  };

  switch (state.lightPosition) {
      case LightPosition.Back: placeLight(0); break;
      case LightPosition.Top: placeLight(-90); break;
      case LightPosition.Side: placeLight(-45); break;
      case LightPosition.Camera: 
          const camDeg = (totalCamAngle * 180) / Math.PI;
          placeLight(camDeg);
          if (Math.abs(state.workingDistance - lightDist) < 50 && state.lightType !== LightFixture.Spot) {
              showLight = false; 
          }
          break;
      case LightPosition.LowAngle: 
          lightX = 0; lightY = 0; showLight = true; break;
      case LightPosition.Surrounding:
          lightX = 0; lightY = 0; break;
      default: placeLight(-45);
  }

  // --- 3. STABILIZED SCALE LOGIC ---
  const scale = useMemo(() => {
    const BASE_RADIUS_MM = 600; 
    const requiredRadius = Math.max(state.workingDistance + 150, (state.lightDistance || 0) + 150, 300);
    const effectiveRadius = Math.max(BASE_RADIUS_MM, requiredRadius);
    const minScreenDim = Math.min(VIEW_W, VIEW_H);
    return (minScreenDim / 2) / effectiveRadius; 
  }, [state.workingDistance, state.lightDistance]);

  const px = (mm: number) => mm * scale;
  const objDim = OBJECT_DIMS[state.objectType];

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

  const strokeProps = { vectorEffect: "non-scaling-stroke", strokeWidth: 1.5 };

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
      if (angleDeg > 90 || angleDeg < -90) angleDeg += 180;

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

  const renderCameraGroup = () => {
      const txtSize = 12 / scale;
      const fovHalfH = metrics.fovHeight / 2;
      const coneLen = state.workingDistance;
      const isActive = activeSection === 'camera';

      return (
          <g 
            transform={`translate(${CENTER_X + px(camX)}, ${CENTER_Y + px(camY)}) rotate(${state.cameraAngle}) scale(${scale})`}
            className="cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); onSectionSelect('camera'); }}
          >
              {/* FOV CONE */}
              <path 
                d={`M 0 0 L ${coneLen} ${-fovHalfH} L ${coneLen} ${fovHalfH} Z`} 
                fill="rgba(56, 189, 248, 0.1)" 
                stroke="rgba(56, 189, 248, 0.3)" 
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <line x1="0" y1="0" x2={coneLen} y2="0" stroke="rgba(56, 189, 248, 0.5)" strokeDasharray="4,2" vectorEffect="non-scaling-stroke" />

              {/* CAMERA BODY */}
              <g className={`transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                <path d="M 0 -15 L -10 -20 L -25 -20 L -25 20 L -10 20 L 0 15 Z" fill="#334155" stroke={isActive ? "#10b981" : "#94a3b8"} {...strokeProps} />
                <rect x="-65" y="-25" width="40" height="50" fill="#1e293b" stroke={isActive ? "#10b981" : "#64748b"} rx="4" {...strokeProps} />
                <text x="-45" y="-35" fill={isActive ? "#10b981" : "#94a3b8"} fontSize={txtSize} textAnchor="middle" transform={`rotate(${-state.cameraAngle}, -45, -35)`}>{t.schCamera}</text>
              </g>
              
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
                              <text x="10" y="-5" fill={lightColorHex} fontSize={txtSize * 0.8} textAnchor="middle" transform={`rotate(${-state.cameraAngle}, 10, -5)`}>{t.schCoaxial}</text>
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
      const isActive = activeSection === 'light';
      const highlight = isActive ? 2 : 1;

      // --- LOW ANGLE (Grazing/Dark Field) ---
      if (state.lightPosition === LightPosition.LowAngle) {
          const r_mm = (objDim.w / 2) + 20; 
          
          if (state.lightType === LightFixture.Ring) {
             return (
              <g 
                transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); onSectionSelect('light'); }}
              >
                  <circle cx="0" cy="0" r={r_mm} fill="none" stroke={lightColorHex} strokeWidth={1.5 * highlight} strokeDasharray="4,4" vectorEffect="non-scaling-stroke"/>
                  <text x="0" y={r_mm + 20} fill={lightColorHex} fontSize={txtSize} textAnchor="middle" fontWeight={isActive ? "bold" : "normal"}>{t.schDarkFieldRing}</text>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                      <g key={deg} transform={`rotate(${deg})`}>
                         <line x1={r_mm} y1="0" x2={objDim.w/2} y2="0" stroke={lightColorHex} opacity="0.5" strokeDasharray="2,2" {...strokeProps} />
                      </g>
                  ))}
              </g>
            );
          }
          if (state.lightType === LightFixture.Bar) {
              const angles = [];
              if (state.lightConfig === LightConfig.Single) angles.push(-90); // Top
              else if (state.lightConfig === LightConfig.Dual) { angles.push(-90); angles.push(90); }
              else { angles.push(0); angles.push(90); angles.push(180); angles.push(270); }

              return (
                  <g 
                    transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}
                    className="cursor-pointer group"
                    onClick={(e) => { e.stopPropagation(); onSectionSelect('light'); }}
                  >
                       {angles.map(ang => (
                           <g key={ang} transform={`rotate(${ang}) translate(${r_mm}, 0)`}>
                               <rect x="0" y="-15" width="10" height="30" fill="#334155" stroke={lightColorHex} strokeWidth={1.5*highlight} vectorEffect="non-scaling-stroke" />
                               <line x1="0" y1="0" x2={-(r_mm - objDim.w/2)} y2="0" stroke={lightColorHex} strokeDasharray="2,2" opacity="0.5" {...strokeProps}/>
                           </g>
                       ))}
                       <text x="0" y={r_mm + 35} fill={lightColorHex} fontSize={txtSize} textAnchor="middle" fontWeight={isActive ? "bold" : "normal"}>{t.schDarkFieldBar} ({state.lightConfig})</text>
                  </g>
              );
          }
      }
      
      // --- SURROUNDING (Dome/Tunnel) ---
      if (state.lightPosition === LightPosition.Surrounding) {
           const r_mm = state.lightDistance || 200;
           return (
              <g 
                transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); onSectionSelect('light'); }}
              >
                  <circle cx="0" cy="0" r={r_mm} fill={lightColorHex} fillOpacity="0.05" stroke={lightColorHex} strokeWidth={1.5*highlight} strokeDasharray="8,8" vectorEffect="non-scaling-stroke"/>
                  <text x="0" y={-r_mm - 10} fill={lightColorHex} fontSize={txtSize} textAnchor="middle" fontWeight={isActive ? "bold" : "normal"}>{t.schDomeTunnel}</text>
              </g>
           );
      }

      // --- DIRECTIONAL (Back, Top, Side) ---
      // SPECIAL DRAWING FOR BAR LIGHT
      if (state.lightType === LightFixture.Bar) {
          return (
            <g 
                transform={`translate(${CENTER_X + px(lightX)}, ${CENTER_Y + px(lightY)}) rotate(${lightRot}) scale(${scale})`}
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); onSectionSelect('light'); }}
            >
                <rect x="-15" y="-30" width="15" height="60" fill="#334155" stroke={lightColorHex} strokeWidth={1.5*highlight} vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="-28" x2="0" y2="28" stroke={lightColorHex} strokeWidth={3} vectorEffect="non-scaling-stroke"/>
                <g opacity="0.5">
                    <line x1="0" y1="0" x2="60" y2="0" stroke={lightColorHex} strokeDasharray="4,2" {...strokeProps}/>
                    <path d="M 60 0 L 55 -2 L 55 2 Z" fill={lightColorHex} />
                </g>
                <text x="-25" y="0" fill={lightColorHex} fontSize={txtSize} textAnchor="end" dominantBaseline="middle" transform={`rotate(${-lightRot}, -25, 0)`} fontWeight={isActive ? "bold" : "normal"}>{t.schBarLight}</text>
            </g>
          );
      }

      // STANDARD FIXTURE SHAPES
      let fixtureShape = (
          <g>
              <rect x="-20" y="-30" width="20" height="60" fill="#334155" stroke={lightColorHex} strokeWidth={1.5*highlight} vectorEffect="non-scaling-stroke"/>
              <line x1="0" y1="-25" x2="0" y2="25" stroke={lightColorHex} strokeWidth={4} vectorEffect="non-scaling-stroke"/>
          </g>
      );
      if (state.lightType === LightFixture.Panel) {
          fixtureShape = (
              <g>
                  <rect x="-10" y="-50" width="10" height="100" fill="#334155" stroke={lightColorHex} strokeWidth={1.5*highlight} vectorEffect="non-scaling-stroke"/>
                  <rect x="0" y="-45" width="2" height="90" fill={lightColorHex} />
              </g>
          );
      }

      return (
          <g 
            transform={`translate(${CENTER_X + px(lightX)}, ${CENTER_Y + px(lightY)}) rotate(${lightRot}) scale(${scale})`}
            className="cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); onSectionSelect('light'); }}
          >
              {fixtureShape}
              <text x="-30" y="0" fill={lightColorHex} fontSize={txtSize} textAnchor="end" dominantBaseline="middle" transform={`rotate(${-lightRot}, -30, 0)`} fontWeight={isActive ? "bold" : "normal"}>
                  {state.lightType}
              </text>
          </g>
      );
  };

  const isActiveObject = activeSection === 'object';

  return (
    <div className="w-full h-full flex flex-col bg-slate-950">
      <div className="h-8 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900/50 text-[10px] text-slate-400">
         <div className="flex gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => onSectionSelect('object')}><div className={`w-2 h-2 rounded-full ${isActiveObject ? 'bg-blue-500' : 'bg-slate-400'}`}/> {t.schObject}</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => onSectionSelect('camera')}><div className={`w-2 h-2 rounded-full ${activeSection === 'camera' ? 'bg-emerald-400' : 'bg-emerald-600'}`}/> {t.schCamera}</span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => onSectionSelect('light')}><div className="w-2 h-2 rounded-full" style={{backgroundColor: lightColorHex}}/> {t.sectionLight}</span>
         </div>
         <div className="font-mono">{metrics.fovWidth.toFixed(1)} x {metrics.fovHeight.toFixed(1)} mm FOV</div>
      </div>
      <div className="flex-1 relative overflow-hidden flex items-center justify-center cursor-crosshair">
         <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            onClick={() => onSectionSelect('all')} // Click background to reset
         >
            <defs>
              <pattern id="grid" width={px(50)} height={px(50)} patternUnits="userSpaceOnUse">
                <path d={`M ${px(50)} 0 L 0 0 0 ${px(50)}`} fill="none" stroke="#1e293b" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
            <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
                 <line x1="-10" y1="0" x2="10" y2="0" stroke="#334155"/>
                 <line x1="0" y1="-10" x2="0" y2="10" stroke="#334155"/>
            </g>
            <DimensionLine x1={CENTER_X + px(camX)} y1={CENTER_Y + px(camY)} x2={CENTER_X} y2={CENTER_Y} label={`${t.schWd}: ${state.workingDistance}mm`} offset={40} />
            {showLight && state.lightPosition !== LightPosition.Surrounding && state.lightPosition !== LightPosition.LowAngle && (
               <DimensionLine x1={CENTER_X + px(lightX)} y1={CENTER_Y + px(lightY)} x2={CENTER_X} y2={CENTER_Y} label={`L: ${state.lightDistance}mm`} offset={-40} color={lightColorHex} />
            )}
            {renderLightGroup()}
            {renderCameraGroup()}
            <g 
                transform={`translate(${CENTER_X}, ${CENTER_Y}) scale(${scale})`}
                className="cursor-pointer group"
                onClick={(e) => { e.stopPropagation(); onSectionSelect('object'); }}
            >
                <rect x={-objDim.w/2} y={-objDim.h/2} width={objDim.w} height={objDim.h} fill="#cbd5e1" stroke={isActiveObject ? "#3b82f6" : "#475569"} {...strokeProps} strokeWidth={isActiveObject ? 3 : 2} transform={`rotate(${state.objectOrientation === 'Side' ? 90 : 0})`} />
                <text x="0" y={0} fontSize={10/scale} fill={isActiveObject ? "#3b82f6" : "#64748b"} textAnchor="middle" dominantBaseline="middle" opacity="0.8">{t.schObject}</text>
            </g>
         </svg>
      </div>
    </div>
  );
};

export default SchematicView;
