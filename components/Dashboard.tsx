
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GridMap } from './GridMap';
import { StatBar } from './StatBar';
import { GameLog } from './GameLog';
import { ControlPanel } from './ControlPanel';
import { LootModal } from './LootModal';
import { AdminPanel } from './AdminPanel';
import { CombatPanel } from './CombatPanel';
import { Inventory } from './Inventory';
import { Item } from '../types/game';
import { decideAiAction } from '../utils/aiLogic';
import { AgentSetupModal } from './AgentSetupModal';
import { PredictionMarket } from './PredictionMarket'; // 引入新组件

const TRANSLATIONS = {
  zh: {
    TITLE: "战术终端",
    SUBTITLE: "8x8 网格 // 生存协议 082",
    START: "初始化系统",
    RESUME: "恢复会话进度",
    LANG: "切换语言: EN",
    CYCLE: "周期",
    ALIVE: "存活",
    PROFILE: "单位诊断",
    SYSTEM_BUSY: "系统繁忙: 计算敌方单位行动...",
    MISSION_END: "任务终结",
    SURVIVOR: "幸存者",
    REBOOT: "重置模拟",
    EXIT: "终止会话",
    YOUR_TURN: "当前轮到你",
    EXIT_CONFIRM: "确认终止当前会话？",
    SAVE_EXIT: "保存并退出",
    RESTART: "重新开始",
    CANCEL: "返回",
    ADMIN: "进入矩阵管理 [ADMIN]",
    MARKET: "预测市场" // 新增
  },
  en: {
    TITLE: "TACTICAL_VOID",
    SUBTITLE: "GRID_8X8 // SURVIVAL_PROTOCOL_082",
    START: "INITIALIZE_SYSTEM",
    RESUME: "RESUME_SESSION",
    LANG: "SWITCH_LANG: ZH",
    CYCLE: "CYCLE",
    ALIVE: "ALIVE",
    PROFILE: "USER_DIAGNOSTICS",
    SYSTEM_BUSY: "SYSTEM_BUSY: PROCESSING_HOSTILE...",
    MISSION_END: "MISSION_END",
    SURVIVOR: "SURVIVOR",
    REBOOT: "REINITIALIZE",
    EXIT: "TERMINATE",
    YOUR_TURN: "YOUR TURN",
    EXIT_CONFIRM: "TERMINATE CURRENT SESSION?",
    SAVE_EXIT: "SAVE & EXIT",
    RESTART: "RESTART",
    CANCEL: "CANCEL",
    ADMIN: "ADMIN_MATRIX_ACCESS",
    MARKET: "PREDICTION MARKET" // 新增
  }
};

