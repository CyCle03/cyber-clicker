# Antigravity

🌐 **Play Online**: https://cycle03.github.io/cyber-clicker/

An incremental clicker game with a space theme.

## 🎮 Game Overview

This is an incremental/idle clicker game. Your goal is to generate resources, purchase upgrades, and progress through the game.

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