/**
 * 사이버 클리커 서버 저장 백엔드.
 *
 * cc.elcherlab.com/api/* 를 Caddy 가 여기(127.0.0.1:3500)로 프록시한다.
 * 같은 출처라 브라우저가 쿠키를 자동으로 실어 보내므로 CORS 가 필요 없다.
 *
 *   GET    /api/health  동작 확인
 *   GET    /api/me      세션 확인 → { loggedIn, username? }
 *   GET    /api/save    저장 데이터 → { data: object|null }
 *   PUT    /api/save    저장 (본문 = 저장 객체 그대로, 64KB 제한)
 *   DELETE /api/save    삭제 (하드 리셋)
 *
 *   POST /internal/export-user  통합 인증의 "내 데이터 내려받기" 전용(루프백)
 *
 * 저장은 cc.saves 한 줄(user_id 당 jsonb 하나)이 전부다. 게임 규칙은 전부
 * 클라이언트에 있고 서버는 검증하지 않는다 — 1인용 방치형이라 치트 방지보다
 * 단순함을 택했다(pixel-pet 과 같은 판단).
 *
 * 탈퇴 시 삭제 경로가 없는 것도 pixel-pet 과 같다. cc.saves 가 identity.users 를
 * on delete cascade 로 참조하므로 통합 인증이 계정 행을 지울 때 함께 사라진다.
 */

import http from 'node:http';
import dotenv from 'dotenv';
import pg from 'pg';
import { readCookie, verifyInternal, verifySession } from './session.js';

dotenv.config();

const PORT = Number(process.env.PORT || 3500);
const HOST = process.env.HOST || '127.0.0.1';
const COOKIE_NAME = process.env.COOKIE_NAME || 'elab_session';
// 클리커 저장본은 업그레이드·업적·스킬 목록이 들어가 펫보다 크다.
const MAX_BODY = 64 * 1024;

// 통합 인증과 같은 값. 없으면 아무도 로그인할 수 없으니 즉시 멈춘다.
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  console.error('AUTH_SECRET 이 없거나 너무 짧습니다(32자 이상). 통합 인증과 같은 값을 .env 에 넣으세요.');
  process.exit(1);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: Number(process.env.DB_POOL_MAX || 3),
  // Supabase 풀러는 TLS 를 쓰지만 체인 검증까지는 하지 않는다(auth·pc·pet 와 동일 설정).
  ssl: String(process.env.DB_SSL || 'true') === 'true' ? { rejectUnauthorized: false } : false,
});
pool.on('error', (e) => console.error('[db] 유휴 커넥션 오류:', e.message));

/** 반복 적용해도 안전한 스키마 — 부팅 때마다 확인한다. */
const SCHEMA_SQL = `
  create schema if not exists cc;
  create table if not exists cc.saves (
    user_id    uuid primary key references identity.users(id) on delete cascade,
    data       jsonb not null,
    updated_at timestamptz not null default now()
  );
`;

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sessionOf(req) {
  return verifySession(readCookie(req.headers.cookie, COOKIE_NAME), AUTH_SECRET);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let over = false;
    req.on('data', (c) => {
      if (over) return;
      size += c.length;
      if (size > MAX_BODY) {
        over = true;
        const e = new Error('저장 데이터가 너무 큽니다.');
        e.code = 413;
        // 여기서 req.destroy() 하면 응답을 보내기 전에 커넥션이 끊겨,
        // 앞단(Cloudflare)이 413 대신 502 를 돌려준다. 남은 본문은 버리고
        // 응답은 호출부가 정상적으로 보내게 둔다.
        req.resume();
        reject(e);
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!over) resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0];
  try {
    if (req.method === 'GET' && path === '/api/health') {
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET' && path === '/api/me') {
      const s = sessionOf(req);
      return json(res, 200, s ? { loggedIn: true, username: s.username } : { loggedIn: false });
    }

    /**
     * 통합 인증이 "내 데이터 내려받기" 처리 중에 부르는 내부 경로.
     * Caddy 는 /api/* 만 여기로 프록시하고 /internal/* 은 404 로 막아 두었지만,
     * 루프백으로 오는 요청이라 공유 시크릿에서 유도한 토큰을 확인한다.
     */
    if (req.method === 'POST' && path === '/internal/export-user') {
      if (!verifyInternal(req.headers['x-internal-auth'], AUTH_SECRET)) {
        return json(res, 403, { error: 'forbidden' });
      }
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return json(res, 400, { error: '본문이 올바른 JSON 이 아닙니다.' });
      }
      const userId = body && body.userId;
      if (typeof userId !== 'string' || !userId) return json(res, 400, { error: 'userId 가 필요합니다.' });
      const r = await pool.query('select data, updated_at from cc.saves where user_id = $1', [userId]);
      // 열람권 문서의 키는 언어별로 아예 다른 한 벌이다. 받아서 보관하는 파일이라
      // 같은 키를 언어에 따라 바꾸면 이미 받아 둔 파일과 형식이 갈린다.
      // lang 은 auth 가 본문에 실어 보낸다(모르는 값이면 한국어).
      const en = body && body.lang === 'en';
      if (en) {
        return json(res, 200, {
          service: 'Cyber Clicker (cc.elcherlab.com)',
          serverSave: r.rows[0] ? { gameData: r.rows[0].data, lastSaved: r.rows[0].updated_at } : null,
          note: 'Play from before you signed in lives only in that browser\'s localStorage, so it is not on the server.',
        });
      }
      return json(res, 200, {
        서비스: '사이버 클리커 (cc.elcherlab.com)',
        서버저장: r.rows[0] ? { 게임데이터: r.rows[0].data, 마지막저장: r.rows[0].updated_at } : null,
        참고: '로그인하지 않고 플레이한 기록은 그 브라우저의 localStorage 에만 있어 서버에 없습니다.',
      });
    }

    // 이하 전부 로그인 필요
    const s = sessionOf(req);
    if (!s) return json(res, 401, { error: '로그인이 필요합니다.' });

    if (req.method === 'GET' && path === '/api/save') {
      const r = await pool.query('select data from cc.saves where user_id = $1', [s.uid]);
      return json(res, 200, { data: r.rows[0] ? r.rows[0].data : null });
    }

    if (req.method === 'PUT' && path === '/api/save') {
      let data;
      try {
        data = JSON.parse(await readBody(req));
      } catch (e) {
        return json(res, e.code === 413 ? 413 : 400, {
          error: e.code === 413 ? e.message : '본문이 올바른 JSON 이 아닙니다.',
        });
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return json(res, 400, { error: '저장 데이터는 객체여야 합니다.' });
      }
      await pool.query(
        `insert into cc.saves (user_id, data, updated_at) values ($1, $2, now())
         on conflict (user_id) do update set data = excluded.data, updated_at = now()`,
        [s.uid, data]
      );
      return json(res, 200, { ok: true });
    }

    if (req.method === 'DELETE' && path === '/api/save') {
      await pool.query('delete from cc.saves where user_id = $1', [s.uid]);
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { error: '없는 경로입니다.' });
  } catch (e) {
    console.error(`[${req.method} ${path}]`, e.message);
    return json(res, 500, { error: '서버 오류가 발생했습니다.' });
  }
});

try {
  await pool.query(SCHEMA_SQL);
  console.log('cc.saves 스키마 확인 완료');
} catch (e) {
  console.error('스키마 적용 실패:', e.message);
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  console.log(`⚡ 사이버 클리커 서버 저장 실행 중: http://${HOST}:${PORT} (쿠키 ${COOKIE_NAME})`);
});
