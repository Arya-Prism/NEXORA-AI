import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Conversation, ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
  Calendar,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { title: '📅 Daily Plan', text: 'Generate an optimized daily performance plan for deep work and fitness.' },
    { title: '🧠 Explain Concept', text: 'Explain Transformer Attention Mechanisms and KV Caching simply.' },
    { title: '🎯 Prioritize Tasks', text: 'Analyze my tasks and tell me which one to execute first today.' },
    { title: '🥗 Metabolic Advice', text: 'Suggest a high-protein budget meal under $6 with minimal prep time.' },
  ];

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConvId) {
      loadMessages(currentConvId);
    }
  }, [currentConvId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !currentConvId) {
        setCurrentConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.getMessages(convId);
      setMessages(res.messages);
    } catch (err) {
      console.warn('Failed to load messages:', err);
    }
  };

  const handleCreateNewConversation = async () => {
    try {
      const res = await api.createConversation('New Conversation');
      setConversations(prev => [res.conversation, ...prev]);
      setCurrentConvId(res.conversation.id);
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          conversation_id: res.conversation.id,
          role: 'assistant',
          content: "Hello! I am your NEXORA AI Personal Intelligence assistant. How can I optimize your workflow today?",
          created_at: new Date().toISOString(),
        }
      ]);
    } catch (err: any) {
      alert('Error creating chat: ' + err.message);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (currentConvId === id) {
        if (remaining.length > 0) {
          setCurrentConvId(remaining[0].id);
        } else {
          setCurrentConvId('');
          setMessages([]);
        }
      }
    } catch (err: any) {
      alert('Error deleting chat: ' + err.message);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'local-u-' + Date.now(),
      conversation_id: currentConvId,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendMessage({
        conversationId: currentConvId || undefined,
        content: text,
      });

      setMessages(prev => [...prev, res.message]);
      if (!currentConvId && res.conversationId) {
        setCurrentConvId(res.conversationId);
        loadConversations();
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          conversation_id: currentConvId,
          role: 'assistant',
          content: `⚠️ Error reaching AI engine: ${err.message}. Please verify server connection.`,
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Container: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar: Conversations list */}
        <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 dark:border-nexora-border">
            <span className="text-xs font-bold text-primary dark:text-white uppercase tracking-wider">
              Conversations
            </span>
            <button
              onClick={handleCreateNewConversation}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary-container text-on-primary dark:bg-nexora-violet text-[11px] font-semibold hover:bg-primary transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 py-3 no-scrollbar">
            {conversations.map(c => {
              const isActive = c.id === currentConvId;
              return (
                <div
                  key={c.id}
                  onClick={() => setCurrentConvId(c.id)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white shadow-xs'
                      : 'text-on-surface-variant dark:text-nexora-muted hover:bg-surface-container-low dark:hover:bg-nexora-card'
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <button
                    onClick={e => handleDeleteConversation(c.id, e)}
                    className="opacity-60 hover:opacity-100 hover:text-error transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col rounded-3xl bg-surface-container-lowest dark:bg-nexora-surface border border-outline-variant/30 dark:border-nexora-border shadow-sm overflow-hidden">
          {/* Top Chat Header */}
          <div className="px-6 py-3.5 border-b border-outline-variant/20 dark:border-nexora-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-secondary/10 dark:bg-nexora-cyan/20 flex items-center justify-center text-secondary dark:text-nexora-cyan">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-primary dark:text-white">NEXORA Intelligence Assistant</h2>
                <p className="text-[10px] text-secondary dark:text-nexora-cyan font-medium">Neural Assistant · Online</p>
              </div>
            </div>

            <button
              onClick={handleCreateNewConversation}
              className="md:hidden p-2 rounded-xl bg-surface-container text-primary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6">
                <div className="w-14 h-14 rounded-3xl bg-primary-container/10 dark:bg-nexora-violet/20 flex items-center justify-center text-primary dark:text-nexora-violet mb-4">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="font-headline-md text-base font-bold text-primary dark:text-white">
                  How can NEXORA AI assist you?
                </h3>
                <p className="text-xs text-on-surface-variant dark:text-nexora-muted mt-1 mb-6">
                  Select a suggested prompt below or type your questions to receive actionable intelligence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-3 rounded-2xl bg-surface-container-low dark:bg-nexora-card border border-outline-variant/30 dark:border-nexora-border hover:bg-surface-container dark:hover:bg-nexora-card-hover transition-colors"
                    >
                      <p className="text-xs font-bold text-primary dark:text-white">{p.title}</p>
                      <p className="text-[11px] text-on-surface-variant dark:text-nexora-muted line-clamp-1 mt-0.5">
                        {p.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(m => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isAssistant
                          ? 'bg-secondary/15 dark:bg-nexora-cyan/20 text-secondary dark:text-nexora-cyan'
                          : 'bg-primary-container text-on-primary dark:bg-nexora-violet'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`relative group max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isAssistant
                          ? 'bg-surface-container-low dark:bg-nexora-card text-on-surface dark:text-nexora-text border border-outline-variant/20 dark:border-nexora-border'
                          : 'bg-primary-container text-on-primary dark:bg-nexora-violet dark:text-white shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      {/* Copy action on hover */}
                      <button
                        onClick={() => handleCopy(m.id, m.content)}
                        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-opacity"
                        title="Copy message"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 dark:bg-nexora-cyan/20 text-secondary dark:text-nexora-cyan flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl p-3.5 bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-nexora-cyan animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-nexora-cyan animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary dark:bg-nexora-cyan animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Prompts Pill Carousel */}
          <div className="px-4 py-2 border-t border-outline-variant/20 dark:border-nexora-border flex items-center gap-2 overflow-x-auto no-scrollbar">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                className="shrink-0 px-3 py-1 rounded-full bg-surface-container-low dark:bg-nexora-card border border-outline-variant/20 dark:border-nexora-border text-[11px] font-semibold text-primary dark:text-white hover:bg-surface-container dark:hover:bg-nexora-card-hover transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-outline-variant/20 dark:border-nexora-border">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask NEXORA AI to plan, explain, summarize, or organize..."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-container-low dark:bg-nexora-bg border border-outline-variant/30 dark:border-nexora-border text-xs text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-nexora-violet"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-2xl bg-primary-container text-on-primary dark:bg-nexora-violet shadow-md hover:bg-primary transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
