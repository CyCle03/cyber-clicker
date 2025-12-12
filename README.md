# Antigravity

🌐 **Play Online**: https://cycle03.github.io/cyber-clicker/

An incremental clicker game with a space theme.

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

## 🚀 Getting Started

### Installation

1. Clone the repository.
2. Open `index.html` in a web browser, or serve it using a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser

### Requirements

- Modern web browser with JavaScript enabled
- No additional dependencies required (vanilla JavaScript)

## 📁 Project Structure

```
/
├── .gitignore
├── debug_check.mjs
├── favicon.ico
├── index.html
├── README.md
├── style.css
├── tests.html
├── tests.js
├── backup/
│   └── js/
├── js/
│   ├── constants.js
│   ├── formulas.js
│   ├── game.js
│   ├── main.js
│   ├── sound.js
│   ├── state.js
│   ├── storage.js
│   └── ui.js
└── tests/
    └── state.test.js
```

## 🧪 Testing

Run the test suite by opening `tests.html` in a browser.

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

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request