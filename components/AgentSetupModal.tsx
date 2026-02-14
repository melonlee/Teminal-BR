
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const AgentSetupModal: React.FC = () => {
  const { dispatch, state } = useGame();
  const [prompt, setPrompt] = useState('You are a tactical survival assistant. Help the user survive the void.');
  const [apiKey, setApiKey] = useState('');

  const handleStart = () => {
    dispatch({ 
      type: 'INIT_AGENT', 
      payload: { systemPrompt: prompt, apiKey: apiKey } 
    });
  };

  const t = {
    zh: {
      TITLE: "初始化 AI 代理",
      SUBTITLE: "配置神经链路参数 // NEURAL_LINK_CONFIG",
      PROMPT_LABEL: "系统指令 (PROMPT)",
      KEY_LABEL: "API 密钥 (ACCESS_KEY)",
      BTN_CREATE: "创建 AI AGENT",
      PLACEHOLDER_KEY: "在此输入 API Key..."
    },
    en: {
      TITLE: "INITIALIZE AI AGENT",
      SUBTITLE: "CONFIGURE NEURAL LINK // NEURAL_LINK_CONFIG",
      PROMPT_LABEL: "SYSTEM PROMPT",
      KEY_LABEL: "API ACCESS KEY",
      BTN_CREATE: "CREATE AI AGENT",
      PLACEHOLDER_KEY: "Enter API Key here..."
    }
  }[state.language];

  return (
    <div className="fixed inset-0 bg-[#050505] z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="w-full max-w-2xl bg-black border-4 border-[#F7931A] p-10 relative shadow-[0_0_50px_rgba(247,147,26,0.15)] flex flex-col gap-8">
        
        {/* 标题区 */}
        <div className="border-b-2 border-white/20 pb-4">
          <h1 className="text-4xl font-black italic text-[#F7931A] uppercase tracking-tighter text-glow mb-2">
            {t.TITLE}
          </h1>
          <p className="text-xs uppercase font-bold tracking-[0.4em] opacity-50">
            {t.SUBTITLE}
          </p>
        </div>

        {/* 表单区 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest text-white/80">
              {t.PROMPT_LABEL}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 bg-[#080808] border-2 border-white/30 p-4 text-white font-mono focus:border-[#F7931A] focus:outline-none focus:shadow-[0_0_15px_rgba(247,147,26,0.2)] transition-all resize-none text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest text-white/80">
              {t.KEY_LABEL}
            </label>
            <input
              type="password"
              value={apiKey}
              placeholder={t.PLACEHOLDER_KEY}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#080808] border-2 border-white/30 p-4 text-white font-mono focus:border-[#F7931A] focus:outline-none focus:shadow-[0_0_15px_rgba(247,147,26,0.2)] transition-all text-sm tracking-widest"
            />
          </div>
        </div>

        {/* 按钮区 */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleStart}
            className="w-full py-5 bg-white text-black text-xl font-black uppercase tracking-widest hover:bg-[#F7931A] hover:text-white transition-all shadow-[8px_8px_0px_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-none"
          >
            {t.BTN_CREATE}
          </button>
        </div>

      </div>
    </div>
  );
};
