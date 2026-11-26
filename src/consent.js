/* Comptes (23/11, owner's decisions): the cookie banner and the measuring tools, on every page of stalak.app.
   - Nothing is loaded nor written before the choice. Accepter / Refuser have the same size and weight. The choice is kept
     6 months (first-party cookie « stalak_cc » = y | n, it only records the choice). « Gérer les cookies » (footer links
     with data-ck) opens the banner again. Global Privacy Control (GPC) = refusal, and no banner.
   - After « Accepter » only: Microsoft Clarity and Google Analytics 4. The ids come from /api/config (measure.clarity,
     measure.ga4); none set = no banner and nothing loaded at all.
   - Clarity: fields (e-mail, password, every input) and the videos of the people (canvas, video) are marked
     data-clarity-mask, as soon as they appear; set Clarity's masking to « Strict » too (handoff).
   - GA4 funnel (docs/stats/compteurs.md): the anonymous counters stay (they work without cookies); the same steps go to GA4
     only after « Accepter » (StalakConsent.counter, called by account.js), plus StalakConsent.track(name, params) for the
     other steps (accueil_vue here; onboarding_etape_N, montage_lance by the app).
   - The TikTok click id (?ttclid=) is kept only after « Accepter » (30 days), and sent with the purchase for the TikTok
     conversion API (server side, functions/_lib/conversions.js), with the consent itself (StalakConsent.forCheckout()). */