const STORAGE_KEY = 'tactical_terminal_save';

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showMarket, setShowMarket] = useState(false); // 新增市场模态框状态
  const [hasSave, setHasSave] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [godMode, setGodMode] = useState(false);

  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to resolve environment-specific type errors.
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[state.language];
  const humanPlayer = state.players.find(p => !p.isAi);
  const isGameOver = state.phase === 'GAME_OVER';
  const activePlayer = state.players[state.activePlayerIndex];

  const isHumanTurn = activePlayer && !activePlayer.isAi && state.phase === 'ACTIVE' && !isAiProcessing;

  useEffect(() => {
    const save = localStorage.getItem(STORAGE_KEY);
    setHasSave(!!save);
  }, [state.phase]);

  /**
   * 监控回合切换与 AI 执行
   */
  useEffect(() => {
    // 基础状态过滤
    if (state.phase !== 'ACTIVE' || isGameOver || isAiProcessing || showExitModal) return;

    // 索引越界安全处理
    if (state.activePlayerIndex >= state.players.length) {
      dispatch({ type: 'NEXT_TURN' });
      return;
    }

    const currentPlayer = state.players[state.activePlayerIndex];

    // 跳过已死亡玩家
    if (currentPlayer.status === 'DEAD') {
      dispatch({ type: 'SKIP_TURN', payload: { playerId: currentPlayer.id } });
      return;
    }

    // 执行 AI 逻辑
    if (currentPlayer.isAi) {
      setIsAiProcessing(true);
      
      // 清除旧定时器防止重叠
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      
      aiTimerRef.current = setTimeout(() => {
        const action = decideAiAction(state, currentPlayer.id);
        dispatch(action);
        setIsAiProcessing(false);
      }, 500); // 适中的延迟感
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state.activePlayerIndex, state.phase, isGameOver, state.players.length, showExitModal]);

  if (state.phase === 'WAITING') {
    const menuBtnClass = "w-full border-4 border-white text-white px-20 py-8 text-3xl font-black bg-transparent hover:bg-white hover:text-black transition-all duration-200 uppercase tracking-widest";
    
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden p-10 terminal-scanline">
        <div className="z-10 border-8 border-white p-20 text-center bg-black min-w-[700px] shadow-[30px_30px_0px_rgba(255,255,255,0.1)]">
          <h1 className="text-8xl font-black italic tracking-tighter text-[#F7931A] mb-8 text-glow leading-none">{t.TITLE}</h1>
          <p className="mb-20 font-mono text-2xl opacity-60 tracking-[0.4em] uppercase">{t.SUBTITLE}</p>
          
          <div className="flex flex-col gap-8 max-w-lg mx-auto">
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { humanCount: 1, aiCount: 7 } })} className={menuBtnClass}>{t.START}</button>
            {hasSave && (
              <button onClick={() => { const s = localStorage.getItem(STORAGE_KEY); if(s) dispatch({type: 'LOAD_GAME', payload: JSON.parse(s)}); }} className={menuBtnClass}>{t.RESUME}</button>
            )}
            <button onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'zh' ? 'en' : 'zh' })} className={menuBtnClass}>{t.LANG}</button>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
          <button onClick={() => setShowAdmin(true)} className="text-sm text-white/30 hover:text-[#F7931A] hover:opacity-100 uppercase transition-all tracking-[0.6em] py-4 px-10 border border-transparent hover:border-white/20 hover:bg-white/5 backdrop-blur-md font-bold">
            --- ROOT_ACCESS_GRANTED [{t.ADMIN}] ---
          </button>
        </div>

        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-6 gap-6 bg-[#050505] text-white font-mono terminal-scanline select-none overflow-hidden text-base">
      <LootModal onHoverItem={setHoveredItem} />
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showMarket && <PredictionMarket onClose={() => setShowMarket(false)} />}
      
      {/* 新增：AI 配置弹窗，在 SETUP 阶段显示 */}
      {state.phase === 'SETUP' && <AgentSetupModal />}
      
      <header className="flex justify-between items-end border-b-8 border-[#F7931A] pb-4 flex-none">
        <div className="flex items-end gap-10">
          <div>
            <h2 className="text-5xl font-black italic text-[#F7931A] leading-none text-glow uppercase tracking-tighter">{t.TITLE}</h2>
            <div className="text-xs opacity-40 uppercase tracking-[0.2em] mt-2 font-black">NODE_{activePlayer?.id.slice(-2)} // {activePlayer?.name}</div>
          </div>
        </div>
        <div className="flex gap-12 items-center text-right">
          {/* 新增：预测市场按钮 */}
          <button 
            onClick={() => setShowMarket(true)}
            className="border-2 border-[#00FF41] text-[#00FF41] px-4 py-1 text-xs font-black hover:bg-[#00FF41] hover:text-black transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(0,255,65,0.2)]"
          >
            [{t.MARKET}]
          </button>

          <div><div className="text-xs opacity-40 uppercase font-black">{t.CYCLE}</div><div className="text-4xl font-black">{state.turnCount}</div></div>
          <div><div className="text-xs opacity-40 uppercase font-black">{t.ALIVE}</div><div className="text-4xl font-black">{state.players.filter(p=>p.status==='ALIVE').length}</div></div>
          <button onClick={() => setShowExitModal(true)} className="border-4 border-white/40 px-6 py-2 text-sm font-black hover:bg-white hover:text-black transition-all uppercase tracking-widest">[{t.EXIT}]</button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-6 min-h-0 overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] border-4 border-white/20 relative shadow-inner overflow-hidden">
            <div className="w-full max-w-[500px] flex justify-end mb-2">
              <button 
                onClick={() => setGodMode(!godMode)}
                className={`text-[10px] px-3 py-1 font-bold border-2 transition-all uppercase tracking-widest ${godMode ? 'bg-[#00FF41] text-black border-[#00FF41]' : 'bg-transparent text-white/30 border-white/10 hover:border-white/30'}`}
              >
                [DEBUG: VISION_{godMode ? 'ON' : 'OFF'}]
              </button>
            </div>
            
            <GridMap state={state} humanPlayer={humanPlayer} godMode={godMode} />
            
            {isAiProcessing && (
              <div className="absolute top-10 right-10 bg-[#F7931A] text-black px-8 py-3 text-xl font-black animate-pulse shadow-[0_0_30px_#F7931A] border-4 border-white z-20">
                [{t.SYSTEM_BUSY}]
              </div>
            )}
          </div>
          <div className="h-1/3 flex-none min-h-[200px]">
            <GameLog logs={state.log} />
          </div>
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-6 min-h-0 overflow-hidden">
          <div className="min-h-0 flex flex-col">
            {humanPlayer && (
              <CombatPanel player={humanPlayer} hoveredItem={hoveredItem} language={state.language} />
            )}
          </div>
          <div className="min-h-0 flex flex-col border-4 border-white p-6 bg-black shadow-[10px_10px_0px_rgba(255,255,255,0.05)]">
            <h3 className="text-sm font-black border-b-2 border-white/20 mb-4 pb-2 flex justify-between uppercase tracking-widest">
              <span>{t.PROFILE}</span>
              {isHumanTurn && <span className="text-[#F7931A] animate-pulse">{t.YOUR_TURN}</span>}
            </h3>
            {humanPlayer && (
              <div className={humanPlayer.status === 'DEAD' ? 'opacity-30 grayscale' : 'space-y-2'}>
                {/* 恢复红色 */}
                <StatBar label="HP" value={humanPlayer.stats.hp} maxValue={humanPlayer.stats.maxHp} color="bg-red-600" />
                <StatBar label="HUNGER" value={humanPlayer.stats.hunger} maxValue={humanPlayer.stats.maxHunger} color="bg-yellow-600" />
                <StatBar label="THIRST" value={humanPlayer.stats.thirst} maxValue={humanPlayer.stats.maxThirst} color="bg-blue-600" />
              </div>
            )}
          </div>
          <div className="min-h-0 flex flex-col">
            <Inventory 
              player={humanPlayer} 
              isHumanTurn={isHumanTurn} 
              dispatch={dispatch} 
              onHoverItem={setHoveredItem} 
              language={state.language} 
            />
          </div>
          <div className="min-h-0 flex flex-col border-4 border-white p-6 bg-black shadow-[10px_10px_0px_rgba(255,255,255,0.05)]">
             <h3 className="text-sm font-black border-b-2 border-white/20 mb-6 pb-2 uppercase tracking-widest">
                COMMAND_MATRIX
             </h3>
             <div className="flex-1 flex items-center justify-center">
               <ControlPanel player={humanPlayer} dispatch={dispatch} disabled={!isHumanTurn} onActionComplete={() => {}} />
             </div>
          </div>
        </div>
      </div>

      {showExitModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[500] backdrop-blur-md animate-in fade-in duration-300">
          <div className="border-8 border-white p-16 bg-black text-center min-w-[600px] shadow-[20px_20px_0px_#F7931A]">
            <h3 className="text-5xl font-black mb-12 text-[#F7931A] uppercase italic tracking-tighter leading-none">{t.EXIT_CONFIRM}</h3>
            <div className="flex flex-col gap-6">
              <button onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); dispatch({ type: 'EXIT_TO_MENU' }); setShowExitModal(false); }} className="bg-white text-black py-8 text-3xl font-black hover:bg-[#F7931A] hover:text-white transition-all uppercase">{t.SAVE_EXIT}</button>
              <button onClick={() => { dispatch({ type: 'START_GAME', payload: { humanCount: 1, aiCount: 7 } }); setShowExitModal(false); }} className="border-4 border-white text-white py-8 text-3xl font-black hover:bg-white hover:text-black transition-all uppercase">{t.RESTART}</button>
              <button onClick={() => setShowExitModal(false)} className="text-lg opacity-50 hover:opacity-100 uppercase mt-4 tracking-[0.5em] font-black underline underline-offset-8 transition-all">{t.CANCEL}</button>
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="fixed inset-0 bg-black/98 flex flex-col items-center justify-center z-[1000] p-6 md:p-12 lg:p-20 animate-in fade-in zoom-in duration-700">
          <div className="border-[12px] md:border-[16px] border-[#F7931A] p-12 md:p-24 text-center bg-black max-w-full lg:max-w-6xl shadow-[0_0_150px_rgba(247,147,26,0.6)] flex flex-col items-center">
            <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-black italic mb-4 text-[#F7931A] uppercase leading-none tracking-tighter text-glow break-words max-w-full text-center">
              {t.MISSION_END}
            </h2>
            <div className="text-2xl md:text-5xl font-black mb-12 md:mb-16 border-y-4 md:border-y-8 border-white py-6 md:py-12 uppercase tracking-[0.3em] md:tracking-[0.6em] w-full">
              {t.SURVIVOR}: {state.winner?.name || 'NONE'}
            </div>
            <button onClick={() => dispatch({ type: 'START_GAME', payload: { humanCount: 1, aiCount: 7 } })} className="w-full max-w-2xl bg-white text-black py-6 md:py-12 text-2xl md:text-5xl font-black hover:bg-[#F7931A] hover:text-white transition-all shadow-[10px_10px_0px_rgba(255,255,255,0.2)] md:shadow-[20px_20px_0px_rgba(255,255,255,0.2)] uppercase">
              {t.REBOOT}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
