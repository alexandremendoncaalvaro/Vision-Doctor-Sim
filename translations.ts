
import { Language } from './types';

export const TEXTS = {
  'pt-BR': {
    appTitle: "Simulador Vision Doctor",
    appSubtitle: "Simulador Óptico Industrial",
    
    sectionObject: "Objeto e Objetivo",
    sectionView: "Vista e Orientação",
    sectionCamera: "Câmera, Lente e Exposição",
    sectionLight: "Iluminação",
    sectionEnv: "Ambiente e Movimento",

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
    lightPos: "Posição",
    lightConfig: "Configuração",
    lightDist: "Distância da Luz (mm)",
    lightColor: "Cor da Luz",
    lightIntensity: "Intensidade da Luz",
    exposureTime: "Tempo de Exposição",
    sensorGain: "Ganho do Sensor",
    background: "Fundo",
    lineSpeed: "Velocidade da Linha",
    vibration: "Nível de Vibração",
    roiSize: "Tamanho da ROI",
    
    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Configurar",
    autoTuneDesc: "Aplicar configuração recomendada completa para o cenário atual",

    objects: {
      "PCB Board": "Placa PCB",
      "Glass Bottle (Amber)": "Garrafa de Vidro (Âmbar)",
      "Aluminum Can": "Lata de Alumínio",
      "Matte Block": "Bloco Fosco",
      "Bottle Cap": "Tampa de Garrafa"
    },
    focus: {
        Top: "Topo", Middle: "Meio", Bottom: "Fundo", Whole: "Inteiro"
    },
    orientation: {
        Front: "Frente", Side: "Lado", Back: "Trás", Top: "Topo", Bottom: "Baixo"
    },
    fixtures: {
        "Ring": "Anel (Ring)",
        "Bar": "Barra (Bar)",
        "Spot": "Spot",
        "Panel": "Painel (Backlight)",
        "Coaxial": "Coaxial"
    },
    positions: {
        "Camera Axis": "Eixo da Câmera",
        "Backlight": "Backlight (Atrás)",
        "Top": "Topo",
        "Side": "Lateral",
        "Low Angle": "Ângulo Baixo",
        "Multi-Angle": "Multi-Ângulo"
    },
    configs: {
        "Small": "Pequeno",
        "Medium": "Médio",
        "Large": "Grande",
        "Single": "Único",
        "Dual (Opposite)": "Duplo (Oposto)",
        "Quad (Square)": "Quadruplo (Quadrado)",
        "Narrow": "Foco Estreito",
        "Wide": "Foco Aberto"
    },
    colors: {
        "White": "Branco", "Red": "Vermelho", "Blue": "Azul", "Infrared": "Infravermelho", "UV": "UV"
    },
    
    schematic: "Esquemático",
    simulator: "Simulador",
    cameraView: "Visão da Câmera",
    freeView: "Visão 3D Livre",
    toggleDoctor: "",
    
    reportTitle: "",
    reportScore: "Adequação",
    reportExcellent: "Excelente",
    reportAcceptable: "Aceitável",
    reportPoor: "Ruim",
    noReport: "",
    scenarioCheck: "Verificação de Cenário",
    
    schCamera: "Câmera",
    schLens: "Lente",
    schObject: "Objeto",
    schBacklight: "Backlight",
    schLowAngle: "Ângulo Baixo",
    schCoaxial: "Coaxial",
    schWd: "DT",
    
    statFov: "FOV (H x V)",
    statMag: "Ampliação",
    statDof: "Profundidade de Campo",
    
    hudSensor: "VISÃO DO SENSOR",
    hudWorld: "VISÃO DO MUNDO",
    hudExp: "EXP",
    hudGain: "GANHO",
    hudFps: "FPS",
    
    valFraming: "Enquadramento (ROI)",
    valStability: "Estabilidade",
    valContrast: "Contraste",
    valExposure: "Exposição",
    valTechnique: "Técnica",
    valGood: "Bom",
    valAcceptable: "Aceitável",
    valPoor: "Ruim",
    valDark: "Escuro",
    valBright: "Claro",
    valWrongGeo: "Luz Bloqueando Câmera",
    valWrongTech: "Técnica Incorreta"
  },
  'en': {
    appTitle: "Vision Doctor Simulator",
    appSubtitle: "Industrial Optical Simulator",
    sectionObject: "Object & Goal",
    sectionView: "View & Orientation",
    sectionCamera: "Camera, Lens & Exposure",
    sectionLight: "Lighting",
    sectionEnv: "Environment & Motion",
    targetObject: "Target Object",
    inspectionGoal: "Inspection Goal",
    cameraFocus: "Camera Focus",
    objOrientation: "Object Orientation",
    sensorFormat: "Sensor Format",
    focalLength: "Focal Length (mm)",
    aperture: "Aperture (f-stop)",
    workingDistance: "Working Distance",
    tiltAngle: "Tilt Angle",
    lightType: "Light Fixture",
    lightPos: "Position",
    lightConfig: "Configuration",
    lightDist: "Light Distance (mm)",
    lightColor: "Light Color",
    lightIntensity: "Light Intensity",
    exposureTime: "Exposure Time",
    sensorGain: "Sensor Gain",
    background: "Background",
    lineSpeed: "Line Speed",
    vibration: "Vibration Level",
    roiSize: "ROI Size",
    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Tune",
    autoTuneDesc: "Apply comprehensive recommended configuration",
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
    fixtures: {
        "Ring": "Ring Light",
        "Bar": "Bar Light",
        "Spot": "Spot Light",
        "Panel": "Panel (Backlight)",
        "Coaxial": "Coaxial"
    },
    positions: {
        "Camera Axis": "Camera Axis",
        "Backlight": "Backlight (Behind)",
        "Top": "Top",
        "Side": "Side",
        "Low Angle": "Low Angle",
        "Multi-Angle": "Multi-Angle"
    },
    configs: {
        "Small": "Small",
        "Medium": "Medium",
        "Large": "Large",
        "Single": "Single",
        "Dual (Opposite)": "Dual (Opposite)",
        "Quad (Square)": "Quad (Square)",
        "Narrow": "Narrow Beam",
        "Wide": "Wide Beam"
    },
    colors: {
        "White": "White", "Red": "Red", "Blue": "Blue", "Infrared": "Infrared", "UV": "UV"
    },
    schematic: "Schematic",
    simulator: "Simulator",
    cameraView: "Camera View",
    freeView: "Free View",
    toggleDoctor: "",
    reportTitle: "",
    reportScore: "Suitability",
    reportExcellent: "Excellent",
    reportAcceptable: "Acceptable",
    reportPoor: "Poor",
    noReport: "",
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
    valTechnique: "Technique",
    valGood: "Good",
    valAcceptable: "Acceptable",
    valPoor: "Poor",
    valDark: "Dark",
    valBright: "Bright",
    valWrongGeo: "Light Blocking Camera",
    valWrongTech: "Wrong Technique"
  },
  'es': {
    appTitle: "Simulador Vision Doctor",
    appSubtitle: "Simulador Óptico Industrial",
    sectionObject: "Objeto y Objetivo",
    sectionView: "Vista y Orientación",
    sectionCamera: "Cámara, Lente y Exposición",
    sectionLight: "Iluminación",
    sectionEnv: "Ambiente y Movimiento",
    targetObject: "Objeto Objetivo",
    inspectionGoal: "Objetivo de Inspección",
    cameraFocus: "Enfoque de Cámara",
    objOrientation: "Orientación del Objeto",
    sensorFormat: "Formato del Sensor",
    focalLength: "Distancia Focal (mm)",
    aperture: "Apertura (f-stop)",
    workingDistance: "Distancia de Trabajo",
    tiltAngle: "Ángulo de Inclinación",
    lightType: "Luminaria",
    lightPos: "Posición",
    lightConfig: "Configuración",
    lightDist: "Distancia de Luz (mm)",
    lightColor: "Color de Luz",
    lightIntensity: "Intensidad de Luz",
    exposureTime: "Tiempo de Exposición",
    sensorGain: "Ganancia del Sensor",
    background: "Fondo",
    lineSpeed: "Velocidad de Línea",
    vibration: "Nivel de Vibración",
    roiSize: "Tamaño de ROI",
    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Ajustar",
    autoTuneDesc: "Aplicar configuración completa recomendada",
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
    fixtures: {
        "Ring": "Anillo (Ring)",
        "Bar": "Barra (Bar)",
        "Spot": "Spot",
        "Panel": "Panel (Luz Trasera)",
        "Coaxial": "Coaxial"
    },
    positions: {
        "Camera Axis": "Eje de Cámara",
        "Backlight": "Luz Trasera (Atrás)",
        "Top": "Superior",
        "Side": "Lateral",
        "Low Angle": "Ángulo Bajo",
        "Multi-Angle": "Multi-Ángulo"
    },
    configs: {
        "Small": "Pequeño",
        "Medium": "Medio",
        "Large": "Grande",
        "Single": "Único",
        "Dual (Opposite)": "Doble (Opuesto)",
        "Quad (Square)": "Cuádruple (Cuadrado)",
        "Narrow": "Haz Estrecho",
        "Wide": "Haz Ancho"
    },
    colors: {
        "White": "Blanco", "Red": "Rojo", "Blue": "Azul", "Infrared": "Infrarrojo", "UV": "UV"
    },
    schematic: "Esquemático",
    simulator: "Simulador",
    cameraView: "Vista de Cámara",
    freeView: "Vista Libre 3D",
    toggleDoctor: "",
    reportTitle: "",
    reportScore: "Idoneidad",
    reportExcellent: "Excelente",
    reportAcceptable: "Aceptable",
    reportPoor: "Pobre",
    noReport: "",
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
    valTechnique: "Técnica",
    valGood: "Bueno",
    valAcceptable: "Aceptable",
    valPoor: "Malo",
    valDark: "Oscuro",
    valBright: "Brillante",
    valWrongGeo: "Luz Bloquea Cámara",
    valWrongTech: "Técnica Incorrecta"
  }
};

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
  // Glass Bottle
  "Inspect Fill Level": { 
      "en": "Inspect Fill Level", 
      "pt-BR": "Inspecionar Nível de Enchimento", 
      "es": "Inspeccionar Nivel de Llenado" 
  },
  "Read Label Text": { 
      "en": "Read Label Text", 
      "pt-BR": "Ler Texto do Rótulo", 
      "es": "Leer Texto de Etiqueta" 
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
  // Matte Block
  "Measure Dimensions (Backlight)": { 
      "en": "Measure Dimensions (Backlight)", 
      "pt-BR": "Medir Dimensões (Backlight)", 
      "es": "Medir Dimensiones (Luz Trasera)" 
  },
  "Check Surface Flatness": { 
      "en": "Check Surface Flatness", 
      "pt-BR": "Verificar Planicidade da Superfície", 
      "es": "Verificar Planitud de la Superficie" 
  },
  // Bottle Cap
  "Inspect Liner Seal Integrity": { 
      "en": "Inspect Liner Seal Integrity", 
      "pt-BR": "Inspecionar Integridade do Vedante (Liner)", 
      "es": "Inspeccionar Integridad del Sello (Liner)" 
  },
  "Read Top Print Code": { 
      "en": "Read Top Print Code", 
      "pt-BR": "Ler Código Impresso no Topo", 
      "es": "Leer Código Impreso en la Parte Superior" 
  }
};
