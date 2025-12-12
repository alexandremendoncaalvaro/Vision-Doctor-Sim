
import { SimulationState, ObjectType, LightFixture, LightPosition, LightConfig, LightColor, SensorFormat } from './types';

// Helper to define partial state easily
type Preset = Partial<SimulationState>;

// Keys are constructed as `${ObjectType}:${GoalString}`
export const RECOMMENDED_PRESETS: Record<string, Preset> = {
  // --- PCB (80 x 60) ---
  [`${ObjectType.PCB}:Read Laser Etched Text (OCR)`]: {
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.LowAngle,
    lightConfig: LightConfig.Dual, 
    lightColor: LightColor.Red,
    lightIntensity: 90,
    lightDistance: 130,
    objectOrientation: 'Front',
    viewFocus: 'Middle',
    backgroundColor: '#475569', 
    // Camera
    workingDistance: 300, 
    focalLength: 25,      
    aperture: 4, 
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 8000, 
    // ROI: Object H is ~76% of FOV. ROI H must be > 0.76. Set to 0.85.
    roiX: 0.5, roiY: 0.5, roiW: 0.85, roiH: 0.85
  },
  [`${ObjectType.PCB}:Check Solder Bridges (Shorts)`]: {
    lightType: LightFixture.Coaxial,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 80,
    lightDistance: 100,
    objectOrientation: 'Front',
    viewFocus: 'Middle',
    backgroundColor: '#475569',
    // Camera
    workingDistance: 400, 
    focalLength: 35,
    aperture: 5.6,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 6, 
    exposureTime: 12000,
    // ROI: Object 80mm. FOV ~100mm. Ratio 0.8. ROI must be > 0.8
    roiX: 0.5, roiY: 0.5, roiW: 0.9, roiH: 0.7
  },
  [`${ObjectType.PCB}:Verify Component Presence`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 70,
    lightDistance: 200,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    // Camera
    workingDistance: 450,
    focalLength: 25,
    aperture: 4,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 5000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.8, roiH: 0.6
  },

  // --- GLASS BOTTLE (60 x 180) ---
  [`${ObjectType.GlassBottle}:Inspect Fill Level`]: {
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightConfig: LightConfig.Medium,
    lightColor: LightColor.Red,
    lightIntensity: 100,
    lightDistance: 200,
    objectOrientation: 'Front',
    viewFocus: 'Top', 
    backgroundColor: '#050505',
    // Camera
    workingDistance: 600, 
    focalLength: 16,      
    aperture: 8,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 12, 
    exposureTime: 5000, 
    // ROI
    roiX: 0.5, roiY: 0.75, roiW: 0.6, roiH: 0.3
  },
  [`${ObjectType.GlassBottle}:Read Label Text`]: {
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.Side,
    lightConfig: LightConfig.Dual,
    lightColor: LightColor.White,
    lightIntensity: 80,
    lightDistance: 300,
    objectOrientation: 'Front',
    viewFocus: 'Bottom',
    backgroundColor: '#050505',
    // Camera
    workingDistance: 450,
    focalLength: 16,
    aperture: 4,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 8000,
    // ROI
    roiX: 0.5, roiY: 0.35, roiW: 0.7, roiH: 0.4
  },

  // --- ALUMINUM CAN (66 x 120) ---
  [`${ObjectType.AluminumCan}:Read Bottom Dot Peen Code`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.LowAngle,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.Red,
    lightIntensity: 100,
    lightDistance: 100,
    objectOrientation: 'Bottom',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    // Camera
    workingDistance: 250,
    focalLength: 16,
    aperture: 4,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 8000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  },
  [`${ObjectType.AluminumCan}:Inspect Pull Tab Integrity`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 60,
    lightDistance: 200,
    objectOrientation: 'Top',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    // Camera
    workingDistance: 300,
    focalLength: 25,
    aperture: 5.6,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 6,
    exposureTime: 8000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  },

  // --- MATTE BLOCK (40 x 40) ---
  [`${ObjectType.MatteBlock}:Measure Dimensions (Backlight)`]: {
    lightType: LightFixture.Panel,
    lightPosition: LightPosition.Back,
    lightConfig: LightConfig.Small,
    lightColor: LightColor.Blue, 
    lightIntensity: 100,
    lightDistance: 150,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#050505',
    // Camera
    workingDistance: 500,
    focalLength: 50, 
    aperture: 11,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 12, 
    exposureTime: 8000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  },
  [`${ObjectType.MatteBlock}:Check Surface Flatness`]: {
    lightType: LightFixture.Bar,
    lightPosition: LightPosition.Side,
    lightConfig: LightConfig.Single, // Side is fine for single
    lightColor: LightColor.Red,
    lightIntensity: 100,
    lightDistance: 150,
    objectOrientation: 'Front',
    viewFocus: 'Whole',
    backgroundColor: '#f1f5f9', // Light BG for contrast
    // Camera
    workingDistance: 300,
    focalLength: 35,
    aperture: 4,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 7000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.6, roiH: 0.6
  },

  // --- BOTTLE CAP (28 x 6) ---
  [`${ObjectType.BottleCap}:Read Top Print Code`]: {
    lightType: LightFixture.Spot,
    lightPosition: LightPosition.Top,
    lightConfig: LightConfig.Wide,
    lightColor: LightColor.White,
    lightIntensity: 90,
    lightDistance: 300,
    objectOrientation: 'Top',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    // Camera
    workingDistance: 300,
    focalLength: 35,
    aperture: 5.6,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 6,
    exposureTime: 8000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.4, roiH: 0.4
  },
  [`${ObjectType.BottleCap}:Inspect Liner Seal Integrity`]: {
    lightType: LightFixture.Ring,
    lightPosition: LightPosition.Camera,
    lightConfig: LightConfig.Single,
    lightColor: LightColor.White,
    lightIntensity: 70,
    lightDistance: 150,
    objectOrientation: 'Bottom',
    viewFocus: 'Whole',
    backgroundColor: '#475569',
    // Camera
    workingDistance: 200,
    focalLength: 25,
    aperture: 4,
    sensorFormat: SensorFormat.Type_2_3,
    gain: 0,
    exposureTime: 5000,
    // ROI
    roiX: 0.5, roiY: 0.5, roiW: 0.7, roiH: 0.7
  }
};

export const getPreset = (type: ObjectType, goal: string): Preset | null => {
  const key = `${type}:${goal}`;
  return RECOMMENDED_PRESETS[key] || null;
};
