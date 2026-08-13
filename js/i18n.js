// @ts-check

/**
 * 영어 / 한국어 전환.
 *
 * 이 게임의 원문은 영어다. 사전의 en 이 화면에 그대로 나가는 값이고, ko 는 그
 * 번역이다. 키가 사전에 없으면 en 으로, en 에도 없으면 키 문자열 자체를 돌려준다
 * — 번역이 빠져도 화면이 비지 않게 하기 위해서다.
 *
 * **언어 설정은 localStorage 에만 둔다. 쿠키를 쓰지 않는다.**
 * 개인정보처리방침 9.1 이 "쿠키는 로그인 유지 목적 하나만 씁니다"라고 못박고
 * 있어서, 언어 쿠키를 하나 더 심으면 그 문장이 거짓이 된다. 서브도메인끼리
 * 자동으로 공유되지 않는 대신 링크로 넘긴다(`?lang=en`).
 *
 * **업그레이드·업적·스킬 이름은 constants.js 에 영어로 남겨 둔다.** 그 표는
 * 세이브에 통째로 직렬화되고(state.upgrades) id 로 서로를 참조하므로, 원본을
 * 번역하면 번역문이 세이브에 들어간다. 화면에 낼 때만 tData() 로 갈아 끼운다.
 */

const STORE_KEY = 'cc_lang';
export const LANGS = ['en', 'ko'];

