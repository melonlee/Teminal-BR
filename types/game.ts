
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

// 新增市场数据接口
export interface MarketData {
  price: number;
  lastPrice: number;
  history: number[]; // 存储最近 20 次价格历史用于绘图
  sharesOwned: number; // 用户持有的份额
  trend: 'UP' | 'DOWN' | 'FLAT';
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
  // 每个玩家关联的市场数据
  market: MarketData;
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

export interface AiConfig {
  systemPrompt: string;
  apiKey: string;
}

export interface GameState {
  players: Player[];
  grid: GridCell[][];
  turnCount: number;
  activePlayerIndex: number;
  log: string[];
  phase: 'WAITING' | 'SETUP' | 'ACTIVE' | 'LOOTING' | 'GAME_OVER';
  pendingLoot?: Item | null;
  winner?: Player | null;
  language: Language;
  settings: GameSettings;
  aiConfig?: AiConfig;
  // 新增：用户在预测市场的现金余额
  userBalance: number;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { humanCount: number; aiCount: number } }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'EXIT_TO_MENU' }
  | { type: 'INIT_AGENT'; payload: AiConfig }
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
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'NEXT_TURN' }
  // 新增：购买股票
  | { type: 'MARKET_BUY'; payload: { playerId: string; amount: number } };
