// Pembatas permintaan sederhana di memori (cukup untuk satu proses Node)
export function createLimiter({ windowMs, max, now = Date.now }) {
  const hits = new Map();
  const prune = () => {
    const t = now();
    for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
  };
  return {
    consume(key) {
      if (hits.size > 5000) prune();
      const t = now();
      let h = hits.get(key);
      if (!h || h.reset <= t) hits.set(key, (h = { count: 0, reset: t + windowMs }));
      h.count += 1;
      return h.count <= max ? { ok: true } : { ok: false, retryAfter: Math.ceil((h.reset - t) / 1000) };
    },
    reset(key) { hits.delete(key); },
  };
}
