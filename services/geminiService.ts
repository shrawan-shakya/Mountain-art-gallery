
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateArtworkMetadata = async (imagePrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this description of an alpine mountain painting: "${imagePrompt}", suggest a poetic title, an artist name (European sounding), a medium (like Oil on Canvas, etc.), and dimensions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            medium: { type: Type.STRING },
            dimensions: { type: Type.STRING },
            year: { type: Type.STRING }
          },
          required: ["title", "artist", "medium", "dimensions", "year"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
