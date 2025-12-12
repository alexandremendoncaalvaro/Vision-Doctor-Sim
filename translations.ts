
import { Language } from './types';

export const TEXTS = {
  'pt-BR': {
    appTitle: "Simulador Vision Doctor",
    appSubtitle: "Simulador Óptico Industrial",
    
    // Control Panel Sections
    sectionObject: "Objeto e Objetivo",
    sectionView: "Vista e Orientação",
    sectionCamera: "Câmera e Lente",
    sectionLight: "Iluminação e Exposição",
    sectionEnv: "Ambiente",

    // Labels
    targetObject: "Objeto Alvo",
    inspectionGoal: "Objetivo da Inspeção",
    cameraFocus: "Foco da Câmera",
    objOrientation: "Orientação do Objeto",
    sensorFormat: "Formato do Sensor",
    focalLength: "Distância Focal (mm)",
    aperture: "Abertura (f-stop)",
    workingDistance: "Distância de Trabalho",
    tiltAngle: "Ângulo de Inclinação",
    lightType: "Tipo de Luz",
    lightColor: "Cor da Luz",
    lightIntensity: "Intensidade",
    exposureTime: "Tempo de Exposição",
    sensorGain: "Ganho do Sensor",
    background: "Fundo",
    lineSpeed: "Velocidade da Linha",
    vibration: "Nível de Vibração",
    roiSize: "Tamanho da ROI",
    
    // Actions
    analyzeBtn: "Consultar Doctor AI",
    analyzing: "Analisando...",

    // Dropdown Options
    objects: {
      "PCB Board": "Placa PCB",
      "Glass Bottle (Amber)": "Garrafa de Vidro (Âmbar)",
      "Aluminum Can": "Lata de Alumínio",
      "Matte Block": "Bloco Fosco",
      "Bottle Cap": "Tampa de Garrafa"
    },
    
    // View Focus
    focus: {
        Top: "Topo", Middle: "Meio", Bottom: "Fundo", Whole: "Inteiro"
    },
    orientation: {
        Front: "Frente", Side: "Lado", Back: "Trás", Top: "Topo", Bottom: "Baixo"
    },
    
    // Light Types
    lights: {
        "Ring Light": "Anel de Luz",
        "Backlight": "Backlight",
        "Coaxial": "Coaxial",
        "Low Angle Ring": "Anel Baixo Ângulo"
    },
    colors: {
        "White": "Branco", "Red": "Vermelho", "Blue": "Azul", "Infrared": "Infravermelho", "UV": "UV"
    },
    
    // App UI
    schematic: "Esquemático",
    simulator: "Simulador",
    cameraView: "Visão da Câmera",
    freeView: "Visão 3D Livre",
    toggleDoctor: "Alternar Doctor Advice",
    
    // Report
    reportTitle: "Relatório Dr. Vision",
    reportScore: "Adequação",
    reportExcellent: "Excelente",
    reportAcceptable: "Aceitável",
    reportPoor: "Ruim",
    noReport: "Clique em 'Consultar Doctor AI' para gerar um relatório.",
    scenarioCheck: "Verificação de Cenário",
    
    // Schematic Labels
    schCamera: "Câmera",
    schLens: "Lente",
    schObject: "Objeto",
    schBacklight: "Backlight",
    schLowAngle: "Ângulo Baixo",
    schCoaxial: "Coaxial",
    schWd: "DT",
    
    // Stats
    statFov: "FOV (H x V)",
    statMag: "Ampliação",
    statDof: "Profundidade de Campo",
    
    // HUD
    hudSensor: "VISÃO DO SENSOR",
    hudWorld: "VISÃO DO MUNDO",
    hudExp: "EXP",
    hudGain: "GANHO",
    hudFps: "FPS",
    
    // Validation
    valFraming: "Enquadramento (ROI)",
    valStability: "Estabilidade",
    valContrast: "Contraste",
    valExposure: "Exposição",
    valGood: "Bom",
    valAcceptable: "Aceitável",
    valPoor: "Ruim",
    valDark: "Escuro",
    valBright: "Claro"
  },
  'en': {
    appTitle: "Vision Doctor Simulator",
    appSubtitle: "Industrial Optical Simulator",
    sectionObject: "Object & Goal",
    sectionView: "View & Orientation",
    sectionCamera: "Camera & Lens",
    sectionLight: "Light & Exposure",
    sectionEnv: "Environment",
    targetObject: "Target Object",
    inspectionGoal: "Inspection Goal",
    cameraFocus: "Camera Focus",
    objOrientation: "Object Orientation",
    sensorFormat: "Sensor Format",
    focalLength: "Focal Length (mm)",
    aperture: "Aperture (f-stop)",
    workingDistance: "Working Distance",
    tiltAngle: "Tilt Angle",
    lightType: "Light Type",
    lightColor: "Light Color",
    lightIntensity: "Intensity",
    exposureTime: "Exposure Time",
    sensorGain: "Sensor Gain",
    background: "Background",
    lineSpeed: "Line Speed",
    vibration: "Vibration Level",
    roiSize: "ROI Size",
    analyzeBtn: "Ask Doctor AI",
    analyzing: "Analyzing...",
    objects: {
      "PCB Board": "PCB Board",
      "Glass Bottle (Amber)": "Glass Bottle (Amber)",
      "Aluminum Can": "Aluminum Can",
      "Matte Block": "Matte Block",
      "Bottle Cap": "Bottle Cap"
    },
    focus: {
        Top: "Top", Middle: "Middle", Bottom: "Bottom", Whole: "Whole"
    },
    orientation: {
        Front: "Front", Side: "Side", Back: "Back", Top: "Top", Bottom: "Bottom"
    },
    lights: {
        "Ring Light": "Ring Light",
        "Backlight": "Backlight",
        "Coaxial": "Coaxial",
        "Low Angle Ring": "Low Angle Ring"
    },
    colors: {
        "White": "White", "Red": "Red", "Blue": "Blue", "Infrared": "Infrared", "UV": "UV"
    },
    schematic: "Schematic",
    simulator: "Simulator",
    cameraView: "Camera View",
    freeView: "Free View",
    toggleDoctor: "Toggle Doctor Advice",
    reportTitle: "Dr. Vision's Report",
    reportScore: "Suitability",
    reportExcellent: "Excellent",
    reportAcceptable: "Acceptable",
    reportPoor: "Poor",
    noReport: "Click 'Ask Doctor AI' to generate a report.",
    scenarioCheck: "Scenario Check",
    schCamera: "Camera",
    schLens: "Lens",
    schObject: "Object",
    schBacklight: "Backlight",
    schLowAngle: "Low Angle",
    schCoaxial: "Coaxial",
    schWd: "WD",
    statFov: "FOV (H x V)",
    statMag: "Magnification",
    statDof: "Depth of Field",
    hudSensor: "SENSOR VIEW",
    hudWorld: "WORLD VIEW",
    hudExp: "EXP",
    hudGain: "GAIN",
    hudFps: "FPS",
    valFraming: "Framing (ROI)",
    valStability: "Stability",
    valContrast: "Contrast",
    valExposure: "Exposure",
    valGood: "Good",
    valAcceptable: "Acceptable",
    valPoor: "Poor",
    valDark: "Dark",
    valBright: "Bright"
  },
  'es': {
    appTitle: "Simulador Vision Doctor",
    appSubtitle: "Simulador Óptico Industrial",
    sectionObject: "Objeto y Objetivo",
    sectionView: "Vista y Orientación",
    sectionCamera: "Cámara y Lente",
    sectionLight: "Iluminación y Exposición",
    sectionEnv: "Ambiente",
    targetObject: "Objeto Objetivo",
    inspectionGoal: "Objetivo de Inspección",
    cameraFocus: "Enfoque de Cámara",
    objOrientation: "Orientación del Objeto",
    sensorFormat: "Formato del Sensor",
    focalLength: "Distancia Focal (mm)",
    aperture: "Apertura (f-stop)",
    workingDistance: "Distancia de Trabajo",
    tiltAngle: "Ángulo de Inclinación",
    lightType: "Tipo de Luz",
    lightColor: "Color de Luz",
    lightIntensity: "Intensidad",
    exposureTime: "Tiempo de Exposición",
    sensorGain: "Ganancia del Sensor",
    background: "Fondo",
    lineSpeed: "Velocidad de Línea",
    vibration: "Nivel de Vibración",
    roiSize: "Tamaño de ROI",
    analyzeBtn: "Consultar Doctor AI",
    analyzing: "Analizando...",
    objects: {
      "PCB Board": "Placa PCB",
      "Glass Bottle (Amber)": "Botella de Vidrio (Ámbar)",
      "Aluminum Can": "Lata de Aluminio",
      "Matte Block": "Bloque Mate",
      "Bottle Cap": "Tapa de Botella"
    },
    focus: {
        Top: "Superior", Middle: "Medio", Bottom: "Inferior", Whole: "Entero"
    },
    orientation: {
        Front: "Frente", Side: "Lado", Back: "Atrás", Top: "Superior", Bottom: "Inferior"
    },
    lights: {
        "Ring Light": "Anillo de Luz",
        "Backlight": "Luz Trasera",
        "Coaxial": "Coaxial",
        "Low Angle Ring": "Anillo de Bajo Ángulo"
    },
    colors: {
        "White": "Blanco", "Red": "Rojo", "Blue": "Azul", "Infrared": "Infrarrojo", "UV": "UV"
    },
    schematic: "Esquemático",
    simulator: "Simulador",
    cameraView: "Vista de Cámara",
    freeView: "Vista Libre 3D",
    toggleDoctor: "Alternar Doctor Advice",
    reportTitle: "Informe Dr. Vision",
    reportScore: "Idoneidad",
    reportExcellent: "Excelente",
    reportAcceptable: "Aceptable",
    reportPoor: "Pobre",
    noReport: "Haga clic en 'Consultar Doctor AI' para generar un informe.",
    scenarioCheck: "Verificación de Escenario",
    schCamera: "Cámara",
    schLens: "Lente",
    schObject: "Objeto",
    schBacklight: "Luz Trasera",
    schLowAngle: "Bajo Ángulo",
    schCoaxial: "Coaxial",
    schWd: "DT",
    statFov: "FOV (H x V)",
    statMag: "Aumento",
    statDof: "Profundidad de Campo",
    hudSensor: "VISTA DEL SENSOR",
    hudWorld: "VISTA DEL MUNDO",
    hudExp: "EXP",
    hudGain: "GAN",
    hudFps: "FPS",
    valFraming: "Encuadre (ROI)",
    valStability: "Estabilidad",
    valContrast: "Contraste",
    valExposure: "Exposición",
    valGood: "Bueno",
    valAcceptable: "Aceptable",
    valPoor: "Malo",
    valDark: "Oscuro",
    valBright: "Brillante"
  }
};

