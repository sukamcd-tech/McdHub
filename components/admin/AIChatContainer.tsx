"use client";

import { useState, useEffect, useRef } from "react";
import { deleteConversation, getMessages, updateAISettings } from "@/lib/actions/ai-actions";
import { useRouter } from "next/navigation";
import {
  Zap, Mic, MicOff, Volume2, VolumeX, Bot, User, Loader2,
  Settings, X, Save, AlertTriangle, MessageSquare, Plus, Trash2, Send
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import McdAIOrb from "./mcdai/McdAIOrb";
import McdAIBrowser from "./mcdai/McdAIBrowser";
import { useMcdAIVoice } from "@/hooks/use-mcdai-voice";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface AIChatContainerProps {
  initialConversations: Conversation[];
  profile: any;
}

export default function AIChatContainer({ initialConversations, profile }: AIChatContainerProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState<any>(null);
  const [isDeletingProcess, setIsDeletingProcess] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [persona, setPersona] = useState(profile?.ai_settings?.persona || "");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { isListening, transcript, startListening, stopListening, speak } = useMcdAIVoice();
  const [isMuted, setIsMuted] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "thinking" | "speaking" | "listening">("idle");

  useEffect(() => { if (transcript) setInputValue(transcript); }, [transcript]);
  const toggleListening = () => { isListening ? stopListening() : startListening(); };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  async function loadConversation(id: string) {
    setIsLoading(true);
    setCurrentConvId(id);
    const msgs = await getMessages(id);
    setMessages(msgs);
    setIsLoading(false);
  }

  function startNewChat() { setCurrentConvId(null); setMessages([]); setInputValue(""); }

  async function handleDelete(conv: any, e: React.MouseEvent) { e.stopPropagation(); setIsDeleting(conv); }

  async function handleConfirmDelete() {
    if (!isDeleting) return;
    setIsDeletingProcess(true);
    const result = await deleteConversation(isDeleting.id);
    if (result.success) {
      setConversations(prev => prev.filter(c => c.id !== isDeleting.id));
      if (currentConvId === isDeleting.id) startNewChat();
      setIsDeleting(null);
    } else alert("Gagal menghapus: " + result.error);
    setIsDeletingProcess(false);
  }

  async function handleSend() {
    if (!inputValue.trim() || isLoading || isTyping) return;
    const userMessage = inputValue;
    setInputValue("");
    const tempUserMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);
    try {
      setAiStatus("thinking");
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId: currentConvId, title: userMessage.substring(0, 30) })
      });
      const data = await response.json();
      if (data.success) {
        if (!currentConvId) {
          setCurrentConvId(data.conversationId);
          setConversations(prev => [{ id: data.conversationId, title: userMessage.substring(0, 30) + "...", created_at: new Date().toISOString() }, ...prev]);
        }
        const aiMsg: Message = { id: Date.now().toString() + "-ai", role: "assistant", content: data.message, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, aiMsg]);
        if (data.actions && Array.isArray(data.actions)) {
          data.actions.forEach((action: any) => {
            if (action.type === "open_url" && action.url) { setBrowserUrl(action.url); setIsBrowserOpen(true); }
          });
        }
        if (!isMuted) {
          setAiStatus("speaking");
          speak(data.message.replace(/[*#`]/g, ""));
          setTimeout(() => setAiStatus("idle"), data.message.length * 50);
        } else setAiStatus("idle");
      } else throw new Error(data.error);
    } catch (err: any) {
      setAiStatus("idle");
      const errMsg: Message = { id: Date.now().toString() + "-error", role: "assistant", content: `Error: ${err.message || "Gagal menghubungi McdAI."}`, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally { setIsTyping(false); }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const result = await updateAISettings({ persona });
    if (result.success) setIsSettingsOpen(false);
    else alert("Gagal menyimpan: " + result.error);
    setIsSavingSettings(false);
  };

  const suggestions = ["Check System Logs", "Security Briefing", "Backup Status", "AI Optimization"];

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      {/* ── Settings Modal ── */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-6" style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-silver)" }}>
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, var(--silver-400), transparent)" }} />
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--bg-hover)", border: "1px solid var(--border-soft)" }}>
                  <Settings className="w-5 h-5" style={{ color: "var(--silver-400)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--silver-100)" }}>AI Personalization</h3>
                  <p className="text-[10px] font-mono" style={{ color: "var(--silver-600)" }}>Customize McdAI behavior</p>
                </div>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-xl cursor-pointer transition-all" style={{ color: "var(--silver-500)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-7 space-y-5">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] font-mono" style={{ color: "var(--silver-600)" }}>Assistant Persona</label>
                <textarea
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  placeholder="Contoh: 'Jawab dengan gaya bajak laut', 'Gunakan istilah medis', dll."
                  className="h-40 resize-none"
                  style={{ background: "rgba(10,10,14,0.8)", border: "1px solid var(--border-soft)", color: "var(--silver-200)", borderRadius: "12px", padding: "14px", fontSize: "12px", width: "100%", outline: "none", lineHeight: "1.6" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-silver)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-soft)"; }}
                />
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
                style={{ background: "var(--silver-200)", color: "#0f0f13" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px var(--silver-glow)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── History Sidebar ── */}
      <aside
        className="w-72 flex flex-col shrink-0"
        style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border-subtle)" }}
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 font-mono" style={{ color: "var(--silver-600)" }}>
            <Zap className="w-3 h-3" style={{ color: "var(--silver-500)" }} /> AI History
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg cursor-pointer transition-all"
              style={{ color: isMuted ? "#ef4444" : "var(--silver-600)" }}
              title="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-1.5 rounded-lg cursor-pointer transition-all" style={{ color: "var(--silver-600)" }} title="Settings">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={startNewChat}
              className="p-1.5 rounded-lg cursor-pointer transition-all"
              style={{ color: "var(--silver-500)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--silver-200)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }}
              title="New chat"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[10px] uppercase tracking-widest font-bold font-mono" style={{ color: "var(--silver-700)" }}>No history</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className="group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                style={
                  currentConvId === conv.id
                    ? { background: "var(--bg-active)", border: "1px solid var(--border-silver)", color: "var(--silver-100)" }
                    : { border: "1px solid transparent", color: "var(--silver-500)" }
                }
                onMouseEnter={(e) => {
                  if (currentConvId !== conv.id) { (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--silver-300)"; }
                }}
                onMouseLeave={(e) => {
                  if (currentConvId !== conv.id) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--silver-500)"; }
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className={`w-4 h-4 shrink-0 ${currentConvId === conv.id ? "text-white" : ""}`} style={{ color: currentConvId === conv.id ? "var(--silver-300)" : "var(--silver-700)" }} />
                  <span className="text-xs font-medium truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(conv, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ color: "var(--silver-600)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--silver-600)"; }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── Chat Area ── */}
      <main className="flex-1 flex flex-col relative" style={{ background: "var(--bg-root)" }}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 relative">
          {messages.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-8 animate-float">
                <McdAIOrb status={isListening ? "listening" : aiStatus} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2 italic uppercase" style={{ color: "var(--silver-100)" }}>
                Intelligence Core
              </h2>
              <p className="max-w-sm text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed opacity-40 font-mono" style={{ color: "var(--silver-400)" }}>
                SukaMCD Administrative Personal Assistant
              </p>
              <div className="mt-12 grid grid-cols-2 gap-3 w-full max-w-md">
                {suggestions.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setInputValue(`Bantu saya dengan: ${topic}`)}
                    className="p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-left flex items-center justify-between cursor-pointer group transition-all"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-silver)";
                      (e.currentTarget as HTMLElement).style.color = "var(--silver-200)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--bg-surface)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                      (e.currentTarget as HTMLElement).style.color = "var(--silver-500)";
                    }}
                  >
                    <span>{topic}</span>
                    <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--silver-700)" }} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-6 pb-36">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                        msg.role === "user" ? "" : ""
                      }`}
                      style={
                        msg.role === "user"
                          ? { background: "var(--bg-elevated)", border: "1px solid var(--border-silver)" }
                          : { background: "var(--silver-200)", border: "1px solid var(--silver-300)" }
                      }
                    >
                      {msg.role === "user" ? (
                        profile?.profile_picture ? (
                          <img src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4" style={{ color: "var(--silver-400)" }} />
                        )
                      ) : (
                        <Bot className="w-4 h-4" style={{ color: "#0f0f13" }} />
                      )}
                    </div>
                    <div
                      className="px-5 py-3.5 rounded-2xl text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? { background: "var(--bg-elevated)", border: "1px solid var(--border-silver)", color: "var(--silver-100)" }
                          : { background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--silver-200)" }
                      }
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="my-4 rounded-xl overflow-x-auto" style={{ background: "rgba(10,10,14,0.9)", border: "1px solid var(--border-subtle)", padding: "16px" }}>
                              <pre {...props} className="font-mono text-xs" style={{ color: "var(--silver-300)" }} />
                            </div>
                          ),
                          code: ({ node, ...props }) => (
                            <code className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: "rgba(10,10,14,0.8)", border: "1px solid var(--border-subtle)", color: "var(--silver-300)" }} {...props} />
                          ),
                          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4 mt-6" style={{ color: "var(--silver-100)" }} {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-5" style={{ color: "var(--silver-100)" }} {...props} />,
                          p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-4 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-4 space-y-1" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--silver-200)", border: "1px solid var(--silver-300)" }}>
                      <Bot className="w-4 h-4" style={{ color: "#0f0f13" }} />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl text-xs font-mono uppercase tracking-widest italic" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--silver-600)" }}>
                      McdAI sedang berpikir...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="absolute bottom-0 inset-x-0 p-6 pt-0 z-20">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative rounded-2xl p-1.5 shadow-2xl"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-silver)" }}
            >
              <div className="flex items-end gap-2 px-3 py-2">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Katakan sesuatu ke McdAI..."
                  className="w-full bg-transparent border-none text-sm focus:outline-none resize-none py-2 px-2 max-h-40 font-light"
                  style={{ color: "var(--silver-200)" }}
                />
                <button
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isListening ? "animate-pulse" : ""}`}
                  style={
                    isListening
                      ? { background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", color: "#ef4444" }
                      : { background: "var(--bg-hover)", border: "1px solid var(--border-subtle)", color: "var(--silver-500)" }
                  }
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || isTyping}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  style={{ background: "var(--silver-200)", color: "#0f0f13" }}
                  onMouseEnter={(e) => { if (!isLoading && !isTyping) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px var(--silver-glow)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[9px] text-center mt-3 tracking-[0.3em] font-black uppercase font-mono" style={{ color: "var(--silver-700)" }}>
              Powered by Groq • LLaMA-3.3 Intelligence
            </p>
          </div>
        </div>
      </main>

      {/* ── Delete Modal ── */}
      {isDeleting && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-in zoom-in-95" style={{ background: "var(--bg-elevated)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <div className="h-px bg-red-600 opacity-60" />
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest font-mono mb-2" style={{ color: "var(--silver-100)" }}>Confirm Delete</h3>
              <p className="text-xs leading-relaxed mb-8 px-4" style={{ color: "var(--silver-500)" }}>
                Delete <span className="text-red-400 font-bold">"{isDeleting.title}"</span>? This conversation will be permanently removed.
              </p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleConfirmDelete} disabled={isDeletingProcess} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50">
                  {isDeletingProcess ? "Deleting..." : "Confirm Delete"}
                </button>
                <button onClick={() => setIsDeleting(null)} className="w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer" style={{ background: "var(--bg-hover)", color: "var(--silver-500)", border: "1px solid var(--border-subtle)" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <McdAIBrowser url={browserUrl} isOpen={isBrowserOpen} onClose={() => setIsBrowserOpen(false)} />
    </div>
  );
}
