import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimulationState, OpticalMetrics, LightColor, LightFixture, LightPosition, LightConfig, ObjectType, Language, GlobalEnv, BackgroundPattern, LensFilter, ActiveSection } from '../types';
import { OBJECT_DIMS } from '../constants';
import { TEXTS } from '../translations';

interface SimulatedImageProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  viewType: 'camera' | 'free';
  language: Language;
  onSectionSelect: (section: ActiveSection) => void;
}

const SimulatedImage: React.FC<SimulatedImageProps> = ({ state, metrics, viewType, language, onSectionSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TEXTS[language];
  
  // Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); 
  const freeCameraRef = useRef<THREE.PerspectiveCamera | null>(null); 
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  // Store the env map texture so we don't regenerate it every frame
  const envMapRef = useRef<THREE.Texture | null>(null);

  // Background Pattern Cache
  const patternsRef = useRef<Record<string, THREE.Texture>>({});

  // State Refs
  const viewTypeRef = useRef(viewType);
  const keysPressed = useRef<Set<string>>(new Set());

  // Scene Objects Refs
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const camModelRef = useRef<THREE.Group | null>(null);
  const enclosureGroupRef = useRef<THREE.Group | null>(null);
  
  // Raycaster Ref
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    viewTypeRef.current = viewType;
  }, [viewType]);

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.code);
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.code);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- INTERACTION HANDLER ---
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!containerRef.current || !rendererRef.current || !sceneRef.current) return;
    
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    const activeCam = viewTypeRef.current === 'free' ? freeCameraRef.current : cameraRef.current;
    if (!activeCam) return;

    raycasterRef.current.setFromCamera(mouseRef.current, activeCam);

    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    if (intersects.length > 0) {
      // Find the first relevant object
      const hit = intersects[0].object;
      
      // Traverse up to find the group logic
      let current: THREE.Object3D | null = hit;
      let sectionFound: ActiveSection | null = null;

      while (current) {
        if (current === objectGroupRef.current) {
          sectionFound = 'object';
          break;
        }
        if (current === lightsGroupRef.current) {
           sectionFound = 'light';
           break;
        }
        if (current === camModelRef.current) {
          sectionFound = 'camera';
          break;
        }
        if (current === enclosureGroupRef.current) {
           sectionFound = 'environment';
           break;
        }
        current = current.parent;
      }
      
      // Special logic: If hitting environment wall, maybe we want "all" or "environment". 
      // User requested "Show all" when clicking canvas (background). 
      // If we hit object/light/camera, select that. Otherwise, select 'all'.
      if (sectionFound && sectionFound !== 'environment') {
          onSectionSelect(sectionFound);
      } else {
          // If we hit the enclosure (background) or environment props, go back to all
          onSectionSelect('all');
      }

    } else {
        onSectionSelect('all');
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const indCam = new THREE.PerspectiveCamera(50, 1, 10, 5000);
    cameraRef.current = indCam;

    const freeCam = new THREE.PerspectiveCamera(50, 1, 1, 5000);
    freeCam.position.set(150, 150, 250);
    freeCam.lookAt(0, 0, 0);
    freeCameraRef.current = freeCam;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    // High Dynamic Range
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.outline = 'none';
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- ENVIRONMENT MAP (Pre-generate for Factory/Sunlight reflections) ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    envMapRef.current = envTexture;
    
    // Initial Background
    scene.background = new THREE.Color('#050505');

    const controls = new OrbitControls(freeCam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // --- ENCLOSURE GROUP ---
    const enclosureGroup = new THREE.Group();
    enclosureGroup.name = "EnvironmentGroup";
    scene.add(enclosureGroup);
    enclosureGroupRef.current = enclosureGroup;

    // 1. Physical Box (Walls)
    // 1200mm = 1.2 meters. Realistic cabinet size.
    const size = 1200;
    const enclosureGeo = new THREE.BoxGeometry(size, size, size);
    const enclosureMat = new THREE.MeshStandardMaterial({ 
        color: 0x707070, // Medium grey (Stainless Steel base)
        roughness: 0.5,  
        metalness: 0.6, 
        side: THREE.BackSide 
    });
    const enclosure = new THREE.Mesh(enclosureGeo, enclosureMat);
    enclosure.receiveShadow = true;
    enclosureGroup.add(enclosure);

    // 2. Structural Frame (Edges)
    const edges = new THREE.EdgesGeometry(enclosureGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, opacity: 0.5, transparent: true });
    const frame = new THREE.LineSegments(edges, lineMat);
    enclosureGroup.add(frame);

    // 3. Floor Grid
    const grid = new THREE.GridHelper(size, 12, 0x444444, 0x222222);
    grid.position.y = -size / 2 + 1; // Slightly above floor to avoid z-fighting
    enclosureGroup.add(grid);

    const lightsGroup = new THREE.Group();
    lightsGroup.name = "LightsGroup";
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    const objectGroup = new THREE.Group();
    objectGroup.name = "ObjectGroup";
    scene.add(objectGroup);
    objectGroupRef.current = objectGroup;

    const camModel = createCameraModel();
    camModel.name = "CameraModel";
    scene.add(camModel);
    camModelRef.current = camModel;

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current || !freeCameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(w, h);
      
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();

      freeCameraRef.current.aspect = w / h;
      freeCameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const currentView = viewTypeRef.current;
      const controls = controlsRef.current;
      const freeCam = freeCameraRef.current;

      if (currentView === 'free' && freeCam && controls) {
         const speed = 4.0;
         const pressed = keysPressed.current;
         
         const forward = new THREE.Vector3();
         freeCam.getWorldDirection(forward);
         forward.y = 0; 
         forward.normalize();
         const right = new THREE.Vector3();
         right.crossVectors(forward, freeCam.up).normalize();
         const up = new THREE.Vector3(0, 1, 0);
         const moveVector = new THREE.Vector3();

         if (pressed.has('KeyW') || pressed.has('ArrowUp')) moveVector.add(forward);
         if (pressed.has('KeyS') || pressed.has('ArrowDown')) moveVector.sub(forward);
         if (pressed.has('KeyA') || pressed.has('ArrowLeft')) moveVector.sub(right);
         if (pressed.has('KeyD') || pressed.has('ArrowRight')) moveVector.add(right);
         if (pressed.has('KeyE')) moveVector.add(up);
         if (pressed.has('KeyQ')) moveVector.sub(up);

         if (moveVector.lengthSq() > 0) {
            moveVector.normalize().multiplyScalar(speed);
            freeCam.position.add(moveVector);
            controls.target.add(moveVector);
         }
      }

      if (controls) controls.update(); 

      if (rendererRef.current && sceneRef.current) {
         const activeCam = currentView === 'free' ? freeCameraRef.current! : cameraRef.current!;
         rendererRef.current.render(sceneRef.current, activeCam);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      controls.dispose();
      pmremGenerator.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // --- BACKGROUND UPDATE ---
  useEffect(() => {
    if (!sceneRef.current || !enclosureGroupRef.current) return;

    // Function to get or create pattern
    const getPattern = (type: BackgroundPattern) => {
        if (patternsRef.current[type]) return patternsRef.current[type];
        
        let tex: THREE.Texture;
        if (type === BackgroundPattern.Level1) {
            tex = createLevel1Texture();
        } else if (type === BackgroundPattern.Level2) {
            tex = createLevel2Texture();
        } else if (type === BackgroundPattern.Level3) {
            tex = createLevel3Texture();
        } else {
            return null;
        }

        // Configure texture to wrap for background usage
        tex.mapping = THREE.EquirectangularReflectionMapping; 
        tex.colorSpace = THREE.SRGBColorSpace;
        patternsRef.current[type] = tex;
        return tex;
    };

    if (state.globalEnv === GlobalEnv.Studio) {
         sceneRef.current.background = null; 
         enclosureGroupRef.current.visible = true;
    } else {
         // Factory / Sunlight
         enclosureGroupRef.current.visible = false;
         
         if (state.backgroundPattern && state.backgroundPattern !== BackgroundPattern.None) {
             // Use Pattern
             const tex = getPattern(state.backgroundPattern);
             if (tex) sceneRef.current.background = tex;
         } else {
             // Use Solid Color
             sceneRef.current.background = new THREE.Color(state.backgroundColor);
         }
    }
  }, [state.backgroundColor, state.globalEnv, state.backgroundPattern]);

  useEffect(() => {
    if (rendererRef.current) {
       const baseExposure = 1.0;
       const timeFactor = state.exposureTime / 5000;
       const apertureFactor = Math.pow(2.8, 2) / Math.pow(state.aperture, 2);
       const gainFactor = Math.pow(10, state.gain / 20);
       
       // Filter Loss Factors
       // Polarizer usually cuts 1.5 - 2 stops. We'll approximate as 60% light loss (factor 0.4)
       // Color filters also cut light.
       let filterFactor = 1.0;
       if (state.lensFilter === LensFilter.Polarizer) filterFactor = 0.4;
       else if (state.lensFilter !== LensFilter.None) filterFactor = 0.8;

       const calculatedExposure = baseExposure * timeFactor * apertureFactor * gainFactor * filterFactor;
       
       rendererRef.current.toneMappingExposure = calculatedExposure;
    }
  }, [state.exposureTime, state.aperture, state.gain, state.lensFilter]);

  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current || !objectGroupRef.current || !camModelRef.current || !cameraRef.current) return;

    // --- GLOBAL ENVIRONMENT UPDATE ---
    const scene = sceneRef.current;
    
    // Calculate Base Environmental intensity
    let envIntensity = 0;
    if (state.globalEnv !== GlobalEnv.Studio) {
       scene.environment = envMapRef.current;
       envIntensity = (state.globalIntensity / 100) * 1.5;
    } else {
       scene.environment = null;
       envIntensity = 0;
    }

    // --- POLARIZER EFFECT ON REFLECTIONS ---
    // A CPL filter significantly reduces reflections from non-metallic surfaces.
    // In our simplified model, we simulate this by crushing the environment intensity.
    if (state.lensFilter === LensFilter.Polarizer) {
        envIntensity *= 0.1; // 90% reduction in glare/reflections
    }
    
    scene.environmentIntensity = envIntensity;

    const objectHeight = OBJECT_DIMS[state.objectType].h;
    
    // Target Y logic
    let targetY = 0;
    if (state.viewFocus === 'Top') targetY = objectHeight * 0.45;
    else if (state.viewFocus === 'Bottom') targetY = -objectHeight * 0.45;
    else if (state.viewFocus === 'Middle') targetY = 0;
    else if (state.viewFocus === 'Whole') targetY = 0;

    const angleRad = (state.cameraAngle * Math.PI) / 180;
    
    // Prevent Gimbal Lock at 90/-90 degrees
    // Standard lookAt fails if up vector and view vector are parallel.
    if (Math.abs(state.cameraAngle) > 89.9) {
         cameraRef.current.up.set(0, 0, -1);
         camModelRef.current.up.set(0, 0, -1);
    } else {
         cameraRef.current.up.set(0, 1, 0);
         camModelRef.current.up.set(0, 1, 0);
    }
    
    const camY = targetY + (state.workingDistance * Math.sin(angleRad));
    const camZ = state.workingDistance * Math.cos(angleRad);
    
    cameraRef.current.position.set(0, camY, camZ);
    cameraRef.current.lookAt(0, targetY, 0);

    const fovDeg = 2 * Math.atan((metrics.fovHeight / 2) / state.workingDistance) * (180 / Math.PI);
    cameraRef.current.fov = fovDeg;
    cameraRef.current.updateProjectionMatrix();

    camModelRef.current.position.set(0, camY, camZ);
    camModelRef.current.lookAt(0, targetY, 0);
    camModelRef.current.visible = viewType === 'free'; 

    updateObject(objectGroupRef.current, state);
    
    updateLights(lightsGroupRef.current, state, camY, camZ, targetY);

  }, [state, metrics, viewType]);

  const blurFilterId = "motionBlurFilter";

  const blurStyle = useMemo(() => {
    if (viewType === 'free') return {};
    
    const lin = metrics.linearBlurPx;
    const vib = metrics.vibrationBlurPx;

    if (lin < 0.5 && vib < 0.5) return {};

    const scale = 0.5; 
    const stdX = (lin + vib) * scale;
    const stdY = vib * scale;

    return { filter: `url(#${blurFilterId})` };
  }, [metrics, viewType]);

  const noiseOpacity = Math.min(Math.max(state.gain / 40, 0), 0.6);

  const roiStyle: React.CSSProperties = {
    left: `${(state.roiX - state.roiW/2) * 100}%`,
    top: `${(state.roiY - state.roiH/2) * 100}%`,
    width: `${state.roiW * 100}%`,
    height: `${state.roiH * 100}%`,
  };

  // Determine Overlay Color for Lens Filter
  const filterOverlayColor = useMemo(() => {
      if (viewType === 'free') return null; // Only apply to camera view
      switch (state.lensFilter) {
          case LensFilter.Red: return 'rgb(255, 0, 0)';
          case LensFilter.Blue: return 'rgb(0, 0, 255)';
          case LensFilter.Green: return 'rgb(0, 255, 0)';
          default: return null;
      }
  }, [state.lensFilter, viewType]);

  const currentStdDev = useMemo(() => {
     const lin = metrics.linearBlurPx;
     const vib = metrics.vibrationBlurPx;
     const scale = 0.5;
     const stdX = Math.max((lin + vib) * scale, 0);
     const stdY = Math.max(vib * scale, 0);
     return `${stdX} ${stdY}`;
  }, [metrics]);

  return (
    <div 
      className="w-full h-full relative bg-black group outline-none overflow-hidden cursor-crosshair" 
      tabIndex={0}
      onClick={handleCanvasClick}
      title={viewType === 'free' ? "Click on objects to edit settings" : "Click to view settings"}
    >
      
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id={blurFilterId}>
             <feGaussianBlur in="SourceGraphic" stdDeviation={currentStdDev} />
          </filter>
        </defs>
      </svg>

      <div 
        ref={containerRef} 
        className="w-full h-full transition duration-100" 
        style={blurStyle}
      />

      {/* FILTER OVERLAY (Multiply Blend) */}
      {filterOverlayColor && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-multiply z-10"
            style={{ backgroundColor: filterOverlayColor }}
          />
      )}

      {viewType === 'camera' && noiseOpacity > 0 && (
         <div 
           className="absolute inset-0 pointer-events-none mix-blend-screen"
           style={{ 
             opacity: noiseOpacity,
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
           }}
         />
      )}
      
      {viewType === 'camera' && (
        <div className="absolute inset-0 pointer-events-none">
           <div 
             className="absolute border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
             style={{
                 ...roiStyle,
                 boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
             }}
           >
             <div className="absolute -top-6 left-0 text-cyan-400 text-[10px] font-bold tracking-widest bg-black/50 px-1 rounded">ROI</div>
           </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-slate-200 p-3 rounded-md text-xs font-mono border border-slate-700 pointer-events-none select-none z-10 shadow-lg">
        <div className={`font-bold mb-2 ${viewType === 'camera' ? 'text-emerald-400' : 'text-indigo-400'} flex items-center gap-2`}>
           <div className={`w-2 h-2 rounded-full ${viewType === 'camera' ? 'bg-emerald-500' : 'bg-indigo-500'} animate-pulse`} />
          {viewType === 'camera' ? t.hudSensor : t.hudWorld}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
          <span>{t.hudExp}:</span> <span className="text-slate-200 text-right">{(state.exposureTime/1000).toFixed(1)}ms</span>
          <span>{t.hudGain}:</span> <span className="text-slate-200 text-right">{rendererRef.current?.toneMappingExposure.toFixed(1) || '1.0'}</span>
          <span>{t.hudFps}:</span> <span className="text-slate-200 text-right">{Math.min(1000000/state.exposureTime, 60).toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEXTURE GENERATION HELPERS
// ==========================================

// Helper to create bump maps for text (Embossed/Debossed)
function createHeightMapTexture(
  drawCallback: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
      // Base Grey (Mid-point)
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, 512, 512);
      drawCallback(ctx, 512, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace; // Important for bump/normal maps
  return tex;
}

// Helper to create Albedo maps (Color)
function createAlbedoTexture(
    drawCallback: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#94a3b8'; // Base material color
        ctx.fillRect(0, 0, 512, 512);
        drawCallback(ctx, 512, 512);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function createEmbossedTexture(): THREE.Texture {
    return createHeightMapTexture((ctx, w, h) => {
        // Lighter than grey = Raised
        ctx.fillStyle = '#e0e0e0'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = 'bold 80px Arial';
        ctx.fillText('VISION', w/2, h*0.3);

        ctx.font = 'bold 120px Arial';
        ctx.fillText('1.0', w/2, h*0.55);

        ctx.font = 'bold 60px Arial';
        ctx.fillText('SERIES A', w/2, h*0.8);
        
        // Frame
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#c0c0c0';
        ctx.strokeRect(20, 20, w-40, h-40);
    });
}

function createDebossedTexture(): THREE.Texture {
    return createHeightMapTexture((ctx, w, h) => {
        // Darker than grey = Sunken
        ctx.fillStyle = '#303030';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = 'bold 100px Arial';
        ctx.fillText('QC', w/2, h*0.35);

        ctx.font = 'bold 60px Arial';
        ctx.fillText('PASSED', w/2, h*0.6);
        
        // Deep groove lines
        ctx.strokeStyle = '#202020';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(50, h*0.8);
        ctx.lineTo(w-50, h*0.8);
        ctx.stroke();
    });
}

function createMixedTexture(): THREE.Texture {
    return createHeightMapTexture((ctx, w, h) => {
        // Raised (White)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(w*0.3, h*0.3, 60, 0, Math.PI*2);
        ctx.fill();

        // Sunken (Black)
        ctx.fillStyle = '#000000';
        ctx.fillRect(w*0.5, h*0.5, 120, 120);
        
        // Raised Text
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 60px Arial';
        ctx.fillText('MIXED', 100, h*0.8);
    });
}

function createScratchesTexture(): THREE.Texture {
    return createHeightMapTexture((ctx, w, h) => {
        ctx.strokeStyle = '#a0a0a0'; // Slight raise (burr)
        ctx.lineWidth = 1;
        for(let i=0; i<30; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random()*w, Math.random()*h);
            ctx.bezierCurveTo(Math.random()*w, Math.random()*h, Math.random()*w, Math.random()*h, Math.random()*w, Math.random()*h);
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#404040'; // Deep scratch
        ctx.lineWidth = 2;
        for(let i=0; i<10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random()*w, Math.random()*h);
            ctx.lineTo(Math.random()*w, Math.random()*h);
            ctx.stroke();
        }
    });
}

function createDotMatrixTexture(): THREE.Texture {
    return createAlbedoTexture((ctx, w, h) => {
        ctx.fillStyle = '#111111'; // Black Ink
        
        // Helper to simulate dot matrix text
        const drawDotText = (text: string, x: number, y: number, scale: number) => {
            const fontMap: any = {
                'L': [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
                'O': [[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[3,3],[1,4],[2,4]],
                'T': [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
                'E': [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4],[1,4],[2,4]],
                ':': [[1,1],[1,3]],
                ' ': [],
                '2': [[0,0],[1,0],[2,0],[2,1],[2,2],[1,2],[0,2],[0,3],[0,4],[1,4],[2,4]],
                '4': [[0,0],[0,1],[0,2],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],
                '/': [[3,0],[2,1],[1,2],[0,3]],
                '1': [[1,0],[0,1],[1,1],[1,2],[1,3],[0,4],[1,4],[2,4]],
                '0': [[1,0],[2,0],[0,1],[3,1],[0,2],[3,2],[0,3],[3,3],[1,4],[2,4]],
                'V': [[0,0],[0,1],[0,2],[1,3],[2,4],[3,3],[4,2],[4,1],[4,0]],
                'A': [[1,0],[2,0],[0,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[3,3],[0,4],[3,4]],
                '8': [[1,0],[2,0],[0,1],[3,1],[1,2],[2,2],[0,3],[3,3],[1,4],[2,4]],
            };
            
            let cursorX = x;
            
            for(let i=0; i<text.length; i++) {
                const char = text[i].toUpperCase();
                const points = fontMap[char] || []; // Fallback empty
                
                points.forEach((p: number[]) => {
                    ctx.beginPath();
                    ctx.arc(cursorX + p[0]*scale, y + p[1]*scale, scale*0.45, 0, Math.PI*2);
                    ctx.fill();
                });
                cursorX += scale * 5; // Spacing
            }
        };
        
        // Calculate appropriate scale and position to fit within width (512)
        // With scale 8, charWidth is 40. "LOTE: 24/10" is 11 chars => 440px. Fits with margins.
        const scale = 8;
        const charWidth = 5 * scale;
        
        const text1 = "LOTE: 24/10";
        const width1 = text1.length * charWidth;
        const x1 = (w - width1) / 2;
        
        const text2 = "VAL: 2028";
        const width2 = text2.length * charWidth;
        const x2 = (w - width2) / 2;

        drawDotText(text1, x1, 150, scale);
        drawDotText(text2, x2, 300, scale);
    });
}

// Level 1: Low (Chromatic Grain / RGB Noise)
function createLevel1Texture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0,512,512);
        for(let i=0; i<30000; i++) {
           const r = Math.floor(Math.random() * 150);
           const g = Math.floor(Math.random() * 150);
           const b = Math.floor(Math.random() * 150);
           ctx.fillStyle = `rgba(${r},${g},${b},0.3)`; 
           ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

// Level 2: Medium (Colored Geometric Clutter)
function createLevel2Texture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
         ctx.fillStyle = '#1a1a1a';
         ctx.fillRect(0,0,512,512);
         const colors = ['#8b4513', '#cd853f', '#eebb00', '#4682b4', '#708090', '#556b2f'];
         for(let i=0; i<40; i++) {
             ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
             ctx.fillRect(Math.random()*512, Math.random()*512, 20 + Math.random()*100, 20 + Math.random()*100);
         }
         ctx.fillStyle = 'rgba(0,0,0,0.3)';
         for(let i=0; i<10; i++) {
             ctx.fillRect(Math.random()*512, 0, Math.random()*50, 512);
         }
    }
    return new THREE.CanvasTexture(canvas);
}

// Level 3: High (Intense Multi-Colored Chaos)
function createLevel3Texture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,512,512);
        for(let i=0; i<2000; i++) {
             const hue = Math.floor(Math.random() * 360);
             ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
             const s = 2 + Math.random() * 6;
             ctx.fillRect(Math.random()*512, Math.random()*512, s, s);
        }
        ctx.lineWidth = 2;
        for(let i=0; i<30; i++) {
            const hue = Math.floor(Math.random() * 360);
            ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
            ctx.beginPath();
            ctx.moveTo(Math.random()*512, Math.random()*512);
            ctx.lineTo(Math.random()*512, Math.random()*512);
            ctx.stroke();
        }
        for(let i=0; i<5; i++) {
            const hue = Math.floor(Math.random() * 360);
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
            const x = Math.random()*512;
            const y = Math.random()*512;
            const r = 50 + Math.random()*100;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    return new THREE.CanvasTexture(canvas);
}

function getLightColorHex(c: LightColor): number {
  switch(c) {
      case LightColor.Red: return 0xff2222;
      case LightColor.Blue: return 0x2266ff;
      case LightColor.IR: return 0xaaaaaa;
      case LightColor.UV: return 0x8800ff;
      default: return 0xffffff; 
  }
}

function createCameraModel(): THREE.Group {
  const group = new THREE.Group();
  const bodyGeo = new THREE.BoxGeometry(40, 40, 60);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.z = -30;
  group.add(body);
  const lensGeo = new THREE.CylinderGeometry(15, 15, 30, 32);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 15; 
  group.add(lens);
  const glassGeo = new THREE.SphereGeometry(14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2);
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff, metalness: 0, roughness: 0, transmission: 0.9, transparent: true 
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = 30;
  glass.rotation.x = Math.PI / 2;
  group.add(glass);
  return group;
}

function createEtchedTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
      ctx.fillStyle = '#111111'; 
      ctx.fillRect(0, 0, 256, 256);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 50px Consolas, monospace';
      ctx.fillStyle = '#9ca3af'; 
      ctx.fillText('FPGA', 128, 80);
      ctx.font = '30px Consolas, monospace';
      ctx.fillStyle = '#64748b'; 
      ctx.fillText('X-2048', 128, 140);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#475569';
      ctx.fillText('TAIWAN', 128, 190);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBeerLabelTexture(name: string, subtext: string, hue: number): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1024, 0);
        grad.addColorStop(0, `hsl(${hue}, 80%, 20%)`);
        grad.addColorStop(0.3, `hsl(${hue}, 70%, 30%)`);
        grad.addColorStop(0.5, `hsl(${hue}, 60%, 45%)`);
        grad.addColorStop(0.7, `hsl(${hue}, 70%, 30%)`);
        grad.addColorStop(1, `hsl(${hue}, 80%, 20%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
        
        ctx.strokeStyle = '#d4af37'; 
        ctx.lineWidth = 15;
        ctx.strokeRect(20, 20, 984, 472);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 120px Serif';
        ctx.fillText(name.toUpperCase(), 512, 200);
        
        ctx.fillStyle = '#facc15';
        ctx.font = 'italic 60px Sans-serif';
        ctx.fillText(subtext, 512, 320);

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '30px Monospace';
        ctx.fillText('ALC 5.2% VOL | 330ML', 512, 420);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function createCrownCapTexture(color: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = color; 
        ctx.fillRect(0,0,512,512);

        for(let i=0; i<100; i++) {
           ctx.fillStyle = 'rgba(255,255,255,0.05)';
           const x = Math.random() * 512;
           const y = Math.random() * 512;
           const w = Math.random() * 50;
           const h = 1;
           ctx.fillRect(x,y,w,h);
        }

        ctx.beginPath();
        ctx.arc(256, 256, 180, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.font = 'bold 200px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VD', 256, 256); 
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function createRealisticCrownCap(radius: number): THREE.Group {
  const group = new THREE.Group();
  const topHeight = radius * 0.15;
  const topGeo = new THREE.CylinderGeometry(radius, radius, topHeight, 32);
  const topMat = new THREE.MeshStandardMaterial({ 
      map: createCrownCapTexture('#dc2626'),
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = topHeight/2;
  top.receiveShadow = true;
  top.castShadow = true;
  group.add(top);

  const skirtHeight = radius * 0.3;
  const skirtGeo = new THREE.CylinderGeometry(radius, radius * 1.05, skirtHeight, 21, 1, true);
  const skirtMat = new THREE.MeshStandardMaterial({ 
      color: 0xdca5a5, 
      roughness: 0.4, 
      metalness: 0.7,
      side: THREE.DoubleSide
  });
  const skirt = new THREE.Mesh(skirtGeo, skirtMat);
  skirt.position.y = -skirtHeight/2;
  skirt.receiveShadow = true;
  skirt.castShadow = true;
  group.add(skirt);
  return group;
}

function updateObject(group: THREE.Group, state: SimulationState) {
  const type = state.objectType;
  const orientation = state.objectOrientation;

  while(group.children.length > 0){ 
    const child = group.children[0];
    group.remove(child);
    if ((child as any).geometry) (child as any).geometry.dispose();
    if ((child as any).material) {
        if (Array.isArray((child as any).material)) (child as any).material.forEach((m:any) => m.dispose());
        else (child as any).material.dispose();
    }
  }

  group.rotation.set(0,0,0);
  
  if (orientation === 'Custom') {
     group.position.set(state.objectShiftX, state.objectShiftY, state.objectShiftZ);
     const rx = (state.objectRotX * Math.PI) / 180;
     const ry = (state.objectRotY * Math.PI) / 180;
     const rz = (state.objectRotZ * Math.PI) / 180;
     group.rotation.set(rx, ry, rz);
  } else {
     group.position.set(0,0,0);
     if (orientation === 'Side') group.rotation.y = -Math.PI / 2;
     else if (orientation === 'Back') group.rotation.y = Math.PI;
     else if (orientation === 'Top') group.rotation.x = Math.PI / 2; 
     else if (orientation === 'Bottom') group.rotation.x = -Math.PI / 2;
  }

  const setShadows = (mesh: THREE.Object3D) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  const dim = OBJECT_DIMS[type];

  if (type === ObjectType.PCB) {
     const board = new THREE.Mesh(new THREE.BoxGeometry(dim.w, dim.h, dim.depth), new THREE.MeshStandardMaterial({ color: 0x1a472a, roughness: 0.7 })); 
     setShadows(board);
     group.add(board);
     const chip = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
     chip.position.z = dim.depth/2 + 1.5;
     setShadows(chip);
     group.add(chip);
     
     const labelGeo = new THREE.PlaneGeometry(16, 16);
     const labelMat = new THREE.MeshStandardMaterial({ 
         map: createEtchedTexture(),
         roughness: 0.8, 
         metalness: 0.2,
         polygonOffset: true,
         polygonOffsetFactor: -1
     });
     const label = new THREE.Mesh(labelGeo, labelMat);
     label.position.set(0, 0, dim.depth/2 + 3.01);
     label.receiveShadow = true; 
     group.add(label);

     const padMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.3 }); 
     for(let i=0; i<5; i++) {
         const pad = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.5), padMat);
         pad.position.set(-30, (i-2)*10, dim.depth/2 + 0.25);
         setShadows(pad);
         group.add(pad);
     }
  } 
  else if (type === ObjectType.GlassBottle) {
      const h = dim.h;
      const r = dim.w / 2;
      const points = [];
      points.push(new THREE.Vector2(0, 0)); 
      points.push(new THREE.Vector2(r * 0.7, 0));
      points.push(new THREE.Vector2(r * 0.95, r * 0.25)); 
      points.push(new THREE.Vector2(r, h * 0.55));
      points.push(new THREE.Vector2(r * 0.35, h * 0.75)); 
      points.push(new THREE.Vector2(r * 0.32, h * 0.95)); 
      points.push(new THREE.Vector2(r * 0.4, h * 0.96)); 
      points.push(new THREE.Vector2(r * 0.4, h * 0.99)); 
      points.push(new THREE.Vector2(r * 0.32, h)); 
      points.push(new THREE.Vector2(0, h));

      const glassGeo = new THREE.LatheGeometry(points, 64);
      const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transmission: 1.0,
          opacity: 1,
          metalness: 0.0,
          roughness: 0.0, 
          ior: 1.5,
          thickness: 2.0, 
          attenuationColor: new THREE.Color(0xcc7a00),
          attenuationDistance: 40.0, 
          side: THREE.DoubleSide
      });
      const bottle = new THREE.Mesh(glassGeo, glassMat);
      setShadows(bottle);
      
      const liqPoints = points.slice(0, 5).map(p => new THREE.Vector2(p.x * 0.88, p.y < h*0.7 ? p.y + 2 : h*0.7));
      const liqGeo = new THREE.LatheGeometry(liqPoints, 32);
      const liqMat = new THREE.MeshPhysicalMaterial({ 
          color: 0x331a00,
          transmission: 0.5,
          roughness: 0.1,
          metalness: 0,
          ior: 1.33
      });
      const liquid = new THREE.Mesh(liqGeo, liqMat);
      liquid.scale.set(0.95, 0.95, 0.95);
      setShadows(liquid);

      const labelGeo = new THREE.CylinderGeometry(r + 0.1, r + 0.1, h * 0.3, 64, 1, true);
      const labelMat = new THREE.MeshStandardMaterial({ 
          map: createBeerLabelTexture("SimulBrew", "Premium Lager", 25), 
          transparent: true,
          side: THREE.DoubleSide,
          roughness: 0.4
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.y = h * 0.35;
      label.rotation.y = -Math.PI / 2;
      label.receiveShadow = true;

      const capGroup = createRealisticCrownCap(r * 0.35);
      capGroup.position.y = h;
      capGroup.traverse((obj) => { if(obj instanceof THREE.Mesh) setShadows(obj); });
      
      const bottleGroup = new THREE.Group();
      bottleGroup.add(bottle);
      bottleGroup.add(liquid);
      bottleGroup.add(label);
      bottleGroup.add(capGroup);

      bottleGroup.position.y = -h/2;
      group.add(bottleGroup);
  }
  else if (type === ObjectType.AluminumCan) {
      const h = dim.h;
      const r = dim.w / 2;
      const aluMat = new THREE.MeshStandardMaterial({
           color: 0xffffff,
           map: createBeerLabelTexture("RoboHops", "Neural IPA", 200),
           metalness: 0.6,
           roughness: 0.35, 
      });
      const topMat = new THREE.MeshStandardMaterial({ 
          color: 0xe5e5e5, 
          metalness: 0.9, 
          roughness: 0.2,
      });

      const bodyH = h * 0.8;
      const bodyGeo = new THREE.CylinderGeometry(r, r, bodyH, 64);
      const body = new THREE.Mesh(bodyGeo, aluMat);
      body.rotation.y = -Math.PI/2;
      setShadows(body);
      
      const taperH = h * 0.08;
      const bottomGeo = new THREE.CylinderGeometry(r, r * 0.7, taperH, 64);
      const bottom = new THREE.Mesh(bottomGeo, topMat);
      bottom.position.y = -bodyH/2 - taperH/2;
      setShadows(bottom);
      
      const topGeo = new THREE.CylinderGeometry(r * 0.8, r, taperH, 64);
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = bodyH/2 + taperH/2;
      setShadows(top);

      const rimGeo = new THREE.TorusGeometry(r * 0.8, 1.2, 16, 100);
      const rim = new THREE.Mesh(rimGeo, topMat);
      rim.rotation.x = Math.PI/2;
      rim.position.y = bodyH/2 + taperH;
      setShadows(rim);

      const lidGeo = new THREE.CircleGeometry(r*0.78, 64);
      const lid = new THREE.Mesh(lidGeo, topMat);
      lid.rotation.x = -Math.PI/2;
      lid.position.y = bodyH/2 + taperH - 0.5;
      lid.receiveShadow = true;

      const tabGeo = new THREE.BoxGeometry(10, 1, 15);
      const tab = new THREE.Mesh(tabGeo, topMat);
      tab.position.y = bodyH/2 + taperH + 1;
      tab.position.z = 5;
      setShadows(tab);

      const canGroup = new THREE.Group();
      canGroup.add(body);
      canGroup.add(bottom);
      canGroup.add(top);
      canGroup.add(rim);
      canGroup.add(lid);
      canGroup.add(tab);
      group.add(canGroup);
  }
  else if (type === ObjectType.MatteBlock) {
      // Define specific materials for each face of the block
      
      const baseMaterialProps = {
        color: 0x94a3b8,
        roughness: 0.9,
        metalness: 0.1,
      };

      // 1. Right (px): Mixed Relief
      const matRight = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          bumpMap: createMixedTexture(),
          bumpScale: 1.0,
      });

      // 2. Left (nx): Smooth
      const matLeft = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
      });

      // 3. Top (py): Scratches
      const matTop = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          bumpMap: createScratchesTexture(),
          bumpScale: 0.5,
      });

      // 4. Bottom (ny): Dot Matrix Print
      const matBottom = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          map: createDotMatrixTexture(),
      });

      // 5. Front (pz): Embossed / Auto-relevo
      const matFront = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          bumpMap: createEmbossedTexture(),
          bumpScale: 1.0, 
      });

      // 6. Back (nz): Debossed / Baixo-relevo
      const matBack = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          bumpMap: createDebossedTexture(),
          bumpScale: 1.0, // Black in texture pushes down relative to grey
      });

      // Array order for BoxGeometry: Right, Left, Top, Bottom, Front, Back
      const materials = [matRight, matLeft, matTop, matBottom, matFront, matBack];

      const block = new THREE.Mesh(
          new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
          materials
      );
      setShadows(block);
      group.add(block);
  }
  else if (type === ObjectType.BottleCap) {
      const cap = createRealisticCrownCap(dim.w / 2);
      cap.rotation.x = -Math.PI/2; 
      cap.traverse((obj) => { if(obj instanceof THREE.Mesh) setShadows(obj); });
      group.add(cap);
  }
}

function updateLights(group: THREE.Group, state: SimulationState, camY: number, camZ: number, targetY: number) {
  while(group.children.length > 0){ group.remove(group.children[0]); }
  
  const globalInt = state.globalIntensity / 100;
  
  const multiplier = state.lightMultiplier || 1;
  const intensityPercent = state.lightIntensity;
  const baseIntensity = (intensityPercent / 100) * multiplier;
  const colorHex = getLightColorHex(state.lightColor);

  if (state.globalEnv === GlobalEnv.Studio) {
      const bounceIntensity = baseIntensity * 0.15;
      if (bounceIntensity > 0.01) {
          const bounce = new THREE.HemisphereLight(colorHex, 0x111111, bounceIntensity);
          group.add(bounce);
      } else {
          const studioAmb = new THREE.AmbientLight(0xffffff, 0.01);
          group.add(studioAmb);
      }

  } 
  else if (state.globalEnv === GlobalEnv.Factory) {
      const hemi = new THREE.HemisphereLight(0xddeeff, 0x333333, globalInt * 1.0);
      group.add(hemi);
      const topFill = new THREE.DirectionalLight(0xffffff, globalInt * 0.5);
      topFill.position.set(50, 200, 50);
      group.add(topFill);
  } 
  else if (state.globalEnv === GlobalEnv.Sunlight) {
      const hemi = new THREE.HemisphereLight(0xffffee, 0x443322, globalInt * 0.5);
      group.add(hemi);
      const sun = new THREE.DirectionalLight(0xfff0dd, globalInt * 3.0);
      sun.position.set(100, 200, 100);
      sun.castShadow = true;
      group.add(sun);
  }
  
  const dist = state.lightDistance || 200;
  
  const configShadow = (light: THREE.Light) => {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.bias = -0.0001;
  };

  const SPOT_SCALE = 400.0;
  const targetVec = new THREE.Vector3(0, targetY, 0);
  const fixture = state.lightType;

  if (fixture === LightFixture.Dome || fixture === LightFixture.Tunnel) {
       const isTunnel = fixture === LightFixture.Tunnel;
       const geo = isTunnel 
           ? new THREE.CylinderGeometry(dist, dist, dist*3, 32, 1, true)
           : new THREE.SphereGeometry(dist, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);

       const mat = new THREE.MeshBasicMaterial({
           color: colorHex,
           side: THREE.BackSide, 
           transparent: true,
           opacity: 0.1 + (intensityPercent/100 * 0.3), 
       });
       const domeMesh = new THREE.Mesh(geo, mat);
       if (isTunnel) {
           domeMesh.rotation.z = Math.PI / 2;
           domeMesh.position.y = targetY;
       } else {
           domeMesh.position.y = targetY;
       }
       group.add(domeMesh);

       const hemi = new THREE.HemisphereLight(colorHex, 0x050505, baseIntensity * 5.0);
       group.add(hemi);
       
       const dl = new THREE.DirectionalLight(colorHex, baseIntensity * 2.0);
       dl.position.set(0, 200, 0);
       dl.target.position.copy(targetVec);
       group.add(dl);
       group.add(dl.target);
  }
  else if (fixture === LightFixture.Panel && state.lightPosition === LightPosition.Back) {
      const objDim = OBJECT_DIMS[state.objectType];
      const zPos = - (objDim.depth/2) - dist;
      const panelGeo = new THREE.PlaneGeometry(400, 400);
      const panelMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, targetY, zPos); 
      group.add(panel);
      const dl = new THREE.DirectionalLight(colorHex, baseIntensity * 10.0);
      dl.position.set(0, targetY, zPos + 10);
      dl.target.position.set(0, targetY, 200);
      group.add(dl);
      group.add(dl.target);
  }
  else if (fixture === LightFixture.Coaxial) {
      const dl = new THREE.DirectionalLight(colorHex, baseIntensity * 5.0); 
      dl.position.set(0, camY, camZ);
      dl.target.position.copy(targetVec);
      configShadow(dl);
      group.add(dl);
      group.add(dl.target);
      const box = new THREE.Mesh(new THREE.BoxGeometry(40, 40, 60), new THREE.MeshBasicMaterial({ color: 0x333333 }));
      box.position.set(30, camY, camZ - 50);
      group.add(box);
  }
  else if (fixture === LightFixture.Spot) {
      const fixtureGroup = new THREE.Group();
      let x=0, y=targetY, z=0;
      if (state.lightPosition === LightPosition.Top) { x=0; y=targetY+dist; z=0; }
      else if (state.lightPosition === LightPosition.Side) { x=dist; y=targetY; z=0; }
      else { 
           x=0; y=targetY+dist; z=0;
      }
      fixtureGroup.position.set(x, y, z);
      fixtureGroup.lookAt(targetVec);
      group.add(fixtureGroup);

      const s = new THREE.SpotLight(colorHex, baseIntensity * SPOT_SCALE);
      s.position.set(0, 0, 0);
      s.target.position.set(0, 0, 100); 
      s.angle = state.lightConfig === LightConfig.Narrow ? 0.25 : 0.5;
      s.penumbra = 0.3;
      s.decay = 2; 
      s.distance = dist * 4; 
      configShadow(s);
      fixtureGroup.add(s);
      fixtureGroup.add(s.target);
      const bulb = new THREE.Mesh(new THREE.CylinderGeometry(5, 10, 15), new THREE.MeshBasicMaterial({ color: colorHex }));
      bulb.rotation.x = Math.PI / 2;
      fixtureGroup.add(bulb);
  }
  else if (fixture === LightFixture.Ring) {
      const isLowAngle = state.lightPosition === LightPosition.LowAngle;
      const ringGroup = new THREE.Group();
      if (isLowAngle) {
          const r = Math.max(dist, 60);
          ringGroup.position.set(0, targetY, 0);
          group.add(ringGroup);
          const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 4, 8, 32), new THREE.MeshBasicMaterial({ color: colorHex }));
          torus.rotation.x = Math.PI / 2;
          ringGroup.add(torus);
          const count = 8;
          for(let i=0; i<count; i++) {
              const a = (i/count) * Math.PI * 2;
              const sx = Math.cos(a) * r;
              const sz = Math.sin(a) * r;
              const s = new THREE.SpotLight(colorHex, baseIntensity * SPOT_SCALE * 0.4); 
              s.position.set(sx, 5, sz);
              s.target.position.set(0, 0, 0);
              s.angle = 0.5;
              s.penumbra = 0.5;
              s.decay = 2;
              s.distance = 200; 
              configShadow(s);
              ringGroup.add(s);
              ringGroup.add(s.target);
          }
      } else {
          const camVec = new THREE.Vector3(0, camY - targetY, camZ).normalize();
          const ringPos = camVec.clone().multiplyScalar(dist).add(new THREE.Vector3(0, targetY, 0));
          ringGroup.position.copy(ringPos);
          ringGroup.lookAt(targetVec);
          group.add(ringGroup);
          const r = 45;
          const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 8, 8, 32), new THREE.MeshBasicMaterial({ color: colorHex }));
          ringGroup.add(torus);
          const count = 6;
          for(let i=0; i<count; i++) {
              const a = (i/count) * Math.PI * 2;
              const sx = Math.cos(a) * r;
              const sy = Math.sin(a) * r;
              const s = new THREE.SpotLight(colorHex, baseIntensity * SPOT_SCALE * 0.3);
              s.position.set(sx, sy, 0);
              s.target.position.set(sx * 0.8, sy * 0.8, 100); 
              s.angle = 0.6;
              s.penumbra = 0.5;
              s.decay = 2;
              s.distance = dist * 3;
              configShadow(s);
              ringGroup.add(s);
              ringGroup.add(s.target);
          }
      }
  }
  else if (fixture === LightFixture.Bar) {
      const len = 100;
      const width = 20;

      const addBarToGroup = (parent: THREE.Group, localPos: THREE.Vector3, rollRad: number) => {
           const barWrapper = new THREE.Group();
           barWrapper.position.copy(localPos);
           barWrapper.lookAt(0,0,0); 
           barWrapper.rotateZ(rollRad); 
           parent.add(barWrapper);
           const face = new THREE.Mesh(new THREE.PlaneGeometry(len, width), new THREE.MeshBasicMaterial({ color: colorHex }));
           face.position.z = 1; 
           barWrapper.add(face);
           const box = new THREE.Mesh(new THREE.BoxGeometry(len+2, width+2, 5), new THREE.MeshBasicMaterial({ color: 0x333333 }));
           box.position.z = -2;
           barWrapper.add(box);
           for(let k=-1; k<=1; k++) {
              const s = new THREE.SpotLight(colorHex, baseIntensity * SPOT_SCALE * 0.3);
              s.position.set(k * 30, 0, 2);
              s.target.position.set(k * 30, 0, 100); 
              s.angle = 0.9;
              s.penumbra = 0.4;
              s.decay = 2;
              s.distance = dist * 4;
              configShadow(s);
              barWrapper.add(s);
              barWrapper.add(s.target);
           }
      };

      if (state.lightPosition === LightPosition.LowAngle) {
          const fixtureGroup = new THREE.Group();
          fixtureGroup.position.copy(targetVec); 
          
          // FIX: Align the fixture group to face the camera.
          // This ensures the "ring" of bars is perpendicular to the viewing angle,
          // creating the "Axial" effect (grazing the face seen by camera).
          fixtureGroup.lookAt(0, camY, camZ);
          
          group.add(fixtureGroup);
          
          const radius = Math.max(dist, 80);
          
          // Define angles in the local XY plane of the fixture group (the face of the object)
          // 0 = Right, PI/2 = Top, etc.
          const configs = {
              [LightConfig.Single]: [Math.PI/2], // Top
              [LightConfig.Dual]: [Math.PI/2, -Math.PI/2], // Top/Bottom
              [LightConfig.Quad]: [0, Math.PI/2, Math.PI, -Math.PI/2] // Square
          };
          const angles = configs[state.lightConfig] || [Math.PI/2];
          
          angles.forEach(ang => {
              const x = Math.cos(ang) * radius;
              const y = Math.sin(ang) * radius;
              
              // We place them on the local XY plane (Z=0)
              // We determine rotation (roll) to make them form a square border
              
              let roll = 0;
              // If the bar is at Left/Right (cos is dominant), we want it vertical.
              if (Math.abs(Math.cos(ang)) > 0.5) {
                 roll = Math.PI / 2;
              }
              
              addBarToGroup(fixtureGroup, new THREE.Vector3(x, y, 0), roll);
          });

      } else {
          let pos = new THREE.Vector3();
          if (state.lightPosition === LightPosition.Top) pos.set(0, dist, 0); 
          else if (state.lightPosition === LightPosition.Side) pos.set(dist, 0, 0);
          else if (state.lightPosition === LightPosition.Back) pos.set(0, 0, -dist);
          const objDim = OBJECT_DIMS[state.objectType];
          if (state.lightPosition === LightPosition.Top) pos.y += objDim.h/2;
          if (state.lightPosition === LightPosition.Side) pos.x += objDim.w/2;
          if (state.lightPosition === LightPosition.Back) pos.z -= objDim.depth/2;
          const absPos = pos.clone().add(targetVec);
          const fixtureGroup = new THREE.Group();
          fixtureGroup.position.copy(absPos);
          fixtureGroup.lookAt(targetVec);
          group.add(fixtureGroup);
          let baseRoll = 0; 
          if (state.lightPosition === LightPosition.Side) baseRoll = Math.PI / 2;
          if (state.lightConfig === LightConfig.Single) {
             addBarToGroup(fixtureGroup, new THREE.Vector3(0,0,0), baseRoll);
          }
          else if (state.lightConfig === LightConfig.Dual) {
             const offset = 60; 
             addBarToGroup(fixtureGroup, new THREE.Vector3(offset, 0, 0), baseRoll);
             addBarToGroup(fixtureGroup, new THREE.Vector3(-offset, 0, 0), baseRoll);
          }
          else if (state.lightConfig === LightConfig.Quad) {
             const offset = 70;
             addBarToGroup(fixtureGroup, new THREE.Vector3(offset, offset, 0), baseRoll);
             addBarToGroup(fixtureGroup, new THREE.Vector3(-offset, offset, 0), baseRoll);
             addBarToGroup(fixtureGroup, new THREE.Vector3(offset, -offset, 0), baseRoll);
             addBarToGroup(fixtureGroup, new THREE.Vector3(-offset, -offset, 0), baseRoll);
          }
      }
  }
}

export default SimulatedImage;