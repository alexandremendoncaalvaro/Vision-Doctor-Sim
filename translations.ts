
import { Language, LightFixture, LightColor, GlobalEnv, ObjectType, LensFilter } from './types';

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
    objOrientation: "Orientação do Objeto",
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
    lightQualityLabel: "Qualidade da Luz:",

    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Configurar",
    autoTuneDesc: "Aplicar configuração recomendada completa para o cenário atual",

    objects: {
      [ObjectType.PCB]: "Placa PCB",
      [ObjectType.GlassBottle]: "Garrafa de Vidro (Âmbar)",
      [ObjectType.AluminumCan]: "Lata de Alumínio",
      [ObjectType.MatteBlock]: "Bloco Fosco",
      [ObjectType.BottleCap]: "Tampa de Garrafa"
    },
    focus: {
        Top: "Topo", Middle: "Meio", Bottom: "Fundo", Whole: "Inteiro"
    },
    orientation: {
        Front: "Frente", Side: "Lado", Back: "Trás", Top: "Topo", Bottom: "Baixo", Custom: "Personalizado (6-DOF)"
    },
    fixtures: {
        [LightFixture.Ring]: "Anel (Ring)",
        [LightFixture.Bar]: "Barra (Bar)",
        [LightFixture.Spot]: "Spot",
        [LightFixture.Panel]: "Painel (Backlight)",
        [LightFixture.Coaxial]: "Coaxial",
        [LightFixture.Dome]: "Domo (Dome)",
        [LightFixture.Tunnel]: "Túnel (Flat Dome)"
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
        [LightColor.White]: "Branco (CRI Alto)",
        [LightColor.Red]: "Vermelho (630nm)",
        [LightColor.Blue]: "Azul (470nm)",
        [LightColor.IR]: "Infravermelho (850nm)",
        [LightColor.UV]: "UV (365nm)"
    },
    envs: {
        [GlobalEnv.Studio]: "Estúdio (Caixa Escura)",
        [GlobalEnv.Factory]: "Fábrica (Luz Fria)",
        [GlobalEnv.Sunlight]: "Luz Solar (Direta)"
    },
    patterns: {
        "Level 1 (Low)": "Baixa",
        "Level 2 (Medium)": "Média",
        "Level 3 (High)": "Alta"
    },
    filters: {
        [LensFilter.None]: "Nenhum",
        [LensFilter.Polarizer]: "Polarizador (CPL)",
        [LensFilter.Red]: "Passa-Faixa Vermelho (Red)",
        [LensFilter.Blue]: "Passa-Faixa Azul (Blue)",
        [LensFilter.Green]: "Passa-Faixa Verde (Green)"
    },
    
    // Light Quality Descriptions
    qualityDesc: {
      [LightFixture.Panel]: "Colimada / Difusa",
      [LightFixture.Bar]: "Dura / Direcional",
      [LightFixture.Ring]: "Dura (Direta)",
      [LightFixture.Spot]: "Fonte Pontual Dura",
      [LightFixture.Coaxial]: "Colimada / Uniforme",
      [LightFixture.Dome]: "Suave / Difusa",
      [LightFixture.Tunnel]: "Suave / Difusa"
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
    
    // Schematic Labels
    schCamera: "Câmera",
    schLens: "Lente",
    schObject: "Objeto",
    schBacklight: "Backlight",
    schLowAngle: "Ângulo Baixo",
    schCoaxial: "Coaxial",
    schWd: "DT",
    schDarkFieldRing: "Anel Campo Escuro",
    schDarkFieldBar: "Barra Campo Escuro",
    schDomeTunnel: "Domo / Túnel",
    schBarLight: "Barra de Luz",
    
    statFov: "FOV (L x A)",
    statMag: "Ampliação",
    statDof: "Profundidade de Campo",
    
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
    
    // Validation Status
    status: {
       good: "Bom",
       acceptable: "Aceitável",
       poor: "Ruim",
       dark: "Escuro",
       bright: "Claro",
       shallow: "Raso",
       warning: "Risco Alto",
       none: "Ok",
       wrong_geometry: "Incorreto"
    },
    
    // Validation Reasons
    reasons: {
       reqBacklight: "Objetivo requer Backlight (Silhueta).",
       reqDarkfield: "Objetivo requer Luz Rasante (Campo Escuro).",
       backlightWashout: "Backlight ofusca o texto da superfície.",
       glareRisk: "Luz direta em metal causa reflexos excessivos."
    },

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
    lightQualityLabel: "Light Quality:",

    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Tune",
    autoTuneDesc: "Apply comprehensive recommended configuration",
    objects: {
      [ObjectType.PCB]: "PCB Board",
      [ObjectType.GlassBottle]: "Glass Bottle (Amber)",
      [ObjectType.AluminumCan]: "Aluminum Can",
      [ObjectType.MatteBlock]: "Matte Block",
      [ObjectType.BottleCap]: "Bottle Cap"
    },
    focus: {
        Top: "Top", Middle: "Middle", Bottom: "Bottom", Whole: "Whole"
    },
    orientation: {
        Front: "Front", Side: "Side", Back: "Back", Top: "Top", Bottom: "Bottom", Custom: "Custom (6-DOF)"
    },
    fixtures: {
        [LightFixture.Ring]: "Ring Light",
        [LightFixture.Bar]: "Bar Light",
        [LightFixture.Spot]: "Spot Light",
        [LightFixture.Panel]: "Backlight Panel",
        [LightFixture.Coaxial]: "Coaxial Light",
        [LightFixture.Dome]: "Dome Light",
        [LightFixture.Tunnel]: "Tunnel Light"
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
        [LightColor.White]: "White (CRI High)",
        [LightColor.Red]: "Red (630nm)",
        [LightColor.Blue]: "Blue (470nm)",
        [LightColor.IR]: "Infrared (850nm)",
        [LightColor.UV]: "UV (365nm)"
    },
    envs: {
        [GlobalEnv.Studio]: "Studio (Dark Box)",
        [GlobalEnv.Factory]: "Factory Floor",
        [GlobalEnv.Sunlight]: "Direct Sunlight"
    },
    patterns: {
        "Level 1 (Low)": "Level 1 (Low)",
        "Level 2 (Medium)": "Level 2 (Medium)",
        "Level 3 (High)": "Level 3 (High)"
    },
    filters: {
        [LensFilter.None]: "None",
        [LensFilter.Polarizer]: "Polarizer (CPL)",
        [LensFilter.Red]: "Red Bandpass (630nm)",
        [LensFilter.Blue]: "Blue Bandpass (470nm)",
        [LensFilter.Green]: "Green Bandpass (525nm)"
    },

    qualityDesc: {
      [LightFixture.Panel]: "Collimated / Diffuse",
      [LightFixture.Bar]: "Hard / Directional",
      [LightFixture.Ring]: "Hard (Direct)",
      [LightFixture.Spot]: "Hard Point Source",
      [LightFixture.Coaxial]: "Collimated / Uniform",
      [LightFixture.Dome]: "Soft / Diffuse",
      [LightFixture.Tunnel]: "Soft / Diffuse"
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
    
    // Schematic Labels
    schCamera: "Camera",
    schLens: "Lens",
    schObject: "Object",
    schBacklight: "Backlight",
    schLowAngle: "Low Angle",
    schCoaxial: "Coaxial",
    schWd: "WD",
    schDarkFieldRing: "Dark Field Ring",
    schDarkFieldBar: "Dark Field Bar",
    schDomeTunnel: "Dome / Tunnel",
    schBarLight: "Bar Light",

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

    // Validation Status
    status: {
       good: "Good",
       acceptable: "Acceptable",
       poor: "Poor",
       dark: "Dark",
       bright: "Bright",
       shallow: "Shallow",
       warning: "High Risk",
       none: "Ok",
       wrong_geometry: "Incorrect"
    },
    
    // Validation Reasons
    reasons: {
       reqBacklight: "Goal requires Backlight (Silhouette).",
       reqDarkfield: "Goal requires Grazing Light (Dark Field).",
       backlightWashout: "Backlight washes out surface text.",
       glareRisk: "Direct light on metal causes excessive glare."
    },

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
    lightQualityLabel: "Calidad de Luz:",

    analyzeBtn: "",
    analyzing: "",
    autoTune: "Auto-Ajustar",
    autoTuneDesc: "Aplicar configuración completa recomendada",
    objects: {
      [ObjectType.PCB]: "Placa PCB",
      [ObjectType.GlassBottle]: "Botella de Vidrio (Ámbar)",
      [ObjectType.AluminumCan]: "Lata de Aluminio",
      [ObjectType.MatteBlock]: "Bloque Mate",
      [ObjectType.BottleCap]: "Tapa de Botella"
    },
    focus: {
        Top: "Superior", Middle: "Medio", Bottom: "Inferior", Whole: "Entero"
    },
    orientation: {
        Front: "Frente", Side: "Lado", Back: "Atrás", Top: "Superior", Bottom: "Inferior", Custom: "Personalizado (6-DOF)"
    },
    fixtures: {
        [LightFixture.Ring]: "Anillo (Ring)",
        [LightFixture.Bar]: "Barra (Bar)",
        [LightFixture.Spot]: "Spot",
        [LightFixture.Panel]: "Panel (Luz Trasera)",
        [LightFixture.Coaxial]: "Coaxial",
        [LightFixture.Dome]: "Domo (Dome)",
        [LightFixture.Tunnel]: "Túnel (Flat Dome)"
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
        [LightColor.White]: "Blanco (CRI Alto)",
        [LightColor.Red]: "Rojo (630nm)",
        [LightColor.Blue]: "Azul (470nm)",
        [LightColor.IR]: "Infrarrojo (850nm)",
        [LightColor.UV]: "UV (365nm)"
    },
    envs: {
        [GlobalEnv.Studio]: "Estudio (Caja Oscura)",
        [GlobalEnv.Factory]: "Fábrica (Luz Fría)",
        [GlobalEnv.Sunlight]: "Luz Solar (Directa)"
    },
    patterns: {
        "Level 1 (Low)": "Bajo",
        "Level 2 (Medium)": "Medio",
        "Level 3 (High)": "Alto"
    },
    filters: {
        [LensFilter.None]: "Ninguno",
        [LensFilter.Polarizer]: "Polarizador (CPL)",
        [LensFilter.Red]: "Paso de Banda Rojo",
        [LensFilter.Blue]: "Paso de Banda Azul",
        [LensFilter.Green]: "Paso de Banda Verde"
    },

    qualityDesc: {
      [LightFixture.Panel]: "Colimada / Difusa",
      [LightFixture.Bar]: "Dura / Direccional",
      [LightFixture.Ring]: "Dura (Directa)",
      [LightFixture.Spot]: "Fuente Puntual Dura",
      [LightFixture.Coaxial]: "Colimada / Uniforme",
      [LightFixture.Dome]: "Suave / Difusa",
      [LightFixture.Tunnel]: "Suave / Difusa"
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
    
    // Schematic Labels
    schCamera: "Cámara",
    schLens: "Lente",
    schObject: "Objeto",
    schBacklight: "Luz Trasera",
    schLowAngle: "Bajo Ángulo",
    schCoaxial: "Coaxial",
    schWd: "DT",
    schDarkFieldRing: "Anillo Campo Oscuro",
    schDarkFieldBar: "Barra Campo Oscuro",
    schDomeTunnel: "Domo / Túnel",
    schBarLight: "Barra de Luz",

    statFov: "FOV (L x A)",
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
    
    // Validation Status
    status: {
       good: "Bueno",
       acceptable: "Aceptable",
       poor: "Malo",
       dark: "Oscuro",
       bright: "Brillante",
       shallow: "Poco Profundo",
       warning: "Riesgo Alto",
       none: "Ok",
       wrong_geometry: "Incorrecto"
    },
    
    // Validation Reasons
    reasons: {
       reqBacklight: "Objetivo requiere Luz Trasera (Silueta).",
       reqDarkfield: "Objetivo requiere Luz Rasante (Campo Oscuro).",
       backlightWashout: "Luz Trasera apaga el texto de la superficie.",
       glareRisk: "Luz directa en metal causa reflejos excesivos."
    },

    dofPos: "Pos",
    dofRot: "Rot"
  }
};