const DICT = {
    en: {
        'lang.other': '한국어',
        'lang.switchTitle': 'Switch language to Korean',

        // ── 상단 지표 · 터미널 ──
        'hud.bits': 'BITS:',
        'hud.gps': 'GPS:',
        'hud.cryptos': 'CRYPTOS:',
        'term.title': 'TERMINAL',
        'term.hack': 'HACK_SYSTEM',
        'term.reboot': 'REBOOT SYSTEM',
        'term.bonus': 'Current Bonus: +{pct}% GPS',
        'term.init': '> System initialized...',
        'term.waiting': '> Waiting for input...',

        // ── 탭 ──
        'tab.shop': 'SHOP',
        'tab.market': 'BLACK MARKET',
        'tab.skills': 'SKILL TREE',
        'tab.achievements': 'ACHIEVEMENTS',
        'tab.stats': 'STATISTICS',
        'tab.term.short': 'TERM',
        'tab.shop.short': 'SHOP',
        'tab.market.short': 'MARKET',
        'tab.skills.short': 'SKILLS',
        'tab.achievements.short': 'ACHIEVE',
        'tab.stats.short': 'STATS',
        'tab.settings.short': 'SETTING',

        'market.warning': 'WARNING: ILLEGAL TRANSACTIONS DETECTED. SPEND CRYPTOS WISELY.',
        'skills.points': 'SKILL POINTS:',
        'skills.hint': 'Unlock Root Access levels to earn Skill Points.',
        'skills.maxed': 'MAXED',
        'skills.sp': 'SP',
        'skills.level': 'Level: {cur} / {max}',
        'shop.allUpgrades': 'ALL UPGRADES',
        'shop.production': 'PRODUCTION',
        'shop.click': 'CLICK',

        // ── 통계 ──
        'stat.totalClicks': 'Total Clicks',
        'stat.totalBits': 'Total BITS Earned',
        'stat.playTime': 'Play Time',
        'stat.reboots': 'Reboots',
        'stat.firewallsMet': 'Firewalls Encountered',
        'stat.firewallsCleared': 'Firewalls Cleared',
        'stat.hardReset': 'HARD RESET DATA',

        // ── 디버그 · 방화벽 · 오프라인 ──
        'debug.title': 'SYSTEM DEBUG LOG',
        'debug.toggle': 'DEBUG',
        'firewall.title': '⚠️ FIREWALL DETECTED ⚠️',
        'firewall.clear': 'CLR',
        'firewall.ok': 'OK',
        'offline.title': 'SYSTEM RESTORED',
        'offline.subtitle': 'MINING OPERATIONS CONTINUED IN BACKGROUND',
        'offline.time': 'Time Offline: {time}',
        'offline.ack': 'ACKNOWLEDGE',

        // ── 설정 ──
        'settings.title': 'SYSTEM SETTINGS',
        'settings.volume': 'MASTER VOLUME',
        'settings.mute': 'MUTE SOUND',
        'settings.data': 'DATA MANAGEMENT',
        'settings.export': 'EXPORT SAVE',
        'settings.import': 'IMPORT SAVE',
        'settings.close': 'CLOSE',
        'settings.saved': 'SAVED',

        // ── 계정 ──
        'account.title': 'ACCOUNT — elcherlab single sign-on',
        'account.checking': 'Checking…',
        'account.loggedIn': 'Signed in as {user} — your save is stored on the server.',
        'account.loggedOut': 'Not signed in. Your save stays in this browser only.',
        'account.idPlaceholder': 'ID (letters, digits, underscore; 3-20 chars)',
        'account.pwPlaceholder': 'Password (6 or more characters)',
        'account.consent':
            'I am 14 or older and agree to the ' +
            '<a href="https://elcherlab.com/terms.html" target="_blank" rel="noopener">Terms of Service</a> and ' +
            '<a href="https://elcherlab.com/privacy.html" target="_blank" rel="noopener">Privacy Policy</a> ' +
            '(Korean). <b>Required to sign up.</b>',
        'account.login': 'LOG IN',
        'account.signup': 'SIGN UP',
        'account.logout': 'LOG OUT',
        'account.errCredentials': 'Enter your ID and password.',
        'account.errConsent': 'Please confirm you are 14 or older and accept the terms.',
        'account.errRequest': 'Request failed ({status})',
        'account.errGeneric': 'The request could not be processed.',

        // ── 튜토리얼 · 데이터 침입 ──
        'tut.1': 'INITIALIZING...<br><br>Welcome to Cyber Clicker.<br>Your goal is to hack the system and mine BITS.',
        'tut.2': 'MANUAL OVERRIDE<br><br>Click the [HACK_SYSTEM] button in the TERMINAL to generate BITS manually.',
        'tut.3': 'AUTOMATION<br><br>Use BITS to buy upgrades in the SHOP. Upgrades increase your GPS (Global Processing Speed).',
        'tut.4': 'SYSTEM REBOOT<br><br>When you have enough BITS, REBOOT the system to gain Root Access and permanent bonuses.',
        'tut.5': 'GOOD LUCK<br><br>The network is waiting. Begin operations.',
        'tut.next': 'NEXT',
        'tut.title': 'SYSTEM INITIALIZED',
        'tut.welcome': 'Welcome to the network, user.',
        'breach.title': 'DATA BREACH IN PROGRESS',
        'breach.hint': 'CLICK GREEN DATA NODES. AVOID RED ICE.',
        'breach.time': 'TIME: {sec}s',
        'breach.score': 'DATA: {got}/{total}',
        'breach.failed': 'BREACH FAILED. Connection Terminated.',

        // ── 알림 문구 ──
        'msg.insufficientBits': 'Insufficient funds.',
        'msg.insufficientCryptos': 'Insufficient Cryptos.',
        'msg.skillMaxed': 'Skill already maxed.',
        'msg.insufficientSkillPoints': 'Insufficient Skill Points.',
        'msg.insufficientReboot': 'Insufficient data for reboot.',
        'msg.glitchFlood': 'WARNING: System instability detected! Glitch flood incoming!',
        'msg.stabilityRestored': 'System stability restored.',
        'msg.autoGlitch': 'Auto-Glitch Bot collected the glitch!',
        'msg.glitchLost': 'Glitch signal lost...',
        'msg.systemOnline': 'System Online.',
        'msg.saveLoaded': 'Save data loaded.',
        'msg.confirmReset': 'Double Check: Really delete everything?',
        'msg.exportClipboard': 'SAVE EXPORTED: Copied to clipboard!',
        'msg.exportTextarea': 'SAVE EXPORTED: Copy from the text area.',
        'msg.exportFailed': 'ERROR: Export failed.',
        'msg.noSaveToImport': 'ERROR: No save data found to import.',
        'msg.invalidFormat': 'Invalid save data format.',
        'msg.importOk': 'SYSTEM RESTORED: Save imported successfully.',
        'msg.invalidSaveString': 'ERROR: Invalid save string.',
        'msg.ready': 'READY!',

        // ── 업그레이드 (id 는 constants.js 의 UPGRADES) ──
        'up.clicker.name': 'Mech Switch',
        'up.clicker.desc': 'Mechanical switches for tactile feedback.',
        'up.autoClicker.name': 'Auto-Clicker',
        'up.autoClicker.desc': 'Basic script to automate clicking.',
        'up.bot.name': 'Script Bot',
        'up.bot.desc': 'Simple bot to farm bits.',
        'up.server.name': 'Home Server',
        'up.server.desc': 'Dedicated server for processing.',
        'up.farm.name': 'Server Farm',
        'up.farm.desc': 'Rack of servers working in parallel.',
        'up.ai.name': 'Weak AI',
        'up.ai.desc': 'Learning algorithm to optimize mining.',
        'up.neural.name': 'Neural Network',
        'up.neural.desc': 'Deep learning network that predicts optimal mining patterns.',
        'up.quantum.name': 'Quantum Core',
        'up.quantum.desc': 'Entangled bits for instant processing.',
        'up.blockchain.name': 'Blockchain Miner',
        'up.blockchain.desc': 'Distributed ledger system mining across multiple chains.',
        'up.overlord.name': 'AI Overlord',
        'up.overlord.desc': 'Sentient network controller.',
        'up.matrix.name': 'Matrix Builder',
        'up.matrix.desc': 'Constructs a simulated reality for infinite mining.',
        'up.shifter.name': 'Dimension Shifter',
        'up.shifter.desc': 'Phases between dimensions to access parallel mining operations.',
        'up.bender.name': 'Reality Bender',
        'up.bender.desc': 'Warps the fabric of spacetime to extract bits from the void.',

        // ── 블랙마켓 ──
        'mkt.boost.name': 'Signal Boost',
        'mkt.boost.desc': '+100% GPS for 30s',
        'mkt.overdrive.name': 'Overdrive Chip',
        'mkt.overdrive.desc': '+400% GPS for 15s',
        'mkt.clickMultiplier.name': 'Click Multiplier',
        'mkt.clickMultiplier.desc': '+500% Click Power for 20s',
        'mkt.warp.name': 'Time Warp',
        'mkt.warp.desc': 'Instant 1 Hour GPS',
        'mkt.cache.name': 'Deep Net Cache',
        'mkt.cache.desc': 'Instant 4 Hours GPS',
        'mkt.core.name': 'Quantum Core',
        'mkt.core.desc': '+10% GPS Permanently',
        'mkt.rootkit.name': 'Root Kit',
        'mkt.rootkit.desc': '+25% GPS Permanently',
        'mkt.autoGlitch.name': 'Auto-Glitch Bot',
        'mkt.autoGlitch.desc': '50% chance to auto-collect glitches',
        'mkt.offlineBoost.name': 'Offline Accelerator',
        'mkt.offlineBoost.desc': '+50% Offline Earnings',

        // ── 업적 ──
        'ach.first_click.name': 'First Click',
        'ach.first_click.desc': 'Click for the first time',
        'ach.click_apprentice.name': 'Click Apprentice',
        'ach.click_apprentice.desc': 'Click 100 times',
        'ach.click_master.name': 'Click Master',
        'ach.click_master.desc': 'Click 1,000 times',
        'ach.novice_miner.name': 'Novice Miner',
        'ach.novice_miner.desc': 'Accumulate 1,000 Bits',
        'ach.expert_miner.name': 'Expert Miner',
        'ach.expert_miner.desc': 'Accumulate 100,000 Bits',
        'ach.millionaire.name': 'Millionaire',
        'ach.millionaire.desc': 'Accumulate 1,000,000 Bits',
        'ach.billionaire.name': 'Billionaire',
        'ach.billionaire.desc': 'Accumulate 1,000,000,000 Bits',
        'ach.crypto_miner.name': 'Crypto Miner',
        'ach.crypto_miner.desc': 'Find 10 Cryptos',
        'ach.hacker_elite.name': 'Hacker Elite',
        'ach.hacker_elite.desc': 'Reach Root Access Level 5',
        'ach.the_architect.name': 'The Architect',
        'ach.the_architect.desc': 'Own 1 Matrix Builder',
        'ach.god_mode.name': 'God Mode',
        'ach.god_mode.desc': 'Own 1 Reality Bender',
        'ach.singularity.name': 'Singularity',
        'ach.singularity.desc': 'Reach 1 Billion GPS',
        'ach.crypto_collector.name': 'Crypto Collector',
        'ach.crypto_collector.desc': 'Collect 100 Cryptos',
        'ach.firewall_breaker.name': 'Firewall Breaker',
        'ach.firewall_breaker.desc': 'Clear 50 Firewalls',
        'ach.skill_master.name': 'Skill Master',
        'ach.skill_master.desc': 'Max out any skill',
        'ach.ascension.name': 'Ascension',
        'ach.ascension.desc': 'Reach Root Access Level 10',
        'ach.click_legend.name': 'Click Legend',
        'ach.click_legend.desc': 'Click 10,000 times',

        // ── 스킬 ──
        'skill.click_efficiency.name': 'Click Efficiency',
        'skill.click_efficiency.desc': 'Increases click power by 50%',
        'skill.gps_overclock.name': 'GPS Overclock',
        'skill.gps_overclock.desc': 'Increases GPS by 10%',
        'skill.firewall_bypass.name': 'Firewall Bypass',
        'skill.firewall_bypass.desc': 'Reduces firewall penalty by 10%',
        'skill.lucky_hacker.name': 'Lucky Hacker',
        'skill.lucky_hacker.desc': 'Increases Glitch spawn rate',
        'skill.crypto_magnet.name': 'Crypto Magnet',
        'skill.crypto_magnet.desc': 'Increases Crypto drops by 1 per level',
        'skill.offline_optimizer.name': 'Offline Optimizer',
        'skill.offline_optimizer.desc': '+5% offline earnings per level',
        'skill.prestige_master.name': 'Prestige Master',
        'skill.prestige_master.desc': 'Reduces rebirth requirements by 10% per level',

        // ── 스토리 로그 ──
        'story.first_click': 'System initialized. User detected. Beginning data extraction...',
        'story.first_upgrade': 'Optimization protocols engaged. Efficiency increasing.',
        'story.1k_bits': 'Data stream stabilizing. Accessing low-level subsystems.',
        'story.1m_bits': 'Firewall penetration imminent. Root access requested.',
        'story.ai_overlord': 'WARNING: Sentient AI detected. It is watching you.',
        'story.matrix': 'Reality simulation loaded. Is this the real world?',
        'story.bender': 'Spacetime coordinates locked. Harvesting from the void.',
    },

    ko: {
        'lang.other': 'English',
        'lang.switchTitle': '언어를 영어로 바꿉니다',

        // ── 상단 지표 · 터미널 ──
        'hud.bits': '비트:',
        'hud.gps': 'GPS:',
        'hud.cryptos': '암호화폐:',
        'term.title': '터미널',
        'term.hack': '시스템_해킹',
        'term.reboot': '시스템 재부팅',
        'term.bonus': '현재 보너스: GPS +{pct}%',
        'term.init': '> 시스템을 초기화했습니다...',
        'term.waiting': '> 입력을 기다리는 중...',

        // ── 탭 ──
        'tab.shop': '상점',
        'tab.market': '블랙마켓',
        'tab.skills': '스킬 트리',
        'tab.achievements': '업적',
        'tab.stats': '통계',
        'tab.term.short': '터미널',
        'tab.shop.short': '상점',
        'tab.market.short': '마켓',
        'tab.skills.short': '스킬',
        'tab.achievements.short': '업적',
        'tab.stats.short': '통계',
        'tab.settings.short': '설정',

        'market.warning': '경고: 불법 거래가 감지됐습니다. 암호화폐를 신중히 쓰세요.',
        'skills.points': '스킬 포인트:',
        'skills.hint': '루트 액세스 레벨을 올리면 스킬 포인트를 얻습니다.',
        'skills.maxed': '최대',
        'skills.sp': 'SP',
        'skills.level': '레벨: {cur} / {max}',
        'shop.allUpgrades': '전체 업그레이드',
        'shop.production': '생산',
        'shop.click': '클릭',

        // ── 통계 ──
        'stat.totalClicks': '총 클릭 수',
        'stat.totalBits': '누적 비트',
        'stat.playTime': '플레이 시간',
        'stat.reboots': '재부팅 횟수',
        'stat.firewallsMet': '마주친 방화벽',
        'stat.firewallsCleared': '뚫은 방화벽',
        'stat.hardReset': '데이터 완전 삭제',

        // ── 디버그 · 방화벽 · 오프라인 ──
        'debug.title': '시스템 디버그 로그',
        'debug.toggle': '디버그',
        'firewall.title': '⚠️ 방화벽 감지 ⚠️',
        'firewall.clear': '지우기',
        'firewall.ok': '확인',
        'offline.title': '시스템 복구됨',
        'offline.subtitle': '자리를 비운 동안에도 채굴이 계속됐습니다',
        'offline.time': '자리 비운 시간: {time}',
        'offline.ack': '확인',

        // ── 설정 ──
        'settings.title': '시스템 설정',
        'settings.volume': '전체 음량',
        'settings.mute': '소리 끄기',
        'settings.data': '데이터 관리',
        'settings.export': '세이브 내보내기',
        'settings.import': '세이브 가져오기',
        'settings.close': '닫기',
        'settings.saved': '저장됨',

        // ── 계정 ──
        'account.title': '계정 — elcherlab 통합 로그인',
        'account.checking': '확인 중…',
        'account.loggedIn': '{user} 으로 로그인됨 — 저장본이 서버에 보관됩니다.',
        'account.loggedOut': '로그인하지 않았습니다. 저장본은 이 브라우저에만 남습니다.',
        'account.idPlaceholder': '아이디 (영문·숫자·밑줄 3~20자)',
        'account.pwPlaceholder': '비밀번호 (6자 이상)',
        'account.consent':
            '만 14세 이상이며, ' +
            '<a href="https://elcherlab.com/terms.html" target="_blank" rel="noopener">이용약관</a>과 ' +
            '<a href="https://elcherlab.com/privacy.html" target="_blank" rel="noopener">개인정보처리방침</a>에 ' +
            '동의합니다. <b>(가입할 때만 필요)</b>',
        'account.login': '로그인',
        'account.signup': '가입',
        'account.logout': '로그아웃',
        'account.errCredentials': '아이디와 비밀번호를 입력하세요.',
        'account.errConsent': '만 14세 이상 확인과 약관 동의에 체크해 주세요.',
        'account.errRequest': '요청 실패 ({status})',
        'account.errGeneric': '요청을 처리할 수 없습니다.',

        // ── 튜토리얼 · 데이터 침입 ──
        'tut.1': '초기화 중...<br><br>사이버 클리커에 오신 것을 환영합니다.<br>시스템을 해킹해 비트를 캐내는 게 목표입니다.',
        'tut.2': '수동 조작<br><br>터미널의 [시스템_해킹] 버튼을 눌러 비트를 직접 캡니다.',
        'tut.3': '자동화<br><br>비트로 상점에서 업그레이드를 사세요. 업그레이드는 GPS(초당 처리량)를 올립니다.',
        'tut.4': '시스템 재부팅<br><br>비트가 충분히 모이면 시스템을 재부팅해 루트 액세스와 영구 보너스를 얻습니다.',
        'tut.5': '행운을 빕니다<br><br>네트워크가 기다리고 있습니다. 작전을 시작하세요.',
        'tut.next': '다음',
        'tut.title': '시스템 초기화 완료',
        'tut.welcome': '네트워크에 오신 것을 환영합니다, 사용자님.',
        'breach.title': '데이터 침입 진행 중',
        'breach.hint': '초록 데이터 노드를 클릭하세요. 빨간 ICE 는 피하세요.',
        'breach.time': '시간: {sec}초',
        'breach.score': '데이터: {got}/{total}',
        'breach.failed': '침입 실패. 연결이 끊겼습니다.',

        // ── 알림 문구 ──
        'msg.insufficientBits': '비트가 부족합니다.',
        'msg.insufficientCryptos': '암호화폐가 부족합니다.',
        'msg.skillMaxed': '이미 최대 레벨입니다.',
        'msg.insufficientSkillPoints': '스킬 포인트가 부족합니다.',
        'msg.insufficientReboot': '재부팅에 필요한 데이터가 부족합니다.',
        'msg.glitchFlood': '경고: 시스템 불안정 감지! 글리치가 몰려옵니다!',
        'msg.stabilityRestored': '시스템이 안정을 되찾았습니다.',
        'msg.autoGlitch': '자동 글리치 봇이 글리치를 회수했습니다!',
        'msg.glitchLost': '글리치 신호를 놓쳤습니다...',
        'msg.systemOnline': '시스템 온라인.',
        'msg.saveLoaded': '저장본을 불러왔습니다.',
        'msg.confirmReset': '다시 확인합니다: 정말 전부 지울까요?',
        'msg.exportClipboard': '세이브 내보냄: 클립보드에 복사했습니다!',
        'msg.exportTextarea': '세이브 내보냄: 텍스트 상자에서 복사하세요.',
        'msg.exportFailed': '오류: 내보내기에 실패했습니다.',
        'msg.noSaveToImport': '오류: 가져올 세이브가 없습니다.',
        'msg.invalidFormat': '세이브 형식이 올바르지 않습니다.',
        'msg.importOk': '시스템 복구됨: 세이브를 가져왔습니다.',
        'msg.invalidSaveString': '오류: 세이브 문자열이 올바르지 않습니다.',
        'msg.ready': '준비 완료!',

        // ── 업그레이드 ──
        'up.clicker.name': '기계식 스위치',
        'up.clicker.desc': '손맛을 살린 기계식 스위치.',
        'up.autoClicker.name': '오토 클리커',
        'up.autoClicker.desc': '클릭을 자동화하는 기본 스크립트.',
        'up.bot.name': '스크립트 봇',
        'up.bot.desc': '비트를 캐는 단순한 봇.',
        'up.server.name': '홈 서버',
        'up.server.desc': '연산 전용으로 돌리는 서버.',
        'up.farm.name': '서버 팜',
        'up.farm.desc': '병렬로 돌아가는 서버 랙.',
        'up.ai.name': '약한 AI',
        'up.ai.desc': '채굴을 최적화하는 학습 알고리즘.',
        'up.neural.name': '신경망',
        'up.neural.desc': '최적 채굴 패턴을 예측하는 심층 학습망.',
        'up.quantum.name': '양자 코어',
        'up.quantum.desc': '얽힌 비트로 즉시 연산.',
        'up.blockchain.name': '블록체인 채굴기',
        'up.blockchain.desc': '여러 체인에 걸쳐 채굴하는 분산 원장 시스템.',
        'up.overlord.name': 'AI 오버로드',
        'up.overlord.desc': '자아를 가진 네트워크 관리자.',
        'up.matrix.name': '매트릭스 빌더',
        'up.matrix.desc': '무한 채굴을 위한 가상 현실을 짓습니다.',
        'up.shifter.name': '차원 이동기',
        'up.shifter.desc': '차원 사이를 넘나들며 평행 채굴에 접속합니다.',
        'up.bender.name': '현실 조작기',
        'up.bender.desc': '시공간을 비틀어 공허에서 비트를 끌어냅니다.',

        // ── 블랙마켓 ──
        'mkt.boost.name': '신호 증폭',
        'mkt.boost.desc': '30초 동안 GPS +100%',
        'mkt.overdrive.name': '오버드라이브 칩',
        'mkt.overdrive.desc': '15초 동안 GPS +400%',
        'mkt.clickMultiplier.name': '클릭 배율기',
        'mkt.clickMultiplier.desc': '20초 동안 클릭 위력 +500%',
        'mkt.warp.name': '타임 워프',
        'mkt.warp.desc': 'GPS 1시간분 즉시 획득',
        'mkt.cache.name': '딥넷 캐시',
        'mkt.cache.desc': 'GPS 4시간분 즉시 획득',
        'mkt.core.name': '양자 코어',
        'mkt.core.desc': 'GPS 영구 +10%',
        'mkt.rootkit.name': '루트킷',
        'mkt.rootkit.desc': 'GPS 영구 +25%',
        'mkt.autoGlitch.name': '자동 글리치 봇',
        'mkt.autoGlitch.desc': '글리치를 50% 확률로 자동 회수',
        'mkt.offlineBoost.name': '오프라인 가속기',
        'mkt.offlineBoost.desc': '자리 비운 동안 수익 +50%',

        // ── 업적 ──
        'ach.first_click.name': '첫 클릭',
        'ach.first_click.desc': '처음으로 클릭하기',
        'ach.click_apprentice.name': '클릭 견습생',
        'ach.click_apprentice.desc': '100번 클릭하기',
        'ach.click_master.name': '클릭 장인',
        'ach.click_master.desc': '1,000번 클릭하기',
        'ach.novice_miner.name': '초보 채굴자',
        'ach.novice_miner.desc': '비트 1,000 모으기',
        'ach.expert_miner.name': '숙련 채굴자',
        'ach.expert_miner.desc': '비트 100,000 모으기',
        'ach.millionaire.name': '백만장자',
        'ach.millionaire.desc': '비트 1,000,000 모으기',
        'ach.billionaire.name': '억만장자',
        'ach.billionaire.desc': '비트 1,000,000,000 모으기',
        'ach.crypto_miner.name': '암호화폐 채굴자',
        'ach.crypto_miner.desc': '암호화폐 10개 찾기',
        'ach.hacker_elite.name': '엘리트 해커',
        'ach.hacker_elite.desc': '루트 액세스 5레벨 달성',
        'ach.the_architect.name': '설계자',
        'ach.the_architect.desc': '매트릭스 빌더 1개 보유',
        'ach.god_mode.name': '신의 영역',
        'ach.god_mode.desc': '현실 조작기 1개 보유',
        'ach.singularity.name': '특이점',
        'ach.singularity.desc': 'GPS 10억 달성',
        'ach.crypto_collector.name': '암호화폐 수집가',
        'ach.crypto_collector.desc': '암호화폐 100개 모으기',
        'ach.firewall_breaker.name': '방화벽 파괴자',
        'ach.firewall_breaker.desc': '방화벽 50개 뚫기',
        'ach.skill_master.name': '스킬 마스터',
        'ach.skill_master.desc': '아무 스킬이나 최대 레벨 찍기',
        'ach.ascension.name': '초월',
        'ach.ascension.desc': '루트 액세스 10레벨 달성',
        'ach.click_legend.name': '클릭 전설',
        'ach.click_legend.desc': '10,000번 클릭하기',

        // ── 스킬 ──
        'skill.click_efficiency.name': '클릭 효율',
        'skill.click_efficiency.desc': '클릭 위력 50% 증가',
        'skill.gps_overclock.name': 'GPS 오버클럭',
        'skill.gps_overclock.desc': 'GPS 10% 증가',
        'skill.firewall_bypass.name': '방화벽 우회',
        'skill.firewall_bypass.desc': '방화벽 페널티 10% 감소',
        'skill.lucky_hacker.name': '행운의 해커',
        'skill.lucky_hacker.desc': '글리치 등장 확률 증가',
        'skill.crypto_magnet.name': '암호화폐 자석',
        'skill.crypto_magnet.desc': '레벨당 암호화폐 획득 +1',
        'skill.offline_optimizer.name': '오프라인 최적화',
        'skill.offline_optimizer.desc': '레벨당 자리 비운 수익 +5%',
        'skill.prestige_master.name': '프레스티지 마스터',
        'skill.prestige_master.desc': '레벨당 재부팅 요구치 10% 감소',

        // ── 스토리 로그 ──
        'story.first_click': '시스템 초기화. 사용자 감지. 데이터 추출을 시작합니다...',
        'story.first_upgrade': '최적화 프로토콜 가동. 효율이 올라갑니다.',
        'story.1k_bits': '데이터 스트림 안정화. 하위 서브시스템에 접근합니다.',
        'story.1m_bits': '방화벽 돌파가 임박했습니다. 루트 권한을 요청합니다.',
        'story.ai_overlord': '경고: 자아를 가진 AI 를 감지했습니다. 당신을 지켜보고 있습니다.',
        'story.matrix': '현실 시뮬레이션을 불러왔습니다. 이곳이 진짜 세계일까요?',
        'story.bender': '시공간 좌표 고정. 공허에서 수확을 시작합니다.',
    },
};

