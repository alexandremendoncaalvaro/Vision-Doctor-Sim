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
  MetalPart = "Metal Cylinder",
  Packaging = "Pharma Blister"
}

export interface SimulationState {
  sensorFormat: SensorFormat;
  focalLength: number; // mm
  aperture: number; // f-stop
  workingDistance: number; // mm
  cameraAngle: number; // degrees off-axis
  objectType: ObjectType;
  lightType: LightType;
  lightColor: LightColor;
  lightIntensity: number; // 0-100
  exposureTime: number; // microseconds
  gain: number; // dB
}

export interface OpticalMetrics {
  fovWidth: number; // mm
  fovHeight: number; // mm
  magnification: number;
  dof: number; // mm (depth of field)
  pixelDensity: number; // pixels per mm (assuming 5MP camera for sim)
}

export interface DoctorAdvice {
  summary: string;
  details: string[];
  score: number; // 0-100 suitability
}