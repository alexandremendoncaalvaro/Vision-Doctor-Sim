import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimulationState, OpticalMetrics, LightColor, LightType, ObjectType, Language } from '../types';
import { OBJECT_DIMS } from '../constants';
import { TEXTS } from '../translations';

interface SimulatedImageProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  viewType: 'camera' | 'free';
  language: Language;
}

const SimulatedImage: React.FC<SimulatedImageProps> = ({ state, metrics, viewType, language }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = TEXTS[language];
  
  // Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); 
  const freeCameraRef = useRef<THREE.PerspectiveCamera | null>(null); 
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  // State Refs
  const viewTypeRef = useRef(viewType);
  const keysPressed = useRef<Set<string>>(new Set());

  // Scene Objects Refs
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const camModelRef = useRef<THREE.Group | null>(null);

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

    // --- ENVIRONMENT MAP (CRITICAL FOR GLASS/METAL) ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    scene.background = new THREE.Color('#050505');

    const controls = new OrbitControls(freeCam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    const objectGroup = new THREE.Group();
    scene.add(objectGroup);
    objectGroupRef.current = objectGroup;

    const camModel = createCameraModel();
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

  // --- UPDATES ---

  // 1. Background Update
  useEffect(() => {
    if (sceneRef.current) {
       // We keep the environment for reflections, but change the visible background
       sceneRef.current.background = new THREE.Color(state.backgroundColor);
    }
  }, [state.backgroundColor]);

  // 2. Exposure Physics Update
  useEffect(() => {
    if (rendererRef.current) {
       const baseExposure = 1.0;
       const timeFactor = state.exposureTime / 5000;
       const apertureFactor = Math.pow(2.8, 2) / Math.pow(state.aperture, 2);
       const gainFactor = Math.pow(10, state.gain / 20);
       const calculatedExposure = baseExposure * timeFactor * apertureFactor * gainFactor;
       
       rendererRef.current.toneMappingExposure = calculatedExposure;
    }
  }, [state.exposureTime, state.aperture, state.gain]);

  // 3. Scene Objects & Lights & Camera Pose Update
  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current || !objectGroupRef.current || !camModelRef.current || !cameraRef.current) return;

    const objectHeight = OBJECT_DIMS[state.objectType].h;
    
    // Calculate Target Y based on Focus
    let targetY = 0;
    if (state.viewFocus === 'Top') targetY = objectHeight * 0.45; // slightly below absolute top
    else if (state.viewFocus === 'Bottom') targetY = -objectHeight * 0.45;
    else if (state.viewFocus === 'Middle') targetY = 0;
    else if (state.viewFocus === 'Whole') targetY = 0;

    const angleRad = (state.cameraAngle * Math.PI) / 180;
    
    // Camera is positioned relative to the Target
    // If we look at the top, the camera moves up.
    // CamY = TargetY + WD * sin(angle)
    // CamZ = TargetZ + WD * cos(angle)
    
    const camY = targetY + (state.workingDistance * Math.sin(angleRad));
    const camZ = state.workingDistance * Math.cos(angleRad);
    
    cameraRef.current.position.set(0, camY, camZ);
    cameraRef.current.lookAt(0, targetY, 0);

    const fovDeg = 2 * Math.atan((metrics.fovHeight / 2) / state.workingDistance) * (180 / Math.PI);
    cameraRef.current.fov = fovDeg;
    cameraRef.current.updateProjectionMatrix();

    // Move Camera Model visual to match
    camModelRef.current.position.set(0, camY, camZ);
    camModelRef.current.lookAt(0, targetY, 0);
    camModelRef.current.visible = viewType === 'free'; 

    updateObject(objectGroupRef.current, state.objectType, state.objectOrientation);
    
    // Lights typically move with the camera (Ring/Coax) or stay fixed relative to world center (Backlight)
    // We pass camY/camZ which are the camera coordinates.
    // However, if we move the camera up to inspect the Top, the Ring Light should follow.
    updateLights(lightsGroupRef.current, state, camY, camZ, targetY);

  }, [state, metrics, viewType]);

  // --- BLUR CALCULATION ---
  const blurStyle = useMemo(() => {
    if (viewType === 'free') return {};
    const totalBlurPx = metrics.motionBlurPx;
    if (totalBlurPx < 0.5) return {};
    return { filter: `blur(${Math.min(totalBlurPx, 20)}px)` };
  }, [metrics.motionBlurPx, viewType]);

  const noiseOpacity = Math.min(Math.max(state.gain / 40, 0), 0.6);

  // --- ROI STYLE ---
  const roiStyle: React.CSSProperties = {
    left: `${(state.roiX - state.roiW/2) * 100}%`,
    top: `${(state.roiY - state.roiH/2) * 100}%`,
    width: `${state.roiW * 100}%`,
    height: `${state.roiH * 100}%`,
  };

  return (
    <div className="w-full h-full relative bg-black group outline-none overflow-hidden" tabIndex={0}>
      <div 
        ref={containerRef} 
        className="w-full h-full transition duration-100" 
        style={blurStyle}
      />

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

// --- HELPERS ---

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
  glass.lookAt(0,0,100);
  group.add(glass);
  return group;
}

function createEtchedTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
      ctx.fillStyle = '#111111'; // Match chip color
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
        grad.addColorStop(0.5, `hsl(${hue}, 60%, 45%)`); // Highlight
        grad.addColorStop(0.7, `hsl(${hue}, 70%, 30%)`);
        grad.addColorStop(1, `hsl(${hue}, 80%, 20%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);
        
        ctx.strokeStyle = '#d4af37'; // Gold
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

        // Scratches / imperfection
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

function updateObject(group: THREE.Group, type: ObjectType, orientation: string) {
  // Clear previous
  while(group.children.length > 0){ 
    const child = group.children[0];
    group.remove(child);
    if ((child as any).geometry) (child as any).geometry.dispose();
    if ((child as any).material) {
        if (Array.isArray((child as any).material)) (child as any).material.forEach((m:any) => m.dispose());
        else (child as any).material.dispose();
    }
  }

  // Set Rotation based on Orientation Presets
  // Default (Front) is 0,0,0
  group.rotation.set(0,0,0);
  
  if (orientation === 'Side') group.rotation.y = -Math.PI / 2;
  else if (orientation === 'Back') group.rotation.y = Math.PI;
  else if (orientation === 'Top') group.rotation.x = Math.PI / 2; // Lie down
  else if (orientation === 'Bottom') group.rotation.x = -Math.PI / 2;

  const dim = OBJECT_DIMS[type];

  if (type === ObjectType.PCB) {
     const board = new THREE.Mesh(new THREE.BoxGeometry(dim.w, dim.h, dim.depth), new THREE.MeshStandardMaterial({ color: 0x1a472a, roughness: 0.5 }));
     group.add(board);
     const chip = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
     chip.position.z = dim.depth/2 + 1.5;
     group.add(chip);
     
     const labelGeo = new THREE.PlaneGeometry(16, 16);
     const labelMat = new THREE.MeshStandardMaterial({ 
         map: createEtchedTexture(),
         roughness: 0.6,
         metalness: 0.2,
         polygonOffset: true,
         polygonOffsetFactor: -1
     });
     const label = new THREE.Mesh(labelGeo, labelMat);
     label.position.set(0, 0, dim.depth/2 + 3.01);
     group.add(label);

     const padMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1.0, roughness: 0.1 });
     for(let i=0; i<5; i++) {
         const pad = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.5), padMat);
         pad.position.set(-30, (i-2)*10, dim.depth/2 + 0.25);
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
          color: 0x8a4b00, 
          transmission: 0.98,
          opacity: 1,
          metalness: 0.0,
          roughness: 0.05, 
          ior: 1.5,
          thickness: 3.0, 
          attenuationColor: new THREE.Color('#3f2105'), 
          attenuationDistance: 25.0, 
          side: THREE.DoubleSide
      });
      const bottle = new THREE.Mesh(glassGeo, glassMat);
      
      const liqPoints = points.slice(0, 5).map(p => new THREE.Vector2(p.x * 0.88, p.y < h*0.7 ? p.y + 2 : h*0.7));
      const liqGeo = new THREE.LatheGeometry(liqPoints, 32);
      const liqMat = new THREE.MeshStandardMaterial({ 
          color: 0x1a0f00, 
          roughness: 0.3 
      });
      const liquid = new THREE.Mesh(liqGeo, liqMat);

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

      const capGroup = createRealisticCrownCap(r * 0.35);
      capGroup.position.y = h;
      
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
           metalness: 0.7, 
           roughness: 0.25,
           envMapIntensity: 1.2
      });
      const topMat = new THREE.MeshStandardMaterial({ 
          color: 0xe5e5e5, 
          metalness: 0.95, 
          roughness: 0.15,
          envMapIntensity: 1.5
      });

      const bodyH = h * 0.8;
      const bodyGeo = new THREE.CylinderGeometry(r, r, bodyH, 64);
      const body = new THREE.Mesh(bodyGeo, aluMat);
      body.rotation.y = -Math.PI/2;
      
      const taperH = h * 0.08;
      const bottomGeo = new THREE.CylinderGeometry(r, r * 0.7, taperH, 64);
      const bottom = new THREE.Mesh(bottomGeo, topMat);
      bottom.position.y = -bodyH/2 - taperH/2;
      
      const topGeo = new THREE.CylinderGeometry(r * 0.8, r, taperH, 64);
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = bodyH/2 + taperH/2;

      const rimGeo = new THREE.TorusGeometry(r * 0.8, 1.2, 16, 100);
      const rim = new THREE.Mesh(rimGeo, topMat);
      rim.rotation.x = Math.PI/2;
      rim.position.y = bodyH/2 + taperH;

      const lidGeo = new THREE.CircleGeometry(r*0.78, 64);
      const lid = new THREE.Mesh(lidGeo, topMat);
      lid.rotation.x = -Math.PI/2;
      lid.position.y = bodyH/2 + taperH - 0.5;

      const tabGeo = new THREE.BoxGeometry(10, 1, 15);
      const tab = new THREE.Mesh(tabGeo, topMat);
      tab.position.y = bodyH/2 + taperH + 1;
      tab.position.z = 5;

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
      const block = new THREE.Mesh(
          new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, metalness: 0.0 })
      );
      group.add(block);
  }
  else if (type === ObjectType.BottleCap) {
      const cap = createRealisticCrownCap(dim.w / 2);
      cap.rotation.x = -Math.PI/2; 
      group.add(cap);
  }
}

function createRealisticCrownCap(radius: number): THREE.Group {
  const numTeeth = 21;
  const segments = numTeeth * 2; 
  const height = 6;
  
  const group = new THREE.Group();

  const topGeo = new THREE.CylinderGeometry(radius, radius, 0.5, segments);
  const topMat = new THREE.MeshStandardMaterial({ 
      map: createCrownCapTexture('#b91c1c'),
      roughness: 0.3,
      metalness: 0.5,
      bumpMap: createCrownCapTexture('#000000'), 
      bumpScale: 0.1
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = height / 2;
  group.add(top);

  const skirtGeo = new THREE.CylinderGeometry(radius, radius * 1.05, height, segments, 4, true);
  const posAttribute = skirtGeo.attributes.position;
  const vertex = new THREE.Vector3();

  for (let i = 0; i < posAttribute.count; i++) {
    vertex.fromBufferAttribute(posAttribute, i);
    const angle = Math.atan2(vertex.z, vertex.x);
    const yFactor = (height/2 - vertex.y) / height; 
    const wave = Math.cos(angle * numTeeth);
    const flare = 1.0 + (wave * 0.1 * yFactor); 
    vertex.x *= flare;
    vertex.z *= flare;
    posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  skirtGeo.computeVertexNormals();

  const skirtMat = new THREE.MeshStandardMaterial({ 
      color: 0xb91c1c, 
      roughness: 0.3, 
      metalness: 0.6,
      side: THREE.DoubleSide
  });
  const skirt = new THREE.Mesh(skirtGeo, skirtMat);
  group.add(skirt);

  return group;
}

function updateLights(group: THREE.Group, state: SimulationState, camY: number, camZ: number, targetY: number) {
  while(group.children.length > 0){ group.remove(group.children[0]); }
  const intensityPercent = state.lightIntensity;
  const baseIntensity = intensityPercent / 100;
  const colorHex = getLightColorHex(state.lightColor);
  const visualColor = new THREE.Color(colorHex).multiplyScalar(0.5 + baseIntensity); 
  const ambient = new THREE.AmbientLight(colorHex, 0.05 + (baseIntensity * 0.05));
  group.add(ambient);

  // Note: camY includes the target offset.
  // We want to position lights relative to the camera or target.

  if (state.lightType === LightType.BackLight) {
     const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: visualColor }));
     plane.position.z = -100; plane.lookAt(0,0,0); group.add(plane);
     const backLight = new THREE.DirectionalLight(colorHex, baseIntensity * 8);
     backLight.position.set(0, 0, -200); group.add(backLight); group.add(backLight.target);
  } else if (state.lightType === LightType.RingLight) {
     const light = new THREE.SpotLight(colorHex, baseIntensity * 120);
     light.position.set(0, camY, camZ); 
     light.target.position.set(0, targetY, 0); // Point at focus
     light.distance = 5000; light.angle = 0.65; light.penumbra = 0.3; light.decay = 0;
     group.add(light); group.add(light.target);
     const ring = new THREE.Mesh(new THREE.TorusGeometry(22, 3, 16, 32), new THREE.MeshBasicMaterial({ color: visualColor }));
     ring.position.set(0, camY, camZ); 
     ring.lookAt(0, targetY, 0); // Orient towards focus
     group.add(ring);
  } else if (state.lightType === LightType.Coaxial) {
     const light = new THREE.SpotLight(colorHex, baseIntensity * 250); 
     light.position.set(0, camY, camZ); light.angle = 0.35; light.penumbra = 0.1; light.decay = 0;
     light.target.position.set(0, targetY, 0);
     group.add(light); group.add(light.target);
     const box = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 30), new THREE.MeshBasicMaterial({ color: visualColor }));
     const offset = new THREE.Vector3(25, 0, 0); 
     // We need to rotate offset to match camera tilt
     offset.applyAxisAngle(new THREE.Vector3(1,0,0), (state.cameraAngle * Math.PI)/180);
     box.position.set(0, camY, camZ).add(offset); 
     box.lookAt(box.position.clone().add(new THREE.Vector3(0,0,-1))); // Just a visual box
     group.add(box);
  } else if (state.lightType === LightType.LowAngle) {
     // Low Angle light is usually fixed to the fixture base, not moving with camera?
     // Actually if we are inspecting Top of bottle, we might have a high ring light.
     // But "Low Angle Ring" specifically usually means sitting on the conveyor.
     // So we keep it fixed at Z=5 (near object surface)
     for(let i=0; i<8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const spot = new THREE.SpotLight(colorHex, baseIntensity * 80);
        spot.position.set(Math.cos(ang) * 90, Math.sin(ang) * 90, 5); // Z=5 is slightly above Z=0 plane? No, Z is depth here.
        // Coordinate system: Y is up/down tower. Z is distance to camera.
        // Actually in this scene setup:
        // Bottle is vertical along Y. Camera is at +Z.
        // So Low Angle Ring should be in XZ plane around the bottle?
        // Wait, current bottle is -h/2 to h/2 Y.
        // Low angle ring should be at Y = -h/2 (bottom of bottle) or Y = targetY?
        // Typically Low Angle is for surface inspection. Let's make it follow the TargetY to simulate a ring light mounted close to the inspection point.
        
        spot.position.set(Math.cos(ang) * 90, targetY, Math.sin(ang) * 90);
        spot.target.position.set(0, targetY, 0);
        
        spot.angle = 0.6; spot.penumbra = 0.4; spot.decay = 0; 
        group.add(spot); group.add(spot.target);
     }
     const ring = new THREE.Mesh(new THREE.TorusGeometry(90, 2, 8, 64), new THREE.MeshBasicMaterial({ color: visualColor }));
     ring.position.set(0, targetY, 0); 
     ring.rotation.x = Math.PI / 2; // Lie flat in XZ plane
     group.add(ring);
  }
}

export default SimulatedImage;