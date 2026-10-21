// 다시 자르기: 이미 정리한 주소에 꼬리(?…)가 남았을 때, 그 페이지가 스스로 밝힌 대표 주소(canonical)를 읽어 더 짧은 주소를 돌려줌.
// 주소는 저장하지 않고, 사이트 이름과 꼬리 이름만 로그에 남김.
const ESSENTIAL = /^(q|query|search|s|id|v|p|page|list|no|idx|seq|num|key|keyword|article|aid|pid|uid|cid)$/i;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const samePath = (a, b) => decodeURIComponent(a).replace(/\/+$/, '').toLowerCase() === decodeURIComponent(b).replace(/\/+$/, '').toLowerCase();
const bare = h => h.replace(/^www\./i, '').toLowerCase();

function findCanonical(html) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (/rel\s*=\s*["']?canonical/i.test(tag)) { const m = tag.match(/href\s*=\s*["']([^"']+)["']/i); if (m) return m[1]; }
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/property\s*=\s*["']og:url/i.test(tag)) { const m = tag.match(/content\s*=\s*["']([^"']+)["']/i); if (m) return m[1]; }
  }
  return null;
}

export async function onRequestGet({ request }) {
  const origin = request.headers.get('origin'), site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return json({ error: 'forbidden' }, 403);
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: 'forbidden' }, 403);

  let u;
  try { u = new URL(new URL(request.url).searchParams.get('u') || ''); } catch (e) { return json({ error: 'bad' }, 400); }
  if (!/^https?:$/.test(u.protocol) || u.port || u.username || u.password) return json({ error: 'bad' }, 400);
  if (!u.search) return json({ same: true });
  if (/^(localhost|.*\.(local|internal|localdomain))$/i.test(u.hostname) || /^[\d.]+$/.test(u.hostname) || u.hostname.includes(':') || !u.hostname.includes('.')) return json({ error: 'bad' }, 400);

  let html = '', finalUrl = u;
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 3500);
    const res = await fetch(u.href, { signal: ctl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; CUTbot; +https://cut.arapshow.net)', accept: 'text/html' } });
    clearTimeout(timer);
    if (!res.ok || !/text\/html/i.test(res.headers.get('content-type') || '')) return json({ same: true });
    finalUrl = new URL(res.url);
    const reader = res.body.getReader(), dec = new TextDecoder();
    while (html.length < 300000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += dec.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
    reader.cancel().catch(() => {});
  } catch (e) { return json({ same: true }); }

  const raw = findCanonical(html);
  let c;
  try { c = new URL(raw, finalUrl); } catch (e) { return json({ same: true }); }
  if (!/^https?:$/.test(c.protocol) || ![bare(u.hostname), bare(finalUrl.hostname)].includes(bare(c.hostname))) return json({ same: true });
  if (!samePath(c.pathname, u.pathname) && !samePath(c.pathname, finalUrl.pathname)) return json({ same: true });
  c.hash = '';
  for (const [k, v] of u.searchParams) if (ESSENTIAL.test(k) && !c.searchParams.has(k)) c.searchParams.set(k, v);
  const out = c.href;
  if (out.length >= u.href.length) return json({ same: true });
  console.log(JSON.stringify({ recut: u.hostname, dropped: [...u.searchParams.keys()].filter(k => !c.searchParams.has(k)) }));
  return json({ url: out });
}
