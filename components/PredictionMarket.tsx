
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';

interface PredictionMarketProps {
  onClose: () => void;
}

// 简单的 SVG 折线图组件 (保持不变，但容器可能会调整)
const PriceChart: React.FC<{ players: Player[] }> = ({ players }) => {
  const topPlayers = [...players]
    .filter(p => p.status === 'ALIVE')
    .sort((a, b) => b.market.price - a.market.price)
    .slice(0, 3);

  const colors = ['#00FF41', '#FFFF00', '#00FFFF'];
  const height = 150;
  const width = 400;

  let allPrices: number[] = [];
  topPlayers.forEach(p => allPrices = [...allPrices, ...p.market.history]);
  const minPrice = Math.min(...allPrices, 0) * 0.9;
  const maxPrice = Math.max(...allPrices, 50) * 1.1;

  const getPoints = (history: number[]) => {
    return history.map((price, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((price - minPrice) / (maxPrice - minPrice)) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="w-full h-full bg-black border-2 border-white/20 relative p-2 overflow-hidden">
      <div className="absolute top-2 left-2 text-[10px] uppercase font-black tracking-widest text-white/50">Alpha_Trend // Top 3</div>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="none">
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="white" strokeOpacity="0.1" strokeDasharray="4 4" />
        {topPlayers.map((p, i) => (
          <g key={p.id}>
             <polyline 
               points={getPoints(p.market.history)} 
               fill="none" 
               stroke={colors[i]} 
               strokeWidth="2"
               strokeLinejoin="round"
               vectorEffect="non-scaling-stroke" 
               className="drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"
             />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-1 right-1 flex gap-3 bg-black/80 p-1 pointer-events-none">
        {topPlayers.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ backgroundColor: colors[i] }}></div>
            <span className="text-[8px] font-bold" style={{ color: colors[i] }}>{p.name.split('_')[1] || p.name.substr(0,3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 紧凑型 AI 市场卡片
const MarketCardCompact: React.FC<{ player: Player; onBuy: (id: string) => void; onShowPrompt: (p: Player) => void }> = ({ player, onBuy, onShowPrompt }) => {
  const isUp = player.market.trend === 'UP';
  const isDown = player.market.trend === 'DOWN';
  const color = isUp ? 'text-[#00FF41]' : (isDown ? 'text-[#F7931A]' : 'text-white');
  const borderColor = isUp ? 'border-[#00FF41]' : (isDown ? 'border-[#F7931A]' : 'border-white/20');
  const arrow = isUp ? '▲' : (isDown ? '▼' : '-');
  const percentChange = ((player.market.price - player.market.lastPrice) / player.market.lastPrice) * 100;

  return (
    // 移除固定高度 h-[80px]，改为 h-auto，使其自适应内容
    <div className={`bg-black border ${borderColor} p-2 flex flex-col justify-between relative group transition-all hover:bg-white/5 h-auto min-h-[80px]`}>
      {player.status === 'DEAD' && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center pointer-events-none">
          <span className="text-[#F7931A] font-black text-sm border border-[#F7931A] px-1 transform -rotate-12">DELISTED</span>
        </div>
      )}
      
      {/* 头部信息：名称和价格 */}
      <div className="flex justify-between items-start cursor-pointer" onClick={() => onShowPrompt(player)}>
        <div className="flex items-baseline gap-2">
          <h4 className="text-[10px] font-black text-white/90 uppercase truncate max-w-[60px]">{player.name}</h4>
          <div className={`text-sm font-black ${color} flex items-center gap-0.5`}>
            {arrow}{player.market.price.toFixed(1)}
          </div>
        </div>
        <div className={`text-[9px] font-bold ${color}`}>
          {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
        </div>
      </div>

      {/* 状态条区域 */}
      <div className="flex flex-col gap-1 mt-2 cursor-pointer" onClick={() => onShowPrompt(player)}>
         <div className="flex items-center gap-1">
            {/* HP 恢复红色 */}
            <span className="text-[8px] text-red-600 font-bold w-3">HP</span>
            <div className="flex-1 h-1 bg-gray-800">
               <div className="h-full bg-red-600" style={{ width: `${(player.stats.hp / player.stats.maxHp) * 100}%` }}></div>
            </div>
            <span className="text-[8px] text-white/50 w-4 text-right">{player.stats.hp}</span>
         </div>
         <div className="flex items-center gap-1">
            <span className="text-[8px] text-yellow-600 font-bold w-3">HG</span>
            <div className="flex-1 h-1 bg-gray-800">
               <div className="h-full bg-yellow-600" style={{ width: `${(player.stats.hunger / player.stats.maxHunger) * 100}%` }}></div>
            </div>
            <span className="text-[8px] text-white/50 w-4 text-right">{player.stats.hunger}</span>
         </div>
         <div className="flex items-center gap-1">
            <span className="text-[8px] text-blue-600 font-bold w-3">TH</span>
            <div className="flex-1 h-1 bg-gray-800">
               <div className="h-full bg-blue-600" style={{ width: `${(player.stats.thirst / player.stats.maxThirst) * 100}%` }}></div>
            </div>
            <span className="text-[8px] text-white/50 w-4 text-right">{player.stats.thirst}</span>
         </div>
      </div>

      {/* 购买按钮覆盖层（Hover显示） */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
         <button 
           onClick={(e) => { e.stopPropagation(); onBuy(player.id); }}
           disabled={player.status === 'DEAD'}
           className={`px-2 py-0.5 text-[9px] font-black uppercase shadow-lg border border-white
             ${isUp ? 'bg-[#00FF41] text-black hover:bg-white' : 'bg-white text-black hover:bg-gray-300'}
           `}
         >
           BUY $100
         </button>
      </div>
    </div>
  );
};

export const PredictionMarket: React.FC<PredictionMarketProps> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  const [selectedAi, setSelectedAi] = useState<Player | null>(null);
  
  const aliveCount = state.players.filter(p => p.status === 'ALIVE').length;
  const progress = Math.min(100, (state.turnCount / 50) * 100);

  const handleBuy = (playerId: string) => {
    dispatch({ type: 'MARKET_BUY', payload: { playerId, amount: 100 } });
  };

  const totalInvested = state.players.reduce((acc, p) => acc + (p.market.sharesOwned * p.market.price), 0);
  const isProfitable = (totalInvested + state.userBalance) > 1000;
  
  // 获取完整的日志用于展示大数据流
  const allLogs = [...state.log].reverse();

  return (
    <div className="fixed inset-0 bg-black/95 z-[600] flex flex-col p-4 animate-in slide-in-from-bottom duration-300 font-mono overflow-hidden">
      {/* 背景噪点 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      {/* 提示词查看弹窗 */}
      {selectedAi && (
        <div className="absolute inset-0 z-[700] bg-black/80 flex items-center justify-center p-10 animate-in fade-in duration-200" onClick={() => setSelectedAi(null)}>
           <div className="bg-[#111] border-2 border-[#00FF41] p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(0,255,65,0.2)]" onClick={e => e.stopPropagation()}>
              <h3 className="text-[#00FF41] text-xl font-black mb-4 uppercase">Neural Protocol // {selectedAi.name}</h3>
              <div className="bg-black p-4 border border-white/10 font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                 {state.aiConfig?.systemPrompt || "NO PROTOCOL DATA AVAILABLE."}
              </div>
              <button onClick={() => setSelectedAi(null)} className="mt-6 w-full bg-[#00FF41] text-black font-black py-3 uppercase hover:bg-white">Close Protocol Viewer</button>
           </div>
        </div>
      )}

      {/* 顶部状态栏 */}
      <div className="flex-none border-b-4 border-white pb-2 mb-4 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-black italic text-[#00FF41] leading-none uppercase tracking-tighter text-glow">
            NEON_MARKET <span className="text-white text-sm not-italic opacity-50 ml-2">v2.0-PRO</span>
          </h1>
          <div className="flex gap-4 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/60">
             <span>CYCLE: {state.turnCount}</span>
             <span>ALIVE: {aliveCount}/8</span>
          </div>
        </div>
        
        <div className="w-1/3 flex flex-col gap-1">
           <div className="flex justify-between text-[10px] font-black uppercase">
             <span>Protocol Progress</span>
             <span>{progress.toFixed(0)}%</span>
           </div>
           <div className="h-2 bg-gray-900 border border-white/30 relative">
              <div className="absolute inset-y-0 left-0 bg-[#F7931A]" style={{ width: `${progress}%` }}></div>
           </div>
        </div>

        <button onClick={onClose} className="border border-white px-4 py-1 hover:bg-white hover:text-black font-black uppercase text-xs transition-all">
          [ESC] EXIT
        </button>
      </div>

      {/* 主内容区 - 50/50 分割 */}
      <div className="flex-1 flex gap-4 min-h-0 relative z-10">
        
        {/* 左侧 (50%): 图表 + AI 网格 */}
        <div className="w-1/2 flex flex-col gap-4">
           {/* 图表区域 (约 25% 高度) */}
           <div className="h-1/4 min-h-[120px]">
              <PriceChart players={state.players} />
           </div>

           {/* AI 网格 (剩余高度) */}
           <div className="flex-1 bg-[#0a0a0a] border border-white/10 p-2 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                 {state.players.map(p => (
                   <MarketCardCompact key={p.id} player={p} onBuy={handleBuy} onShowPrompt={setSelectedAi} />
                 ))}
              </div>
           </div>
        </div>

        {/* 右侧 (50%): 资产 + 大数据流 */}
        <div className="w-1/2 flex flex-col gap-4">
           {/* 资产概览 */}
           <div className="bg-[#0a0a0a] border-2 border-white/20 p-3 flex justify-between items-end">
              <div>
                 <div className="text-[10px] text-white/50 uppercase font-black">Portfolio Value</div>
                 <div className={`text-2xl font-black ${isProfitable ? 'text-[#00FF41]' : 'text-[#F7931A]'}`}>
                    ${(totalInvested + state.userBalance).toFixed(0)}
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-[10px] text-white/50 uppercase font-black">Cash Available</div>
                 <div className="text-xl font-black text-white">${state.userBalance.toFixed(0)}</div>
              </div>
           </div>

           {/* 实时数据流 (占满剩余空间 - 占据半个屏幕视觉重心) */}
           <div className="flex-1 bg-black border-2 border-[#F7931A]/30 p-4 overflow-hidden flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative">
              <div className="absolute top-0 left-0 right-0 bg-[#F7931A]/10 border-b border-[#F7931A]/30 p-1 px-2 flex justify-between items-center z-10 backdrop-blur-sm">
                 <span className="text-[10px] uppercase font-black text-[#F7931A] animate-pulse">&gt;&gt; LIVE_DATA_STREAM_FEED</span>
                 <span className="text-[9px] text-[#F7931A]/70">RECEIVING...</span>
              </div>
              <div className="flex-1 overflow-y-auto pt-8 space-y-1.5 custom-scrollbar">
                 {allLogs.map((log, i) => (
                   <div key={i} className="text-[11px] font-mono leading-tight border-l-2 border-[#F7931A]/20 pl-2 text-white/80 hover:text-white hover:border-[#F7931A] transition-colors">
                     <span className="opacity-30 mr-2 text-[9px]">{new Date().toLocaleTimeString()}</span>
                     {log}
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