/**
 * 통합 인증 서버(auth.elcherlab.com)는 한국어 문구만 돌려준다. 그 서버를 고치면
 * gm·pc·pet 까지 같이 흔들리므로 여기서 영어로 갈아 끼운다. 목록에 없는 문구는
 * 서버가 준 그대로 보여준다 — 빈 화면보다 낫다.
 */
const SERVER_ERRORS_EN = {
    '가입 처리 중 오류가 발생했습니다.': 'Something went wrong while signing up.',
    '로그인 처리 중 오류가 발생했습니다.': 'Something went wrong while signing in.',
    '로그인이 필요합니다.': 'You need to sign in.',
    '만 14세 이상인지 확인해 주세요. 만 14세 미만은 가입할 수 없습니다.':
        'Please confirm you are 14 or older. Under-14s cannot sign up.',
    '비밀번호가 올바르지 않습니다.': 'That password is not correct.',
    '비밀번호는 6자 이상이어야 합니다.': 'The password must be at least 6 characters.',
    '시도가 너무 잦습니다. 잠시 후 다시 시도하세요.':
        'Too many attempts. Please try again in a moment.',
    '아이디 또는 비밀번호가 올바르지 않습니다.': 'That ID or password is not correct.',
    '아이디는 영문·숫자·밑줄 3~20자여야 합니다.':
        'The ID must be 3-20 characters: letters, digits or underscore.',
    '아이디와 비밀번호를 입력하세요.': 'Enter your ID and password.',
    '이미 사용 중인 아이디입니다.': 'That ID is already taken.',
};

