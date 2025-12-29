
import React from 'react';
import { GameAction, Player } from '../types/game';

interface ControlPanelProps {
  player?: Player;
  dispatch: React.Dispatch<GameAction>;
  disabled?: boolean;
  onActionComplete: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ player, dispatch, disabled, onActionComplete }) => {
  if (!player || player.status === 'DEAD') return null;

  const handleAction = (action: GameAction) => {
    dispatch(action);
    onActionComplete();
  };

  const btnClass = "border-2 border-white hover:bg-white hover:text-black transition-all p-3 font-black uppercase text-xs flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transform active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_rgba(255,255,255,0.2)]";

  return (
    <div className="w-full flex flex-col gap-3 bg-transparent overflow-hidden">
      {/* 移动控制 */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'MOVE', payload: { playerId: player.id, direction: 'UP' } })}
          className={btnClass}
        >
          [W] UP
        </button>
        <div />
        
        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'MOVE', payload: { playerId: player.id, direction: 'LEFT' } })}
          className={btnClass}
        >
          [A] LFT
        </button>
        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'MOVE', payload: { playerId: player.id, direction: 'DOWN' } })}
          className={btnClass}
        >
          [S] DWN
        </button>
        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'MOVE', payload: { playerId: player.id, direction: 'RIGHT' } })}
          className={btnClass}
        >
          [D] RGT
        </button>
      </div>

      {/* 基础动作 */}
      <div className="grid grid-cols-3 gap-2">
        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'SEARCH', payload: { playerId: player.id } })}
          className={`${btnClass} col-span-1 border-[#FF4500] text-[#FF4500] hover:bg-[#FF4500] hover:text-white shadow-[2px_2px_0px_rgba(255,69,0,0.2)]`}
        >
          [F] SCAN
        </button>

        <button 
          disabled={disabled}
          onClick={() => handleAction({ type: 'NEXT_TURN' })}
          className={`${btnClass} col-span-2 bg-white text-black hover:bg-gray-400 hover:text-white shadow-[2px_2px_0px_rgba(255,255,255,0.2)]`}
        >
          [SPACE] END_TURN
        </button>
      </div>

      {/* 调试/高级指令 */}
      <div className="w-full">
        <button 
          onClick={() => {
            if(window.confirm('CRITICAL: PURGE_ALL_AI?')) {
              handleAction({ type: 'KILL_ALL_AI' });
            }
          }}
          className="w-full border-2 border-red-600 text-red-600 p-2 font-black uppercase text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_rgba(220,38,38,0.2)]"
        >
          [!] PURGE_HOSTILES (DEBUG)
        </button>
      </div>
    </div>
  );
};
