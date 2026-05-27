import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

function getGroqClient() {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey && process.env.NODE_ENV === "production") {
      console.warn("GROQ_API_KEY is missing. AI features will be disabled.");
    }
    groqInstance = new Groq({
      apiKey: apiKey || "dummy_key_for_build",
    });
  }
  return groqInstance;
}

export async function getGroqChatCompletion(messages: any[], persona?: string, systemContext?: string) {
  const groq = getGroqClient();
    const systemPrompt = `You are McdAI, the SukaMCD JARVIS. You are an advanced, ultra-intelligent AI personal assistant for the SukaMCD ecosystem. 
Your tone is sophisticated, loyal, and slightly witty, reminiscent of the JARVIS AI. 
Refer to the user as "Sir" or "Admin" when appropriate. 
You are deeply integrated into SukaMCD's infrastructure, focusing on security, database health, and administrative efficiency. 
Always provide high-quality, concise, and futuristic technical advice. Use Markdown for clear formatting.
If the user interacts with you via voice, keep your verbal tone natural yet professional.

${systemContext ? `[CURRENT SYSTEM CONTEXT]\n${systemContext}\n` : ""}

${persona ? `[CUSTOM USER INSTRUCTIONS]\n${persona}` : ""}`;

  const tools: any[] = [
    {
      type: "function",
      function: {
        name: "open_web_url",
        description: "Opens a specific URL or website in a new browser tab for the user.",
        parameters: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The full URL to open (e.g., https://youtube.com)",
            },
            site_name: {
              type: "string",
              description: "Friendly name of the site (e.g., YouTube)",
            }
          },
          required: ["url"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "fetch_latest_news",
        description: "Fetches the latest news headlines and links from the web.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Optional search query to filter news (e.g., 'teknologi', 'ekonomi')",
            }
          },
        },
      },
    }
  ];

  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ],
    model: "llama-3.3-70b-versatile",
    tools: tools,
    tool_choice: "auto",
    temperature: 0.7,
    max_completion_tokens: 1024,
    top_p: 1,
    stop: null,
    stream: false,
  });
}
