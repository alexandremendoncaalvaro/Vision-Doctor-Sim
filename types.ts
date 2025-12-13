
export type Language = 'pt-BR' | 'en' | 'es';

export type ActiveSection = 'all' | 'object' | 'light' | 'camera' | 'environment';

export enum SensorFormat {
  Type_1_3 = "1/3\"",
  Type_1_2 = "1/2\"",
  Type_1_1_8 = "1/1.8\"",
  Type_2_3 = "2/3\"",
  Type_1 = "1\"",
  Type_FullFrame = "Full Frame (35mm)"
}

export enum LightColor {
  White = "White (CRI High)",
  Red = "Red (630nm)",
  Blue = "Blue (470nm)",
  IR = "Infrared (850nm)",
  UV = "UV (365nm)"
}

export enum LightFixture {
  Panel = "Backlight Panel",
  Bar = "Bar Light",
  Ring = "Ring Light",
  Spot = "Spot Light",
  Coaxial = "Coaxial Light",
  Dome = "Dome Light",
  Tunnel = "Tunnel Light"
}

export enum GlobalEnv {
  Studio = "Studio (Dark Box)",
  Factory = "Factory Floor",
  Sunlight = "Direct Sunlight"
}

// Aligned with "Geometry" column of the Definitive Guide
export enum LightPosition {
  Back = "Backlight (Silhouette)",
  Camera = "Coaxial / Frontal (Bright Field)",
  Top = "Top Direct (Bright Field)",
  Side = "Side Directional (Shadow/Relief)",
  LowAngle = "Grazing / Low Angle (Dark Field)",
  Surrounding = "Surrounding (Diffuse)",
  Multi = "Multi-Angle"
}

// Aligned with "Quality" column (Internal logic mostly, but useful for UI info)
export enum LightQuality {
  Hard = "Hard / Direct",
  Diffuse = "Diffuse / Soft",
  Collimated = "Collimated",
  Polarized = "Polarized"
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
export type ObjectOrientation = 'Front' | 'Side' | 'Back' | 'Top' | 'Bottom' | 'Custom';

export enum BackgroundPattern {
  None = "None",
  Level1 = "Level 1 (Low)",
  Level2 = "Level 2 (Medium)",
  Level3 = "Level 3 (High)"
}

export enum LensFilter {
  None = "None",
  Polarizer = "Polarizer (CPL)",
  Red = "Red Bandpass (630nm)",
  Blue = "Blue Bandpass (470nm)",
  Green = "Green Bandpass (525nm)"
}

export interface SimulationState {
  // Optics
  sensorFormat: SensorFormat;
  focalLength: number; // mm
  aperture: number; // f-stop
  workingDistance: number; // mm
  cameraAngle: number; // degrees
  lensFilter: LensFilter; 
  
  // Scene
  objectType: ObjectType;
  inspectionGoal: string; // Specific goal
  viewFocus: ViewFocus;
  objectOrientation: ObjectOrientation;
  
  // 6-DOF Object Control (Used when orientation is Custom)
  objectShiftX: number;
  objectShiftY: number;
  objectShiftZ: number;
  objectRotX: number;
  objectRotY: number;
  objectRotZ: number;

  // Lighting
  lightType: LightFixture; 
  lightPosition: LightPosition; 
  lightConfig: LightConfig; 
  lightDistance: number; // mm (Distance from object center)
  lightColor: LightColor;
  lightIntensity: number; // 0-100
  lightMultiplier: number; // 1, 10, 100, 1000
  
  // Global Environment
  globalEnv: GlobalEnv;
  globalIntensity: number; // 0-100

  // Camera Settings
  exposureTime: number; // microseconds
  gain: number; // dB
  
  // Environment & Motion
  backgroundColor: string; // Hex
  backgroundPattern: BackgroundPattern; // Texture
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
  resolution: 'good' | 'acceptable' | 'poor'; 
  focus: 'good' | 'shallow' | 'poor'; 
  contrast: 'good' | 'poor';
  stability: 'good' | 'acceptable' | 'poor';
  exposure: 'good' | 'dark' | 'bright';
  glare: 'none' | 'warning'; 
  technique: 'good' | 'acceptable' | 'poor' | 'wrong_geometry'; 
  techniqueReason?: string; // Feedback message
}

export interface DoctorAdvice {
  summary: string;
  details: string[];
  score: number;
}
