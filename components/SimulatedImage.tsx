import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SimulationState, OpticalMetrics, LightColor, LightFixture, LightPosition, LightConfig, ObjectType, Language } from '../types';
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

    // --- ENVIRONMENT MAP ---
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

  useEffect(() => {
    if (sceneRef.current) {
       sceneRef.current.background = new THREE.Color(state.backgroundColor);
    }
  }, [state.backgroundColor]);

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

  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current || !objectGroupRef.current || !camModelRef.current || !cameraRef.current) return;

    const objectHeight = OBJECT_DIMS[state.objectType].h;
    
    // Target Y logic
    let targetY = 0;
    if (state.viewFocus === 'Top') targetY = objectHeight * 0.45;
    else if (state.viewFocus === 'Bottom') targetY = -objectHeight * 0.45;
    else if (state.viewFocus === 'Middle') targetY = 0;
    else if (state.viewFocus === 'Whole') targetY = 0;

    const angleRad = (state.cameraAngle * Math.PI) / 180;
    
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

    updateObject(objectGroupRef.current, state.objectType, state.objectOrientation);
    
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

  const currentStdDev = useMemo(() => {
     const lin = metrics.linearBlurPx;
     const vib = metrics.vibrationBlurPx;
     const scale = 0.5;
     const stdX = Math.max((lin + vib) * scale, 0);
     const stdY = Math.max(vib * scale, 0);
     return `${stdX} ${stdY}`;
  }, [metrics]);

  return (
    <div className="w-full h-full relative bg-black group outline-none overflow-hidden" tabIndex={0}>
      
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
  
  // Top
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

  // Skirt (simplified crimps)
  const skirtHeight = radius * 0.3;
  const skirtGeo = new THREE.CylinderGeometry(radius, radius * 1.05, skirtHeight, 21, 1, true);
  const skirtMat = new THREE.MeshStandardMaterial({ 
      color: 0xdca5a5, // slightly reddish metal
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

function updateObject(group: THREE.Group, type: ObjectType, orientation: string) {
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
  if (orientation === 'Side') group.rotation.y = -Math.PI / 2;
  else if (orientation === 'Back') group.rotation.y = Math.PI;
  else if (orientation === 'Top') group.rotation.x = Math.PI / 2; 
  else if (orientation === 'Bottom') group.rotation.x = -Math.PI / 2;

  const setShadows = (mesh: THREE.Object3D) => {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  };

  const dim = OBJECT_DIMS[type];

  if (type === ObjectType.PCB) {
     const board = new THREE.Mesh(new THREE.BoxGeometry(dim.w, dim.h, dim.depth), new THREE.MeshStandardMaterial({ color: 0x1a472a, roughness: 0.5 }));
     setShadows(board);
     group.add(board);
     const chip = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
     chip.position.z = dim.depth/2 + 1.5;
     setShadows(chip);
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
     label.receiveShadow = true; 
     group.add(label);

     const padMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 1.0, roughness: 0.1 });
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
      setShadows(bottle);
      
      const liqPoints = points.slice(0, 5).map(p => new THREE.Vector2(p.x * 0.88, p.y < h*0.7 ? p.y + 2 : h*0.7));
      const liqGeo = new THREE.LatheGeometry(liqPoints, 32);
      const liqMat = new THREE.MeshStandardMaterial({ 
          color: 0x1a0f00, 
          roughness: 0.3 
      });
      const liquid = new THREE.Mesh(liqGeo, liqMat);
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
      const block = new THREE.Mesh(
          new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, metalness: 0.0 })
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
  
  const intensityPercent = state.lightIntensity;
  const baseIntensity = intensityPercent / 100;
  const colorHex = getLightColorHex(state.lightColor);
  const visualColor = new THREE.Color(colorHex).multiplyScalar(0.5 + baseIntensity); 
  
  const ambient = new THREE.AmbientLight(colorHex, 0.02 + (baseIntensity * 0.05));
  group.add(ambient);

  const dist = state.lightDistance || 200;
  
  // Calculate bounding box offsets to prevent clipping
  const objDim = OBJECT_DIMS[state.objectType];
  const halfW = objDim.w / 2;
  const halfH = objDim.h / 2;
  const halfD = objDim.depth / 2;

  let lightPos = new THREE.Vector3();
  let lightTarget = new THREE.Vector3(0, targetY, 0);

  // Position Logic
  switch (state.lightPosition) {
    case LightPosition.Camera:
      // Strictly follows camera axis
      lightPos.set(0, camY, camZ);
      break;
    case LightPosition.Back:
      // Behind object means -Z. Must be behind halfD.
      lightPos.set(0, targetY, -halfD - dist);
      break;
    case LightPosition.Top:
      // Top means +Y. Must be above halfH.
      // Offset slightly in Z to avoid Gimbal lock (0.01)
      lightPos.set(0, halfH + dist, 0.01); 
      break;
    case LightPosition.Side:
      // Side means +X. Must be right of halfW.
      lightPos.set(halfW + dist, targetY, 0);
      break;
    case LightPosition.LowAngle:
      // Generic Low Angle: Position safely outside in Front-Low area
      // This prevents "inside object" for generic fixtures.
      lightPos.set(0, targetY, dist + halfD); 
      break;
    default:
      lightPos.set(0, 0, dist);
  }

  const fixtureGroup = new THREE.Group();
  fixtureGroup.position.copy(lightPos);
  
  // Look at target.
  fixtureGroup.lookAt(lightTarget);
  group.add(fixtureGroup);

  const configShadow = (light: THREE.Light) => {
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.bias = -0.0005;
  };

  const fixture = state.lightType;
  const config = state.lightConfig;

  // Helper to add a spot in Local Space
  const addSpot = (x:number, y:number, z:number, angle:number, intensityMult: number = 1.0) => {
     const s = new THREE.SpotLight(colorHex, baseIntensity * 100 * intensityMult);
     s.position.set(x, y, z);
     
     const targetObj = new THREE.Object3D();
     targetObj.position.set(x, y, z + 100); 
     
     fixtureGroup.add(targetObj);
     s.target = targetObj;
     
     s.angle = angle;
     s.penumbra = 0.5;
     s.decay = 0;
     s.distance = 2000;
     configShadow(s);
     fixtureGroup.add(s);
  };

  if (fixture === LightFixture.Ring) {
     if (state.lightPosition === LightPosition.LowAngle) {
         fixtureGroup.removeFromParent(); 
         const laGroup = new THREE.Group();
         laGroup.position.set(0, targetY, 0); // Low angle is always relative to target focus plane
         group.add(laGroup);
         
         // Dynamically calculate radius to be outside object
         const r = Math.max(dist, Math.max(halfW, halfD) + 30); 
         
         for(let i=0; i<8; i++) {
            const a = (i/8)*Math.PI*2;
            const elevation = 10; 
            const s = new THREE.SpotLight(colorHex, baseIntensity * 200); 
            s.position.set(Math.cos(a)*r, elevation, Math.sin(a)*r);
            s.target.position.set(0, 0, 0);
            s.angle = 0.6; s.penumbra = 0.5; s.decay = 0; s.distance = 1000;
            configShadow(s);
            laGroup.add(s); laGroup.add(s.target);
         }
         const ringVis = new THREE.Mesh(new THREE.TorusGeometry(r, 2, 8, 32), new THREE.MeshBasicMaterial({ color: visualColor }));
         ringVis.rotation.x = Math.PI/2;
         ringVis.position.y = 10;
         laGroup.add(ringVis);

     } else {
         // Ring Light on Camera Axis
         const r = 45; 
         // Ensure visuals don't block camera if camera is close, but typically Ring is AROUND lens.
         // We create a "hole" by just using spots around a radius.
         for(let i=0; i<8; i++) {
             const a = (i/8)*Math.PI*2;
             addSpot(Math.cos(a)*r, Math.sin(a)*r, 0, 0.6, 25); 
         }
         const ringVis = new THREE.Mesh(new THREE.TorusGeometry(r, 4, 8, 32), new THREE.MeshBasicMaterial({ color: visualColor }));
         fixtureGroup.add(ringVis);
     }
  } 
  else if (fixture === LightFixture.Panel) {
      let size = 200;
      if (config === LightConfig.Small) size = 100;
      if (config === LightConfig.Large) size = 400;

      if (state.lightPosition === LightPosition.Back) {
          fixtureGroup.removeFromParent();
          const dl = new THREE.DirectionalLight(colorHex, baseIntensity * 2);
          
          // Ensure it's behind the object
          dl.position.set(0, targetY, -halfD - dist);
          dl.target.position.set(0, targetY, 0);
          configShadow(dl);
          
          const d = size / 2;
          dl.shadow.camera.left = -d; dl.shadow.camera.right = d;
          dl.shadow.camera.top = d; dl.shadow.camera.bottom = -d;
          group.add(dl); group.add(dl.target);
          
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color: visualColor }));
          plane.position.set(0, targetY, -halfD - dist);
          plane.lookAt(0, targetY, 0);
          group.add(plane);
      } else {
          // Standard Panel logic
          // If on Camera Axis, we push it BACK behind camera to avoid clipping inside the camera model
          // But effectively it blocks the view. The validation engine flags this.
          // Visually we still place it at 'dist' from object.
          
          const d = size / 4;
          addSpot(-d, -d, 0, 0.9, 10);
          addSpot(d, -d, 0, 0.9, 10);
          addSpot(-d, d, 0, 0.9, 10);
          addSpot(d, d, 0, 0.9, 10);
          
          const plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color: visualColor }));
          fixtureGroup.add(plane);
      }
  }
  else if (fixture === LightFixture.Bar) {
      const len = 100;
      
      const createBar = (groupToAddTo: THREE.Group, x: number, y: number, rotZ: number = 0) => {
          const barGroup = new THREE.Group();
          barGroup.position.set(x, y, 0);
          barGroup.rotation.z = rotZ;
          groupToAddTo.add(barGroup);

          const s1 = new THREE.SpotLight(colorHex, baseIntensity * 40);
          s1.position.set(-len/3, 0, 0);
          const t1 = new THREE.Object3D(); t1.position.set(-len/3, 0, 100); 
          barGroup.add(t1); s1.target = t1; s1.angle=0.6; configShadow(s1); barGroup.add(s1);

          const s2 = new THREE.SpotLight(colorHex, baseIntensity * 40);
          s2.position.set(0, 0, 0);
          const t2 = new THREE.Object3D(); t2.position.set(0, 0, 100);
          barGroup.add(t2); s2.target = t2; s2.angle=0.6; configShadow(s2); barGroup.add(s2);

          const s3 = new THREE.SpotLight(colorHex, baseIntensity * 40);
          s3.position.set(len/3, 0, 0);
          const t3 = new THREE.Object3D(); t3.position.set(len/3, 0, 100);
          barGroup.add(t3); s3.target = t3; s3.angle=0.6; configShadow(s3); barGroup.add(s3);

          const vis = new THREE.Mesh(new THREE.BoxGeometry(len, 20, 10), new THREE.MeshBasicMaterial({ color: visualColor }));
          barGroup.add(vis);
      }

      if (state.lightPosition === LightPosition.LowAngle) {
          // Special "Surround" logic for Low Angle Bars
          fixtureGroup.removeFromParent();
          const laGroup = new THREE.Group();
          laGroup.position.set(0, targetY, 0);
          group.add(laGroup);

          // Calculate radius to be safely outside object
          // For Bar, we position them tangential to this radius
          const radius = Math.max(dist, Math.max(halfW, halfD) + 30);
          const elevation = 10; 

          const addAngledBar = (angleRad: number) => {
               // Position on circle
               const bx = Math.cos(angleRad) * radius;
               const bz = Math.sin(angleRad) * radius;
               
               // Create a holder that looks at center
               const holder = new THREE.Group();
               holder.position.set(bx, elevation, bz);
               holder.lookAt(0, elevation, 0); // Face inward
               laGroup.add(holder);

               // Create bar inside holder. createBar makes it face +Z.
               // lookAt(0,0,0) makes -Z face origin.
               // So we need to rotate bar to face origin.
               createBar(holder, 0, 0, 0);
          };

          if (config === LightConfig.Single) {
              addAngledBar(Math.PI/2); // Front
          } 
          else if (config === LightConfig.Dual) {
              addAngledBar(0); // Right
              addAngledBar(Math.PI); // Left
          }
          else if (config === LightConfig.Quad) {
              addAngledBar(0);
              addAngledBar(Math.PI/2);
              addAngledBar(Math.PI);
              addAngledBar(-Math.PI/2);
          }

      } else {
          // Standard fixture-attached bars (Top, Side, etc)
          createBar(fixtureGroup, 0, 0, 0); 

          if (config === LightConfig.Dual) {
               fixtureGroup.clear(); 
               createBar(fixtureGroup, -60, 0, 0);
               createBar(fixtureGroup, 60, 0, 0);
          }
          else if (config === LightConfig.Quad) {
              fixtureGroup.clear();
              const offset = 70;
              createBar(fixtureGroup, 0, offset, 0);
              createBar(fixtureGroup, 0, -offset, 0);
              createBar(fixtureGroup, -offset, 0, Math.PI/2);
              createBar(fixtureGroup, offset, 0, Math.PI/2);
          }
      }
  }
  else if (fixture === LightFixture.Spot) {
      const angle = config === LightConfig.Narrow ? 0.2 : 0.6;
      addSpot(0, 0, 0, angle, 200); 
      const spotVis = new THREE.Mesh(new THREE.CylinderGeometry(5, 10, 15), new THREE.MeshBasicMaterial({ color: visualColor }));
      spotVis.rotation.x = Math.PI/2;
      fixtureGroup.add(spotVis);
  }
  else if (fixture === LightFixture.Coaxial) {
      addSpot(0, 0, 0, 0.25, 250);
      const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 40), new THREE.MeshBasicMaterial({ color: visualColor }));
      // Coaxial is physically mounted to the side usually
      if (state.lightPosition === LightPosition.Camera) {
          box.position.x = 40; // Offset mesh so it doesn't block lens
      }
      fixtureGroup.add(box);
  }
}

export default SimulatedImage;