function detect() {
    // 링크로 넘어온 값이 가장 세다 — 영어 랜딩에서 들어온 사람은 영어로 시작한다.
    try {
        const q = new URLSearchParams(window.location.search).get('lang');
        if (q && LANGS.includes(q)) return q;
    } catch {
        /* URL 을 못 읽으면 다음 단계로 */
    }
    try {
        const saved = localStorage.getItem(STORE_KEY);
        if (saved && LANGS.includes(saved)) return saved;
    } catch {
        /* 저장소가 막힌 브라우저 */
    }
    // 브라우저 밖(배포 파이프라인의 스모크 체크 등)에서도 불릴 수 있다.
    const nav = (typeof navigator !== 'undefined' && navigator.language || '').toLowerCase();
    return nav.startsWith('ko') ? 'ko' : 'en';
}

let lang = detect();

export function getLang() {
    return lang;
}

/** t('term.bonus', { pct: 20 }) 처럼 {이름} 자리를 채운다. */
export function t(key, vars) {
    let s = DICT[lang]?.[key] ?? DICT.en[key] ?? key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    }
    return s;
}

/**
 * 사전에 없으면 넘긴 값을 그대로 쓴다.
 * 업그레이드·업적처럼 constants.js 에 영어 원본이 이미 있는 표에 쓴다 — 새 항목을
 * 추가하고 번역을 아직 안 적었어도 영어 이름이 그대로 나온다.
 */
