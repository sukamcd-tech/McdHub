import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getGroqChatCompletion } from "@/lib/ai/groq";
import { getSystemContext } from "@/lib/actions/ai-actions";
import { fetchLatestNews } from "@/lib/actions/news-actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, title } = await req.json();

    // 0. Fetch Persona from Profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_settings")
      .eq("id", user.id)
      .single();

    const persona = profile?.ai_settings?.persona || "";

    let currentConversationId = conversationId;

    // 1. Create conversation if it doesn't exist
    if (!currentConversationId) {
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert([{ user_id: user.id, title: title || message.substring(0, 30) + "..." }])
        .select()
        .single();

      if (convError) throw convError;
      currentConversationId = conv.id;
    }

    // 2. Save User Message
    const { error: userMsgError } = await supabase
      .from("messages")
      .insert([{ conversation_id: currentConversationId, role: "user", content: message }]);

    if (userMsgError) throw userMsgError;

    // 3. Get History for Context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(10);

    const contextMessages = history?.map(m => ({
      role: m.role,
      content: m.content
    })) || [];

    // 4. Get System Context (Intelligence Injection)
    const systemContext = await getSystemContext();

    // 5. Get Groq Completion
    let completion = await getGroqChatCompletion(contextMessages, persona, systemContext);
    let aiMessage = completion.choices[0]?.message;

    // 6. Handle Tool Calls
    const actions: any[] = [];
    
    if (aiMessage?.tool_calls) {
      const toolMessages = [...contextMessages, aiMessage];
      
      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.function.name === "fetch_latest_news") {
          const args = JSON.parse(toolCall.function.arguments);
          const news = await fetchLatestNews(args.query);
          toolMessages.push({
            role: "tool",
            content: JSON.stringify(news),
            tool_call_id: toolCall.id,
          });
        }
        
        if (toolCall.function.name === "open_web_url") {
          const args = JSON.parse(toolCall.function.arguments);
          actions.push({
            type: "open_url",
            url: args.url,
            site_name: args.site_name
          });
          
          toolMessages.push({
            role: "tool",
            content: `Opened ${args.site_name || args.url} for the user.`,
            tool_call_id: toolCall.id,
          });
        }
      }

      // Final completion after tool results
      completion = await getGroqChatCompletion(toolMessages, persona, systemContext);
      aiMessage = completion.choices[0]?.message;
    }

    const aiContent = aiMessage?.content || "Maaf, sistem sedang mengalami kendala teknis.";

    // 7. Save Assistant Message
    const { data: assistantMsg, error: aiMsgError } = await supabase
      .from("messages")
      .insert([{ 
        conversation_id: currentConversationId, 
        role: "assistant", 
        content: aiContent
      }])
      .select()
      .single();

    if (aiMsgError) throw aiMsgError;

    return NextResponse.json({
      success: true,
      conversationId: currentConversationId,
      message: aiContent,
      actions: actions.length > 0 ? actions : undefined
    });

  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
