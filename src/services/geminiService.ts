import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateTaskDescription(title: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional enterprise task description for: "${title}". Include Objectives, Requirements, and Acceptance Criteria.`,
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return "Failed to generate description.";
  }
}
