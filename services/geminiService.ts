
import { GoogleGenAI } from "@google/genai";
import { AnalysisResults } from "../types";

export const getAIInsights = async (results: AnalysisResults): Promise<string> => {
  // Always create a new instance to pick up the latest selected key from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const flaggedItems = results.items.filter(i => i.flags.length > 0);
  const summary = {
    totalItems: results.reliability.itemCount,
    studentCount: results.reliability.studentCount,
    reliability: results.reliability.kr20.toFixed(2),
    flaggedCount: flaggedItems.length,
    meanScore: results.reliability.meanScore.toFixed(2),
    troubleItems: flaggedItems.map(i => ({
      id: i.itemId,
      flags: i.flags.join(", "),
      difficulty: i.difficultyIndex.toFixed(2),
      discrimination: i.discriminationIndex.toFixed(2)
    }))
  };

  const prompt = `
    Act as a senior Psychometrician. Analyze the following MCQ test results and provide a professional, concise executive summary.
    Identify if the test is reliable, which items are candidates for deletion or revision, and overall recommendations.
    
    Data Summary:
    ${JSON.stringify(summary, null, 2)}
    
    Format your response in Markdown. Focus on actionable insights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    // Propagate the error message so the UI can detect invalid projects/keys
    return `Error: ${error.message || "Failed to generate insights."}`;
  }
};
