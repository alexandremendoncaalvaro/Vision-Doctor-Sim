

import { Language } from './types';

export const GOAL_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Read Laser Etched Text (OCR)": {
    "pt-BR": "Ler Texto Gravado a Laser (OCR)",
    "en": "Read Laser Etched Text (OCR)",
    "es": "Leer Texto Grabado con Láser (OCR)"
  },
  "Check Solder Bridges (Shorts)": {
    "pt-BR": "Verificar Pontes de Solda (Curtos)",
    "en": "Check Solder Bridges (Shorts)",
    "es": "Verificar Puentes de Soldadura (Cortos)"
  },
  "Verify Component Presence": {
    "pt-BR": "Verificar Presença de Componentes",
    "en": "Verify Component Presence",
    "es": "Verificar Presencia de Componentes"
  },
  "Inspect Fill Level": {
    "pt-BR": "Inspecionar Nível de Enchimento",
    "en": "Inspect Fill Level",
    "es": "Inspeccionar Nivel de Llenado"
  },
  "Read Label Text": {
    "pt-BR": "Ler Texto do Rótulo",
    "en": "Read Label Text",
    "es": "Leer Texto de la Etiqueta"
  },
  "Read Bottom Dot Peen Code": {
    "pt-BR": "Ler Código Dot Peen no Fundo",
    "en": "Read Bottom Dot Peen Code",
    "es": "Leer Código Dot Peen Inferior"
  },
  "Inspect Pull Tab Integrity": {
    "pt-BR": "Inspecionar Integridade do Anel",
    "en": "Inspect Pull Tab Integrity",
    "es": "Inspeccionar Integridad de la Anilla"
  },
  "Measure Dimensions (Backlight)": {
    "pt-BR": "Medir Dimensões (Backlight)",
    "en": "Measure Dimensions (Backlight)",
    "es": "Medir Dimensiones (Luz Trasera)"
  },
  "Check Surface Flatness": {
    "pt-BR": "Verificar Planicidade da Superfície",
    "en": "Check Surface Flatness",
    "es": "Verificar Planitud de la Superficie"
  },
  "Read Top Print Code": {
    "pt-BR": "Ler Código Impresso no Topo",
    "en": "Read Top Print Code",
    "es": "Leer Código Impreso Superior"
  },
  "Inspect Liner Seal Integrity": {
    "pt-BR": "Inspecionar Integridade da Vedação",
    "en": "Inspect Liner Seal Integrity",
    "es": "Inspeccionar Integridad del Sello"
  }
};

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
    objOrientation: "Orientación do Objeto",
    sensorFormat: "Formato do Sensor",
    focalLength: "Distância Focal (mm)",
    aperture: "Abertura (f-stop)",
    workingDistance: "Distância de Trabalho",
    tiltAngle: "Ângulo de Inclinação",
    lensFilter: "Filtro de Lente",
    lightType: "Tipo de Luz",
    lightPos: "Posição",
    lightConfig: "Configuração",
    lightDist: "Distância da Luz (mm)",
    lightColor: "Cor da Luz",
    lightIntensity: "Intensidade da Luz",
    lightMultiplier: "Multiplicador de Intensidade",
    exposureTime: "Tempo de Exposição",
    sensorGain: "Ganho do Sensor",
    background: "Fundo",
    visualNoise: "Poluição Visual",
    lineSpeed: "Velocidade da Linha",
    vibration: "Nível de Vibração",
    roiSize: "Tamanho da ROI",
    globalEnv: "Ambiente Global",
    globalIntensity: "Intensidade Global",

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
        Front: "Frente", Side: "Lado", Back: "Trás", Top: "Topo", Bottom: "Baixo", Custom: "Personalizado (6-DOF)"
    },
    fixtures: {
        "Ring Light": "Anel (Ring)",
        "Bar Light": "Barra (Bar)",
        "Spot Light": "Spot",
        "Backlight Panel": "Painel (Backlight)",
        "Coaxial": "Coaxial",
        "Dome (Cloudy Day)": "Domo (Dome)",
        "Tunnel (Flat Dome)": "Túnel (Flat Dome)"
    },
    positions: {
        "Camera Axis (Bright Field)": "Eixo Câmera (Campo Claro)",
        "Backlight (Silhouette)": "Backlight (Silhueta)",
        "Top (Direct)": "Topo (Direto)",
        "Side (Oblique)": "Lateral (Oblíquo)",
        "Low Angle (Dark Field)": "Ângulo Baixo (Campo Escuro)",
        "Surrounding (Diffuse)": "Envolvente (Difuso)"
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
    envs: {
        "Studio (Dark Box)": "Estúdio (Caixa Escura)",
        "Factory Floor": "Fábrica (Luz Fria)",
        "Direct Sunlight": "Luz Solar (Direta)"
    },
    patterns: {
        "Level 1 (Low)": "Baixa",
        "Level 2 (Medium)": "Média",
        "Level 3 (High)": "Alta"
    },
    filters: {
        "None": "Nenhum",
        "Polarizer (CPL)": "Polarizador (CPL)",
        "Red Bandpass (630nm)": "Passa-Faixa Vermelho (Red)",
        "Blue Bandpass (470nm)": "Passa-Faixa Azul (Blue)",
        "Green Bandpass (525nm)": "Passa-Faixa Verde (Green)"
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
    statDof: "Profundidad de Campo",
    
    hudSensor: "VISÃO DO SENSOR",
    hudWorld: "VISÃO DO MUNDO",
    hudExp: "EXP",
    hudGain: "GANHO",
    hudFps: "FPS",
    
    valFraming: "Enquadramento (ROI)",
    valResolution: "Resolução (px/mm)",
    valFocus: "Foco (DoF)",
    valStability: "Estabilidade",
    valContrast: "Contraste",
    valExposure: "Exposição",
    valGlare: "Reflexos (Glare)",
    valTechnique: "Técnica",
    valGood: "Bom",
    valAcceptable: "Aceitável",
    valPoor: "Ruim",
    valDark: "Escuro",
    valBright: "Claro",
    valShallow: "Raso",
    valWarning: "Risco Alto",
    valWrongGeo: "Luz Bloqueando Câmera",
    valWrongTech: "Técnica Incorreta",

    dofPos: "Pos",
    dofRot: "Rot"
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
    lensFilter: "Lens Filter",
    lightType: "Light Fixture",
    lightPos: "Position",
    lightConfig: "Configuration",
    lightDist: "Light Distance (mm)",
    lightColor: "Light Color",
    lightIntensity: "Light Intensity",
    lightMultiplier: "Intensity Multiplier",
    exposureTime: "Exposure Time",
    sensorGain: "Sensor Gain",
    background: "Background",
    visualNoise: "Visual Noise / Clutter",
    lineSpeed: "Line Speed",
    vibration: "Vibration Level",
    roiSize: "ROI Size",
    globalEnv: "Global Environment",
    globalIntensity: "Global Intensity",

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
        Front: "Front", Side: "Side", Back: "Back", Top: "Top", Bottom: "Bottom", Custom: "Custom (6-DOF)"
    },
    fixtures: {
        "Ring Light": "Ring Light",
        "Bar Light": "Bar Light",
        "Spot Light": "Spot Light",
        "Backlight Panel": "Backlight Panel",
        "Coaxial": "Coaxial",
        "Dome (Cloudy Day)": "Dome (Cloudy Day)",
        "Tunnel (Flat Dome)": "Tunnel (Flat Dome)"
    },
    positions: {
        "Camera Axis (Bright Field)": "Camera Axis (Bright Field)",
        "Backlight (Silhouette)": "Backlight (Silhouette)",
        "Top (Direct)": "Top (Direct)",
        "Side (Oblique)": "Side (Oblique)",
        "Low Angle (Dark Field)": "Low Angle (Dark Field)",
        "Surrounding (Diffuse)": "Surrounding (Diffuse)"
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
    envs: {
        "Studio (Dark Box)": "Studio (Dark Box)",
        "Factory Floor": "Factory Floor (Cool)",
        "Direct Sunlight": "Direct Sunlight"
    },
    patterns: {
        "Level 1 (Low)": "Level 1 (Low)",
        "Level 2 (Medium)": "Level 2 (Medium)",
        "Level 3 (High)": "Level 3 (High)"
    },
    filters: {
        "None": "None",
        "Polarizer (CPL)": "Polarizer (CPL)",
        "Red Bandpass (630nm)": "Red Bandpass (630nm)",
        "Blue Bandpass (470nm)": "Blue Bandpass (470nm)",
        "Green Bandpass (525nm)": "Green Bandpass (525nm)"
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
    valResolution: "Resolution (px/mm)",
    valFocus: "Focus (DoF)",
    valStability: "Stability",
    valContrast: "Contrast",
    valExposure: "Exposure",
    valGlare: "Glare (Reflections)",
    valTechnique: "Technique",
    valGood: "Good",
    valAcceptable: "Acceptable",
    valPoor: "Poor",
    valDark: "Dark",
    valBright: "Bright",
    valShallow: "Shallow",
    valWarning: "High Risk",
    valWrongGeo: "Light Blocking Camera",
    valWrongTech: "Wrong Technique",
    dofPos: "Pos",
    dofRot: "Rot"
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
    lensFilter: "Filtro de Lente",
    lightType: "Luminaria",
    lightPos: "Posición",
    lightConfig: "Configuración",
    lightDist: "Distancia de Luz (mm)",
    lightColor: "Color de Luz",
    lightIntensity: "Intensidad de Luz",
    lightMultiplier: "Multiplicador de Intensidad",
    exposureTime: "Tiempo de Exposición",
    sensorGain: "Ganancia del Sensor",
    background: "Fondo",
    visualNoise: "Ruido Visual",
    lineSpeed: "Velocidad de Línea",
    vibration: "Nivel de Vibración",
    roiSize: "Tamaño de ROI",
    globalEnv: "Entorno Global",
    globalIntensity: "Intensidad Global",
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
        Front: "Frente", Side: "Lado", Back: "Atrás", Top: "Superior", Bottom: "Inferior", Custom: "Personalizado (6-DOF)"
    },
    fixtures: {
        "Ring Light": "Anillo (Ring)",
        "Bar Light": "Barra (Bar)",
        "Spot Light": "Spot",
        "Backlight Panel": "Panel (Luz Trasera)",
        "Coaxial": "Coaxial",
        "Dome (Cloudy Day)": "Domo (Dome)",
        "Tunnel (Flat Dome)": "Túnel (Flat Dome)"
    },
    positions: {
        "Camera Axis (Bright Field)": "Eje de Cámara (Campo Claro)",
        "Backlight (Silhouette)": "Luz Trasera (Silueta)",
        "Top (Direct)": "Superior (Directo)",
        "Side (Oblique)": "Lateral (Oblicuo)",
        "Low Angle (Dark Field)": "Ángulo Bajo (Campo Oscuro)",
        "Surrounding (Diffuse)": "Envolvente (Difuso)"
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
    envs: {
        "Studio (Dark Box)": "Estudio (Caja Oscura)",
        "Factory Floor": "Fábrica (Luz Fría)",
        "Direct Sunlight": "Luz Solar (Directa)"
    },
    patterns: {
        "Level 1 (Low)": "Bajo",
        "Level 2 (Medium)": "Medio",
        "Level 3 (High)": "Alto"
    },
    filters: {
        "None": "Ninguno",
        "Polarizer (CPL)": "Polarizador (CPL)",
        "Red Bandpass (630nm)": "Paso de Banda Rojo",
        "Blue Bandpass (470nm)": "Paso de Banda Azul",
        "Green Bandpass (525nm)": "Paso de Banda Verde"
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
    valResolution: "Resolución (px/mm)",
    valFocus: "Enfoque (DoF)",
    valStability: "Estabilidad",
    valContrast: "Contraste",
    valExposure: "Exposición",
    valGlare: "Reflejos (Glare)",
    valTechnique: "Técnica",
    valGood: "Bueno",
    valAcceptable: "Aceptable",
    valPoor: "Malo",
    valDark: "Oscuro",
    valBright: "Brillante",
    valShallow: "Poco Profundo",
    valWarning: "Riesgo Alto",
    valWrongGeo: "Luz Bloquea Cámara",
    valWrongTech: "Técnica Incorrecta",
    dofPos: "Pos",
    dofRot: "Rot"
  }
};