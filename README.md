<div align="center">

# Terminal-BR

### Tactical Terminal Battle Royale

A turn-based tactical battle royale game with AI opponents and a prediction market, wrapped in a retro cyberpunk terminal aesthetic.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Deploy](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://teminal-br.vercel.app)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

[Live Demo](https://www.tecticalterminal.xyz/)

</div>

---

## Overview

Terminal-BR drops up to 8 players (human + AI) onto an 8×8 tactical grid in a fight for survival. Scavenge loot, engage in turn-based combat, and outlast your opponents as restricted zones close in — all through a monochrome terminal interface.

AI opponents are powered by the **Gemini API** with customizable system prompts, making each match unpredictable. A built-in **prediction market** lets you trade shares on contestants using bonding curve pricing, adding a strategic financial layer to the survival gameplay.

The game supports **bilingual UI** (English / Chinese) and saves progress to localStorage.

## Features

- **Turn-Based Tactical Combat** — Move, attack, search, and manage resources on an 8×8 grid with fog of war
- **AI Opponents** — Gemini API-powered NPCs with priority-based decision trees and configurable prompts
- **Prediction Market** — Trade contestant shares with bonding curve mechanics (+2% per purchase)
- **Loot System** — Weighted random item generation across weapons, armor, and consumables with rarity tiers (Common / Rare / Epic)
- **Survival Mechanics** — HP, hunger, and thirst management; consumables restore stats
- **Restricted Zones** — Expanding danger areas every 5 turns force players into tighter combat
- **Equipment Slots** — 6-slot gear system (Head, Body, Hands, Feet, Weapon, Bag) with stat previews on hover
- **Save & Load** — Game state persists via localStorage

## Demo

> **Video** — https://youtu.be/a-NmW2W24uA.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Gemini API key](https://ai.google.dev/) (for AI opponents)

### Installation

```bash
git clone https://github.com/melonlee/Teminal-BR.git
cd Teminal-BR
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
