import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimulationState, OpticalMetrics, LightColor, LightType, ObjectType } from '../types';
import { OBJECT_DIMS } from '../constants';

interface SimulatedImageProps {
  state: SimulationState;
  metrics: OpticalMetrics;
  viewType: 'camera' | 'free';
}

const SimulatedImage: React.FC<SimulatedImageProps> = ({ state, metrics, viewType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
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
    freeCam.position.set(200, 200, 300);
    freeCam.lookAt(0, 0, 0);
    freeCameraRef.current = freeCam;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Exposure control via Tone Mapping
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.domElement.style.outline = 'none';
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // --- UPDATES ---

  // 1. Background Update
  useEffect(() => {
    if (sceneRef.current) {
       sceneRef.current.background = new THREE.Color(state.backgroundColor);
    }
  }, [state.backgroundColor]);

  // 2. Exposure Physics Update
  useEffect(() => {
    if (rendererRef.current) {
       // Simple exposure simulation model
       // Base values: Aperture f/2.8, Time 5000us, Gain 0, Intensity 50
       // Exposure ~ (Time * Intensity * ISO) / Aperture^2
       
       const baseExposure = 1.0;
       
       const timeFactor = state.exposureTime / 5000;
       const apertureFactor = Math.pow(2.8, 2) / Math.pow(state.aperture, 2);
       
       // Gain: 0dB = 1x, 20dB = 10x
       const gainFactor = Math.pow(10, state.gain / 20);

       // Final exposure applied to renderer
       const calculatedExposure = baseExposure * timeFactor * apertureFactor * gainFactor;
       
       rendererRef.current.toneMappingExposure = calculatedExposure;
    }
  }, [state.exposureTime, state.aperture, state.gain]);

  // 3. Scene Objects & Lights Update
  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current || !objectGroupRef.current || !camModelRef.current || !cameraRef.current) return;

    const angleRad = (state.cameraAngle * Math.PI) / 180;
    const camY = state.workingDistance * Math.sin(angleRad);
    const camZ = state.workingDistance * Math.cos(angleRad);
    
    cameraRef.current.position.set(0, camY, camZ);
    cameraRef.current.lookAt(0, 0, 0);

    const fovDeg = 2 * Math.atan((metrics.fovHeight / 2) / state.workingDistance) * (180 / Math.PI);
    cameraRef.current.fov = fovDeg;
    cameraRef.current.updateProjectionMatrix();

    camModelRef.current.position.set(0, camY, camZ);
    camModelRef.current.lookAt(0, 0, 0);
    camModelRef.current.visible = viewType === 'free'; 

    updateObject(objectGroupRef.current, state.objectType);
    updateLights(lightsGroupRef.current, state, camY, camZ);

  }, [state, metrics, viewType]);

  // --- BLUR CALCULATION ---
  const blurStyle = useMemo(() => {
    if (viewType === 'free') return {};
    
    // Blur is pre-calculated in App.tsx metrics based on speed + vibration vs exposure time
    // We just render it here.
    const totalBlurPx = metrics.motionBlurPx;
    
    if (totalBlurPx < 0.5) return {};
    return { filter: `blur(${Math.min(totalBlurPx, 20)}px)` };
  }, [metrics.motionBlurPx, viewType]);

  // --- NOISE OVERLAY STYLE ---
  // High gain introduces noise.
  // 0 dB = 0 opacity, 24 dB = 0.5 opacity (visible grain)
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

      {/* Sensor Noise Overlay */}
      {viewType === 'camera' && noiseOpacity > 0 && (
         <div 
           className="absolute inset-0 pointer-events-none mix-blend-screen"
           style={{ 
             opacity: noiseOpacity,
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
           }}
         />
      )}
      
      {/* ROI Overlay (Only in Camera View) */}
      {viewType === 'camera' && (
        <div className="absolute inset-0 pointer-events-none">
           <div 
             className="absolute border-2 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
             style={{
                 ...roiStyle,
                 // Use a massive box-shadow to create the "dimmed outside" effect
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
          {viewType === 'camera' ? 'SENSOR VIEW' : 'WORLD VIEW'}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
          <span>EXP:</span> <span className="text-slate-200 text-right">{(state.exposureTime/1000).toFixed(1)}ms</span>
          <span>GAIN:</span> <span className="text-slate-200 text-right">{rendererRef.current?.toneMappingExposure.toFixed(1) || '1.0'}</span>
          <span>FPS:</span> <span className="text-slate-200 text-right">{Math.min(1000000/state.exposureTime, 60).toFixed(0)}</span>
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
      
      // Main Code
      ctx.font = 'bold 50px Consolas, monospace';
      ctx.fillStyle = '#9ca3af'; // slate-400
      ctx.fillText('FPGA', 128, 80);
      
      // Detail
      ctx.font = '30px Consolas, monospace';
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.fillText('X-2048', 128, 140);
      
      // Tiny text
      ctx.font = '20px Arial';
      ctx.fillStyle = '#475569';
      ctx.fillText('TAIWAN', 128, 190);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCapTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#b91c1c'; // Dark Red
        ctx.fillRect(0,0,512,512);

        // Logo
        ctx.beginPath();
        ctx.arc(256, 256, 180, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.font = 'bold 80px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('BREW', 256, 256);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function updateObject(group: THREE.Group, type: ObjectType) {
  while(group.children.length > 0){ 
    const child = group.children[0];
    group.remove(child);
    if ((child as any).geometry) (child as any).geometry.dispose();
  }
  const dim = OBJECT_DIMS[type];

  if (type === ObjectType.PCB) {
     const board = new THREE.Mesh(new THREE.BoxGeometry(dim.w, dim.h, dim.depth), new THREE.MeshStandardMaterial({ color: 0x1a472a, roughness: 0.5 }));
     group.add(board);
     const chip = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 3), new THREE.MeshStandardMaterial({ color: 0x111111 }));
     chip.position.z = dim.depth/2 + 1.5;
     group.add(chip);
     
     // Label on IC with Texture
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
      // Bottle aligned along Y axis (lying flat for side inspection)
      // Body
      const bodyRadius = dim.w / 2;
      const bodyHeight = dim.h * 0.6;
      const neckRadius = dim.w / 4;
      const neckHeight = dim.h * 0.3;
      
      const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 32);
      const shoulderGeo = new THREE.CylinderGeometry(neckRadius, bodyRadius, dim.h * 0.1, 32);
      const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckHeight, 32);
      
      const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xdf8f1f, // Amber
          transmission: 0.9,
          opacity: 1,
          metalness: 0.1,
          roughness: 0.05,
          ior: 1.5,
          thickness: 2.0,
          transparent: true
      });

      const body = new THREE.Mesh(bodyGeo, glassMat);
      body.rotation.z = Math.PI / 2; // Lay flat along X axis (so side is visible from Z)
      group.add(body);

      const shoulder = new THREE.Mesh(shoulderGeo, glassMat);
      shoulder.rotation.z = Math.PI / 2;
      shoulder.position.x = bodyHeight/2 + (dim.h * 0.1)/2;
      group.add(shoulder);

      const neck = new THREE.Mesh(neckGeo, glassMat);
      neck.rotation.z = Math.PI / 2;
      neck.position.x = bodyHeight/2 + (dim.h * 0.1) + neckHeight/2;
      group.add(neck);

      // Liquid fill
      const liqGeo = new THREE.CylinderGeometry(bodyRadius - 2, bodyRadius - 2, bodyHeight - 10, 32);
      const liqMat = new THREE.MeshStandardMaterial({ color: 0x3f1f00, roughness: 0.2 });
      const liquid = new THREE.Mesh(liqGeo, liqMat);
      liquid.rotation.z = Math.PI / 2;
      liquid.position.x = -5;
      group.add(liquid);
  }
  else if (type === ObjectType.AluminumCan) {
      // Can lying flat
      const radius = dim.w / 2;
      const height = dim.h;
      
      const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 64);
      const canMat = new THREE.MeshStandardMaterial({
          color: 0xe5e5e5, // Silver
          metalness: 0.9,
          roughness: 0.25,
      });
      const can = new THREE.Mesh(bodyGeo, canMat);
      can.rotation.z = Math.PI / 2;
      group.add(can);

      // Rims
      const rimGeo = new THREE.TorusGeometry(radius, 1.5, 16, 64);
      const rim1 = new THREE.Mesh(rimGeo, canMat);
      rim1.rotation.y = Math.PI / 2;
      rim1.position.x = height / 2;
      group.add(rim1);
      
      const rim2 = new THREE.Mesh(rimGeo, canMat);
      rim2.rotation.y = Math.PI / 2;
      rim2.position.x = -height / 2;
      group.add(rim2);
      
      // Label text
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256; labelCanvas.height = 128;
      const ctx = labelCanvas.getContext('2d');
      if (ctx) {
          ctx.fillStyle = '#e5e5e5'; ctx.fillRect(0,0,256,128);
          ctx.font = 'bold 30px Arial'; ctx.fillStyle = '#000000'; ctx.fillText('LOT: 24B01', 50, 64);
      }
      const labelTex = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(40, 20);
      const labelMat = new THREE.MeshStandardMaterial({ map: labelTex, transparent: true, polygonOffset: true, polygonOffsetFactor: -1 });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.z = radius + 0.1;
      group.add(label);
  }
  else if (type === ObjectType.MatteBlock) {
      const block = new THREE.Mesh(
          new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9, metalness: 0.0 })
      );
      group.add(block);
  }
  else if (type === ObjectType.BottleCap) {
      // Cap lying flat on XY plane (Face up)
      const radius = dim.w / 2;
      const height = dim.depth;
      
      const capGeo = new THREE.CylinderGeometry(radius, radius, height, 64);
      const capMat = new THREE.MeshStandardMaterial({
          map: createCapTexture(),
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.3
      });
      
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.rotation.x = Math.PI / 2; // Face Z
      group.add(cap);

      // Ridges (Simulated with simple torus knots or texture? Let's use small cylinders ring)
      // Actually, let's just make the side texture bumpy using bump map would be better but we don't have external assets.
      // Let's add physical ridges.
      const ridgeGeo = new THREE.CylinderGeometry(0.5, 0.5, height, 8);
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 });
      for(let i=0; i<40; i++) {
          const angle = (i / 40) * Math.PI * 2;
          const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
          ridge.rotation.x = Math.PI / 2;
          ridge.position.set(Math.cos(angle) * (radius + 0.2), Math.sin(angle) * (radius + 0.2), 0);
          group.add(ridge);
      }
  }
}

