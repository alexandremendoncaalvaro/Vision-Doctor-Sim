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

export const OBJECT_GOALS: Record<ObjectType, string[]> = {
  [ObjectType.PCB]: [
    "Check Solder Bridges (Shorts)",
    "Verify Component Presence",
    "Read Laser Etched Text (OCR)",
    "Check Polarity Marks",
    "Inspect Conformal Coating"
  ],
  [ObjectType.GlassBottle]: [
    "Inspect Fill Level",
    "Check Cap Seal / Tamper Band",
    "Read Label Text / Date Code",
    "Detect Glass Cracks / Inclusions",
    "Verify Label Alignment"
  ],
  [ObjectType.AluminumCan]: [
    "Read Bottom Dot Peen Code",
    "Inspect Pull Tab Integrity",
    "Verify Print Quality / Color",
    "Detect Dents or Scratches",
    "Check Lid Sealing"
  ],
  [ObjectType.MatteBlock]: [
    "Measure Dimensions (Metrology)",
    "Check Surface Flatness",
    "Detect Surface Flaws",
    "Calibrate Robot Coordinate System"
  ],
  [ObjectType.BottleCap]: [
    "Inspect Liner Seal Integrity",
    "Verify Logo Print Quality",
    "Check for Deformed Criminp",
    "Read Top Print Code"
  ]
};

export const DEFAULT_ADVICE = "Adjust parameters to inspect the object. Click 'Analyze Setup' for AI feedback.";
