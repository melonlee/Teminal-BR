
import { GameState, GridCell, Player, Item, Slot } from '../types/game';

const GRID_SIZE = 8;

const getInitialLoadout = (): { weapon: Item; bread: Item; water: Item } => ({
  weapon: {
    id: `item-init-weapon-${Math.random()}`,
    name: 'WOODEN STICK',
    type: 'WEAPON',
    rarity: 'COMMON',
    stats: { atk: 1 },
    description: '一块随处可见的木棍。'
  },
  bread: {
    id: `item-init-food-${Math.random()}`,
    name: 'BREAD',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    stats: { hunger: 40 },
    description: '干燥但能填饱肚子的面包。'
  },
  water: {
    id: `item-init-water-${Math.random()}`,
    name: 'WATER',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    stats: { thirst: 40 },
    description: '纯净的饮用水。'
  }
});

export const generateInitialState = (humanCount: number, aiCount: number): GameState => {
  const grid: GridCell[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x,
      y,
      isRestricted: false,
      isWarning: false,
      items: [],
      players: []
    }))
  );

  const players: Player[] = [];
  const totalPlayers = humanCount + aiCount;
  const usedPositions = new Set<string>();

  for (let i = 0; i < totalPlayers; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (usedPositions.has(`${x},${y}`));

    usedPositions.add(`${x},${y}`);

    const isAi = i >= humanCount;
    const loadout = getInitialLoadout();
    const playerId = `p-${i}`;

    const player: Player = {
      id: playerId,
      name: isAi ? `BOT_${i - humanCount + 1}` : `USER_${i + 1}`,
      isAi,
      stats: {
        hp: 100, maxHp: 100,
        hunger: 100, thirst: 100,
        maxHunger: 100, maxThirst: 100
      },
      equipment: {
        HEAD: null, BODY: null, HANDS: null, FEET: null, WEAPON: loadout.weapon, BAG: null
      },
      inventory: [loadout.bread, loadout.water],
      position: { x, y },
      status: 'ALIVE'
    };

    players.push(player);
    grid[y][x].players.push(playerId);
  }

  return {
    players,
    grid,
    turnCount: 1,
    activePlayerIndex: 0,
    log: ['>>> TERMINAL BOOTED.', '>>> OPERATION: NEON_VOID INITIATED.', '>>> ALL UNITS DEPLOYED.'],
    phase: 'ACTIVE',
    language: 'zh',
    settings: {
      searchSuccessRate: 0.5 // 默认 50% 成功率
    }
  };
};
