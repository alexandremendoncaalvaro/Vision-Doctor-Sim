
import { SimulationState, ObjectType, LightFixture, LightPosition, LightConfig, LightColor, SensorFormat } from './types';

// Helper to define partial state easily
type Preset = Partial<SimulationState>;

// Keys are constructed as `${ObjectType}:${GoalString}`
export const RECOMMENDED_PRESETS: Record<string, Preset> = {
  // --- PCB (80 x 60) ---
  [`${ObjectType.PCB}:Verify Component Presence`]: {
    // Guide: Cat 1 -> Presence -> Frontal/Coaxial -> Diffuse
    lightType: LightFixture.Dome, 
    lightPosition: LightPosition.Surrounding,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 70, 
    lightMultiplier: 100, // Stronger default
    lightDistance: 200,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    workingDistance: 450, focalLength: 25, aperture: 4, gain: 0, exposureTime: 8000,
    roiX: 0.5, roiY: 0.5, roiW: 0.9, roiH: 0.75
  },
  [`${ObjectType.PCB}:Read Laser Etched Text`]: {
    // Guide: Cat 6 -> Etched Text -> Grazing (Dark Field) -> Hard -> Bar Light
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.LowAngle, // Grazing
    lightConfig: LightConfig.Dual, 
    lightColor: LightColor.Red, 
    lightIntensity: 100, 
    lightMultiplier: 100,
    lightDistance: 120, 
    objectOrientation: 'Front',
    viewFocus: 'Middle',
    backgroundColor: '#475569',
    workingDistance: 350, focalLength: 25, aperture: 2.8, gain: 6, exposureTime: 12000,
    roiX: 0.5, roiY: 0.5, roiW: 0.9, roiH: 0.8
  },
  [`${ObjectType.PCB}:Check Solder Bridges`]: {
    // Guide: Cat 7 -> Metal/Shiny -> Coaxial -> Diffuse
    lightType: LightFixture.Coaxial,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 90,
    lightMultiplier: 100,
    lightDistance: 100,
    objectOrientation: 'Front',
    viewFocus: 'Middle',
    backgroundColor: '#475569',
    workingDistance: 400, focalLength: 35, aperture: 4, gain: 12, exposureTime: 15000,
    roiX: 0.5, roiY: 0.5, roiW: 0.95, roiH: 0.75
  },

  // --- GLASS BOTTLE (60 x 180) ---
  [`${ObjectType.GlassBottle}:Inspect Fill Level`]: {
    // Guide: Cat 9 -> Liquid Level -> Backlight -> Diffuse/Collimated
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightConfig: LightConfig.Medium,
    lightColor: LightColor.Red, 
    lightIntensity: 100,
    lightMultiplier: 100,
    lightDistance: 200,
    objectOrientation: 'Front',
    viewFocus: 'Top', 
    backgroundColor: '#050505',
    workingDistance: 650, focalLength: 25, aperture: 8, gain: 12, exposureTime: 4000, 
    roiX: 0.5, roiY: 0.70, roiW: 0.8, roiH: 0.4
  },
  [`${ObjectType.GlassBottle}:Read Label Text`]: {
    // Guide: Cat 6 -> Printed Text -> Frontal/Side -> Diffuse
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.Side, 
    lightConfig: LightConfig.Dual,
    lightColor: LightColor.White,
    lightIntensity: 85,
    lightMultiplier: 100,
    lightDistance: 350,
    objectOrientation: 'Front',
    viewFocus: 'Bottom',
    backgroundColor: '#050505',
    workingDistance: 500, focalLength: 16, aperture: 4, gain: 0, exposureTime: 10000,
    roiX: 0.5, roiY: 0.35, roiW: 0.8, roiH: 0.5
  },

  // --- ALUMINUM CAN (66 x 120) ---
  [`${ObjectType.AluminumCan}:Read Bottom Dot Peen Code`]: {
    // Guide: Cat 4 -> DPM on Metal -> Dome OR Low Angle
    lightType: LightFixture.Dome,
    lightPosition: LightPosition.Surrounding,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.Red,
    lightIntensity: 100,
    lightMultiplier: 100,
    lightDistance: 100,
    objectOrientation: 'Bottom',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    workingDistance: 300, focalLength: 16, aperture: 4, gain: 0, exposureTime: 8000,
    roiX: 0.5, roiY: 0.5, roiW: 0.8, roiH: 0.8
  },
  [`${ObjectType.AluminumCan}:Inspect Pull Tab Integrity`]: {
    // Guide: Cat 7 -> Metal features -> Dome or Coaxial
    lightType: LightFixture.Dome,
    lightPosition: LightPosition.Surrounding,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 70,
    lightMultiplier: 100,
    lightDistance: 150,
    objectOrientation: 'Top',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    workingDistance: 300, focalLength: 25, aperture: 5.6, gain: 6, exposureTime: 10000,
    roiX: 0.5, roiY: 0.5, roiW: 0.8, roiH: 0.8
  },

  // --- MATTE BLOCK (40 x 40) ---
  [`${ObjectType.MatteBlock}:Measure Dimensions`]: {
    // Guide: Cat 2 -> Dimensional -> Backlight -> Collimated
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightConfig: LightConfig.Small,
    lightColor: LightColor.Blue, 
    lightIntensity: 100,
    lightMultiplier: 100,
    lightDistance: 150,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    workingDistance: 550, focalLength: 50, aperture: 11, gain: 18, exposureTime: 10000,
    roiX: 0.5, roiY: 0.5, roiW: 0.7, roiH: 0.7
  },
  [`${ObjectType.MatteBlock}:Detect Surface Scratches`]: {
    // Guide: Cat 3 -> Scratches -> Grazing (Dark Field) -> Hard -> Bar Light
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.LowAngle,
    lightConfig: LightConfig.Single, 
    lightColor: LightColor.Red,
    lightIntensity: 100,
    lightMultiplier: 100,
    lightDistance: 150,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#f1f5f9',
    workingDistance: 300, focalLength: 35, aperture: 2.8, gain: 6, exposureTime: 8000,
    roiX: 0.5, roiY: 0.5, roiW: 0.8, roiH: 0.8
  },

  // --- BOTTLE CAP (28 x 6) ---
  [`${ObjectType.BottleCap}:Read Top Print Code`]: {
    // Guide: Cat 6 -> Printed Text -> Coaxial or Ring (High Angle)
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera, // High Angle
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 90,
    lightMultiplier: 100,
    lightDistance: 300,
    objectOrientation: 'Top',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    workingDistance: 300, focalLength: 35, aperture: 5.6, gain: 6, exposureTime: 8000,
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  },
  [`${ObjectType.BottleCap}:Inspect Liner Seal Integrity`]: {
    // Guide: Cat 1 -> Integrity -> Frontal
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 80,
    lightMultiplier: 100,
    lightDistance: 150,
    objectOrientation: 'Bottom',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    workingDistance: 200, focalLength: 25, aperture: 4, gain: 0, exposureTime: 6000,
    roiX: 0.5, roiY: 0.5, roiW: 0.8, roiH: 0.8
  }
};

export const getPreset = (type: ObjectType, goal: string): Preset | null => {
  const key = `${type}:${goal}`;
  return RECOMMENDED_PRESETS[key] || null;
};
