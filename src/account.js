/* Stalak account client (plain JS, no framework).
   window.StalakAccount:
     me()                 -> Promise<{user, session, entitlements, subscription, freeVideo}>
                             user: {id, email, lang, displayName, avatarUrl, hasPassword, passwordSetAt, emailVerified, providers, reminders}
                             entitlements: {plan: 'free'|'basic'|'pro'|'max', features: [...], limits: {...}} (functions/_lib/entitlements.js)
                             freeVideo (free plan): {usedToday, nextAt}
     has(feature)         -> bool: the plan unlocks this feature ('unlimited', 'nologo', 'text', 'filters', 'clip', 'packs',
                             'lyrics', 'cloud', 'pack30', 'human'); the table is on the server
                             session: {method, recentCode} (recentCode: may set a password without the old one)
     providers()          -> Promise<['google'|'microsoft'|'apple', …]>  (only those configured on the server)
     signup(email, password[, displayName[, reminders]]) -> Promise<{needCode, expiresIn}> (a code is mailed; error email_taken…)
                             reminders: true = the box « Me prévenir quand ma vidéo gratuite du jour est disponible »
     signupVerify(email, code)  -> Promise<state>   (account made, signed in)
     login(email, password)     -> Promise<state | {needCode: true}> (needCode: new browser, a code is mailed)
     loginVerify(email, code)   -> Promise<state>
     forgot(email)              -> Promise<{needCode}>   (same answer whether the account exists or not)
     resetCheck(email, code)    -> Promise<{codeOk}>     (checks the code, keeps it)
     reset(email, code, password) -> Promise<state>      (new password, signed in)
     oauthUrl(provider, to, popup) -> the address that starts Google / Apple / Microsoft sign-in (to: 'account' | 'pro')
     setPassword(password[, currentPassword]) -> Promise<state>
     updateProfile({displayName} | {reminders: bool}) -> Promise<state>
     uploadAvatar(blob)   -> Promise<state>   (blob: image/jpeg | image/webp | image/png, at most 80 KB)
     removeAvatar()       -> Promise<state>
     logout()
     checkout(plan, interval) -> opens the Paddle overlay; plan = 'basic' | 'pro' | 'max', interval = 'month' | 'year'
                             (checkout('month') / checkout('year') = Pro, the older call)
     videos.claim(videoId) -> Promise<{unlimited} | {token, day, nextAt}>: the « jeton du jour » asked before a free export;
                             error daily_video_used (data.nextAt), not_logged_in
     portal()             -> Promise<{url, cancelUrl, updatePaymentUrl}> (manage / cancel)
     changePlan(plan, interval) -> Promise<{ok, from, to}>: a subscriber moves to another plan (prorated, same subscription)
     deleteAccount()
     projects.list() / get(id) / save(id, name, state[, fileIds]) / remove(id)
     projects.listAll()   -> Promise<{projects, storage: {available, used, quota, partSize, maxFile}}>
     projects.rename(id, name)
     projects.setCover(id, blob) -> Promise<{coverUrl}>  (the Galerie's picture; listAll() gives each project's coverUrl)
     cloud.available()    -> Promise<bool>  (the server has its R2 storage: online saving with media)
     cloud.fingerprint(file) -> Promise<id>  (same file = same id: not sent twice)
     cloud.upload(projectId, file, fileId, {onProgress(bytes), onRetry(n, err), signal}) -> Promise<{fileId, skipped}>
     cloud.download(projectId, {id, name, type, size, lastModified}, {onProgress(bytes), onRetry, signal}) -> Promise<File>
     onChange(cb)         -> unsubscribe function; cb(state) on every state change
     checkoutOpen         -> true while Paddle's checkout window is open
     state                -> last known state
   Errors are thrown as Error objects with .code (server "error" field) and .status. */
