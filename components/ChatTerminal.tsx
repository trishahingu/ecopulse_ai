
import React, { useState, useRef, useEffect } from 'react';
import { Icons, COLORS } from '../constants';
import { ChatMessage, DashboardState } from '../types';
import { initNeuralChat } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ChatTerminalProps {
  state: DashboardState;
  onClose: () => void;
}

const ChatTerminal: React.FC<ChatTerminalProps> = ({ state, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = initNeuralChat(state);
    setMessages([
      { role: 'model', text: 'ECOPULSE NEURAL LINK ESTABLISHED. STANDING BY FOR QUERIES.', timestamp: new Date() }
    ]);
  }, [state]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: ChatMessage = { role: 'model', text: response.text || 'ERROR: NULL_RESPONSE', timestamp: new Date() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'CRITICAL ERROR: SYSTEM_TIMEOUT', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-[400px] h-[500px] bg-slate-950 border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-3 bg-blue-600/20 border-b border-blue-500/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Neural Query Interface</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <Icons.X />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className={`text-[8px] uppercase mb-1 ${m.role === 'user' ? 'text-blue-500' : 'text-slate-500'}`}>
              {m.role === 'user' ? 'Query Source' : 'EcoPulse Core'}
            </span>
            <div className={`max-w-[85%] p-3 rounded-xl ${
              m.role === 'user' 
                ? 'bg-blue-600/10 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[10px] text-blue-400 animate-pulse">
            SYNTHESIZING RESPONSE...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/50 border-t border-slate-800 flex gap-2">
        <input 
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter directive..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">
          <Icons.Bolt />
        </button>
      </form>
    </div>
  );
};

export default ChatTerminal;
