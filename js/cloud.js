// @ts-check

/**
 * elcherlab 통합 로그인 + 서버 저장.
 *
 * 로그인하지 않으면 이 파일은 아무 일도 하지 않는다 — 게임은 지금까지처럼
 * localStorage 만 쓴다. 로그인하면 같은 저장본을 서버(cc.saves)에도 올려
 * 다른 기기에서 이어서 할 수 있게 한다.
 *
 * 저장 API 는 같은 출처(cc.elcherlab.com/api/*)라 쿠키가 자동으로 실린다.
 * 가입·로그인만 통합 인증(auth.elcherlab.com)으로 나가므로 credentials 가 필요하다.
 *
 * GitHub Pages 처럼 백엔드가 없는 곳에서 열면 /api/me 가 실패하고, 그때는
 * 조용히 "로그아웃 상태"로 판단해 localStorage 만 쓴다. 배포처를 가리지 않는다.
 */

import { debugLog, errorLog } from './logger.js';
import { t, translateServerError, getLang } from './i18n.js';

const AUTH_ORIGIN = 'https://auth.elcherlab.com';
const SAVE_KEY = 'cyberClickerSave';
/** 마지막으로 이 브라우저에서 로그인했던 계정. 계정이 바뀌면 로컬 저장본을 섞지 않는다. */
const ACCOUNT_KEY = 'cc_account';
/** 저장은 자주 일어난다(15초 자동저장 + 수동). 서버에는 몰아서 올린다. */
const PUSH_DELAY_MS = 4000;

/** @type {{loggedIn: boolean, username: string|null}} */
export const session = { loggedIn: false, username: null };

let pushTimer = null;
let pendingData = null;

async function api(path, options) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(translateServerError(data.error) || t('account.errRequest', { status: res.status }));
  return data;
}

async function authApi(path, body) {
  // 언어는 쿼리로 넘긴다 — auth 가 오류 문구를 그 언어로 내려준다. 헤더로 넘기면
  // 다른 오리진이라 프리플라이트가 뜨는데 auth 는 Content-Type 만 허용해서 막힌다
  // (gm 이 X-Lang 을 붙였다가 로그인이 통째로 죽은 적이 있다).
  const url = AUTH_ORIGIN + path + (path.includes('?') ? '&' : '?') + 'lang=' + getLang();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  // auth 가 위 lang 을 보고 맞춰 보낸다. 아래 번역은 옛 auth·캐시된 옛 번들 대비 그물이다.
  if (!res.ok) throw new Error(translateServerError(data.error) || t('account.errGeneric'));
  return data;
}

// ---------- 상태 ----------

function readLocal() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

/**
 * 부팅 전에 한 번 부른다. 로그인 상태면 서버 저장본을 localStorage 로 맞춰 둔다.
 * 게임 코드는 지금까지처럼 localStorage 만 읽으면 되므로 나머지가 바뀌지 않는다.
 */
export async function syncBeforeBoot() {
  // 확인이 끝날 때까지 보이는 문구. 마크업에는 영어가 박혀 있고 data-i18n 을 붙일 수
  // 없어서(전환 때 로그인 상태 문장이 "Checking…" 으로 되돌아간다) 여기서 한 번 옮긴다.
  const checking = $('cc-account-status');
  if (checking) checking.textContent = t('account.checking');
  try {
    const me = await api('/api/me');
    session.loggedIn = !!me.loggedIn;
    session.username = me.username || null;
  } catch {
    // 백엔드가 없는 배포처(GitHub Pages 등) — 로컬 저장만 쓴다.
    session.loggedIn = false;
    session.username = null;
    return;
  }
  if (!session.loggedIn) return;

  // 다른 계정으로 갈아탄 경우, 앞 계정의 저장본을 이 계정에 올리면 안 된다.
  const lastAccount = localStorage.getItem(ACCOUNT_KEY);
  if (lastAccount && lastAccount !== session.username) {
    localStorage.removeItem(SAVE_KEY);
    debugLog('[cloud] 계정이 바뀌어 이 브라우저의 저장본을 비웠습니다.');
  }
  localStorage.setItem(ACCOUNT_KEY, session.username || '');

  let server = null;
  try {
    server = (await api('/api/save')).data;
  } catch (e) {
    errorLog('[cloud] 서버 저장본을 읽지 못했습니다', e);
    return; // 로컬로 계속 진행한다 — 게임이 멈추는 것보다 낫다
  }

  const local = readLocal();

  if (!server && local) {
    // 서버가 비어 있는 첫 로그인 — 이 브라우저의 진행 상황을 서버로 옮긴다.
    await pushNow(local);
    debugLog('[cloud] 로컬 저장본을 서버로 옮겼습니다.');
    return;
  }
  if (!server) return;

  const serverTime = Number(server.lastSaveTime || 0);
  const localTime = Number((local && local.lastSaveTime) || 0);

  if (localTime > serverTime) {
    // 오프라인에서 더 진행한 경우 — 로컬이 이긴다.
    await pushNow(local);
    debugLog('[cloud] 로컬이 더 최신이라 서버를 갱신했습니다.');
  } else {
    writeLocal(server);
    debugLog('[cloud] 서버 저장본을 불러왔습니다.');
  }
}