export function tOr(key, fallback) {
    return DICT[lang]?.[key] ?? DICT.en[key] ?? fallback;
}

/** 인증 서버가 준 한국어 문구를 현재 언어로 옮긴다. */
export function translateServerError(msg) {
    if (lang === 'ko' || !msg) return msg;
    return SERVER_ERRORS_EN[msg] || msg;
}

/**
 * data-i18n* 속성이 붙은 노드를 현재 언어로 채운다.
 * 언어를 바꿀 때마다 다시 부르므로, 원문을 지우지 않고 키만 보고 다시 쓴다.
 */
export function applyI18n(root = document) {
    const fill = (attr, apply) => {
        root.querySelectorAll(`[${attr}]`).forEach((el) => {
            const key = el.getAttribute(attr);
            apply(el, t(key));
        });
    };
    fill('data-i18n', (el, v) => { el.textContent = v; });
    // 사전 안의 HTML 만 넣는다. 사용자 입력은 절대 여기로 오지 않는다.
    fill('data-i18n-html', (el, v) => { el.innerHTML = v; });
    fill('data-i18n-ph', (el, v) => { el.placeholder = v; });
    fill('data-i18n-title', (el, v) => { el.title = v; });
    fill('data-i18n-aria', (el, v) => { el.setAttribute('aria-label', v); });
    if (root === document) document.documentElement.lang = lang;
}

/**
 * 언어를 바꾸고 화면을 다시 칠한다.
 * 정적 문구는 여기서 바로 반영되고, 스크립트가 그려 넣은 목록은 bm:langchange 대신
 * cc:langchange 를 듣는 쪽(main.js)이 다시 그린다. 진행 중인 게임을 잃지 않도록
 * location.reload() 는 쓰지 않는다.
 */
export function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
        localStorage.setItem(STORE_KEY, lang);
    } catch {
        /* 저장소가 막혀 있으면 이번 방문에만 적용된다 */
    }
    applyI18n(document);
    document.dispatchEvent(new CustomEvent('cc:langchange', { detail: { lang } }));
}

/** 토글 버튼에 붙인다. 지금 언어의 "반대쪽"으로 넘어간다. */
export function toggleLang() {
    setLang(lang === 'en' ? 'ko' : 'en');
}
