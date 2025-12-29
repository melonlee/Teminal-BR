
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';

/**
 * 初始状态
 */
const initialState: GameState = {
  players: [],
  grid: [],
  turnCount: 0,
  activePlayerIndex: 0,
  log: ['WAITING FOR COMMAND...'],
  phase: 'WAITING',
  language: 'zh', // 默认语言为中文
  // Fix: Added missing 'settings' property to satisfy GameState interface
  settings: {
    searchSuccessRate: 0.5
  }
};

/**
 * 定义 Context 类型
 */
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * 游戏状态提供者组件
 */
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * 游戏状态 Hook
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