// Map internal English goal strings to translations
export const GOAL_TRANSLATIONS: Record<string, Record<Language, string>> = {
  // PCB
  "Check Solder Bridges (Shorts)": { 
      "en": "Check Solder Bridges (Shorts)", 
      "pt-BR": "Verificar Pontes de Solda (Curto)", 
      "es": "Verificar Puentes de Soldadura (Cortos)" 
  },
  "Verify Component Presence": { 
      "en": "Verify Component Presence", 
      "pt-BR": "Verificar Presença de Componentes", 
      "es": "Verificar Presencia de Componentes" 
  },
  "Read Laser Etched Text (OCR)": { 
      "en": "Read Laser Etched Text (OCR)", 
      "pt-BR": "Ler Texto Gravado a Laser (OCR)", 
      "es": "Leer Texto Grabado con Láser (OCR)" 
  },
  "Check Polarity Marks": { 
      "en": "Check Polarity Marks", 
      "pt-BR": "Verificar Marcas de Polaridade", 
      "es": "Verificar Marcas de Polaridad" 
  },
  "Inspect Conformal Coating": { 
      "en": "Inspect Conformal Coating", 
      "pt-BR": "Inspecionar Revestimento (Conformal Coating)", 
      "es": "Inspeccionar Recubrimiento (Conformal Coating)" 
  },
  // Glass Bottle
  "Inspect Fill Level": { 
      "en": "Inspect Fill Level", 
      "pt-BR": "Inspecionar Nível de Enchimento", 
      "es": "Inspeccionar Nivel de Llenado" 
  },
  "Check Cap Seal / Tamper Band": { 
      "en": "Check Cap Seal / Tamper Band", 
      "pt-BR": "Verificar Lacre da Tampa / Banda de Segurança", 
      "es": "Verificar Sello de la Tapa / Banda de Seguridad" 
  },
  "Read Label Text / Date Code": { 
      "en": "Read Label Text / Date Code", 
      "pt-BR": "Ler Texto do Rótulo / Data", 
      "es": "Leer Texto de Etiqueta / Código de Fecha" 
  },
  "Detect Glass Cracks / Inclusions": { 
      "en": "Detect Glass Cracks / Inclusions", 
      "pt-BR": "Detectar Rachaduras / Inclusões no Vidro", 
      "es": "Detectar Grietas / Inclusiones en el Vidrio" 
  },
  "Verify Label Alignment": { 
      "en": "Verify Label Alignment", 
      "pt-BR": "Verificar Alinhamento do Rótulo", 
      "es": "Verificar Alineación de Etiqueta" 
  },
  // Aluminum Can
  "Read Bottom Dot Peen Code": { 
      "en": "Read Bottom Dot Peen Code", 
      "pt-BR": "Ler Código Dot Peen no Fundo", 
      "es": "Leer Código Dot Peen en el Fondo" 
  },
  "Inspect Pull Tab Integrity": { 
      "en": "Inspect Pull Tab Integrity", 
      "pt-BR": "Inspecionar Integridade do Anel de Abertura", 
      "es": "Inspeccionar Integridad de la Anilla" 
  },
  "Verify Print Quality / Color": { 
      "en": "Verify Print Quality / Color", 
      "pt-BR": "Verificar Qualidade de Impressão / Cor", 
      "es": "Verificar Calidad de Impresión / Color" 
  },
  "Detect Dents or Scratches": { 
      "en": "Detect Dents or Scratches", 
      "pt-BR": "Detectar Amassados ou Arranhões", 
      "es": "Detectar Abolladuras o Rasguños" 
  },
  "Check Lid Sealing": { 
      "en": "Check Lid Sealing", 
      "pt-BR": "Verificar Vedação da Tampa", 
      "es": "Verificar Sellado de la Tapa" 
  },
  // Matte Block
  "Measure Dimensions (Metrology)": { 
      "en": "Measure Dimensions (Metrology)", 
      "pt-BR": "Medir Dimensões (Metrologia)", 
      "es": "Medir Dimensiones (Metrología)" 
  },
  "Check Surface Flatness": { 
      "en": "Check Surface Flatness", 
      "pt-BR": "Verificar Planicidade da Superfície", 
      "es": "Verificar Planitud de la Superficie" 
  },
  "Detect Surface Flaws": { 
      "en": "Detect Surface Flaws", 
      "pt-BR": "Detectar Falhas na Superfície", 
      "es": "Detectar Defectos Superficiales" 
  },
  "Calibrate Robot Coordinate System": { 
      "en": "Calibrate Robot Coordinate System", 
      "pt-BR": "Calibrar Sistema de Coordenadas do Robô", 
      "es": "Calibrar Sistema de Coordenadas del Robot" 
  },
  // Bottle Cap
  "Inspect Liner Seal Integrity": { 
      "en": "Inspect Liner Seal Integrity", 
      "pt-BR": "Inspecionar Integridade do Vedante (Liner)", 
      "es": "Inspeccionar Integridad del Sello (Liner)" 
  },
  "Verify Logo Print Quality": { 
      "en": "Verify Logo Print Quality", 
      "pt-BR": "Verificar Qualidade de Impressão do Logo", 
      "es": "Verificar Calidad de Impresión del Logo" 
  },
  "Check for Deformed Criminp": { 
      "en": "Check for Deformed Crimp", 
      "pt-BR": "Verificar Crimpagem Deformada", 
      "es": "Verificar Crimpado Deformado" 
  },
  "Read Top Print Code": { 
      "en": "Read Top Print Code", 
      "pt-BR": "Ler Código Impresso no Topo", 
      "es": "Leer Código Impreso en la Parte Superior" 
  }
};
