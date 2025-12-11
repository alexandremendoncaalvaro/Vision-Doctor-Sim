import React, { useEffect, useRef } from 'react';
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
  
  // Refs to keep track of Three.js instances across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null); // Industrial Camera
  const freeCameraRef = useRef<THREE.PerspectiveCamera | null>(null); // User Camera
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number>(0);

  // State Refs for Loop Access (Avoiding stale closures)
  const viewTypeRef = useRef(viewType);
  const keysPressed = useRef<Set<string>>(new Set());

  // Scene Objects Refs for updating
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const camModelRef = useRef<THREE.Group | null>(null);

  // Update viewType ref whenever prop changes
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

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    // Add grid helper
    const grid = new THREE.GridHelper(1000, 20, '#334155', '#0f172a');
    grid.position.y = -50; 
    grid.position.z = -5; // Slightly below object
    grid.rotation.x = Math.PI / 2; // Grid on XY plane (behind object in Z-up? No, standard grid is XZ)
    // Let's re-orient grid to be consistent. 
    // Our setup: Object surface is ~XY plane, facing +Z. Camera is at +Z. 
    // So "Ground" behind object would be negative Z.
    grid.rotation.x = 0; 
    grid.position.set(0, -100, 0); // Floor below
    scene.add(grid);
    sceneRef.current = scene;

    // 2. Cameras
    const indCam = new THREE.PerspectiveCamera(50, 1, 10, 5000);
    cameraRef.current = indCam;

    const freeCam = new THREE.PerspectiveCamera(50, 1, 1, 5000);
    freeCam.position.set(200, 200, 300);
    freeCam.lookAt(0, 0, 0);
    freeCameraRef.current = freeCam;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.outline = 'none';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls
    const controls = new OrbitControls(freeCam, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 2000;
    controlsRef.current = controls;

    // 5. Groups
    const lightsGroup = new THREE.Group();
    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    const objectGroup = new THREE.Group();
    scene.add(objectGroup);
    objectGroupRef.current = objectGroup;

    const camModel = createCameraModel();
    scene.add(camModel);
    camModelRef.current = camModel;

    // 6. Resize Handler
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

    // 7. Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      const currentView = viewTypeRef.current;
      const controls = controlsRef.current;
      const freeCam = freeCameraRef.current;

      // WASD Navigation
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

  // --- SCENE STATE UPDATES ---
  useEffect(() => {
    if (!sceneRef.current || !lightsGroupRef.current || !objectGroupRef.current || !camModelRef.current || !cameraRef.current) return;

    // A. Update Camera Position
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

    // B. Update Object & Lights
    updateObject(objectGroupRef.current, state.objectType);
    updateLights(lightsGroupRef.current, state, camY, camZ);

  }, [state, metrics, viewType]);

  return (
    <div className="w-full h-full relative bg-black group outline-none" tabIndex={0}>
      <div ref={containerRef} className="w-full h-full" />
      
      {/* HUD */}
      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-slate-200 p-3 rounded-md text-xs font-mono border border-slate-700 pointer-events-none select-none z-10 shadow-lg">
        <div className={`font-bold mb-2 ${viewType === 'camera' ? 'text-emerald-400' : 'text-indigo-400'} flex items-center gap-2`}>
           <div className={`w-2 h-2 rounded-full ${viewType === 'camera' ? 'bg-emerald-500' : 'bg-indigo-500'} animate-pulse`} />
          {viewType === 'camera' ? 'SENSOR VIEW' : 'WORLD VIEW'}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
          <span>TILT:</span> <span className="text-slate-200 text-right">{state.cameraAngle}°</span>
          <span>DIST:</span> <span className="text-slate-200 text-right">{state.workingDistance}mm</span>
          <span>FOV:</span> <span className="text-slate-200 text-right">{metrics.fovWidth.toFixed(0)}x{metrics.fovHeight.toFixed(0)}</span>
          <span>LIGHT:</span> <span className="text-slate-200 text-right">{state.lightType}</span>
        </div>
      </div>

       {/* Control Hints */}
       {viewType === 'free' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-slate-700 text-slate-300 px-6 py-3 rounded-lg text-xs pointer-events-none text-center shadow-2xl">
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-left">
               <div><span className="font-bold text-indigo-400">WASD</span> Move</div>
               <div><span className="font-bold text-indigo-400">Q / E</span> Vertical</div>
               <div><span className="font-bold text-indigo-400">L-Click</span> Rotate</div>
               <div><span className="font-bold text-indigo-400">R-Click</span> Pan</div>
             </div>
          </div>
        )}
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
  
  // Industrial Camera Body
  const bodyGeo = new THREE.BoxGeometry(40, 40, 60);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.z = -30;
  group.add(body);

  // Lens Barrel
  const lensGeo = new THREE.CylinderGeometry(15, 15, 30, 32);
  const lensMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.8 });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 15; 
  group.add(lens);

  // Lens Glass
  const glassGeo = new THREE.SphereGeometry(14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.2);
  const glassMat = new THREE.MeshPhysicalMaterial({ 
    color: 0xffffff, 
    metalness: 0, 
    roughness: 0, 
    transmission: 0.9, 
    transparent: true 
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = 30;
  glass.lookAt(0,0,100);
  group.add(glass);

  return group;
}

function updateObject(group: THREE.Group, type: ObjectType) {
  while(group.children.length > 0){ 
    const child = group.children[0];
    group.remove(child);
    if ((child as any).geometry) (child as any).geometry.dispose();
  }

  const dim = OBJECT_DIMS[type];

  // Common offset to center object on Z=0 plane based on its depth
  // The objects are defined with thickness. We want the top face to be around Z=0 for easy lighting?
  // Or base at Z=0. Let's put base at Z=0.
  
  if (type === ObjectType.PCB) {
     const board = new THREE.Mesh(
        new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
        new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.4, metalness: 0.1 })
     );
     // If depth is 5, pos.z should be 0, so it goes from -2.5 to 2.5. 
     // Let's keep it centered on origin.
     group.add(board);
     
     // IC Chip
     const chip = new THREE.Mesh(
       new THREE.BoxGeometry(20, 20, 2),
       new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.1 })
     );
     chip.position.z = dim.depth/2 + 1;
     group.add(chip);

     // Gold Pads (Shiny)
     const padMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 });
     for(let i=0; i<4; i++) {
        const pad = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), padMat);
        pad.position.set(-25, (i-1.5)*12, dim.depth/2 + 0.25);
        group.add(pad);
     }
  } else if (type === ObjectType.MetalPart) {
      // Cylinder lying on side
      const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(dim.w/2, dim.w/2, dim.depth, 64),
        new THREE.MeshStandardMaterial({ 
          color: 0x94a3b8, 
          metalness: 0.8, 
          roughness: 0.15, // Very shiny
        })
      );
      cylinder.rotation.x = Math.PI / 2;
      group.add(cylinder);

      // Scratch (Geometry detail)
      const scratch = new THREE.Mesh(
        new THREE.BoxGeometry(30, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 })
      );
      scratch.position.set(0, 0, dim.w/2); // Top surface
      scratch.rotation.z = Math.PI / 4;
      group.add(scratch);

  } else if (type === ObjectType.Packaging) {
      const blister = new THREE.Mesh(
         new THREE.BoxGeometry(dim.w, dim.h, dim.depth),
         new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6, metalness: 0 })
      );
      group.add(blister);
      
      const pillGeo = new THREE.SphereGeometry(12, 32, 16, 0, Math.PI*2, 0, Math.PI/2);
      const pillMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2, metalness: 0.1 });
      
      const p1 = new THREE.Mesh(pillGeo, pillMat);
      p1.position.set(0, -25, dim.depth/2);
      group.add(p1);

      const p2 = new THREE.Mesh(pillGeo, pillMat);
      p2.position.set(0, 25, dim.depth/2);
      group.add(p2);
  }
}

