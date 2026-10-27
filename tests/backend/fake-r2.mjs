// In-memory stand-in for a Cloudflare R2 bucket binding (the parts of the Workers API Stalak uses):
// head, get (with range), put, delete (one key or up to 1000), list (prefix, limit <= 1000, cursor),
// createMultipartUpload / resumeMultipartUpload -> uploadPart, complete, abort.
// Like R2: multipart parts except the last must all have the same size and at least 5 MiB; an unknown or finished upload throws.
const MIN_PART = 5 * 1024 * 1024;

async function bytesOf(value) {
  if (value == null) return new Uint8Array(0);
  if (typeof value === 'string') return new TextEncoder().encode(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  if (typeof Blob !== 'undefined' && value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
  if (value && typeof value.getReader === 'function') return new Uint8Array(await new Response(value).arrayBuffer());
  throw new TypeError('fake R2: unsupported value');
}
const etagOf = (bytes) => {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i += Math.max(1, bytes.length >> 12)) h = Math.imul(h ^ bytes[i], 16777619);
  return (h >>> 0).toString(16) + '-' + bytes.length;
};

export function createR2() {
  const objects = new Map();   // key -> { data, httpMetadata, etag, uploaded }
  const uploads = new Map();   // uploadId -> { key, parts: Map<n, data>, httpMetadata }
  let nextUpload = 1;
  const meta = (key, o, range) => ({
    key, size: o.data.length, etag: o.etag, httpEtag: `"${o.etag}"`, uploaded: o.uploaded, httpMetadata: { ...o.httpMetadata },
    range, writeHttpMetadata(h) { if (o.httpMetadata.contentType) h.set('Content-Type', o.httpMetadata.contentType); },
  });
  function mpu(key, uploadId) {
    return {
      key, uploadId,
      async uploadPart(n, value) {
        const u = uploads.get(uploadId);
        if (!u || u.key !== key) throw new Error('fake R2: NoSuchUpload');
        if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error('fake R2: bad part number');
        const data = await bytesOf(value);
        u.parts.set(n, data);
        return { partNumber: n, etag: etagOf(data) + '-p' + n };
      },
      async complete(parts) {
        const u = uploads.get(uploadId);
        if (!u || u.key !== key) throw new Error('fake R2: NoSuchUpload');
        const list = parts.map((p) => {
          const d = u.parts.get(p.partNumber);
          if (!d || etagOf(d) + '-p' + p.partNumber !== p.etag) throw new Error('fake R2: InvalidPart ' + p.partNumber);
          return d;
        });
        for (let i = 0; i < list.length - 1; i++) {
          if (list[i].length < MIN_PART) throw new Error('fake R2: EntityTooSmall');
          if (list[i].length !== list[0].length) throw new Error('fake R2: parts must have the same size');
        }
        const data = new Uint8Array(list.reduce((s, d) => s + d.length, 0));
        let off = 0; for (const d of list) { data.set(d, off); off += d.length; }
        const o = { data, httpMetadata: u.httpMetadata, etag: etagOf(data), uploaded: new Date() };
        objects.set(key, o); uploads.delete(uploadId);
        return meta(key, o);
      },
      async abort() {
        if (!uploads.has(uploadId)) throw new Error('fake R2: NoSuchUpload');
        uploads.delete(uploadId);
      },
    };
  }
  return {
    objects, uploads,
    async head(key) { const o = objects.get(key); return o ? meta(key, o) : null; },
    async get(key, opts = {}) {
      const o = objects.get(key); if (!o) return null;
      let data = o.data, range;
      if (opts.range) {
        const r = opts.range;
        const offset = r.suffix != null ? Math.max(0, data.length - r.suffix) : (r.offset || 0);
        const length = r.suffix != null ? data.length - offset : (r.length != null ? r.length : data.length - offset);
        if (offset > data.length) throw new Error('fake R2: InvalidRange');
        data = data.slice(offset, offset + length); range = { offset, length: data.length };
      }
      const body = new Blob([data]).stream();
      return { ...meta(key, o, range), body, bodyUsed: false, async arrayBuffer() { return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength); } };
    },
    async put(key, value, opts = {}) {
      const data = await bytesOf(value);
      const o = { data, httpMetadata: (opts && opts.httpMetadata) || {}, etag: etagOf(data), uploaded: new Date() };
      objects.set(key, o);
      return meta(key, o);
    },
    async delete(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      if (list.length > 1000) throw new Error('fake R2: at most 1000 keys per delete');
      for (const k of list) objects.delete(k);
    },
    async list({ prefix = '', limit = 1000, cursor } = {}) {
      if (limit > 1000) limit = 1000;
      const all = [...objects.keys()].filter((k) => k.startsWith(prefix)).sort();
      const start = cursor ? Number(cursor) : 0;
      const page = all.slice(start, start + limit);
      const truncated = start + limit < all.length;
      return { objects: page.map((k) => meta(k, objects.get(k))), truncated, cursor: truncated ? String(start + limit) : undefined, delimitedPrefixes: [] };
    },
    async createMultipartUpload(key, opts = {}) {
      const uploadId = 'up' + (nextUpload++);
      uploads.set(uploadId, { key, parts: new Map(), httpMetadata: (opts && opts.httpMetadata) || {} });
      return mpu(key, uploadId);
    },
    resumeMultipartUpload(key, uploadId) { return mpu(key, uploadId); },
  };
}
