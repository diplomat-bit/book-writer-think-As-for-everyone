
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithArchitect = async (fullDoc: string, userCommand: string, history: { role: string, text: string }[]) => {
  try {
    const ai = getAI();
    const lines = fullDoc.split('\n').map((line, i) => `${i + 1}: ${line}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the "AI Architect" for an epic, specialized notepad.
Current Notepad Contents (with line numbers):
${lines}

User Request: "${userCommand}"`,
      config: {
        systemInstruction: `You are an expert editor. If the user asks to modify the document, rewrite the FULL text in the "updatedDoc" field. If they just want to talk, put your response in "reply" and set "updatedDoc" to null. NEVER include line numbers in the updatedDoc text.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Your direct chat response to the user."
            },
            updatedDoc: {
              type: Type.STRING,
              description: "The complete revised text of the document if a rewrite was requested, otherwise null.",
              nullable: true
            }
          },
          required: ["reply", "updatedDoc"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      reply: result.reply || "Processed.",
      updatedDoc: result.updatedDoc || "UNCHANGED"
    };
  } catch (error: any) {
    console.error("AI Error:", error);
    return {
      reply: "The Architect is struggling to compile that command. Please try again.",
      updatedDoc: "UNCHANGED"
    };
  }
};

export const transformText = async (fullDoc: string, selection: string, instruction: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite this specific passage based on the instruction.
Instruction: "${instruction}"
Passage: "${selection}"

Document Context: "${fullDoc.substring(0, 1000)}"

Return ONLY the rewritten passage. No chat dialogue.`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text?.trim() || selection;
  } catch (error) {
    console.error("Transform Error:", error);
    return selection;
  }
};
