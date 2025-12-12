import { GoogleGenAI, Type } from "@google/genai";
import { SimulationState, OpticalMetrics, DoctorAdvice } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

export const analyzeSetup = async (
  state: SimulationState, 
  metrics: OpticalMetrics
): Promise<DoctorAdvice> => {
  if (!GEMINI_API_KEY) {
    return {
      summary: "API Key Missing",
      details: ["Please configure the API_KEY environment variable to use the Vision Doctor AI."],
      score: 0
    };
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const prompt = `
    You are an expert Machine Vision Engineer ("Vision Doctor"). 
    Analyze the following optical setup for industrial inspection.
    
    Target Application:
    - Object: ${state.objectType}
    - Specific Goal: ${state.inspectionGoal}
    - Object Orientation: ${state.objectOrientation}
    - Camera View: Focusing on ${state.viewFocus}
    
    Current Setup:
    - Sensor: ${state.sensorFormat}
    - Focal Length: ${state.focalLength}mm
    - Aperture: f/${state.aperture}
    - Working Distance: ${state.workingDistance}mm
    - Lighting: ${state.lightColor} ${state.lightType}
    
    Calculated Metrics:
    - FOV: ${metrics.fovWidth.toFixed(1)} x ${metrics.fovHeight.toFixed(1)} mm
    - Magnification: ${metrics.magnification.toFixed(3)}x
    - Depth of Field: ${metrics.dof.toFixed(2)} mm
    
    Task:
    Provide a critique of this setup specifically for the goal: "${state.inspectionGoal}".
    1. Is the resolution/magnification sufficient for this specific goal?
    2. Is the lighting type and color appropriate for the material and defect type? (e.g. Low angle for scratches, Backlight for dimensions/fill level).
    3. Is the view angle correct? (e.g. Top view for caps, Side view for labels).
    4. Give a suitability score (0-100).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A one-sentence summary of the setup quality." },
            details: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3-4 bullet points of technical advice."
            },
            score: { type: Type.INTEGER, description: "Suitability score from 0 to 100." }
          },
          required: ["summary", "details", "score"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DoctorAdvice;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Analysis Failed",
      details: ["Could not connect to the Vision Doctor AI.", "Check your internet connection or API key."],
      score: 0
    };
  }
};
