(() => {
  const KEY = 'chrosys.deck.v2';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { saved = {}; }
  const legacy = (() => { try { return JSON.parse(localStorage.getItem('chrosys.deck.v1') || '{}') || {}; } catch (_) { return {}; } })();
  window.CHROSYS_STATE = {
    platform: ['desktop','android','webview'].includes(saved.platform) ? saved.platform : (['desktop','android','webview'].includes(legacy.platform) ? legacy.platform : null),
    remember: Boolean(saved.remember ?? legacy.remember),
    favorites: new Set(Array.isArray(saved.favorites) ? saved.favorites : (Array.isArray(legacy.favorites) ? legacy.favorites : [])),
    recent: Array.isArray(saved.recent) ? saved.recent : (Array.isArray(legacy.recent) ? legacy.recent : []),
    imported: Array.isArray(saved.imported) ? saved.imported : (Array.isArray(legacy.imported) ? legacy.imported : []),
    route: 'matrix',
    selected: null
  };
  window.CHROSYS_PERSIST = () => {
    try { localStorage.setItem(KEY, JSON.stringify({...window.CHROSYS_STATE, favorites:[...window.CHROSYS_STATE.favorites], route:undefined, selected:undefined})); }
    catch (_) { window.dispatchEvent(new CustomEvent('chrosys:status',{detail:'LOCAL STORAGE UNAVAILABLE'})); }
  };
})();