function updateLights(group: THREE.Group, state: SimulationState, camY: number, camZ: number) {
  while(group.children.length > 0){ group.remove(group.children[0]); }
  const intensityPercent = state.lightIntensity;
  const baseIntensity = intensityPercent / 100;
  const colorHex = getLightColorHex(state.lightColor);
  const visualColor = new THREE.Color(colorHex).multiplyScalar(0.5 + baseIntensity); 
  const ambient = new THREE.AmbientLight(colorHex, 0.05 + (baseIntensity * 0.05));
  group.add(ambient);

  if (state.lightType === LightType.BackLight) {
     const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: visualColor }));
     plane.position.z = -100; plane.lookAt(0,0,0); group.add(plane);
     const backLight = new THREE.DirectionalLight(colorHex, baseIntensity * 8);
     backLight.position.set(0, 0, -200); group.add(backLight); group.add(backLight.target);
  } else if (state.lightType === LightType.RingLight) {
     const light = new THREE.SpotLight(colorHex, baseIntensity * 120);
     light.position.set(0, camY, camZ); light.distance = 5000; light.angle = 0.65; light.penumbra = 0.3; light.decay = 0;
     group.add(light); group.add(light.target);
     const ring = new THREE.Mesh(new THREE.TorusGeometry(22, 3, 16, 32), new THREE.MeshBasicMaterial({ color: visualColor }));
     ring.position.set(0, camY, camZ); ring.lookAt(0, 0, 0); group.add(ring);
  } else if (state.lightType === LightType.Coaxial) {
     const light = new THREE.SpotLight(colorHex, baseIntensity * 250); 
     light.position.set(0, camY, camZ); light.angle = 0.35; light.penumbra = 0.1; light.decay = 0;
     group.add(light); group.add(light.target);
     const box = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 30), new THREE.MeshBasicMaterial({ color: visualColor }));
     const offset = new THREE.Vector3(25, 0, 0); offset.applyAxisAngle(new THREE.Vector3(1,0,0), (state.cameraAngle * Math.PI)/180);
     box.position.set(0, camY, camZ).add(offset); box.lookAt(box.position.clone().add(new THREE.Vector3(0,0,-1))); group.add(box);
  } else if (state.lightType === LightType.LowAngle) {
     for(let i=0; i<8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const spot = new THREE.SpotLight(colorHex, baseIntensity * 80);
        spot.position.set(Math.cos(ang) * 90, Math.sin(ang) * 90, 5);
        spot.angle = 0.6; spot.penumbra = 0.4; spot.decay = 0; 
        group.add(spot); group.add(spot.target);
     }
     const ring = new THREE.Mesh(new THREE.TorusGeometry(90, 2, 8, 64), new THREE.MeshBasicMaterial({ color: visualColor }));
     ring.position.set(0, 0, 5); group.add(ring);
  }
}

export default SimulatedImage;