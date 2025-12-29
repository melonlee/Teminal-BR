
import { GameState, GameAction, Player, GridCell, Item, Slot } from '../types/game';
import { generateInitialState } from '../utils/gameInit';
import { calculateTotalAtk, calculateTotalDef } from '../utils/gameLogic';
import { generateLoot } from '../utils/lootSystem';

const GRID_SIZE = 8;

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  const newLog = [...state.log];
  const addLog = (msg: string) => {
    newLog.push(`> ${msg}`);
    if (newLog.length > 50) newLog.shift();
  };

  /**
   * 增强版回合推进逻辑
   * 自动寻找下一个活着的玩家，如果绕回到原点则结束大回合
   */
  const getNextStateWithActivePlayer = (currentState: GameState): GameState => {
    let nextIndex = currentState.activePlayerIndex + 1;
    
    // 如果已经遍历完所有玩家，触发下一轮环境结算
    if (nextIndex >= currentState.players.length) {
      return gameReducer({ ...currentState, activePlayerIndex: 0 }, { type: 'NEXT_TURN' });
    }

    // 如果下一个玩家已经死亡，递归寻找下一个
    if (currentState.players[nextIndex].status === 'DEAD') {
      return getNextStateWithActivePlayer({ ...currentState, activePlayerIndex: nextIndex });
    }
    
    return { ...currentState, activePlayerIndex: nextIndex, log: newLog };
  };

  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'START_GAME':
      return { ...generateInitialState(action.payload.humanCount, action.payload.aiCount), language: state.language };

    case 'LOAD_GAME':
      return { ...action.payload, phase: 'ACTIVE' };

    case 'EXIT_TO_MENU':
      return { ...state, phase: 'WAITING' };

    case 'KILL_ALL_AI': {
      const human = state.players.find(p => !p.isAi);
      let updatedGrid = state.grid.map(row => 
        row.map(cell => ({ 
          ...cell, 
          players: cell.players.filter(pid => {
            const p = state.players.find(sp => sp.id === pid);
            return p && !p.isAi;
          }) 
        }))
      );
      
      const updatedPlayers = state.players.map(p => {
        if (p.isAi) {
          return { ...p, status: 'DEAD' as const, stats: { ...p.stats, hp: 0 } };
        }
        return p;
      });

      addLog(state.language === 'zh' ? 'ADMIN: 强制离线所有敌对 AI。' : 'ADMIN: PURGED ALL AI.');
      return { ...state, players: updatedPlayers, grid: updatedGrid, phase: 'GAME_OVER', winner: human || null, activePlayerIndex: 0, log: newLog };
    }

    case 'MOVE': {
      const { playerId, direction } = action.payload;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      const player = state.players[playerIndex];
      if (!player || player.status === 'DEAD') return getNextStateWithActivePlayer(state);
      
      const { x, y } = player.position;
      let newX = x, newY = y;
      if (direction === 'UP') newY--;
      if (direction === 'DOWN') newY++;
      if (direction === 'LEFT') newX--;
      if (direction === 'RIGHT') newX++;

      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE || player.stats.hunger < 2 || player.stats.thirst < 5) {
        addLog(state.language === 'zh' ? `${player.name} 无法移动。` : `${player.name} MOVE BLOCKED.`);
        return getNextStateWithActivePlayer(state);
      }

      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = {
        ...player,
        position: { x: newX, y: newY },
        stats: { ...player.stats, hunger: Math.max(0, player.stats.hunger - 2), thirst: Math.max(0, player.stats.thirst - 5) }
      };

      const updatedGrid = state.grid.map(row => row.map(cell => ({ ...cell, players: [...cell.players] })));
      updatedGrid[y][x].players = updatedGrid[y][x].players.filter(id => id !== playerId);
      updatedGrid[newY][newX].players.push(playerId);
      
      addLog(state.language === 'zh' ? `${player.name} 移动至 [${newX}, ${newY}]。` : `${player.name} MOVED TO [${newX}, ${newY}].`);
      return getNextStateWithActivePlayer({ ...state, players: updatedPlayers, grid: updatedGrid });
    }

    case 'SEARCH': {
      const { playerId } = action.payload;
      const pIdx = state.players.findIndex(p => p.id === playerId);
      const player = state.players[pIdx];
      if (!player || player.status === 'DEAD') return getNextStateWithActivePlayer(state);

      const successProb = state.settings?.searchSuccessRate ?? 0.5;
      const isSuccess = Math.random() < successProb;

      const updatedPlayers = [...state.players];
      updatedPlayers[pIdx] = { ...player, stats: { ...player.stats, hunger: Math.max(0, player.stats.hunger - 5) } };

      if (!isSuccess) {
        addLog(state.language === 'zh' ? `[${player.name}] 搜索无果。` : `[${player.name}] SEARCH FAILED.`);
        return getNextStateWithActivePlayer({ ...state, players: updatedPlayers });
      }

      const loot = generateLoot();
      if (!loot) return getNextStateWithActivePlayer({ ...state, players: updatedPlayers });
      
      if (!player.isAi) {
        // 关键：人类搜寻到物资，进入 LOOTING 阶段
        return { ...state, players: updatedPlayers, phase: 'LOOTING', pendingLoot: loot, log: newLog };
      } else {
        if (player.inventory.length < 8) {
          updatedPlayers[pIdx].inventory.push(loot);
          addLog(state.language === 'zh' ? `AI ${player.name} 拾取了 ${loot.name}。` : `AI ${player.name} TOOK ${loot.name}.`);
        }
        return getNextStateWithActivePlayer({ ...state, players: updatedPlayers });
      }
    }

    case 'TAKE_LOOT': {
      const { playerId } = action.payload;
      const pIdx = state.players.findIndex(p => p.id === playerId);
      if (pIdx === -1 || !state.pendingLoot) return { ...state, phase: 'ACTIVE' };
      
      const player = state.players[pIdx];
      const updatedPlayers = [...state.players];
      
      if (player.inventory.length < 8) {
        updatedPlayers[pIdx] = { ...player, inventory: [...player.inventory, state.pendingLoot] };
        addLog(state.language === 'zh' ? `获得了 ${state.pendingLoot.name}。` : `ACQUIRED ${state.pendingLoot.name}.`);
      } else {
        addLog(state.language === 'zh' ? `背包已满，未能获得物品。` : `INV FULL, ITEM DISCARDED.`);
      }

      // 关键修复：显式重置 phase 为 ACTIVE，确保 getNextStateWithActivePlayer 接收到的状态是干净的
      const intermediateState = { ...state, players: updatedPlayers, phase: 'ACTIVE' as const, pendingLoot: null };
      return getNextStateWithActivePlayer(intermediateState);
    }

    case 'DISCARD_LOOT':
      addLog(state.language === 'zh' ? `舍弃了发现的物资。` : `ITEM DISCARDED.`);
      return getNextStateWithActivePlayer({ ...state, phase: 'ACTIVE', pendingLoot: null });

    case 'ATTACK': {
      const { attackerId, targetId } = action.payload;
      const attackerIdx = state.players.findIndex(p => p.id === attackerId);
      const targetIdx = state.players.findIndex(p => p.id === targetId);
      const attacker = state.players[attackerIdx];
      const target = state.players[targetIdx];

      if (!attacker || !target || attacker.status === 'DEAD' || target.status === 'DEAD') {
        return getNextStateWithActivePlayer(state);
      }

      const damage = Math.max(1, calculateTotalAtk(attacker) - calculateTotalDef(target));
      const updatedPlayers = [...state.players];
      const newHp = Math.max(0, target.stats.hp - damage);
      
      updatedPlayers[targetIdx] = {
        ...target,
        stats: { ...target.stats, hp: newHp },
        status: newHp <= 0 ? 'DEAD' : 'ALIVE'
      };

      addLog(state.language === 'zh' ? `${attacker.name} -> ${target.name} [-${damage}HP]` : `${attacker.name} -> ${target.name} [-${damage}HP]`);
      
      let updatedGrid = state.grid;
      if (newHp <= 0) {
        addLog(state.language === 'zh' ? `${target.name} 已被淘汰。` : `${target.name} ELIMINATED.`);
        updatedGrid = state.grid.map(row => row.map(cell => ({
          ...cell,
          players: cell.players.filter(pid => pid !== targetId)
        })));
      }

      return getNextStateWithActivePlayer({ ...state, players: updatedPlayers, grid: updatedGrid });
    }

    case 'USE_ITEM': {
      const { playerId, itemId } = action.payload;
      const pIdx = state.players.findIndex(p => p.id === playerId);
      const player = state.players[pIdx];
      const itemIdx = player.inventory.findIndex(i => i.id === itemId);
      const item = player.inventory[itemIdx];
      if (!item) return getNextStateWithActivePlayer(state);

      const updatedPlayers = [...state.players];
      const updatedPlayer = { ...player, inventory: [...player.inventory] };
      updatedPlayer.inventory.splice(itemIdx, 1);

      if (item.type === 'WEAPON' || item.type === 'ARMOR') {
        const slot = item.slot || (item.type === 'WEAPON' ? 'WEAPON' : 'BODY');
        const oldItem = player.equipment[slot];
        if (oldItem) updatedPlayer.inventory.push(oldItem);
        updatedPlayer.equipment[slot] = item;
      } else {
        if (item.stats.heal) updatedPlayer.stats.hp = Math.min(updatedPlayer.stats.maxHp, updatedPlayer.stats.hp + item.stats.heal);
        if (item.stats.hunger) updatedPlayer.stats.hunger = Math.min(updatedPlayer.stats.maxHunger, updatedPlayer.stats.hunger + item.stats.hunger);
        if (item.stats.thirst) updatedPlayer.stats.thirst = Math.min(updatedPlayer.stats.maxThirst, updatedPlayer.stats.thirst + item.stats.thirst);
      }
      
      updatedPlayers[pIdx] = updatedPlayer;
      addLog(state.language === 'zh' ? `使用了 ${item.name}。` : `USED ${item.name}.`);
      return getNextStateWithActivePlayer({ ...state, players: updatedPlayers });
    }

    case 'PICKUP_ITEM': {
      const { playerId, itemId } = action.payload;
      const pIdx = state.players.findIndex(p => p.id === playerId);
      const player = state.players[pIdx];
      const { x, y } = player.position;
      const item = state.grid[y][x].items.find(i => i.id === itemId);
      
      if (!item || player.inventory.length >= 8) return getNextStateWithActivePlayer(state);
      
      const updatedPlayers = [...state.players];
      updatedPlayers[pIdx] = { ...player, inventory: [...player.inventory, item] };
      const updatedGrid = state.grid.map((row, ry) => row.map((c, cx) => 
        (ry === y && cx === x) ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c
      ));
      
      addLog(state.language === 'zh' ? `拾取了地面的物品。` : `PICKED UP ITEM.`);
      return getNextStateWithActivePlayer({ ...state, players: updatedPlayers, grid: updatedGrid });
    }

    case 'SKIP_TURN':
      return getNextStateWithActivePlayer(state);

    case 'NEXT_TURN': {
      let updatedTurnCount = state.turnCount + 1;
      let updatedGrid = state.grid.map(row => row.map(cell => ({ ...cell, isWarning: false, players: [...cell.players], items: [...cell.items] })));
      
      state.grid.forEach((row, y) => row.forEach((cell, x) => {
        if (cell.isWarning) updatedGrid[y][x].isRestricted = true;
      }));

      if ((updatedTurnCount + 1) % 5 === 0) {
        const potential = [];
        for (let y = 0; y < GRID_SIZE; y++) 
          for (let x = 0; x < GRID_SIZE; x++) 
            if (!updatedGrid[y][x].isRestricted) potential.push({x, y});
        if (potential.length > 0) {
          const t = potential[Math.floor(Math.random() * potential.length)];
          updatedGrid[t.y][t.x].isWarning = true;
          addLog(state.language === 'zh' ? `! 警告：区域 [${t.x}, ${t.y}] 即将坍塌。` : `! WARNING: SECTOR [${t.x}, ${t.y}] COLLAPSE IMMINENT.`);
        }
      }

      let updatedPlayers = state.players.map(p => {
        if (p.status === 'DEAD') return p;
        const stats = { ...p.stats, hunger: Math.max(0, p.stats.hunger - 1), thirst: Math.max(0, p.stats.thirst - 1) };
        if (updatedGrid[p.position.y][p.position.x].isRestricted) {
          updatedGrid[p.position.y][p.position.x].players = updatedGrid[p.position.y][p.position.x].players.filter(id => id !== p.id);
          addLog(state.language === 'zh' ? `${p.name} 被禁区吞噬。` : `${p.name} DIED IN ZONE.`);
          return { ...p, status: 'DEAD' as const, stats: { ...stats, hp: 0 } };
        }
        return { ...p, stats };
      });

      const alive = updatedPlayers.filter(p => p.status === 'ALIVE');
      let phase = state.phase;
      let winner = state.winner;

      if (alive.length === 1) { 
        phase = 'GAME_OVER'; 
        winner = alive[0]; 
      } else if (alive.length === 0) { 
        phase = 'GAME_OVER'; 
      }
      
      // 关键：NEXT_TURN 时，如果有未清空的 LOOTING 状态，强制回归 ACTIVE
      return { 
        ...state, 
        turnCount: updatedTurnCount, 
        activePlayerIndex: 0, 
        players: updatedPlayers, 
        grid: updatedGrid, 
        phase: phase === 'LOOTING' ? 'ACTIVE' : phase, 
        winner, 
        log: newLog 
      };
    }

    default:
      return state;
  }
};
