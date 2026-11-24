// MADE-UP answers of Google Analytics (Data API) and Microsoft Clarity (Data Export API), with the shapes their docs give,
// for the dashboard demo (tools/admin_demo_data.mjs). Not real data.
const rep = (dims, metrics, rows, totals) => ({ dimensionHeaders: dims.map((name) => ({ name })), metricHeaders: metrics.map((name) => ({ name })),
  rows: rows.map((r) => ({ dimensionValues: r.slice(0, dims.length).map((value) => ({ value })), metricValues: r.slice(dims.length).map((v) => ({ value: String(v) })) })),
  totals: totals ? [{ metricValues: totals.map((v) => ({ value: String(v) })) }] : undefined });
const FUNNEL = { d1: [212, 160, 131, 118, 104, 61, 55, 21, 7, 2], d7: [1310, 1004, 845, 760, 671, 402, 361, 140, 41, 9], d30: [5480, 4170, 3540, 3170, 2810, 1690, 1530, 590, 176, 38] };
const STEPS = ['accueil_vue', 'onboarding_etape_1', 'onboarding_etape_2', 'onboarding_etape_3', 'onboarding_etape_4', 'export_lance', 'export_ok', 'paywall_vu', 'checkout_ouvert', 'achat'];
const scale = (days) => (days === 1 ? 0.04 : days === 7 ? 0.24 : 1);
export function fakeAnalyticsFetch() {
  return async (url, init = {}) => {
    url = String(url);
    if (url === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'demo', expires_in: 3599 });
    const m = /analyticsdata\.googleapis\.com\/v1beta\/properties\/\d+:(\w+)$/.exec(url);
    if (m) {
      const body = JSON.parse(init.body || '{}');
      if (m[1] === 'runReport') return Response.json(rep(['eventName', 'dateRange'], ['totalUsers', 'eventCount'],
        Object.entries(FUNNEL).flatMap(([d, v]) => STEPS.map((e, i) => [e, d, v[i], Math.round(v[i] * 1.2)]))));
      if (m[1] === 'batchRunReports') {
        const sd = body.requests[0].dateRanges[0].startDate, days = sd === 'today' ? 1 : Number.parseInt(sd, 10) + 1, k = scale(days);
        const r = (x) => Math.max(1, Math.round(x * k));
        return Response.json({ reports: [
          rep(['sessionSource', 'sessionMedium'], ['sessions', 'totalUsers'], [['tiktok.com', 'referral', r(2900), r(2410)], ['(direct)', '(none)', r(1210), r(980)],
            ['google', 'organic', r(640), r(560)], ['tiktok', 'bio', r(420), r(380)], ['instagram.com', 'referral', r(180), r(150)], ['alternativeto.net', 'referral', r(44), r(40)]]),
          rep(['countryId'], ['activeUsers', 'sessions'], [['US', r(1900), r(2300)], ['FR', r(1210), r(1500)], ['GB', r(420), r(510)], ['CA', r(300), r(350)], ['BE', r(180), r(200)], ['DE', r(120), r(140)]]),
          rep(['deviceCategory'], ['activeUsers', 'sessions', 'userEngagementDuration', 'screenPageViews'], [['mobile', r(3900), r(4700), r(3900) * 96, r(9400)], ['desktop', r(1010), r(1250), r(1010) * 160, r(2600)], ['tablet', r(90), r(100), r(90) * 70, r(180)]],
            [r(3900) + r(1010) + r(90), r(4700) + r(1250) + r(100), r(3900) * 96 + r(1010) * 160 + r(90) * 70, r(9400) + r(2600) + r(180)]),
          rep(['language'], ['activeUsers'], [['English', r(3100)], ['French', r(1700)], ['Spanish', r(120)]]),
          rep(['pagePath'], ['screenPageViews', 'activeUsers', 'userEngagementDuration'], [['/', r(5200), r(3000), r(3000) * 120], ['/fr/', r(3100), r(1700), r(1700) * 130], ['/pricing/', r(800), r(620), r(620) * 35], ['/fr/tarifs/', r(410), r(330), r(330) * 38], ['/help/', r(160), r(120), r(120) * 50]]),
        ] });
      }
      if (m[1] === 'runRealtimeReport') return body.dimensions[0].name === 'countryId'
        ? Response.json(rep(['countryId'], ['activeUsers'], [['US', 4], ['FR', 3], ['GB', 1]], [8]))
        : Response.json(rep(['unifiedScreenName'], ['activeUsers'], [['Stalak — beat-synced edits', 5], ['Stalak — montage calé sur le son', 3]]));
    }
    if (url.startsWith('https://www.clarity.ms/export-data/api/v1/project-live-insights')) {
      const q = new URL(url).searchParams, dims = [q.get('dimension1'), q.get('dimension2')].filter(Boolean).join(',');
      const fr = (n, pctv, extra) => ({ sessionsCount: String(Math.round(n / pctv * 100)), sessionsWithMetricPercentage: pctv, subTotal: String(n), ...extra });
      if (dims === 'Device') return Response.json([
        { metricName: 'Traffic', information: [{ totalSessionCount: '642', totalBotSessionCount: '31', distantUserCount: '540', PagesPerSessionPercentage: 1.8, Device: 'Mobile' },
          { totalSessionCount: '171', totalBotSessionCount: '12', distantUserCount: '150', PagesPerSessionPercentage: 2.4, Device: 'PC' }, { totalSessionCount: '14', totalBotSessionCount: '0', distantUserCount: '12', PagesPerSessionPercentage: 1.6, Device: 'Tablet' }] },
        { metricName: 'ScrollDepth', information: [{ averageScrollDepth: 46.2, Device: 'Mobile' }, { averageScrollDepth: 61.5, Device: 'PC' }] },
        { metricName: 'EngagementTime', information: [{ totalTime: '212', activeTime: '96', Device: 'Mobile' }, { totalTime: '340', activeTime: '170', Device: 'PC' }] },
        { metricName: 'RageClickCount', information: [fr(58, 6.1, { Device: 'Mobile' }), fr(9, 3.2, { Device: 'PC' })] },
        { metricName: 'DeadClickCount', information: [fr(141, 13.4, { Device: 'Mobile' }), fr(40, 11, { Device: 'PC' })] },
        { metricName: 'QuickbackClick', information: [fr(37, 5.2, { Device: 'Mobile' })] },
        { metricName: 'ScriptErrorCount', information: [fr(12, 1.4, { Device: 'Mobile' }), fr(3, 1.1, { Device: 'PC' })] },
        { metricName: 'ErrorClickCount', information: [fr(6, 0.8, { Device: 'Mobile' })] },
        { metricName: 'ExcessiveScroll', information: [fr(22, 3.3, { Device: 'Mobile' })] }]);
      if (dims === 'URL,Device') return Response.json([
        { metricName: 'RageClickCount', information: [fr(41, 9.5, { URL: 'https://stalak.app/', Device: 'Mobile' }), fr(12, 4.1, { URL: 'https://stalak.app/fr/', Device: 'Mobile' }), fr(6, 3.3, { URL: 'https://stalak.app/pricing/', Device: 'PC' })] },
        { metricName: 'DeadClickCount', information: [fr(88, 15.2, { URL: 'https://stalak.app/', Device: 'Mobile' }), fr(30, 12.4, { URL: 'https://stalak.app/fr/', Device: 'Mobile' }), fr(25, 10.5, { URL: 'https://stalak.app/', Device: 'PC' })] },
        { metricName: 'QuickbackClick', information: [fr(21, 6.6, { URL: 'https://stalak.app/pricing/', Device: 'Mobile' }), fr(9, 4.4, { URL: 'https://stalak.app/fr/tarifs/', Device: 'Mobile' })] },
        { metricName: 'ScriptErrorCount', information: [fr(10, 1.6, { URL: 'https://stalak.app/', Device: 'Mobile' })] },
        { metricName: 'ExcessiveScroll', information: [fr(17, 4.8, { URL: 'https://stalak.app/help/', Device: 'Mobile' })] }]);
      if (dims === 'Channel') return Response.json([{ metricName: 'Traffic', information: [{ totalSessionCount: '455', Channel: 'Social' }, { totalSessionCount: '214', Channel: 'Direct' }, { totalSessionCount: '102', Channel: 'Organic search' }, { totalSessionCount: '56', Channel: 'Referral' }] }]);
      return Response.json([]);
    }
    return null;
  };
}
