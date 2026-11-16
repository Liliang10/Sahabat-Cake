import crypto from 'crypto';

const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
const b64 = (b) => Buffer.from(b).toString('base64url');

/**
 * Token admin stateless: base64url(payload).HMAC.
 * Kunci HMAC memuat hash kata sandi, jadi mengganti ADMIN_PASSWORD otomatis mencabut semua token lama.
 */
export function createAuth({ password, secret, ttlMs, now = Date.now }) {
  const passDigest = sha(password);
  const key = crypto.createHmac('sha256', secret).update(passDigest).digest();
  const sign = (body) => crypto.createHmac('sha256', key).update(body).digest('base64url');

  return {
    checkPassword(input) {
      return crypto.timingSafeEqual(sha(input ?? ''), passDigest);
    },
    issue() {
      const body = b64(JSON.stringify({ exp: now() + ttlMs, jti: crypto.randomUUID() }));
      return `${body}.${sign(body)}`;
    },
    verify(token) {
      if (typeof token !== 'string') return false;
      const [body, sig, extra] = token.split('.');
      if (!body || !sig || extra !== undefined) return false;
      const expected = Buffer.from(sign(body));
      const given = Buffer.from(sig);
      if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return false;
      try {
        const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
        return typeof exp === 'number' && exp > now();
      } catch { return false; }
    },
  };
}

export function loadSecret(db, fromEnv) {
  if (fromEnv) return fromEnv;
  const row = db.prepare("SELECT value FROM meta WHERE key = 'token_secret'").get();
  if (row) return row.value;
  const s = crypto.randomBytes(32).toString('hex');
  db.prepare("INSERT INTO meta (key, value) VALUES ('token_secret', ?)").run(s);
  return s;
}
