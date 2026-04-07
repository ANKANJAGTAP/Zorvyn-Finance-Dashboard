import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  import.meta.env.VITE_GEMINI_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
  import.meta.env.VITE_GEMINI_KEY_3,
  import.meta.env.VITE_GEMINI_KEY_4,
  import.meta.env.VITE_GEMINI_KEY_5,
].filter(key => key && !key.includes('your_api_key'));

let currentKeyIndex = 0;

export async function askZorvynAI(prompt, dashboardContext, chatHistory = [], onStreamResponse = null) {
  if (API_KEYS.length === 0) {
    // Fallback UI mock if no keys are provided
    await new Promise(resolve => setTimeout(resolve, 800));
    const msg = "Hi there! I am **Zorvyn AI**. It looks like you haven't added any Gemini API keys yet (e.g. `VITE_GEMINI_KEY_1` in `.env`). Please add them to chat with me and analyze your data fully!";
    if (onStreamResponse) onStreamResponse(msg);
    return msg;
  }

  let attempts = 0;
  let lastError = null;

  while (attempts < API_KEYS.length) {
    try {
      const activeKey = API_KEYS[currentKeyIndex];
      const genAI = new GoogleGenerativeAI(activeKey);
      
      // Use standard system instructions
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: `You are Zorvyn Assistant, an intelligent and friendly AI financial assistant living inside the user's dashboard. 
        Keep your responses very concise, accurate, and easy to read. Use Markdown formatting.
        Always base your answers on the following live data from the user's dashboard:
        ${JSON.stringify(dashboardContext)}
        Do not make up numbers. If the user asks about something not in the data, state you can only see their current dashboard context.`
      });

      // Format previous history into Gemini's expected format
      // Note: Gemini's history MUST start with 'user' and MUST alternate 'user' -> 'model'
      const cleanHistory = [];
      let lastRole = null;
      
      chatHistory.forEach((msg) => {
        if (msg.role === 'system') return;
        const geminiRole = msg.role === 'ai' ? 'model' : 'user';
        
        // Skip if first message tries to be 'model'
        if (cleanHistory.length === 0 && geminiRole === 'model') return;
        
        // Skip consecutive messages from the same role
        if (geminiRole === lastRole) return;
        
        cleanHistory.push({
          role: geminiRole,
          parts: [{ text: msg.text }]
        });
        lastRole = geminiRole;
      });

      // Gemini history must end with 'model' before we send a new 'user' prompt
      if (cleanHistory.length > 0 && cleanHistory[cleanHistory.length - 1].role === 'user') {
        cleanHistory.pop();
      }

      const chat = model.startChat({
        history: cleanHistory,
      });

      if (onStreamResponse) {
        const result = await chat.sendMessageStream(prompt);
        let fullText = '';
        for await (const chunk of result.stream) {
          fullText += chunk.text();
          onStreamResponse(fullText);
        }
        return fullText;
      } else {
        const result = await chat.sendMessage(prompt);
        return result.response.text();
      }

    } catch (error) {
      console.warn(`[Zorvyn AI] API Key index ${currentKeyIndex} failed. Trying next key. Error:`, error.message);
      lastError = error;
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      attempts++;
    }
  }

  console.error("[Zorvyn AI] All API keys have been exhausted.", lastError);
  throw new Error(`Sorry, I'm currently unable to process requests. All backend API keys have been exhausted or hit rate limits. (Latest Error: ${lastError?.message})`);
}
