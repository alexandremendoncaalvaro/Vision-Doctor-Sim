import { SimulationState, ObjectType, LightType, LightColor, SensorFormat } from './types';

// Helper to define partial state easily
type Preset = Partial<SimulationState>;

// Keys are constructed as `${ObjectType}:${GoalString}`
export const RECOMMENDED_PRESETS: Record<string, Preset> = {
  // --- PCB ---
  // PCB is modeled standing up. 'Front' faces the camera.
  [`${ObjectType.PCB}:Check Solder Bridges (Shorts)`]: {
    lightType: LightType.Coaxial,
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
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 300,
    focalLength: 16,
    aperture: 2.8,
    cameraAngle: 0
  },
  [`${ObjectType.PCB}:Read Laser Etched Text (OCR)`]: {
    lightType: LightType.LowAngle,
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
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 250,
    focalLength: 25,
    cameraAngle: 0
  },

  // --- GLASS BOTTLE ---
  [`${ObjectType.GlassBottle}:Inspect Fill Level`]: {
    lightType: LightType.BackLight,
    lightColor: LightColor.Red, // Red penetrates amber glass better
    viewFocus: 'Middle', // Neck area
    objectOrientation: 'Front',
    workingDistance: 500,
    focalLength: 35,
    aperture: 8, // More DOF
    cameraAngle: 0,
    exposureTime: 2000 // Silhouettes are bright
  },
  [`${ObjectType.GlassBottle}:Check Cap Seal / Tamper Band`]: {
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Top',
    objectOrientation: 'Front',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 15 // Slight angle to see under rim
  },
  [`${ObjectType.GlassBottle}:Read Label Text / Date Code`]: {
    lightType: LightType.RingLight, // Or bars, but Ring is what we have
    lightColor: LightColor.White,
    viewFocus: 'Bottom',
    objectOrientation: 'Front',
    workingDistance: 400,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.GlassBottle}:Detect Glass Cracks / Inclusions`]: {
    lightType: LightType.BackLight,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 600,
    focalLength: 50,
    aperture: 11
  },

  // --- ALUMINUM CAN ---
  [`${ObjectType.AluminumCan}:Read Bottom Dot Peen Code`]: {
    lightType: LightType.LowAngle, // Casts shadows in dots
    lightColor: LightColor.Red,
    viewFocus: 'Whole',
    objectOrientation: 'Bottom',
    workingDistance: 150,
    focalLength: 16,
    cameraAngle: 0,
    lightIntensity: 100
  },
  [`${ObjectType.AluminumCan}:Inspect Pull Tab Integrity`]: {
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Top',
    objectOrientation: 'Top',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.AluminumCan}:Verify Print Quality / Color`]: {
    lightType: LightType.RingLight, // Diffuse would be better, but Ring works
    lightColor: LightColor.White,
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 400,
    focalLength: 25
  },
  [`${ObjectType.AluminumCan}:Detect Dents or Scratches`]: {
    lightType: LightType.Coaxial, // Highlights flat surfaces, dents appear dark
    lightColor: LightColor.Blue, // Metal often contrasts well
    viewFocus: 'Middle',
    objectOrientation: 'Front',
    workingDistance: 300,
    focalLength: 35,
    gain: 6
  },

  // --- MATTE BLOCK ---
  [`${ObjectType.MatteBlock}:Measure Dimensions (Metrology)`]: {
    lightType: LightType.BackLight,
    lightColor: LightColor.Blue, // Short wavelength for precision
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 600,
    focalLength: 75, // Telecentric-ish behavior (less perspective distortion)
    aperture: 11,
    cameraAngle: 0
  },
  [`${ObjectType.MatteBlock}:Check Surface Flatness`]: {
    lightType: LightType.LowAngle,
    lightColor: LightColor.Red,
    viewFocus: 'Whole',
    objectOrientation: 'Front',
    workingDistance: 200,
    focalLength: 25,
    cameraAngle: 0
  },

  // --- BOTTLE CAP ---
  [`${ObjectType.BottleCap}:Inspect Liner Seal Integrity`]: {
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Bottom', // Look inside
    workingDistance: 150,
    focalLength: 25,
    cameraAngle: 0
  },
  [`${ObjectType.BottleCap}:Verify Logo Print Quality`]: {
    lightType: LightType.RingLight,
    lightColor: LightColor.White,
    viewFocus: 'Whole',
    objectOrientation: 'Top',
    workingDistance: 200,
    focalLength: 35
  },
  [`${ObjectType.BottleCap}:Check for Deformed Criminp`]: {
    lightType: LightType.RingLight,
    lightColor: LightColor.Red,
    viewFocus: 'Middle',
    objectOrientation: 'Side',
    workingDistance: 150,
    focalLength: 25,
    cameraAngle: 10
  }
};

export const getPreset = (type: ObjectType, goal: string): Preset | null => {
  const key = `${type}:${goal}`;
  return RECOMMENDED_PRESETS[key] || null;
};
