# Cyber Clicker
[![CI Status](https://github.com/CyCle03/cyber-clicker/actions/workflows/ci.yml/badge.svg)](https://github.com/CyCle03/cyber-clicker/actions/workflows/ci.yml)

🌐 **Play Online**: https://pc.elcherlab.com/

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

---

# 안티그래비티 (Antigravity)

🌐 **온라인에서 플레이하기**: https://cycle03.github.io/cyber-clicker/

우주를 테마로 한 증분형 클리커 게임입니다.

## 🧩 기술 스택

- **런타임**: 브라우저 (정적 사이트)
- **언어**: 바닐라 자바스크립트 (ES 모듈)
- **진입점**: `index.html` → `js/main.js`
- **저장소**: 로컬 스토리지 (저장/내보내기/가져오기)
- **테스트**: 브라우저 기반 테스트 러너 (`tests.html`)

## 🎮 게임 개요

이 게임은 자원을 생성하고 업그레이드를 구매하며 진행하는 증분/아이들 클리커 게임입니다.

## 🕹️ 게임플레이

### 핵심 루프
- **비트 생성**: 메인 버튼을 클릭하여 기본 화폐인 `비트`를 생성하세요.
- **업그레이드 구매**: 상점에서 `GPS`(Global Processing Speed) 업그레이드를 구매하여 자동으로 비트를 생성하세요.
- **재부팅(프레스티지)**: 충분한 비트를 모으면 시스템을 재부팅하여 `루트 액세스` 레벨을 올릴 수 있습니다. 이는 프레스티지 시스템으로, 비트와 업그레이드는 초기화되지만 영구적인 보너스와 `스킬 포인트`를 얻을 수 있습니다.

### 화폐
- **비트**: 기본 화폐로, 일반 업그레이드 구매에 사용됩니다.
- **암호화폐**: `글리치`를 해킹하거나 `업적`을 달성하여 얻는 프리미엄 화폐입니다. 블랙마켓에서 강력한 아이템을 구매하는 데 사용됩니다.
- **스킬 포인트**: 재부팅 시 보상으로 얻으며, 스킬 트리에서 영구적인 버프를 해금하는 데 사용됩니다.

### 이벤트 & 미니게임
- **글리치**: 화면에 무작위로 등장하는 클릭 가능한 개체입니다. 해킹하면 암호화폐를 얻을 수 있습니다.
- **방화벽**: 주기적으로 등장하는 미니게임으로, 코드를 해결할 때까지 일시적으로 GPS가 감소합니다. 해결하면 많은 양의 비트를 보상으로 받습니다.
- **데이터 유출**: 시간 내에 모든 데이터 노드를 찾아야 하는 타일 매칭 미니게임입니다.
- **대규모 글리치 이벤트**: 희귀하게 발생하는 이벤트로, 짧은 시간 동안 글리치가 가속화되어 나타납니다.

### 진행
- **상점**: GPS와 클릭력을 높여주는 업그레이드를 구매할 수 있는 주요 장소입니다.
- **블랙마켓**: 암호화폐를 사용해 강력한 임시 부스트, 즉시 비트 획득, 영구 업그레이드 등을 구매할 수 있는 특별한 상점입니다.
- **스킬 트리**: 스킬 포인트를 사용해 해금할 수 있는 강력한 영구 버프들입니다.
- **튜토리얼**: 신규 유저에게 게임의 기초를 안내하는 통합 가이드 시스템입니다.
- **설정**: 오디오 제어 (마스터 볼륨, 음소거) 및 데이터 관리 옵션을 제공합니다.

## 🚀 시작하기

### 설치

1. 저장소를 클론합니다.
2. 로컬 웹 서버를 사용하여 프로젝트를 실행하세요 (권장):
```bash
# Python 사용 시
python -m http.server 8000

# Node.js (http-server) 사용 시
npx http-server

# PHP 사용 시
php -S localhost:8000
```

3. 브라우저에서 `http://localhost:8000`을 엽니다.

`index.html`을 직접 브라우저에서 열 수도 있지만, 일부 브라우저에서는 ES 모듈 로딩이나 `file://` 프로토콜에서의 LocalStorage 동작이 제한될 수 있습니다.

### 요구사항

- 자바스크립트가 활성화된 최신 웹 브라우저
- 추가 의존성 없음 (바닐라 자바스크립트)

## 프로젝트 구조

```
/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI 워크플로우
├── .gitignore
├── debug_check.mjs           # Node.js 기반 스모크 테스트
├── favicon.ico
├── index.html                # 메인 진입점
├── README.md
├── script.js                 # JSDoc 타입 정의
├── style.css
├── tests.html                # 테스트 러너
├── tests.js                  # 테스트 스위트
├── js/                       # 메인 게임 코드
│   ├── constants.js          # 게임 상수 및 설정
│   ├── formulas.js           # 게임 계산식
│   ├── game.js               # 코어 게임 루프 및 로직
│   ├── logger.js             # 로깅 유틸리티
│   ├── main.js               # 진입점 및 이벤트 핸들러
│   ├── sound.js              # 오디오 관리
│   ├── state.js              # 게임 상태 관리
│   ├── storage.js            # 저장/불러오기 기능
│   └── ui.js                 # UI 업데이트 및 상호작용
└── tests/                    # 테스트 파일
    └── state.test.js         # 상태 관리 테스트
```

## 🧪 테스트

프로젝트를 서빙한 후 브라우저에서 `tests.html`을 열어 테스트 스위트를 실행하세요.

- **권장 방법**
  - 로컬 서버 시작 (시작하기 참조)
  - `http://localhost:8000/tests.html` 열기

## 🛠 개발 유틸리티

### 디버그 체크

`debug_check.mjs`는 Node.js에서 실행되는 스모크 테스트로, 최소한의 브라우저 전역 객체를 모킹하고 `js/game.js`를 임포트합니다. 이는 깨진 임포트나 구문 오류를 조기에 발견하는 데 유용합니다.

실행 방법:
```bash
node debug_check.mjs
```

### GitHub Pages 배포

이 사이트는 GitHub Pages에 호스팅되어 있습니다. 배포 소스를 확인하거나 변경하려면:
1. GitHub 저장소 설정으로 이동
2. Pages 메뉴 선택
3. 어떤 브랜치/폴더가 소스로 사용되는지 확인

### 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 만드세요
3. 변경사항을 만드세요
4. 철저히 테스트하세요
5. Submit a pull request