function updateLights(group: THREE.Group, state: SimulationState, camY: number, camZ: number) {
  while(group.children.length > 0){ 
     group.remove(group.children[0]);
  }

  const intensityPercent = state.lightIntensity;
  const baseIntensity = intensityPercent / 100;
  const colorHex = getLightColorHex(state.lightColor);
  const colorObj = new THREE.Color(colorHex);
  
  // Visual helper color (glows with intensity)
  const visualColor = colorObj.clone().multiplyScalar(0.5 + baseIntensity); 

  // 1. Ambient - Low baseline
  const ambient = new THREE.AmbientLight(colorHex, 0.05 + (baseIntensity * 0.05));
  group.add(ambient);

  // 2. Main Lights
  if (state.lightType === LightType.BackLight) {
     // VISUAL: Bright panel behind object
     // Emissive material to look like a light source
     const planeMat = new THREE.MeshBasicMaterial({ color: visualColor });
     const plane = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), planeMat);
     plane.position.z = -100; // Behind object
     plane.lookAt(0,0,0);
     group.add(plane);
     
     // LIGHT: Directional from behind
     // Backlight creates silhouettes. Standard material needs light to show color.
     // If we want a true silhouette, we don't light the front.
     // If translucent, we need custom shader or tricks. 
     // For this sim, let's add a strong RIM light effect or just backlight.
     // We'll add a directional light pointing towards camera to blowout background if checking edges
     // and a weak fill light from front so object isn't 100% black (usability).
     
     const backLight = new THREE.DirectionalLight(colorHex, baseIntensity * 8);
     backLight.position.set(0, 0, -200);
     backLight.target.position.set(0, 0, 0);
     group.add(backLight);
     group.add(backLight.target);

  } else if (state.lightType === LightType.RingLight) {
     // Attached to camera, moves with it.
     // Broad beam, softer shadows.
     const light = new THREE.SpotLight(colorHex, baseIntensity * 120);
     light.position.set(0, camY, camZ);
     light.target.position.set(0, 0, 0);
     light.angle = 0.65; 
     light.penumbra = 0.3;
     light.decay = 0; // Linear/No decay for simpler control
     light.distance = 5000;
     group.add(light);
     group.add(light.target);

     // Visual Ring
     const ring = new THREE.Mesh(
       new THREE.TorusGeometry(22, 3, 16, 32),
       new THREE.MeshBasicMaterial({ color: visualColor })
     );
     ring.position.set(0, camY, camZ);
     ring.lookAt(0, 0, 0);
     group.add(ring);

  } else if (state.lightType === LightType.Coaxial) {
     // On-axis, collimated-ish.
     // High intensity, narrow beam, sharp shadows (if any).
     // Great for looking into holes or at flat specular surfaces.
     const light = new THREE.SpotLight(colorHex, baseIntensity * 250); 
     light.position.set(0, camY, camZ);
     light.target.position.set(0, 0, 0);
     light.angle = 0.35; 
     light.penumbra = 0.1;
     light.decay = 0;
     group.add(light);
     group.add(light.target);

     // Visual Box
     const box = new THREE.Mesh(
        new THREE.BoxGeometry(15, 15, 30),
        new THREE.MeshBasicMaterial({ color: visualColor })
     );
     // Mounted on side of lens
     const offset = new THREE.Vector3(25, 0, 0);
     offset.applyAxisAngle(new THREE.Vector3(1,0,0), (state.cameraAngle * Math.PI)/180);
     box.position.set(0, camY, camZ).add(offset);
     box.lookAt(box.position.clone().add(new THREE.Vector3(0,0,-1))); 
     group.add(box);

  } else if (state.lightType === LightType.LowAngle) {
     // Dark Field Illumination.
     // Light comes from very low angle (grazing incidence).
     // Highlights edges, scratches, dust. Surfaces are dark.
     
     const lightCount = 8;
     const radius = 90;
     const height = 5; // Very close to Z=0 plane
     
     for(let i=0; i<lightCount; i++) {
        const ang = (i / lightCount) * Math.PI * 2;
        const x = Math.cos(ang) * radius;
        const y = Math.sin(ang) * radius;
        
        const spot = new THREE.SpotLight(colorHex, baseIntensity * 80);
        spot.position.set(x, y, height);
        spot.target.position.set(0, 0, 0);
        spot.angle = 0.6;
        spot.penumbra = 0.4;
        spot.decay = 0; 
        group.add(spot);
        group.add(spot.target);
     }

     // Visual Ring sitting on "floor"
     const ring = new THREE.Mesh(
       new THREE.TorusGeometry(radius, 2, 8, 64),
       new THREE.MeshBasicMaterial({ color: visualColor })
     );
     ring.position.set(0, 0, height);
     group.add(ring);
  }
}

export default SimulatedImage;