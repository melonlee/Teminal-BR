
# Changelog

All notable changes to the **Tactical Terminal BR** project will be documented in this file.

## [v1.3.0] - AI Agent Configuration

### Added (新增)
- **Setup Phase (配置阶段)**: 游戏开始前新增了 `SETUP` 阶段。
- **Agent Configuration Modal**: 新增了 AI Agent 配置弹窗，包含：
  - **System Prompt Input**: 用于输入自定义 AI 指令。
  - **API Key Input**: 用于输入 API 密钥。
  - **Activation**: 点击 "创建 AI AGENT" 后才正式进入游戏地图。

## [v1.2.0] - Fixes & Logs

### Fixed (修复)
- **Control Panel**: Removed `window.confirm` from `KILL_ALL_AI` button to resolve non-responsive click issues on some platforms. Added CSS reinforcement (`z-index`, `pointer-events`) to ensure clickability.
- **Changelog**: Restored changelog structure with versioning.

## [v1.1.0] - UI Refinement & Logic Consolidation

### Changed (变更)
- **Grid Map UX**:
  - 坐标显示修改为居中 `[X,Y]`，置于底层，清晰度更高。
  - **Loot Radar**: 玩家周围 3x3 范围内（包含脚下）若有掉落物，格子背景将显示为 20% 透明度的绿色，辅助搜寻。
- **Turn Control (回合控制)**:
  - 将原本的调试功能 `FORCE_NEXT` 逻辑合并入 `[SPACE] END_TURN` 按钮。
  - 移除了独立的 `FORCE_NEXT` 按钮。
- **Admin Commands**:
  - 修复 `[☠] KILL_ALL_AI`：现在点击后所有 AI 会立即死亡 (HP=0, Status=DEAD)，并直接触发胜负判定。

## [v1.0.0] - Initial Release & Optimizations

### Features
- **Control Panel Debug Tools**: Added debugging capabilities.
- **Corpse Persistence**: Dead players remain on map.
- **Grid Map Rendering**: Multi-unit support, AI ID display.
- **Core Loop**: Complete 8x8 BR logic.
