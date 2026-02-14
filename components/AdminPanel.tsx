
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getLootConfig } from '../utils/lootSystem';
import { LootPoolItem, ItemType } from '../types/game';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, dispatch } = useGame();
  const [config, setConfig] = useState(getLootConfig());

  // 本地管理的设置状态，用于同步 UI
  const [searchRate, setSearchRate] = useState((state.settings?.searchSuccessRate ?? 0.5) * 100);

  const saveConfig = () => {
    localStorage.setItem('admin_loot_config', JSON.stringify(config));
    alert('DATABASE_SYNCHRONIZED: 全局掉落矩阵已更新。');
    onClose();
  };

  const handleRateChange = (val: number) => {
    setSearchRate(val);
    dispatch({ type: 'UPDATE_SETTINGS', payload: { searchSuccessRate: val / 100 } });
  };

  const purgeAi = () => {
    if (window.confirm('CRITICAL: 确认执行 PURGE_ALL_AI 指令？所有敌对单元将立即离线。')) {
      dispatch({ type: 'KILL_ALL_AI' });
      onClose();
    }
  };

  const addNewItem = (catIdx: number, type: ItemType) => {
    const newItem: LootPoolItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: 'NEW_TEMPLATE',
      type: type,
      weight: 10,
      minStat: 1,
      maxStat: 10,
      description: '待定义的系统物资描述。'
    };
    const newCfg = [...config];
    newCfg[catIdx].items.push(newItem);
    setConfig(newCfg);
  };

  const removeItem = (catIdx: number, itemIdx: number) => {
    if (!window.confirm('确认抹除该物资数据？此操作不可逆。')) return;
    const newCfg = [...config];
    newCfg[catIdx].items.splice(itemIdx, 1);
    setConfig(newCfg);
  };

  const updateItem = (catIdx: number, itemIdx: number, field: keyof LootPoolItem, value: string | number) => {
    const newCfg = [...config];
    // @ts-ignore
    newCfg[catIdx].items[itemIdx][field] = value;
    setConfig(newCfg);
  };

  return (
    <div className="fixed inset-0 bg-black z-[300] flex flex-col font-mono animate-in fade-in duration-300">
      <div className="flex-none bg-black border-b-4 border-white p-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic text-[#F7931A] leading-none">SYSTEM_ADMIN // MATRIX_EDITOR</h1>
            <p className="text-[10px] opacity-40 mt-2 uppercase tracking-widest font-bold">Root_Access: Enabled // Version: 2.3.0-DebugReady</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={purgeAi}
              className="border-2 border-[#F7931A] text-[#F7931A] px-6 py-3 font-black hover:bg-[#F7931A] hover:text-white transition-all uppercase text-xs"
            >
              [!] PURGE_ALL_AI
            </button>
            <button 
              onClick={onClose} 
              className="bg-white text-black px-8 py-3 font-black hover:bg-white/80 transition-all border-2 border-white text-xs"
            >
              [ESC] CLOSE
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#050505]">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* 全局参数调节区 */}
          <div className="border-4 border-[#F7931A] p-8 bg-[#F7931A]/5 shadow-[0_0_20px_rgba(247,147,26,0.1)]">
            <h2 className="text-2xl font-black text-[#F7931A] mb-6 uppercase italic tracking-tighter">Global_System_Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black uppercase opacity-60">Scan_Success_Probability</span>
                  <span className="text-2xl font-black text-[#F7931A]">{searchRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={searchRate}
                  onChange={(e) => handleRateChange(parseInt(e.target.value))}
                  className="w-full accent-[#F7931A] bg-white/10 h-2 appearance-none cursor-pointer"
                />
                <p className="text-[10px] opacity-40 uppercase italic">影响玩家执行 [SCAN_ZONE] 指令时成功探测到物资的几率。</p>
              </div>
              <div className="flex items-center justify-center border-2 border-dashed border-white/10 p-4 opacity-30 italic text-xs uppercase">
                Additional_Parameters_Locked_In_Dev_Mode
              </div>
            </div>
          </div>

          {state.phase !== 'WAITING' && (
            <div className="bg-[#F7931A]/20 text-[#F7931A] p-4 font-bold border-2 border-[#F7931A] shadow-[4px_4px_0px_#F7931A] uppercase text-xs tracking-tighter">
              CRITICAL_WARNING: 游戏会话进行中。修改将在下一次系统初始化时生效。
            </div>
          )}

          {config.map((cat, catIdx) => (
            <div key={cat.type} className="border-4 border-white/10 flex flex-col max-h-[500px] bg-[#080808]">
              <div className="flex-none p-6 border-b-2 border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-baseline gap-6">
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{cat.type}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Global_Weight:</span>
                      <input 
                        type="number" 
                        value={cat.weight} 
                        onChange={e => {
                          const newCfg = [...config];
                          newCfg[catIdx].weight = parseInt(e.target.value) || 0;
                          setConfig(newCfg);
                        }}
                        className="bg-black border border-white/40 p-1 w-20 text-center text-[#F7931A] font-bold focus:border-[#F7931A] outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => addNewItem(catIdx, cat.type)}
                    className="border-2 border-green-500 text-green-500 px-6 py-2 text-xs font-black hover:bg-green-500 hover:text-black transition-all uppercase"
                  >
                    [+] ADD_ENTRY
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-4 px-3 text-[10px] opacity-40 uppercase font-black tracking-widest">
                  <div className="col-span-3">Item_Identity</div>
                  <div className="col-span-1 text-center">WGT</div>
                  <div className="col-span-1 text-center">MIN</div>
                  <div className="col-span-1 text-center">MAX</div>
                  <div className="col-span-5">Data_Payload_Description</div>
                  <div className="col-span-1 text-right">Term</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {cat.items.map((item, itemIdx) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 bg-white/5 p-3 border border-white/5 items-center hover:bg-white/10 transition-colors group">
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={e => updateItem(catIdx, itemIdx, 'name', e.target.value)}
                        className="bg-transparent border-b border-white/10 w-full text-xs font-bold text-white focus:border-[#F7931A] outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="number" 
                        value={item.weight} 
                        onChange={e => updateItem(catIdx, itemIdx, 'weight', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b border-white/10 w-full text-center text-xs text-[#F7931A] outline-none font-bold"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="number" 
                        value={item.minStat} 
                        onChange={e => updateItem(catIdx, itemIdx, 'minStat', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b border-white/10 w-full text-center text-xs outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <input 
                        type="number" 
                        value={item.maxStat} 
                        onChange={e => updateItem(catIdx, itemIdx, 'maxStat', parseInt(e.target.value) || 0)}
                        className="bg-transparent border-b border-white/10 w-full text-center text-xs outline-none"
                      />
                    </div>
                    <div className="col-span-5">
                      <input 
                        type="text" 
                        value={item.description} 
                        onChange={e => updateItem(catIdx, itemIdx, 'description', e.target.value)}
                        className="bg-transparent border-b border-white/10 w-full text-[10px] opacity-70 italic outline-none truncate"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <button 
                        onClick={() => removeItem(catIdx, itemIdx)}
                        className="text-[#F7931A] opacity-20 group-hover:opacity-100 font-bold hover:bg-[#F7931A] hover:text-white px-3 py-1 transition-all"
                      >
                        [X]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none bg-black border-t-4 border-white p-10">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={saveConfig}
            className="w-full bg-[#F7931A] text-white py-6 text-2xl font-black hover:bg-white hover:text-black transition-all shadow-[10px_10px_0px_rgba(255,255,255,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 border-2 border-white"
          >
            COMMIT_CHANGES_TO_CENTRAL_CORE
          </button>
        </div>
      </div>
    </div>
  );
};
