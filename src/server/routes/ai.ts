import { Hono } from 'hono';
import { query, execute } from '../db';
import { getCurrentUser, requireAuth } from '../lib/auth';
import type { Bindings } from '../index';

export const aiRoute = new Hono<{ Bindings: Bindings }>();

// News search helper for tool calls
async function fetchNews(queryStr = '') {
  try {
    const rssUrl = `https://news.google.com/rss?hl=id-ID&gl=ID&ceid=ID:id${queryStr ? `&q=${encodeURIComponent(queryStr)}` : ''}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(apiUrl);
    const data: any = await res.json();
    if (data.status === 'ok' && Array.isArray(data.items)) {
      return data.items.slice(0, 5).map((item: any) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: item.author || 'Google News',
      }));
    }
    return [];
  } catch {
    return [];
  }
}

// GET /api/ai/conversations
aiRoute.get('/conversations', requireAuth(), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const list = await query(
      c.env.DB,
      'SELECT * FROM mcdai_conversations WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    return c.json({ success: true, conversations: list });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /api/ai/conversations/:id/messages
aiRoute.get('/conversations/:id/messages', requireAuth(), async (c) => {
  const id = c.req.param('id');
  try {
    const messages = await query(
      c.env.DB,
      'SELECT * FROM mcdai_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [Number(id)]
    );
    return c.json({ success: true, messages });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// DELETE /api/ai/conversations/:id
aiRoute.delete('/conversations/:id', requireAuth(), async (c) => {
  const id = c.req.param('id');
  try {
    await execute(c.env.DB, 'DELETE FROM mcdai_messages WHERE conversation_id = ?', [Number(id)]);
    await execute(c.env.DB, 'DELETE FROM mcdai_conversations WHERE id = ?', [Number(id)]);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /api/ai/chat (Groq Chat Completion with Tools)
aiRoute.post('/chat', requireAuth(), async (c) => {
  const user = await getCurrentUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const apiKey = c.env.GROQ_API_KEY;
  if (!apiKey) {
    return c.json({
      error: 'GROQ_API_KEY is not configured on Cloudflare environment.',
    }, 503);
  }

  try {
    const { message, conversationId, title } = await c.req.json();
    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    let currentConversationId = conversationId;

    // 1. Create conversation if new
    if (!currentConversationId) {
      const convTitle = title || (message.length > 30 ? message.substring(0, 30) + '...' : message);
      const res = await execute(
        c.env.DB,
        'INSERT INTO mcdai_conversations (user_id, title) VALUES (?, ?)',
        [user.id, convTitle]
      );
      currentConversationId = res.lastRowId;
    }

    // 2. Save user message to D1
    await execute(
      c.env.DB,
      'INSERT INTO mcdai_messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [currentConversationId, 'user', message]
    );

    // 3. Get recent history
    const history = await query<{ role: string; content: string }>(
      c.env.DB,
      'SELECT role, content FROM mcdai_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10',
      [currentConversationId]
    );

    const systemPrompt = `You are McdAI, the SukaMCD JARVIS. You are an advanced, ultra-intelligent AI personal assistant for the SukaMCD ecosystem.
Your tone is sophisticated, loyal, and slightly witty, reminiscent of JARVIS AI.
Refer to the user as "Sir" or "Admin" when appropriate.
You are deeply integrated into SukaMCD's infrastructure, focusing on security, database health, and administrative efficiency.
Always provide high-quality, concise, and futuristic technical advice in Markdown.`;

    const tools = [
      {
        type: 'function',
        function: {
          name: 'open_web_url',
          description: 'Opens a specific URL or website in a new browser tab for the user.',
          parameters: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'The full URL to open (e.g. https://youtube.com)' },
              site_name: { type: 'string', description: 'Friendly name of the site' },
            },
            required: ['url'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'fetch_latest_news',
          description: 'Fetches the latest news headlines from Google News.',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Optional search query' },
            },
          },
        },
      },
    ];

    const messagesPayload: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Call Groq API via direct fetch (Edge-native, zero node dependencies)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messagesPayload,
        tools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_completion_tokens: 1024,
      }),
    });

    const groqData: any = await groqRes.json();
    if (!groqRes.ok) {
      throw new Error(groqData.error?.message || 'Failed to communicate with Groq');
    }

    let aiMessage = groqData.choices?.[0]?.message;
    const actions: any[] = [];

    // Handle Tool Calls
    if (aiMessage?.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolMessages = [...messagesPayload, aiMessage];

      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.function.name === 'fetch_latest_news') {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          const news = await fetchNews(args.query);
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify(news),
            tool_call_id: toolCall.id,
          });
        }
        if (toolCall.function.name === 'open_web_url') {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          actions.push({
            type: 'open_url',
            url: args.url,
            site_name: args.site_name,
          });
          toolMessages.push({
            role: 'tool',
            content: `Opened ${args.site_name || args.url} for the user.`,
            tool_call_id: toolCall.id,
          });
        }
      }

      // Second round completion
      const secondRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: toolMessages,
          temperature: 0.7,
        }),
      });

      const secondData: any = await secondRes.json();
      aiMessage = secondData.choices?.[0]?.message || aiMessage;
    }

    const aiContent = aiMessage?.content || 'Maaf Sir, respon tidak dapat diproses saat ini.';

    // 4. Save AI Response in D1
    await execute(
      c.env.DB,
      'INSERT INTO mcdai_messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [currentConversationId, 'assistant', aiContent]
    );

    return c.json({
      success: true,
      conversationId: currentConversationId,
      message: aiContent,
      actions: actions.length > 0 ? actions : undefined,
    });
  } catch (error: any) {
    console.error('Groq AI Error:', error);
    return c.json({ error: error.message }, 500);
  }
});
