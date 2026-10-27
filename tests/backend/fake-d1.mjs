// Minimal Cloudflare D1 stand-in backed by Node's built-in node:sqlite (Node >= 22.5).
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const plain = (r) => (r ? { ...r } : r);

class Stmt {
  constructor(db, sql, params = []) { this.db = db; this.sql = sql; this.params = params; }
  bind(...params) {
    for (const p of params) if (p === undefined) throw new Error('D1_TYPE_ERROR: undefined bind value in ' + this.sql);
    return new Stmt(this.db, this.sql, params);
  }
  _s() { return this.db.prepare(this.sql); }
  async first(col) {
    const r = plain(this._s().get(...this.params));
    if (r == null) return null;
    return col ? r[col] : r;
  }
  async all() { return { success: true, results: this._s().all(...this.params).map(plain), meta: {} }; }
  async run() {
    const s = this._s();
    // like D1, run() (and so batch()) gives back the rows of a SELECT or of RETURNING
    if (/\bRETURNING\b/i.test(this.sql) || /^\s*(SELECT|WITH)\b/i.test(this.sql)) return { success: true, results: s.all(...this.params).map(plain), meta: {} };
    const r = s.run(...this.params);
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
}

export function createD1(migrationsDir) {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  for (const f of readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()) {
    db.exec(readFileSync(join(migrationsDir, f), 'utf8'));
  }
  return {
    raw: db,
    prepare: (sql) => new Stmt(db, sql),
    async batch(stmts) {
      db.exec('BEGIN');
      try { const out = []; for (const s of stmts) out.push(await s.run()); db.exec('COMMIT'); return out; }
      catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    async exec(sql) { db.exec(sql); return { count: 1 }; },
  };
}
