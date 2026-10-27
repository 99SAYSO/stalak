/* Stalak account client (plain JS, no framework).
   window.StalakAccount:
     me()                 -> Promise<{user, session, entitlements, subscription}>
                             user: {id, email, lang, displayName, avatarUrl, hasPassword, passwordSetAt, emailVerified, providers}
                             session: {method, recentCode} (recentCode: may set a password without the old one)
     providers()          -> Promise<['google'|'microsoft'|'apple', …]>  (only those configured on the server)
     signup(email, password[, displayName]) -> Promise<{needCode, expiresIn}> (a code is mailed; error email_taken…)
     signupVerify(email, code)  -> Promise<state>   (account made, signed in)
     login(email, password)     -> Promise<state | {needCode: true}> (needCode: new browser, a code is mailed)
     loginVerify(email, code)   -> Promise<state>
     forgot(email)              -> Promise<{needCode}>   (same answer whether the account exists or not)
     resetCheck(email, code)    -> Promise<{codeOk}>     (checks the code, keeps it)
     reset(email, code, password) -> Promise<state>      (new password, signed in)
     oauthUrl(provider, to, popup) -> the address that starts Google / Apple / Microsoft sign-in (to: 'account' | 'pro')
     setPassword(password[, currentPassword]) -> Promise<state>
     updateProfile({displayName}) -> Promise<state>
     uploadAvatar(blob)   -> Promise<state>   (blob: image/jpeg | image/webp | image/png, at most 80 KB)
     removeAvatar()       -> Promise<state>
     logout()
     checkout(plan)       -> opens the Paddle overlay; plan = 'month' | 'year'
     portal()             -> Promise<{url, cancelUrl, updatePaymentUrl}> (manage / cancel)
     deleteAccount()
     projects.list() / get(id) / save(id, name, state) / remove(id)
     onChange(cb)         -> unsubscribe function; cb(state) on every state change
     checkoutOpen         -> true while Paddle's checkout window is open
     state                -> last known state
   Errors are thrown as Error objects with .code (server "error" field) and .status. */
(function () {
  'use strict';
  var FREE = { plan: 'free', outro: true, cloudSave: false, clipMode: false, autoLyrics: false, packs: false };
  var state = { user: null, session: null, entitlements: FREE, subscription: null };
  var listeners = [];
  var configPromise = null;
  var paddlePromise = null;
  var checkoutOpen = false;   // Paddle's window is on screen

  function lang() {
    var l = (document.documentElement.lang || navigator.language || 'fr').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'fr';
  }

  function api(method, path, body, rawType) {
    var opts = { method: method, credentials: 'same-origin', headers: { Accept: 'application/json' } };
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
    state = { user: next.user || null, session: next.session || null, entitlements: next.entitlements || FREE, subscription: next.subscription || null };
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
    if (ev && ev.name === 'checkout.closed') checkoutOpen = false;
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

  window.StalakAccount = {
    get state() { return state; },
    get checkoutOpen() { return checkoutOpen; },
    me: me,
    config: config,
    providers: function () { return config().then(function (c) { return (c.auth && c.auth.providers) || []; }); },
    signup: function (email, password, displayName) {
      return api('POST', 'auth/signup', { email: email, password: password, displayName: displayName || null, lang: lang() });
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
