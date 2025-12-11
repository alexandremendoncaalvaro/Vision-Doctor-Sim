
export enum SensorFormat {
  Type_1_3 = "1/3\"",
  Type_1_2 = "1/2\"",
  Type_1_1_8 = "1/1.8\"",
  Type_2_3 = "2/3\"",
  Type_1 = "1\"",
  Type_FullFrame = "Full Frame (35mm)"
}

export enum LightColor {
  White = "White",
  Red = "Red",
  Blue = "Blue",
  IR = "Infrared",
  UV = "UV"
}

export enum LightType {
  RingLight = "Ring Light",
  BackLight = "Backlight",
  Coaxial = "Coaxial",
  LowAngle = "Low Angle Ring"
}

export enum ObjectType {
  PCB = "PCB Board",
  GlassBottle = "Glass Bottle (Amber)",
  AluminumCan = "Aluminum Can",
  MatteBlock = "Matte Block",
  BottleCap = "Bottle Cap"
}

export interface SimulationState {
  // Optics
  sensorFormat: SensorFormat;
  focalLength: number; // mm
  aperture: number; // f-stop
  workingDistance: number; // mm
  cameraAngle: number; // degrees
  
  // Scene
  objectType: ObjectType;
  lightType: LightType;
  lightColor: LightColor;
  lightIntensity: number; // 0-100
  
  // Camera Settings
  exposureTime: number; // microseconds
  gain: number; // dB
  
  // Environment & Motion
  backgroundColor: string; // Hex
  objectSpeed: number; // mm/s
  vibrationLevel: number; // 0-10
  
  // Region of Interest (ROI) - percentages 0-1 relative to FOV
  roiX: number;
  roiY: number;
  roiW: number;
  roiH: number;
}

export interface OpticalMetrics {
  fovWidth: number; // mm
  fovHeight: number; // mm
  magnification: number;
  dof: number; // mm
  pixelDensity: number; // px/mm
  motionBlurPx: number; // Estimated blur in pixels
  exposureValue: number; // Estimated relative brightness (1.0 = optimal)
}

export interface DoctorAdvice {
  summary: string;
  details: string[];
  score: number; // 0-100 suitability
}

export interface ValidationResult {
  roi: 'good' | 'acceptable' | 'poor';
  contrast: 'good' | 'poor';
  stability: 'good' | 'acceptable' | 'poor';
  exposure: 'good' | 'dark' | 'bright';
}