// @ts-check

/**
 * 인라인 onclick 을 대신하는 위임 핸들러.
 *
 * elcherlab.com 의 서비스들은 CSP 가 `script-src 'self'` 라 인라인 이벤트
 * 핸들러(`onclick="..."`)가 아예 실행되지 않는다. CDN·인라인 스크립트를 막는
 * 것이 사이트 전체의 방침이라 예외를 두는 대신 마크업 쪽을 바꿨다.
 *
 * 버튼에는 `data-act`(부를 동작)와 필요하면 `data-arg`(인자 하나)만 둔다.
 * 실제 함수는 game.js 가 이미 window 에 올려 둔 것을 그대로 쓴다 — 동작이
 * 달라지지 않도록 호출 지점만 옮긴 것이다.
 *
 *   <button onclick="switchMobileTab('shop')">      (이전)
 *   <button data-act="switchMobileTab" data-arg="shop">   (지금)
 */

/**
 * window 에 없는, 마크업에 DOM 조작이 직접 적혀 있던 동작들.
 * @type {Record<string, (arg: string|null) => void>}
 */
const SPECIAL = {
  /** 오버레이·패널 닫기. 원래 onclick 에 getElementById(...).classList.remove 가 적혀 있었다. */
  hideOverlay(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  },
};

document.addEventListener('click', (event) => {
  const start = event.target instanceof Element ? event.target : null;
  const el = start ? start.closest('[data-act]') : null;
  if (!el) return;

  const act = el.getAttribute('data-act');
  if (!act) return;
  const arg = el.getAttribute('data-arg');

  if (Object.prototype.hasOwnProperty.call(SPECIAL, act)) {
    SPECIAL[act](arg);
    return;
  }

  const fn = /** @type {any} */ (window)[act];
  if (typeof fn !== 'function') {
    // 오타나 삭제된 함수를 조용히 넘기면 버튼이 말없이 죽는다.
    console.error(`[actions] 알 수 없는 동작: ${act}`);
    return;
  }
  if (arg === null) fn();
  else fn(arg);
});
