[한국어](README.md) | **English**

# Cyber Clicker

[![CI Status](https://github.com/CyCle03/cyber-clicker/actions/workflows/ci.yml/badge.svg)](https://github.com/CyCle03/cyber-clicker/actions/workflows/ci.yml)

🌐 **Play Online**: https://cc.elcherlab.com/

An incremental clicker game with a space theme.

## 🧩 Tech Stack

- **Runtime**: Browser (static site)
- **Language**: Vanilla JavaScript (ES Modules)
- **Entry**: `index.html` → `js/main.js`
- **Storage**: LocalStorage (save/export/import)
- **Tests**: Browser-based runner (`tests.html`)

## 🎮 Game Overview

This is an incremental/idle clicker game. Your goal is to generate resources, purchase upgrades, and progress through the game.

## 🕹️ Gameplay

### Core Loop
- **Generate Bits**: Click the main button to generate `Bits`, the primary currency.
- **Buy Upgrades**: Purchase upgrades from the Shop to increase your `GPS` (Global Processing Speed), which automatically generates Bits for you.
- **Reboot (Prestige)**: When you've earned enough Bits, `Reboot` the system to gain `Root Access` levels. This is the prestige system, which resets your Bits and upgrades but provides permanent bonuses and `Skill Points`.

### Currencies
- **Bits**: The primary currency used to purchase standard upgrades.
- **Cryptos**: A premium currency earned from hacking `Glitches` and unlocking `Achievements`. Used to buy powerful items in the Black Market.
- **Skill Points**: Earned from Rebooting. Used to unlock permanent buffs in the Skill Tree.

### Events & Minigames
- **Glitches**: Clickable entities that appear randomly on screen. Hacking them awards Cryptos.
- **Firewall**: A minigame that appears periodically, temporarily reducing your GPS until you solve the code. Solving it provides a large Bit reward.
- **Data Breach**: A tile-matching minigame where you must find all the data nodes before time runs out.
- **Mass Glitch Event**: A rare, chaotic event where glitches begin to spawn at an accelerated and compounding rate for a short period.

### Progression
- **Shop**: The primary source for purchasing upgrades that increase your GPS and manual clicking power.
- **Black Market**: A special shop where you can spend Cryptos on powerful temporary boosts, instant Bit infusions, and permanent upgrades.
- **Skill Tree**: A tree of powerful, permanent buffs that can be unlocked using Skill Points.
- **Tutorial**: An integrated guide that walks new users through the basics of the game.
- **Settings**: Audio controls (Master Volume, Mute) and Data Management options.

## 🚀 Getting Started

### Installation

1. Clone the repository.
2. Serve the project using a local web server (recommended):
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

You can also open `index.html` directly in a browser, but some browsers restrict ES module loading or LocalStorage behavior on `file://`.

### Requirements

- Modern web browser with JavaScript enabled
- No additional dependencies required (vanilla JavaScript)

##  Project Structure

```
/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow
├── .gitignore
├── debug_check.mjs           # Node-based smoke test
├── favicon.ico
├── index.html                # Main entry point
├── README.md
├── script.js                 # JSDoc type definitions
├── style.css
├── tests.html                # Test runner
├── tests.js                  # Test suite
├── js/                       # Main game code
│   ├── constants.js          # Game constants and configurations
│   ├── formulas.js           # Game calculations and formulas
│   ├── game.js               # Core game loop and logic
│   ├── logger.js             # Logging utilities
│   ├── main.js               # Entry point and event handlers
│   ├── sound.js              # Audio management
│   ├── state.js              # Game state management
│   ├── storage.js            # Save/load functionality
│   └── ui.js                 # UI updates and interactions
└── tests/                    # Test files
    └── state.test.js         # State management tests
```

## 🧪 Testing

Run the test suite by serving the project and opening `tests.html` in a browser.

- **Recommended**
  - Start a local server (see Getting Started)
  - Open `http://localhost:8000/tests.html`

## ✅ Release Checklist

### Save Compatibility

- [ ] Existing save loads without errors
- [ ] Root Access level, Skill Points, Skills, and Upgrades are preserved
- [ ] Achievements and Story Events are preserved
- [ ] Save migration (if any) does not reset progress unexpectedly

### GitHub Pages Smoke Test

- [ ] Fresh load works (no console errors)
- [ ] Shop
  - [ ] Scroll list renders correctly
  - [ ] Unaffordable items look disabled (no hover glow, no pointer cursor)
  - [ ] Affordable items are clickable and purchase correctly
- [ ] Reboot UI shows Remaining BITS and READY/Next state correctly

### Tests

- [ ] `tests.html` reports all tests PASS (currently 15/15)

## 💾 Save System

- Automatic save every 15 seconds
- Manual save/export available in Settings
- Save data stored in browser's LocalStorage
- Export/Import functionality for backup

## 🔧 Development

### Code Style
- Uses JSDoc for type annotations
- ES6 modules
- TypeScript-style type checking with `// @ts-check`

### Notes
- This repository is a static site (no `package.json` / build step).
- GitHub Pages deployment is done by pushing to the branch configured in GitHub repo settings.

### Dev Utilities

- `script.js`
  - JSDoc type definitions used by `// @ts-check` (e.g. `Achievement`, `StoryEvent`).
  - Not required at runtime; used for editor/type checking.
- `debug_check.mjs`
  - Node-based smoke check that mocks minimal browser globals and imports `js/game.js`.
  - Useful for catching broken imports or syntax errors early.
  - Run:
    ```bash
    node debug_check.mjs
    ```

### GitHub Pages Deployment

- The live site is hosted on GitHub Pages.
- To confirm or change the deployment source:
  - Go to GitHub repository Settings
  - Pages
  - Check which Branch/Folder is used as the source

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
