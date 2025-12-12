
export type Language = 'pt-BR' | 'en' | 'es';

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

export enum LightFixture {
  Ring = "Ring Light",
  Bar = "Bar Light",
  Spot = "Spot Light",
  Panel = "Backlight Panel",
  Coaxial = "Coaxial",
  Dome = "Dome (Cloudy Day)",
  Tunnel = "Tunnel (Flat Dome)"
}

export enum GlobalEnv {
  Studio = "Studio (Dark Box)",
  Factory = "Factory Floor",
  Sunlight = "Direct Sunlight"
}

// Simplified positions that make sense per fixture
export enum LightPosition {
  Camera = "Camera Axis (Bright Field)",
  Back = "Backlight (Silhouette)",
  Top = "Top (Direct)",
  Side = "Side (Oblique)",
  LowAngle = "Low Angle (Dark Field)",
  Surrounding = "Surrounding (Diffuse)" // For Dome/Tunnel
}

export enum LightConfig {
  // Sizes
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
  // Arrangements
  Single = "Single",
  Dual = "Dual (Opposite)",
  Quad = "Quad (Square)",
  // Beams
  Narrow = "Narrow",
  Wide = "Wide"
}

export enum ObjectType {
  PCB = "PCB Board",
  GlassBottle = "Glass Bottle (Amber)",
  AluminumCan = "Aluminum Can",
  MatteBlock = "Matte Block",
  BottleCap = "Bottle Cap"
}

export type ViewFocus = 'Top' | 'Middle' | 'Bottom' | 'Whole';
export type ObjectOrientation = 'Front' | 'Side' | 'Back' | 'Top' | 'Bottom';

export interface SimulationState {
  // Optics
  sensorFormat: SensorFormat;
  focalLength: number; // mm
  aperture: number; // f-stop
  workingDistance: number; // mm
  cameraAngle: number; // degrees
  
  // Scene
  objectType: ObjectType;
  inspectionGoal: string; // Specific goal
  viewFocus: ViewFocus;
  objectOrientation: ObjectOrientation;

  // Lighting
  lightType: LightFixture; 
  lightPosition: LightPosition; 
  lightConfig: LightConfig; // Size/Arrangement
  lightDistance: number; // mm (Distance from object center)
  lightColor: LightColor;
  lightIntensity: number; // 0-100
  
  // Global Environment
  globalEnv: GlobalEnv;
  globalIntensity: number; // 0-100

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
  motionBlurPx: number; // Estimated blur in pixels (Total)
  linearBlurPx: number; // Blur from speed (Directional)
  vibrationBlurPx: number; // Blur from vibration (Isotropic)
  exposureValue: number; // Estimated relative brightness (1.0 = optimal)
}

export interface ValidationResult {
  roi: 'good' | 'acceptable' | 'poor';
  contrast: 'good' | 'poor';
  stability: 'good' | 'acceptable' | 'poor';
  exposure: 'good' | 'dark' | 'bright';
  technique: 'good' | 'acceptable' | 'poor' | 'wrong_geometry'; // New check for lighting logic
}

export interface DoctorAdvice {
  summary: string;
  details: string[];
  score: number;
}
