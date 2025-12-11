import { SensorFormat, ObjectType } from './types';

// Sensor dimensions in mm (Width, Height)
export const SENSOR_SPECS: Record<SensorFormat, { w: number; h: number }> = {
  [SensorFormat.Type_1_3]: { w: 4.8, h: 3.6 },
  [SensorFormat.Type_1_2]: { w: 6.4, h: 4.8 },
  [SensorFormat.Type_1_1_8]: { w: 7.2, h: 5.4 },
  [SensorFormat.Type_2_3]: { w: 8.8, h: 6.6 },
  [SensorFormat.Type_1]: { w: 12.8, h: 9.6 },
  [SensorFormat.Type_FullFrame]: { w: 36, h: 24 },
};

export const STANDARD_FOCAL_LENGTHS = [6, 8, 12, 16, 25, 35, 50, 75];
export const STANDARD_APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];

// Physical size of simulated objects in mm
export const OBJECT_DIMS: Record<ObjectType, { w: number; h: number, depth: number }> = {
  [ObjectType.PCB]: { w: 80, h: 60, depth: 5 },
  [ObjectType.GlassBottle]: { w: 60, h: 180, depth: 60 },
  [ObjectType.AluminumCan]: { w: 66, h: 120, depth: 66 },
  [ObjectType.MatteBlock]: { w: 40, h: 40, depth: 40 },
  [ObjectType.BottleCap]: { w: 28, h: 28, depth: 6 },
};

export const OBJECT_GOALS: Record<ObjectType, string> = {
  [ObjectType.PCB]: "Goal: Inspect solder bridges and read laser-etched component text.",
  [ObjectType.GlassBottle]: "Goal: Inspect fill level and contour. Manage specular reflections on glass.",
  [ObjectType.AluminumCan]: "Goal: Inspect printed codes on curved metal. Avoid hotspots and glare.",
  [ObjectType.MatteBlock]: "Goal: Calibrate geometry and contrast without specular distractions.",
  [ObjectType.BottleCap]: "Goal: Inspect ridges and logo. Use Low Angle light to reveal texture."
};

export const DEFAULT_ADVICE = "Adjust parameters to inspect the object. Click 'Analyze Setup' for AI feedback.";