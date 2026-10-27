/* Stalak account client (plain JS, no framework).
   window.StalakAccount:
     me()                 -> Promise<{user, entitlements, subscription}>
     sendCode(email[, lang])
     verify(email, code)  -> Promise<state>   (sets the session cookie)
     logout()
     checkout(plan)       -> opens the Paddle overlay; plan = 'month' | 'year'
     portal()             -> Promise<{url, cancelUrl, updatePaymentUrl}> (manage / cancel)
     deleteAccount()
     projects.list() / get(id) / save(id, name, state) / remove(id)
     onChange(cb)         -> unsubscribe function; cb(state) on every state change
     state                -> last known state
   Errors are thrown as Error objects with .code (server "error" field) and .status. */
(function () {
  'use strict';
  var FREE = { plan: 'free', outro: true, cloudSave: false, clipMode: false, autoLyrics: false };
  var state = { user: null, entitlements: FREE, subscription: null };
  var listeners = [];
  var configPromise = null;
  var paddlePromise = null;

  function lang() {
    var l = (document.documentElement.lang || navigator.language || 'fr').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'fr';
  }

  function api(method, path, body) {
    var opts = { method: method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (method !== 'GET') {
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
    state = { user: next.user || null, entitlements: next.entitlements || FREE, subscription: next.subscription || null };
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

  // After payment the webhook upgrades the account a few seconds later: poll /api/me until Pro.
  function waitForPro(tries) {
    if (state.entitlements.plan === 'pro' || tries <= 0) return;
    setTimeout(function () { me().then(function () { waitForPro(tries - 1); }, function () { waitForPro(tries - 1); }); }, 2000);
  }

  function onPaddleEvent(ev) {
    if (ev && ev.name === 'checkout.completed') waitForPro(20);
  }

  function checkout(plan) {
    if (plan !== 'month' && plan !== 'year') return Promise.reject(Object.assign(new Error('plan must be month or year'), { code: 'invalid_plan' }));
    return Promise.all([config(), state.user ? state : me()]).then(function (r) {
      var cfg = r[0], st = r[1];
      if (!st.user) throw Object.assign(new Error('Sign in first.'), { code: 'not_logged_in', status: 401 });
      var priceId = cfg.paddle.prices[plan];
      if (!priceId) throw Object.assign(new Error('Payments are not configured yet.'), { code: 'not_configured' });
      return loadPaddle(cfg).then(function (P) {
        P.Checkout.open({
          items: [{ priceId: priceId, quantity: 1 }],
          customer: { email: st.user.email },
          customData: { user_id: st.user.id },
          settings: { displayMode: 'overlay', locale: st.user.lang || lang(), allowLogout: false }
        });
      });
    });
  }

  window.StalakAccount = {
    get state() { return state; },
    me: me,
    config: config,
    sendCode: function (email, l) { return api('POST', 'auth/send-code', { email: email, lang: l || lang() }); },
    verify: function (email, code) { return api('POST', 'auth/verify', { email: email, code: code, lang: lang() }).then(setState); },
    logout: function () { return api('POST', 'auth/logout').then(function () { return setState({}); }); },
    checkout: checkout,
    portal: function () { return api('POST', 'paddle/portal'); },
    deleteAccount: function () { return api('DELETE', 'account', { confirm: true }).then(function () { return setState({}); }); },
    projects: {
      list: function () { return api('GET', 'projects').then(function (d) { return d.projects; }); },
      get: function (id) { return api('GET', 'projects/' + encodeURIComponent(id)); },
      save: function (id, name, projectState) { return api('PUT', 'projects/' + encodeURIComponent(id), { name: name, state: projectState }); },
      remove: function (id) { return api('DELETE', 'projects/' + encodeURIComponent(id)); }
    },
    onChange: function (cb) {
      listeners.push(cb);
      return function () { listeners = listeners.filter(function (x) { return x !== cb; }); };
    }
  };
})();
