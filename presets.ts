import { SimulationState, ObjectType, LightFixture, LightPosition, LightColor } from './types';

// Helper to define partial state easily
type Preset = Partial<SimulationState>;

// Keys are constructed as `${ObjectType}:${GoalString}`
export const RECOMMENDED_PRESETS: Record<string, Preset> = {
  // --- PCB ---
  [`${ObjectType.PCB}:Check Solder Bridges (Shorts)`]: {
    lightType: LightFixture.Coaxial,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Front', 
    workingDistance: 200,
    focalLength: 25,
    aperture: 4,
    cameraAngle: 0,
    lightIntensity: 80,
    exposureTime: 5000
  },
  [`${ObjectType.PCB}:Verify Component Presence`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 300,
    focalLength: 16,
    aperture: 2.8,
    cameraAngle: 0
  },
  [`${ObjectType.PCB}:Read Laser Etched Text (OCR)`]: {
    lightType: LightFixture.Bar, // Or Low Angle Ring
    lightPosition: LightPosition.LowAngle,
    lightColor: LightColor.Red,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 150,
    focalLength: 35,
    aperture: 5.6,
    gain: 0,
    lightIntensity: 90
  },
  [`${ObjectType.PCB}:Check Polarity Marks`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 250,
    focalLength: 25,
    cameraAngle: 0
  },

  // --- GLASS BOTTLE ---
  [`${ObjectType.GlassBottle}:Inspect Fill Level`]: {
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightColor: LightColor.Red,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 500,
    focalLength: 35,
    aperture: 8,
    cameraAngle: 0,
    exposureTime: 2000
  },
  [`${ObjectType.GlassBottle}:Check Cap Seal / Tamper Band`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Top',
    objectOrientation: 'Front',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 15
  },
  [`${ObjectType.GlassBottle}:Read Label Text / Date Code`]: {
    lightType: LightFixture.Bar, // Vertical bars often used
    lightPosition: LightPosition.Side,
    lightColor: LightColor.White,
    viewFocus: 'Bottom',
    objectOrientation: 'Front',
    workingDistance: 400,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.GlassBottle}:Detect Glass Cracks / Inclusions`]: {
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 600,
    focalLength: 50,
    aperture: 11
  },

  // --- ALUMINUM CAN ---
  [`${ObjectType.AluminumCan}:Read Bottom Dot Peen Code`]: {
    lightType: LightFixture.Ring, // Low angle ring
    lightPosition: LightPosition.LowAngle,
    lightColor: LightColor.Red,
    viewFocus: 'Whole',
    objectOrientation: 'Bottom',
    workingDistance: 150,
    focalLength: 16,
    cameraAngle: 0,
    lightIntensity: 100
  },
  [`${ObjectType.AluminumCan}:Inspect Pull Tab Integrity`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Top',
    objectOrientation: 'Top',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.AluminumCan}:Verify Print Quality / Color`]: {
    lightType: LightFixture.Ring, // Dome/Tunnel preferred but Ring is okay fallback
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 400,
    focalLength: 25
  },
  [`${ObjectType.AluminumCan}:Detect Dents or Scratches`]: {
    lightType: LightFixture.Coaxial,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.Blue,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 300,
    focalLength: 35,
    gain: 6
  },

  // --- MATTE BLOCK ---
  [`${ObjectType.MatteBlock}:Measure Dimensions (Metrology)`]: {
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightColor: LightColor.Blue,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 600,
    focalLength: 75,
    aperture: 11,
    cameraAngle: 0
  },
  [`${ObjectType.MatteBlock}:Check Surface Flatness`]: {
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.Side, // Raking light
    lightColor: LightColor.Red,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 0
  },

  // --- BOTTLE CAP ---
  [`${ObjectType.BottleCap}:Inspect Liner Seal Integrity`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Bottom',
    workingDistance: 150,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.BottleCap}:Verify Logo Print Quality`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Top',
    workingDistance: 200,
    focalLength: 35
  },
  [`${ObjectType.BottleCap}:Check for Deformed Criminp`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.LowAngle, // To see profile
    lightColor: LightColor.Red,
    viewFocus: 'Middle',
    objectOrientation: 'Side',
    workingDistance: 150,
    focalLength: 25,
    cameraAngle: 10
  },
  [`${ObjectType.BottleCap}:Read Top Print Code`]: {
    lightType: LightFixture.Spot,
    lightPosition: LightPosition.Top,
    lightColor: LightColor.White,
    viewFocus: 'Top',
    objectOrientation: 'Top',
    workingDistance: 250,
    focalLength: 25,
    cameraAngle: 0
  }
};

export const getPreset = (type: ObjectType, goal: string): Preset | null => {
  const key = `${type}:${goal}`;
  return RECOMMENDED_PRESETS[key] || null;
};