(function () {
  'use strict';
  if (window.StalakConsent) return;
  var KEY = 'stalak_cc', SIX_MONTHS = 183 * 86400, TT_KEY = 'stalak_ttclid', TT_DAYS = 30;
  var fr = /^fr/i.test(document.documentElement.lang || '') || /^\/fr(\/|$)/.test(location.pathname);
  var gpc = navigator.globalPrivacyControl === true;
  var cfg = null, loaded = false, queue = [], banner = null, listeners = [];
  var ttclidNow = (function () { try { var v = new URLSearchParams(location.search).get('ttclid'); return v && /^[\w.-]{8,200}$/.test(v) ? v : null; } catch (e) { return null; } })();

  function readChoice() {
    if (gpc) return 'n';
    var m = document.cookie.match(/(?:^|;\s*)stalak_cc=([yn])/);
    return m ? m[1] : null;
  }
  function writeChoice(v) {
    try { document.cookie = KEY + '=' + v + '; Max-Age=' + SIX_MONTHS + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch (e) {}
  }
  function store(k, v, days) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify({ v: v, until: Date.now() + days * 864e5 })); } catch (e) {} }
  function stored(k) { try { var o = JSON.parse(localStorage.getItem(k) || 'null'); if (o && o.until > Date.now()) return o.v; localStorage.removeItem(k); } catch (e) {} return null; }
  // the cookies of GA4 and Clarity, deleted when « Refuser » comes after « Accepter »
  function dropTools() {
    var names = document.cookie.split(';').map(function (c) { return c.split('=')[0].trim(); })
      .filter(function (n) { return /^(_ga|_ga_.*|_gid|_gat.*|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM|_ttp|_tt_enable_cookie|ttcsid.*)$/.test(n); });
    var host = location.hostname, doms = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    names.forEach(function (n) { doms.forEach(function (d) { document.cookie = n + '=; Max-Age=0; Path=/' + (d ? '; Domain=' + d : ''); }); });
    store(TT_KEY, null);
  }

  function config() {
    if (cfg) return Promise.resolve(cfg);
    return fetch('/api/config', { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; }).then(function (c) {
        var m = (c && c.measure) || {};
        cfg = { clarity: /^[a-z0-9]{6,20}$/i.test(m.clarity || '') ? m.clarity : null, ga4: /^G-[A-Z0-9]{4,16}$/.test(m.ga4 || '') ? m.ga4 : null,
          tiktok: typeof m.tiktok === 'string' && /^[A-Z0-9]{10,30}$/.test(m.tiktok) ? m.tiktok : null };   // 25/11: the pixel's id
        return cfg;
      });
  }
  var any = function () { return !!(cfg && (cfg.clarity || cfg.ga4 || cfg.tiktok)); };

  // Clarity: never the fields nor the videos
  function maskAll(root) {
    try {
      (root.querySelectorAll ? root.querySelectorAll('input,textarea,select,[contenteditable],canvas,video,.st-email,[data-private]') : [])
        .forEach(function (e) { if (!e.hasAttribute('data-clarity-mask')) e.setAttribute('data-clarity-mask', 'true'); });
    } catch (e) {}
  }
  function startMasking() {
    maskAll(document);
    try { new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { maskAll(n); if (n.matches && n.matches('input,textarea,select,canvas,video')) maskAll(n.parentNode || n); } }); }); })
      .observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  }
  function script(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadTools() {
    if (loaded || !cfg) return; loaded = true;
    if (cfg.clarity) {
      startMasking();
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      script('https://www.clarity.ms/tag/' + encodeURIComponent(cfg.clarity));
      try { window.clarity('consent'); } catch (e) {}
    }
    if (cfg.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      // 13 months at most for its cookies (CNIL)
      window.gtag('config', cfg.ga4, { cookie_expires: 13 * 30 * 86400, allow_google_signals: false, allow_ad_personalization_signals: false });
      script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4));
    }
    // 25/11 (test payant): the TikTok pixel, only after « Accepter »: the visit (page), then the export (Download), the payment
    // window (InitiateCheckout) and the purchase (Purchase, same event_id as the server's conversion: counted once).
    // TikTok's own base code (Ads Manager → Events → Web events → Set up manually), written out.
    if (cfg.tiktok) {
      (function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = w[t] = w[t] || [];
        ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
        ttq.setAndDefer = function (o, m) { o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.instance = function (id) { for (var e = ttq._i[id] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
        ttq.load = function (id, opts) {
          var u = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = u; ttq._t = ttq._t || {}; ttq._t[id] = +new Date; ttq._o = ttq._o || {}; ttq._o[id] = opts || {};
          var s = d.createElement('script'); s.async = true; s.src = u + '?sdkid=' + encodeURIComponent(id) + '&lib=' + t; d.head.appendChild(s);
        };
        ttq.load(cfg.tiktok);
        ttq.page();
      })(window, document, 'ttq');
    }
    if (ttclidNow) store(TT_KEY, ttclidNow, TT_DAYS);
    var q = queue; queue = []; q.forEach(function (e) { send(e[0], e[1]); });
  }
  var TT_EVENTS = { export_ok: 'Download', checkout_ouvert: 'InitiateCheckout' };
  function send(name, params) {
    if (!loaded || !cfg) return;
    if (cfg.ga4 && window.gtag) try { window.gtag('event', name, params || {}); } catch (e) {}
    if (cfg.tiktok && window.ttq) try {
      var p = params || {};
      if (name === 'achat') {
        // a trial costs nothing today: « StartTrial »; a real payment: « Purchase » with its amount (Paddle.js gives 7.99, not 799)
        var v = typeof p.value === 'number' && isFinite(p.value) ? Math.round(p.value * 100) / 100 : 0;
        var props = { content_type: 'product', content_id: 'stalak_' + (p.formule || 'pro'), currency: p.currency || undefined, value: v || undefined };
        window.ttq.track(v > 0 ? 'Purchase' : 'StartTrial', props, p.transaction_id ? { event_id: String(p.transaction_id) } : undefined);
      } else if (TT_EVENTS[name]) window.ttq.track(TT_EVENTS[name], { content_type: 'product', content_id: 'stalak_video' });
    } catch (e) {}
  }

  // ---- the banner ----
  var T = fr ? {
    text: 'Stalak utilise des cookies de mesure (Microsoft Clarity, Google Analytics) pour comprendre comment le site est utilisé et l’améliorer, et pour mesurer nos publicités. Rien n’est déposé si tu refuses.',
    textTt: 'Stalak utilise des cookies de mesure (Microsoft Clarity, Google Analytics, pixel TikTok) pour comprendre comment le site est utilisé et l’améliorer, et pour mesurer nos publicités. Rien n’est déposé si tu refuses.',
    more: 'En savoir plus', yes: 'Accepter', no: 'Refuser', href: '/fr/confidentialite#cookies', label: 'Cookies',
  } : {
    text: 'Stalak uses measurement cookies (Microsoft Clarity, Google Analytics) to understand how the site is used and improve it, and to measure our ads. Nothing is stored if you refuse.',
    textTt: 'Stalak uses measurement cookies (Microsoft Clarity, Google Analytics, TikTok pixel) to understand how the site is used and improve it, and to measure our ads. Nothing is stored if you refuse.',
    more: 'Learn more', yes: 'Accept', no: 'Refuse', href: '/privacy#cookies', label: 'Cookies',
  };
  var CSS = '.st-cc{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483600;width:min(560px,calc(100vw - 32px));box-sizing:border-box;'
    + 'background:#fff;color:#0a0d14;border:3px solid #0a0d14;border-radius:18px;box-shadow:0 5px 0 #0a0d14;padding:16px 16px 14px;font:15px/1.45 "DM Sans",Rubik,system-ui,-apple-system,sans-serif}'
    + '.st-cc p{margin:0 0 12px}.st-cc a{color:#0e3f8f;text-decoration:underline}.st-cc .st-cc-b{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
    + '.st-cc button{font:inherit;font-weight:800;font-size:16px;min-height:46px;border:3px solid #0a0d14;border-radius:14px;box-shadow:0 3px 0 #0a0d14;background:#fff;color:#0a0d14;cursor:pointer;padding:8px 10px}'
    + '.st-cc button:focus-visible{outline:3px solid #1f6fd6;outline-offset:2px}.st-cc button:active{transform:translateY(2px);box-shadow:0 1px 0 #0a0d14}';
  function close() { if (banner) { banner.remove(); banner = null; } }
  function choose(v) {
    var before = readChoice();
    writeChoice(v); close();
    try { fetch('/api/event', { method: 'POST', credentials: 'omit', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: v === 'y' ? 'consent_yes' : 'consent_no' }) }).catch(function () {}); } catch (e) {}
    if (v === 'y') { loadTools(); if (isHome()) send('accueil_vue', {}); }
    else {
      queue = [];
      if (loaded) {
        try { if (window.gtag && cfg.ga4) window.gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' }); } catch (e) {}
        try { if (window.clarity) window.clarity('consent', false); } catch (e) {}
        try { if (window.ttq && window.ttq.revokeConsent) window.ttq.revokeConsent(); } catch (e) {}
      }
      if (before === 'y' || loaded) dropTools();
    }
    listeners.forEach(function (f) { try { f(v); } catch (e) {} });
  }
  function open() {
    if (banner || gpc) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    banner = document.createElement('div');
    banner.className = 'st-cc'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-modal', 'false'); banner.setAttribute('aria-label', T.label);
    var p = document.createElement('p'); p.textContent = (cfg && cfg.tiktok ? T.textTt : T.text) + ' ';
    var a = document.createElement('a'); a.href = T.href; a.textContent = T.more; p.appendChild(a);
    var row = document.createElement('div'); row.className = 'st-cc-b';
    var no = document.createElement('button'); no.type = 'button'; no.textContent = T.no; no.setAttribute('data-cc', 'n'); no.onclick = function () { choose('n'); };
    var yes = document.createElement('button'); yes.type = 'button'; yes.textContent = T.yes; yes.setAttribute('data-cc', 'y'); yes.onclick = function () { choose('y'); };
    row.appendChild(no); row.appendChild(yes); banner.appendChild(p); banner.appendChild(row);
    (document.body || document.documentElement).appendChild(banner);
  }
  var isHome = function () { return /^\/(fr\/?)?(index\.html)?$/.test(location.pathname); };

  window.StalakConsent = {
    // 'y' | 'n' | null (not chosen yet)
    state: readChoice,
    accepted: function () { return readChoice() === 'y' && any(); },
    open: function () { config().then(function () { if (any()) open(); }); },
    onChange: function (f) { if (typeof f === 'function') listeners.push(f); },
    // a step of the GA4 funnel (sent only after « Accepter »; before the tools are ready it waits)
    track: function (name, params) {
      if (!/^[a-z][a-z0-9_]{1,39}$/.test(String(name))) return;
      if (readChoice() !== 'y') return;
      if (loaded) send(name, params); else queue.push([name, params]);
    },
    // the anonymous counters (account.js event) → the same step in GA4, under the names of the funnel
    counter: function (name, extra) {
      var m = { export_start: 'export_lance', export_ok: 'export_ok', plans_open: 'paywall_vu', checkout_open: 'checkout_ouvert', clip_open: 'clip_ouvert' }[name];
      if (!m) return;
      var p = {};
      if (name === 'plans_open' && extra && extra.why) p.endroit = String(extra.why).slice(0, 20);
      this.track(m, p);
    },
    // what goes with a purchase (Paddle customData): the consent, and the TikTok click id when there is one (after « Accepter »)
    forCheckout: function () {
      var y = readChoice() === 'y', o = { mc: y ? 1 : 0 };
      if (y) { var t = stored(TT_KEY) || ttclidNow; if (t) o.ttclid = t; }
      return o;
    },
  };

  // « Gérer les cookies » in the footer (data-ck): the banner again, when there is something to choose
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-ck]');
    if (!a || !any() || gpc) return;
    e.preventDefault(); open();
  });

  function start() {
    config().then(function () {
      if (!any()) return;
      var c = readChoice();
      if (c === 'y') { loadTools(); if (isHome()) send('accueil_vue', {}); }
      else if (c == null) open();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
