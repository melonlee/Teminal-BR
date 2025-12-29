
import React from 'react';
import { useGame } from '../context/GameContext';
import { Item } from '../types/game';

interface LootModalProps {
  onHoverItem: (item: Item | null) => void;
}

export const LootModal: React.FC<LootModalProps> = ({ onHoverItem }) => {
  const { state, dispatch } = useGame();
  if (state.phase !== 'LOOTING' || !state.pendingLoot) return null;

  const item = state.pendingLoot;
  const humanPlayer = state.players.find(p => !p.isAi);

  const rarityColor = {
    COMMON: 'text-white',
    RARE: 'text-blue-400',
    EPIC: 'text-purple-500 font-black'
  };

  const t = {
    zh: { TITLE: '检测到物资', TAKE: '放入背包', DISCARD: '丢弃', FULL: '背包容量已满！' },
    en: { TITLE: 'LOOT DETECTED', TAKE: 'TAKE ITEM', DISCARD: 'DISCARD', FULL: 'INVENTORY FULL!' }
  }[state.language];

  return (
    <div className="fixed inset-0 bg-black/40 z-[400] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        onMouseEnter={() => onHoverItem(item)}
        onMouseLeave={() => onHoverItem(null)}
        className="border-8 border-white bg-black p-12 max-w-lg w-full relative shadow-[30px_30px_0px_#FF4500]"
      >
        {/* 背景装饰线 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,white_4px,white_8px)]" />
        
        <h2 className="text-3xl font-black italic border-b-4 border-white mb-10 pb-4 text-[#FF4500] uppercase tracking-tighter">
          {t.TITLE}
        </h2>

        <div className="mb-12 space-y-8 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className={`text-5xl font-black leading-none uppercase italic tracking-tighter ${rarityColor[item.rarity]}`}>{item.name}</div>
              <div className="text-xs opacity-40 uppercase tracking-[0.3em] font-black mt-2">{item.type} // RANK_{item.rarity}</div>
            </div>
          </div>

          <div className="bg-white/5 p-6 border-2 border-white/10 italic text-lg leading-relaxed border-l-8 border-l-[#FF4500]">
            "{item.description}"
          </div>

          <div className="space-y-3">
            {Object.entries(item.stats).map(([key, val]) => (
              <div key={key} className="flex justify-between text-base border-b-2 border-white/10 pb-2 items-baseline">
                <span className="uppercase font-black opacity-60 tracking-widest">{key}</span>
                <span className="text-green-500 font-black text-2xl">+{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => { dispatch({ type: 'TAKE_LOOT', payload: { playerId: humanPlayer!.id } }); onHoverItem(null); }}
            className="bg-white text-black py-8 text-3xl font-black hover:bg-[#FF4500] hover:text-white transition-all transform active:scale-95 uppercase tracking-widest"
          >
            {t.TAKE}
          </button>
          <button 
            onClick={() => { dispatch({ type: 'DISCARD_LOOT' }); onHoverItem(null); }}
            className="border-4 border-white text-white py-4 text-sm font-black hover:bg-white hover:text-black transition-all uppercase tracking-[0.5em]"
          >
            {t.DISCARD}
          </button>
        </div>

        {humanPlayer && humanPlayer.inventory.length >= 8 && (
          <div className="mt-6 text-center text-red-500 text-sm font-black animate-pulse uppercase tracking-widest">
            !! {t.FULL} !!
          </div>
        )}
      </div>
    </div>
  );
};
