import { GoogleGenAI } from "@google/genai"

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key-here")
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured()) {
    return null
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