async function pushNow(data) {
  if (!session.loggedIn || !data) return;
  try {
    await api('/api/save', { method: 'PUT', body: JSON.stringify(data) });
  } catch (e) {
    // 저장 실패로 게임을 멈추지 않는다. 로컬에는 이미 저장돼 있다.
    errorLog('[cloud] 서버 저장 실패', e);
  }
}

/** 게임이 저장할 때마다 부른다. 실제 전송은 몰아서 한 번만 한다. */
export function queuePush(data) {
  if (!session.loggedIn) return;
  pendingData = data;
  if (pushTimer) return;
  pushTimer = setTimeout(() => {
    pushTimer = null;
    const d = pendingData;
    pendingData = null;
    pushNow(d);
  }, PUSH_DELAY_MS);
}

/** 하드 리셋 때 서버 저장본도 함께 지운다. */
export async function deleteRemote() {
  if (!session.loggedIn) return;
  try {
    await api('/api/save', { method: 'DELETE' });
  } catch (e) {
    errorLog('[cloud] 서버 저장 삭제 실패', e);
  }
}

// ---------- 화면 ----------

function $(id) {
  return document.getElementById(id);
}

function setAuthError(msg) {
  const el = $('cc-auth-error');
  if (!el) return;
  el.textContent = msg || '';
  el.hidden = !msg;
}

/** 설정 모달의 계정 영역을 현재 상태에 맞춘다. */
export function renderAccount() {
  const status = $('cc-account-status');
  const form = $('cc-auth-form');
  const logoutBtn = $('cc-logout-btn');
  if (!status || !form || !logoutBtn) return;

  if (session.loggedIn) {
    status.textContent = t('account.loggedIn', { user: session.username });
    form.hidden = true;
    logoutBtn.hidden = false;
  } else {
    status.textContent = t('account.loggedOut');
    form.hidden = false;
    logoutBtn.hidden = true;
  }
  setAuthError('');
}

/**
 * 로그인 또는 가입. 가입에는 만 14세 확인이 필요하다(통합 인증도 같은 조건으로 막는다).
 * @param {string} mode 'login' | 'signup'
 */
async function submitAuth(mode) {
  const userEl = /** @type {HTMLInputElement|null} */ ($('cc-auth-user'));
  const passEl = /** @type {HTMLInputElement|null} */ ($('cc-auth-pass'));
  const ageEl = /** @type {HTMLInputElement|null} */ ($('cc-auth-age'));
  if (!userEl || !passEl) return;

  const username = userEl.value.trim();
  const password = passEl.value;
  if (!username || !password) return setAuthError(t('account.errCredentials'));
  if (mode === 'signup' && !(ageEl && ageEl.checked)) {
    return setAuthError(t('account.errConsent'));
  }

  setAuthError('');
  try {
    const body = mode === 'signup' ? { username, password, ageConfirm: true } : { username, password };
    await authApi(mode === 'signup' ? '/api/signup' : '/api/login', body);
    passEl.value = '';
    // 쿠키가 생겼으니 처음부터 다시 부팅해 서버 저장본을 반영한다.
    location.reload();
  } catch (e) {
    setAuthError(e.message);
  }
}

// index.html 의 data-act 가 부른다(js/actions.js 위임). 인라인 핸들러를 쓰지 않는다.
/** @type {any} */ (window).ccLogin = () => submitAuth('login');
/** @type {any} */ (window).ccSignup = () => submitAuth('signup');
/** @type {any} */ (window).ccLogout = async () => {
  try {
    await authApi('/api/logout', {});
  } catch {
    // 쿠키 만료 등 — 목적은 세션 제거이므로 무시한다
  }
  location.reload();
};