(function () {
  'use strict';
  var FREE = { plan: 'free', features: [], limits: { videosPerDay: 1 }, outro: true, cloudSave: false, clipMode: false, autoLyrics: false, packs: false };
  var state = { user: null, session: null, entitlements: FREE, subscription: null, freeVideo: null };
  // a server from before the 30/10 offer sends no features list: its Pro had everything but « pack30 » and « human »
  var OLD_PRO = ['unlimited', 'nologo', 'text', 'filters', 'clip', 'packs', 'lyrics', 'cloud', 'pack30', 'human'];
  function has(feature) {
    var e = state.entitlements || FREE;
    if (Array.isArray(e.features)) return e.features.indexOf(feature) >= 0;
    return e.plan === 'pro' && OLD_PRO.indexOf(feature) >= 0;
  }
  var listeners = [];
  var configPromise = null;
  var paddlePromise = null;
  var checkoutOpen = false;   // Paddle's window is on screen

  function lang() {
    var l = (document.documentElement.lang || navigator.language || 'fr').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'fr';
  }

  function api(method, path, body, rawType) {
    var opts = { method: method, credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } };
    if (rawType) {
      opts.headers['Content-Type'] = rawType;
      opts.body = body;
    } else if (method !== 'GET') {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body || {});
    }
    return fetch('/api/' + path, opts).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error(data.message || ('HTTP ' + res.status));
          err.code = data.error || 'http_' + res.status;
          err.status = res.status;
          err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  function setState(next) {
    var before = JSON.stringify(state);
    state = { user: next.user || null, session: next.session || null, entitlements: next.entitlements || FREE, subscription: next.subscription || null,
      freeVideo: next.freeVideo || null };
    if (JSON.stringify(state) !== before) {
      listeners.slice().forEach(function (cb) { try { cb(state); } catch (e) { console.error(e); } });
    }
    return state;
  }

  function me() {
    return api('GET', 'me').then(setState);
  }

  function config() {
    if (!configPromise) configPromise = api('GET', 'config').catch(function (e) { configPromise = null; throw e; });
    return configPromise;
  }

  function loadPaddle(cfg) {
    if (paddlePromise) return paddlePromise;
    paddlePromise = new Promise(function (resolve, reject) {
      if (!cfg.paddle.clientToken) { reject(Object.assign(new Error('Payments are not configured yet.'), { code: 'not_configured' })); return; }
      var s = document.createElement('script');
      s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      s.async = true;
      s.onload = function () {
        var P = window.Paddle;
        if (cfg.paddle.environment === 'sandbox') P.Environment.set('sandbox');
        P.Initialize({ token: cfg.paddle.clientToken, eventCallback: onPaddleEvent });
        resolve(P);
      };
      s.onerror = function () { paddlePromise = null; reject(Object.assign(new Error('Could not load the payment window.'), { code: 'paddle_load_failed' })); };
      document.head.appendChild(s);
    });
    return paddlePromise;
  }

  // After payment the webhook changes the account's plan a few seconds later: poll /api/me until it is the plan bought.
  var buying = null;
  function waitForPlan(tries) {
    if ((buying && state.entitlements.plan === buying) || tries <= 0) { buying = null; return; }
    setTimeout(function () { me().then(function () { waitForPlan(tries - 1); }, function () { waitForPlan(tries - 1); }); }, 2000);
  }

  function onPaddleEvent(ev) {
    if (ev && ev.name === 'checkout.closed') checkoutOpen = false;
    if (ev && ev.name === 'checkout.completed') waitForPlan(20);
  }

  var PLANS = ['basic', 'pro', 'max'];
  function checkout(plan, interval) {
    if (plan === 'month' || plan === 'year') { interval = plan; plan = 'pro'; }   // the older call
    if (PLANS.indexOf(plan) < 0 || (interval !== 'month' && interval !== 'year')) {
      return Promise.reject(Object.assign(new Error('plan: basic, pro or max; interval: month or year'), { code: 'invalid_plan' }));
    }
    return Promise.all([config(), state.user ? state : me()]).then(function (r) {
      var cfg = r[0], st = r[1];
      if (!st.user) throw Object.assign(new Error('Sign in first.'), { code: 'not_logged_in', status: 401 });
      var p = cfg.paddle.prices[plan], priceId = p && typeof p === 'object' ? p[interval] : null;
      buying = plan;
      if (!priceId) throw Object.assign(new Error('Payments are not configured yet.'), { code: 'not_configured' });
      return loadPaddle(cfg).then(function (P) {
        checkoutOpen = true;
        P.Checkout.open({
          items: [{ priceId: priceId, quantity: 1 }],
          customer: { email: st.user.email },
          customData: { user_id: st.user.id },
          settings: { displayMode: 'overlay', locale: st.user.lang || lang(), allowLogout: false }
        });
      });
    });
  }

  /* ---- online saving: the media files of a project (Stalak Pro). Big files go part by part (file.slice: never the whole
     file in memory), each request is tried again after a network error; downloads come back in 8 MB pieces (Range). ---- */
  var TRIES = 6, CHUNK = 8 * 1024 * 1024;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function aborted() { return Object.assign(new Error('aborted'), { code: 'aborted', status: 0 }); }
  function retriable(e) { return !e || e.code === 'network' || !e.status || e.status >= 500 || e.status === 429 || e.status === 408; }
  function withRetry(fn, o) {
    var n = 0;
    function attempt() {
      if (o.signal && o.signal.aborted) return Promise.reject(aborted());
      return fn().catch(function (e) {
        if ((e && e.code === 'aborted') || (o.signal && o.signal.aborted)) throw aborted();
        if (++n >= TRIES || !retriable(e)) throw e;
        if (o.onRetry) try { o.onRetry(n, e); } catch (x) {}
        return wait(Math.min(15000, 1000 * Math.pow(2, n - 1))).then(attempt);
      });
    }
    return attempt();
  }
  function httpErr(status, d) {
    var err = new Error((d && d.message) || ('HTTP ' + status));
    err.code = (d && d.error) || (status ? 'http_' + status : 'network'); err.status = status; err.data = d || {};
    return err;
  }
  // PUT of raw bytes with XMLHttpRequest: its upload progress events give the bytes sent (fetch cannot)
  function xhrPut(path, blob, onProg, signal) {
    return new Promise(function (resolve, reject) {
      if (signal && signal.aborted) { reject(aborted()); return; }
      var x = new XMLHttpRequest(), stop = function () { x.abort(); };
      x.open('PUT', '/api/' + path);
      x.setRequestHeader('Content-Type', 'application/octet-stream');
      x.setRequestHeader('Accept', 'application/json');
      x.upload.onprogress = function (e) { if (onProg) onProg(e.loaded); };
      var done = function () { if (signal) signal.removeEventListener('abort', stop); };
      x.onload = function () {
        done(); var d = {}; try { d = JSON.parse(x.responseText); } catch (e) {}
        if (x.status >= 200 && x.status < 300) resolve(d); else reject(httpErr(x.status, d));
      };
      x.onerror = x.ontimeout = function () { done(); reject(httpErr(0, { error: 'network' })); };
      x.onabort = function () { done(); reject(aborted()); };
      if (signal) signal.addEventListener('abort', stop);
      x.send(blob);
    });
  }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  // name, size, date and the first and last 64 KB: enough to know the same file again, without reading it all
  function fingerprint(file) {
    var K = 65536, head = file.slice(0, K), tail = file.size > K ? file.slice(Math.max(K, file.size - K)) : new Blob([]);
    return Promise.all([head.arrayBuffer(), tail.arrayBuffer()]).then(function (b) {
      var meta = new TextEncoder().encode([file.name, file.size, file.lastModified || 0, file.type || ''].join('|'));
      var all = new Uint8Array(meta.length + b[0].byteLength + b[1].byteLength);
      all.set(meta, 0); all.set(new Uint8Array(b[0]), meta.length); all.set(new Uint8Array(b[1]), meta.length + b[0].byteLength);
      return crypto.subtle.digest('SHA-256', all);
    }).then(function (d) { return 'f' + hex(d).slice(0, 39); });
  }
  function upload(projectId, file, fileId, o) {
    o = o || {};
    var base = 'projects/' + encodeURIComponent(projectId) + '/files', fpath = base + '/' + encodeURIComponent(fileId), done = 0;
    var report = function (extra) { if (o.onProgress) o.onProgress(Math.min(file.size, done + (extra || 0))); };
    function run(again) {
      return withRetry(function () { return api('POST', base, { fileId: fileId, name: file.name, type: file.type || '', size: file.size }); }, o).then(function (st) {
        if (st.status === 'ready') { done = file.size; report(); return { fileId: fileId, skipped: true }; }
        if (!st.multipart) {
          return withRetry(function () { return xhrPut(fpath, file, report, o.signal); }, o).then(function () { done = file.size; report(); return { fileId: fileId }; });
        }
        var have = st.uploadedParts || [], ps = st.partSize, n = st.parts, k = 0;
        done = have.reduce(function (s, p) { return s + Math.min(ps, file.size - (p - 1) * ps); }, 0); report();
        function next() {
          k++;
          if (k > n) return withRetry(function () { return api('POST', fpath + '/complete', {}); }, o);
          if (have.indexOf(k) >= 0) return next();
          var blob = file.slice((k - 1) * ps, Math.min(file.size, k * ps));
          return withRetry(function () { return xhrPut(fpath + '/parts/' + k, blob, report, o.signal); }, o)
            .then(function () { done += blob.size; report(); return next(); });
        }
        return next().then(function () { return { fileId: fileId }; });
      }).catch(function (e) {
        // the upload was dropped on the server side (too old): once more from the start
        if (!again && e && (e.code === 'not_found' || e.code === 'parts_missing' || e.code === 'already_uploaded')) { done = 0; return run(true); }
        throw e;
      });
    }
    return run(false);
  }
  function download(projectId, f, o) {
    o = o || {};
    var url = '/api/projects/' + encodeURIComponent(projectId) + '/files/' + encodeURIComponent(f.id), parts = [], off = 0;
    function piece() {
      if (off >= f.size) return Promise.resolve(new File(parts, f.name, { type: f.type === 'application/octet-stream' ? '' : f.type, lastModified: f.lastModified || Date.now() }));
      var end = Math.min(f.size, off + CHUNK) - 1;
      return withRetry(function () {
        return fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: o.signal, headers: { Range: 'bytes=' + off + '-' + end } })
          .catch(function (e) { throw (o.signal && o.signal.aborted) ? aborted() : httpErr(0, { error: 'network' }); })
          .then(function (res) {
            if (res.status !== 206 && res.status !== 200) return res.json().catch(function () { return {}; }).then(function (d) { throw httpErr(res.status, d); });
            return res.blob().then(function (b) { return { b: b, whole: res.status === 200 }; });
          });
      }, o).then(function (r) {
        if (r.whole) { parts = [r.b]; off = f.size; } else { if (!r.b.size) throw httpErr(0, { error: 'network' }); parts.push(r.b); off += r.b.size; }
        if (o.onProgress) o.onProgress(Math.min(off, f.size));
        return piece();
      });
    }
    return piece();
  }

  window.StalakAccount = {
    get state() { return state; },
    get checkoutOpen() { return checkoutOpen; },
    me: me,
    config: config,
    has: has,
    providers: function () { return config().then(function (c) { return (c.auth && c.auth.providers) || []; }); },
    signup: function (email, password, displayName, reminders) {
      return api('POST', 'auth/signup', { email: email, password: password, displayName: displayName || null, lang: lang(), reminders: reminders === true });
    },
    signupVerify: function (email, code) { return api('POST', 'auth/signup/verify', { email: email, code: code, lang: lang() }).then(setState); },
    login: function (email, password) {
      return api('POST', 'auth/login', { email: email, password: password, lang: lang() }).then(function (d) { return d.needCode ? d : setState(d); });
    },
    loginVerify: function (email, code) { return api('POST', 'auth/login/verify', { email: email, code: code }).then(setState); },
    forgot: function (email) { return api('POST', 'auth/forgot', { email: email, lang: lang() }); },
    resetCheck: function (email, code) { return api('POST', 'auth/reset', { email: email, code: code }); },
    reset: function (email, code, password) { return api('POST', 'auth/reset', { email: email, code: code, password: password }).then(setState); },
    oauthUrl: function (provider, to, popup) {
      return '/api/auth/oauth/' + encodeURIComponent(provider) + '/start?return=' + encodeURIComponent(location.pathname) +
        '&to=' + (to === 'pro' ? 'pro' : 'account') + '&lang=' + lang() + (popup ? '&popup=1' : '');
    },
    setPassword: function (password, currentPassword) {
      var b = { password: password };
      if (currentPassword) b.currentPassword = currentPassword;
      return api('POST', 'auth/password', b).then(setState);
    },
    updateProfile: function (fields) { return api('PATCH', 'me', fields).then(setState); },
    uploadAvatar: function (blob) { return api('PUT', 'me/avatar', blob, blob.type || 'image/jpeg').then(me); },
    removeAvatar: function () { return api('DELETE', 'me/avatar').then(me); },
    logout: function () { return api('POST', 'auth/logout').then(function () { return setState({}); }); },
    checkout: checkout,
    portal: function () { return api('POST', 'paddle/portal'); },
    // a subscriber moves to another plan (same subscription, the difference billed now): then wait for the webhook
    changePlan: function (plan, interval) {
      return api('POST', 'paddle/change', { plan: plan, interval: interval }).then(function (d) { buying = plan; waitForPlan(20); return d; });
    },
    deleteAccount: function () { return api('DELETE', 'account', { confirm: true }).then(function () { return setState({}); }); },
    videos: {
      // the free video of the day (functions/_lib/videos.js); the same id may be asked again the same day (a retry)
      claim: function (videoId) {
        return api('POST', 'videos/claim', { video: videoId }).then(function (d) {
          if (!d.unlimited && state.user) setState({ user: state.user, session: state.session, entitlements: state.entitlements,
            subscription: state.subscription, freeVideo: { usedToday: true, nextAt: d.nextAt } });
          return d;
        });
      }
    },
    projects: {
      list: function () { return api('GET', 'projects').then(function (d) { return d.projects; }); },
      get: function (id) { return api('GET', 'projects/' + encodeURIComponent(id)); },
      // the Galerie's cover: a small JPEG / WebP picture (64 KB at most) → {coverUrl}
      setCover: function (id, blob) { return api('PUT', 'projects/' + encodeURIComponent(id) + '/cover', blob, blob.type || 'image/jpeg'); },
      save: function (id, name, projectState, fileIds) {
        var b = { name: name, state: projectState }; if (fileIds) b.files = fileIds;
        return api('PUT', 'projects/' + encodeURIComponent(id), b);
      },
      remove: function (id) { return api('DELETE', 'projects/' + encodeURIComponent(id)); },
      listAll: function () { return api('GET', 'projects'); },
      rename: function (id, name) { return api('PATCH', 'projects/' + encodeURIComponent(id), { name: name }); }
    },
    cloud: {
      available: function () { return config().then(function (c) { return !!(c.features && c.features.cloudSave); }); },
      fingerprint: fingerprint,
      upload: upload,
      download: download
    },
    onChange: function (cb) {
      listeners.push(cb);
      return function () { listeners = listeners.filter(function (x) { return x !== cb; }); };
    }
  };
})();
