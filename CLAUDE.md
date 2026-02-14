# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Terminal BR** (Tactical Terminal Battle Royale) is a text-based, grid-based battle royale game with a unique prediction market system. Built with React 19, TypeScript, and Vite, it combines turn-based combat mechanics with a stock trading mini-game where players can buy/sell shares in contestants.

## Development Commands

```bash
# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Prerequisites**: Requires `GEMINI_API_KEY` in `.env.local` for AI agent functionality.

## Architecture

### State Management Pattern
The application uses a **React Context + Reducer pattern** (Redux-style):

```
App.tsx
  └── GameProvider (Context)
        └── useReducer(gameReducer)
              └── Components dispatch actions
```

- **GameContext** (`context/GameContext.tsx`): Global state provider via `useGame()` hook
- **gameReducer** (`reducers/gameReducer.ts`): Single source of truth for all state transitions

### Key Directories

- `components/` - React UI components (Dashboard, GridMap, PredictionMarket, etc.)
- `context/` - React Context for state management
- `reducers/` - Game state reducer with all action handlers
- `types/` - TypeScript type definitions (`game.ts` contains all interfaces)
- `utils/` - Game logic utilities (aiLogic, gameInit, lootSystem, gameLogic)

### Game Flow States
- `WAITING` - Main menu
- `SETUP` - AI agent configuration
- `ACTIVE` - Game in progress
- `LOOTING` - Item discovery modal
- `GAME_OVER` - Results screen

## Core Game Mechanics

### Grid System
- 8x8 grid with fog of war
- Restricted zones expand over time (every 5 turns)
- Players take hunger/thirst damage when in restricted zones

### Turn System
- Simultaneous turn-based gameplay
- `activePlayerIndex` tracks current player
- `getNextStateWithActivePlayer()` handles turn advancement

### Prediction Market (Unique Feature)
Each player has an associated stock price that fluctuates based on:
- Successful actions (+0.5% to +10%)
- Failed actions (-1% to -5%)
- Death (price → 0)
- Player survival (+1% per turn)
- Buying shares increases price (bonding curve)

Players start with $1000 to invest. Stock prices are tracked in `player.market` with history for charting.

### AI Decision Priority (`utils/aiLogic.ts`)
1. Escape restricted zones
2. Use consumables if HP/hunger/thirst critical
3. Attack enemies in same cell (if HP > 30)
4. Pick up items or search for loot
5. Move toward map center

## Important Implementation Details

### Path Alias
`@/*` maps to root directory (configured in `vite.config.ts` and `tsconfig.json`)

### Environment Variables
- `GEMINI_API_KEY` is exposed via Vite's `define` config in `vite.config.ts`
- Accessed as `process.env.GEMINI_API_KEY` in code

### Internationalization
- Bilingual support (Chinese `'zh'` / English `'en'`)
- `language` state in `GameState` controls UI text
- All log messages check `state.language` before outputting

### Equipment Slots
`HEAD` | `BODY` | `HANDS` | `FEET` | `WEAPON` | `BAG`

### Inventory Capacity
Max 8 items per player

## Reducer Actions Reference

All state changes flow through `gameReducer`. Key actions:
- Game flow: `START_GAME`, `LOAD_GAME`, `EXIT_TO_MENU`, `NEXT_TURN`
- Player actions: `MOVE`, `SEARCH`, `ATTACK`, `SKIP_TURN`
- Item management: `TAKE_LOOT`, `DISCARD_LOOT`, `USE_ITEM`, `EQUIP_ITEM`, `DROP_ITEM`, `PICKUP_ITEM`
- Market: `MARKET_BUY` (purchase shares with cash)
- Admin: `KILL_ALL_AI`, `UPDATE_SETTINGS`

## Styling

- Tailwind CSS via CDN (configured in `index.html`)
- Cyber/Brutalist theme with orange (#F7931A) and green (#00FF41) accents
- Scanline effects and monospace fonts (Fira Code)
- Custom terminal-style CSS defined inline
