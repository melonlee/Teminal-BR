
import React from 'react';
import { GameState, Player } from '../types/game';

interface GridMapProps {
  state: GameState;
  humanPlayer?: Player;
  godMode?: boolean; // 新增：上帝模式控制
}

/**
 * 战术地图组件
 * 渲染 8x8 网格，支持视野迷雾及区域预警
 */
export const GridMap: React.FC<GridMapProps> = ({ state, humanPlayer, godMode = false }) => {
  return (
    <div className="aspect-square w-full max-w-[500px] border-4 border-white bg-[#050505] grid grid-cols-8 grid-rows-8 p-1 gap-1 relative overflow-hidden">
      {/* 上帝模式开启时的全局视觉反馈 */}
      {godMode && (
        <div className="absolute top-1 left-1 z-50 pointer-events-none">
          <span className="bg-[#00FF41] text-black px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
            SYSTEM_OVERRIDE_ACTIVE
          </span>
        </div>
      )}

      {state.grid.map((row, y) => 
        row.map((cell, x) => {
          const px = humanPlayer?.position.x ?? -10;
          const py = humanPlayer?.position.y ?? -10;
          
          const isRestricted = cell.isRestricted;
          const isWarning = cell.isWarning;

          // 核心逻辑：视野范围半径为 1 的九宫格，或者该区域是禁区/预警区，或者开启了上帝模式
          const isVisible = (Math.abs(px - x) <= 1 && Math.abs(py - y) <= 1) || isRestricted || isWarning || godMode;
          
          const isOccupiedByHuman = px === x && py === y;
          const hasItems = cell.items.length > 0;
          const otherPlayers = cell.players.filter(pid => pid !== humanPlayer?.id);
          
          let bgColor = 'bg-transparent';
          let borderColor = 'border-white/10';

          if (isRestricted) {
            bgColor = 'bg-red-900/40';
            borderColor = 'border-red-600';
          } else if (isWarning) {
            bgColor = 'bg-yellow-900/30 animate-pulse';
            borderColor = 'border-yellow-500';
          }

          return (
            <div 
              key={`${x}-${y}`}
              className={`relative border ${borderColor} ${bgColor} flex items-center justify-center transition-all duration-300 group ${!isVisible ? 'brightness-[0.1] grayscale opacity-30' : ''}`}
            >
              {isVisible ? (
                <>
                  <span className="absolute top-0 left-0 text-[6px] opacity-20 select-none">{x},{y}</span>
                  {hasItems && <span className="absolute top-0 right-1 text-[10px] text-yellow-500 animate-bounce">▼</span>}
                  
                  {isOccupiedByHuman && (
                    <div className="w-5 h-5 bg-[#FF4500] flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-[0_0_10px_#FF4500]">
                      @
                    </div>
                  )}

                  {!isOccupiedByHuman && otherPlayers.length > 0 && (
                    <div className="w-5 h-5 bg-white flex items-center justify-center text-[10px] font-black text-black border-2 border-[#FF4500]">
                      X
                    </div>
                  )}
                </>
              ) : (
                <span className="text-[12px] opacity-5 text-white/10 select-none">?</span>
              )}

              {isRestricted && (
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#FF4500_5px,#FF4500_10px)]" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
