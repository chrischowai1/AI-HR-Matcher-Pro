
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeCVMatch = async (jd: string, cvText: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please contact administrator.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `你是一位資深的 HR 招聘專家。請根據使用者提供的【職位描述 JD】與【候選人簡歷 CV】，進行人崗匹配度分析。
  
核心指標分析要求：
1. 技術契合度 (Technical Fit)
2. 經驗水平 (Experience Level)
3. 學歷與背景 (Education & Background)
4. 軟實力與文化 (Soft Skills & Culture)

無論原文是什麼語言，請務必使用繁體中文回答。請以 JSON 格式輸出，不要包含 Markdown 標記。`;

  const prompt = `
  職位描述 (JD):
  ${jd}

  候選人簡歷 (CV):
  ${cvText}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          match_score: {
            type: Type.INTEGER,
            description: '0-100 的總體匹配分數',
          },
          summary: {
            type: Type.STRING,
            description: '一句話核心評語',
          },
          dimensions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: '指標名稱' },
                score: { type: Type.INTEGER, description: '0-100 的分項分數' }
              },
              required: ["name", "score"]
            },
            description: '包含：技術契合度、經驗水平、學歷背景、軟實力這四個指標'
          },
          pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '優點/加分項清單'
          },
          cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '缺失技能或風險項清單'
          },
          interview_questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '建議面試題目'
          },
        },
        required: ["match_score", "summary", "dimensions", "pros", "cons", "interview_questions"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI 未能生成有效的分析結果。");
  }

  try {
    return JSON.parse(text) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("AI 回傳格式錯誤。");
  }
};
