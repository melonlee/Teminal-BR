
export type Language = 'zh' | 'en';
export type ItemType = 'WEAPON' | 'ARMOR' | 'CONSUMABLE' | 'TRAP' | 'EMPTY';
export type Slot = 'HEAD' | 'BODY' | 'HANDS' | 'FEET' | 'WEAPON' | 'BAG';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: 'COMMON' | 'RARE' | 'EPIC';
  slot?: Slot; 
  stats: {
    atk?: number;
    def?: number;
    heal?: number;
    hunger?: number;
    thirst?: number;
  };
  description: string;
}

export interface LootPoolItem {
  id: string;
  name: string;
  type: ItemType;
  slot?: Slot;
  weight: number;
  minStat: number;
  maxStat: number;
  description: string;
}

export interface LootCategory {
  type: ItemType;
  weight: number;
  items: LootPoolItem[];
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  hunger: number;
  thirst: number;
  maxHunger: number;
  maxThirst: number;
}

export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  stats: PlayerStats;
  equipment: Record<Slot, Item | null>;
  inventory: Item[];
  position: { x: number; y: number };
  status: 'ALIVE' | 'DEAD';
}

export interface GridCell {
  x: number;
  y: number;
  isRestricted: boolean;
  isWarning: boolean;
  items: Item[];
  players: string[];
}

export interface GameSettings {
  searchSuccessRate: number; // 0.0 到 1.0 之间
}

export interface GameState {
  players: Player[];
  grid: GridCell[][];
  turnCount: number;
  activePlayerIndex: number;
  log: string[];
  phase: 'WAITING' | 'ACTIVE' | 'LOOTING' | 'GAME_OVER';
  pendingLoot?: Item | null;
  winner?: Player | null;
  language: Language;
  settings: GameSettings; // 新增：全局设置
}

export type GameAction =
  | { type: 'START_GAME'; payload: { humanCount: number; aiCount: number } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'EXIT_TO_MENU' }
  | { type: 'MOVE'; payload: { playerId: string; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' } }
  | { type: 'SEARCH'; payload: { playerId: string } }
  | { type: 'TAKE_LOOT'; payload: { playerId: string } }
  | { type: 'DISCARD_LOOT' }
  | { type: 'ATTACK'; payload: { attackerId: string; targetId: string } }
  | { type: 'USE_ITEM'; payload: { playerId: string; itemId: string } }
  | { type: 'EQUIP_ITEM'; payload: { playerId: string; itemId: string } }
  | { type: 'DROP_ITEM'; payload: { playerId: string; itemId: string } }
  | { type: 'PICKUP_ITEM'; payload: { playerId: string; itemId: string } }
  | { type: 'SKIP_TURN'; payload: { playerId: string } }
  | { type: 'KILL_ALL_AI' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> } // 新增：更新设置动作
  | { type: 'NEXT_TURN' };
