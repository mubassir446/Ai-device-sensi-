import { GoogleGenAI, Type } from "@google/genai";
import { SensitivitySettings, DeviceOS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

function generateSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export async function generateSensitivity(os: DeviceOS, brand: string, model: string): Promise<SensitivitySettings> {
  const seed = generateSeed(`${brand.toLowerCase()}-${model.toLowerCase()}`);
  
  const prompt = `Generate the best Free Fire sensitivity settings, fire button size, and DPI (Dots Per Inch) for a ${os} device: ${brand} ${model}. 
  The settings should be optimized for headshots and smooth gameplay. 
  
  IMPORTANT: 
  - We support over 10,000+ devices, so provide highly specific values for this exact model.
  - For iOS devices, DPI is NOT applicable. Set DPI to 0 for iOS.
  - For Android devices, provide a recommended DPI (usually between 360-900).
  - Sensitivity values (General, Red Dot, etc.) are often high (near 100) for pro performance, but should be uniquely balanced for this device.
  
  Provide values for:
  - General (0-100)
  - Red Dot (0-100)
  - 2x Scope (0-100)
  - 4x Scope (0-100)
  - Sniper Scope (0-100)
  - Free Look (0-100)
  - Fire Button Size (0-100, usually between 40-60)
  - DPI (0 for iOS, 360-900 for Android)
  
  Return ONLY a JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      seed: seed, // Ensure deterministic output for the same device
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          general: { type: Type.NUMBER },
          redDot: { type: Type.NUMBER },
          scope2x: { type: Type.NUMBER },
          scope4x: { type: Type.NUMBER },
          sniperScope: { type: Type.NUMBER },
          freeLook: { type: Type.NUMBER },
          fireButtonSize: { type: Type.NUMBER },
          dpi: { type: Type.NUMBER, description: "The recommended DPI for this specific device model." },
          deviceInfo: { type: Type.STRING, description: "A brief explanation of why these settings are good for this specific device." }
        },
        required: ["general", "redDot", "scope2x", "scope4x", "sniperScope", "freeLook", "fireButtonSize", "dpi", "deviceInfo"]
      }
    }
  });

  const text = response.text;
  try {
    return JSON.parse(text) as SensitivitySettings;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Failed to generate sensitivity settings.");
  }
}
