(() => {
  const $ = (s) => document.querySelector(s);
  const els = {
    grid: $('#functionGrid'), search: $('#searchInput'), category: $('#categorySelect'), command: $('#commandInput'), summary: $('#matrixSummary'), stats: $('#telemetryStats'), platform: $('#platformSelect'), remember: $('#rememberToggle'), clock: $('#clock'), state: $('#systemState'),
    platformModal: $('#platformModal'), executionModal: $('#executionModal'), infoModal: $('#infoModal'), importModal: $('#importModal'),
    execName: $('#execName'), execUrl: $('#execUrl'), execCategory: $('#execCategory'), execWarning: $('#execWarning'), infoTitle: $('#infoTitle'), infoUrl: $('#infoUrl'), infoMeta: $('#infoMeta'), infoDescription: $('#infoDescription'), infoDetails: $('#infoDetails'), importText: $('#importText'), importResult: $('#importResult')
  };
  const KEY = 'chrosys.deck.v1';
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!saved || typeof saved !== 'object') saved = {};
  } catch (_) {
    localStorage.removeItem(KEY);
  }
  const state = {
    platform: ['desktop', 'android', 'webview'].includes(saved.platform) ? saved.platform : detectPlatform(),
    remember: !!saved.remember,
    favorites: new Set(Array.isArray(saved.favorites) ? saved.favorites : []),
    recent: Array.isArray(saved.recent) ? saved.recent : [],
    imported: Array.isArray(saved.imported) ? saved.imported : []
  };
  let selected = null;
  let activeView = 'all';

  function detectPlatform() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return /wv|; wv\)/i.test(ua) ? 'webview' : 'android';
    return 'desktop';
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        platform: state.platform,
        remember: state.remember,
        favorites: [...state.favorites],
        recent: state.recent,
        imported: state.imported
      }));
    } catch (_) {
      setStatus('LOCAL STORAGE UNAVAILABLE');
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>\"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function allFunctions() {
    const base = window.CHROSYS_FUNCTIONS.map(x => ({ ...x, imported: false }));
    const extra = state.imported
      .filter(x => x && x.url && !base.some(b => b.url === x.url))
      .map(x => ({ ...x, imported: true }));
    return base.concat(extra);
  }

  function categoryLabel(c) { return window.CHROSYS_CATEGORIES[c] || String(c || '').toUpperCase(); }
  function riskLabel(r) { return r === 'experimental' ? 'EXPERIMENTAL' : r === 'restricted' ? 'RESTRICTED' : 'DIAGNOSTIC'; }
  function compatible(item) { return !item.platforms || item.platforms.includes(state.platform); }

  function saveRecent(item) {
    state.recent = [item.url, ...state.recent.filter(u => u !== item.url)].slice(0, 8);
    persist();
  }

  function setStatus(text) {
    els.state.textContent = text;
    clearTimeout(setStatus.timer);
    setStatus.timer = setTimeout(() => { els.state.textContent = 'SYSTEM READY'; }, 1800);
  }

  function renderCategories() {
    const current = els.category.value;
    els.category.innerHTML = '<option value="all">ALL SECTORS</option>' +
      Object.entries(window.CHROSYS_CATEGORIES)
        .map(([k, v]) => `<option value="${escapeHTML(k)}">${escapeHTML(v)}</option>`).join('');
    els.category.value = Object.prototype.hasOwnProperty.call(window.CHROSYS_CATEGORIES, current) ? current : 'all';
  }

  function filtered() {
    const q = (els.search.value || '').trim().toLowerCase();
    let list = allFunctions();
    if (activeView === 'favorites') list = list.filter(x => state.favorites.has(x.url));
    if (activeView === 'recent') list = list.filter(x => state.recent.includes(x.url)).sort((a, b) => state.recent.indexOf(a.url) - state.recent.indexOf(b.url));
    if (els.category.value !== 'all') list = list.filter(x => x.category === els.category.value);
    if (q) list = list.filter(x => `${x.name} ${x.url} ${x.category} ${x.description}`.toLowerCase().includes(q));
    return list;
  }

  function card(item, index) {
    const fav = state.favorites.has(item.url);
    const compatibleClass = compatible(item) ? '' : ' restricted';
    const safeUrl = encodeURIComponent(item.url);
    return `<article class="function-card${compatibleClass}" data-risk="${escapeHTML(item.risk)}" data-url="${escapeHTML(item.url)}">
      <div class="card-head"><span class="card-index">${String(index + 1).padStart(2, '0')} // ${escapeHTML(categoryLabel(item.category))}</span><button class="favorite ${fav ? 'active' : ''}" data-action="favorite" data-url="${safeUrl}" aria-label="Favorite ${escapeHTML(item.name)}">${fav ? '◆' : '◇'}</button></div>
      <h3>${escapeHTML(item.name)}</h3><code class="url">${escapeHTML(item.url)}</code>
      <p class="desc">${escapeHTML(item.description)}</p>
      <div class="badges"><span class="badge">${escapeHTML(state.platform.toUpperCase())}</span><span class="badge">${escapeHTML(riskLabel(item.risk))}</span>${!compatible(item) ? '<span class="badge restricted">PLATFORM MISMATCH</span>' : ''}</div>
      <div class="card-actions"><button class="green-btn" data-action="start" data-url="${safeUrl}">START FUNCTION</button><button class="ghost-btn" data-action="info" data-url="${safeUrl}">DETAILS</button></div>
    </article>`;
  }

  function render() {
    const list = filtered();
    els.grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty"><strong>NO FUNCTIONS MATCH THE CURRENT VECTOR</strong>Adjust the search, sector or command view.</div>';
    const total = allFunctions().length;
    const shown = list.length;
    const restricted = allFunctions().filter(x => x.risk === 'restricted').length;
    els.summary.textContent = `${shown} SHOWN // ${total} REGISTERED // ${restricted} RESTRICTED // TARGET: ${state.platform.toUpperCase()}`;
    els.stats.textContent = `FUNCTIONS: ${total} // VIEW: ${shown} // FAV: ${state.favorites.size} // RECENT: ${state.recent.length}`;
    els.platform.value = state.platform;
    els.remember.textContent = `REMEMBER: ${state.remember ? 'ON' : 'OFF'}`;
    els.remember.setAttribute('aria-pressed', String(state.remember));
  }

  function find(url) { return allFunctions().find(x => x.url === url); }

  function openExecution(item) {
    selected = item;
    saveRecent(item);
    els.execName.textContent = item.name;
    els.execUrl.textContent = item.url;
    els.execCategory.textContent = `${categoryLabel(item.category)} // ${riskLabel(item.risk)} // ${state.platform.toUpperCase()}`;
    if (!compatible(item)) {
      els.execWarning.textContent = `This target is not catalogued for ${state.platform.toUpperCase()}. Chrome may reject the request on this environment.`;
    } else if (item.risk === 'experimental') {
      els.execWarning.textContent = 'EXPERIMENTAL SURFACE: this function may alter browser behavior or depend on feature flags. Chrome controls final access.';
    } else if (item.risk === 'restricted') {
      els.execWarning.textContent = 'RESTRICTED SURFACE: this internal page may expose sensitive browser state or be unavailable to ordinary web navigation.';
    } else {
      els.execWarning.textContent = 'Chrome internal pages are privileged browser surfaces. A normal web page may be prevented from navigating directly to this target.';
    }
    els.executionModal.hidden = false;
  }

  function openInfo(item) {
    selected = item;
    els.infoTitle.textContent = item.name;
    els.infoUrl.textContent = item.url;
    els.infoMeta.innerHTML = `<span class="badge">${escapeHTML(categoryLabel(item.category))}</span><span class="badge">${escapeHTML(riskLabel(item.risk))}</span><span class="badge">${escapeHTML((item.platforms || []).join(' / ').toUpperCase())}</span>`;
    els.infoDescription.textContent = item.description;
    els.infoDetails.textContent = item.details;
    els.infoModal.hidden = false;
  }

  function closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(x => { x.hidden = true; });
    selected = null;
  }

  function attemptOpen(item) {
    setStatus(`NAV REQUEST // ${item.url}`);
    let opened = null;
    try { opened = window.open(item.url, '_blank', 'noopener,noreferrer'); } catch (_) { opened = null; }
    if (!opened) {
      copyTarget(item, 'NAVIGATION BLOCKED // URL COPIED');
      return;
    }
    setStatus('NAVIGATION REQUEST SENT');
  }

  function copyTarget(item, successMessage = 'URL COPIED TO CLIPBOARD') {
    const fallback = () => setStatus('CLIPBOARD BLOCKED // COPY URL FROM TARGET PANEL');
    try {
      const write = navigator.clipboard?.writeText?.(item.url);
      if (write && typeof write.then === 'function') {
        write.then(() => setStatus(successMessage)).catch(fallback);
      } else fallback();
    } catch (_) { fallback(); }
  }

  function executeCommand(raw) {
    const input = raw.trim();
    if (!input) return;
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();
    activeView = 'all';
    if (cmd === 'clear') { els.command.value = ''; els.search.value = ''; render(); return; }
    if (cmd === 'favorites' || cmd === 'favs') { activeView = 'favorites'; els.search.value = ''; els.category.value = 'all'; render(); return; }
    if (cmd === 'recent') { activeView = 'recent'; els.search.value = ''; els.category.value = 'all'; render(); return; }
    if (cmd === 'open' && arg) {
      const item = allFunctions().find(x => x.url.toLowerCase() === arg || x.name.toLowerCase() === arg);
      if (item) openExecution(item); else setStatus('TARGET NOT FOUND');
      return;
    }
    if (cmd === 'info' && arg) {
      const item = allFunctions().find(x => x.url.toLowerCase() === arg || x.name.toLowerCase() === arg);
      if (item) openInfo(item); else setStatus('TARGET NOT FOUND');
      return;
    }
    if (cmd === 'category' && arg) {
      const key = Object.keys(window.CHROSYS_CATEGORIES).find(k => k === arg || window.CHROSYS_CATEGORIES[k].toLowerCase() === arg);
      if (key) { els.category.value = key; render(); } else setStatus('SECTOR NOT FOUND');
      return;
    }
    if (cmd === 'platform' && arg) {
      if (['desktop', 'android', 'webview'].includes(arg)) setPlatform(arg, true);
      else setStatus('PLATFORM UNKNOWN');
      return;
    }
    els.search.value = input.replace(/^(search\s+)/i, '');
    render();
  }

  function setPlatform(value, userAction = false) {
    state.platform = value;
    if (userAction && state.remember) persist();
    render();
    if (userAction) setStatus(`TARGET // ${value.toUpperCase()}`);
  }

  function initializePlatform() {
    if (!saved.platform || !saved.remember) els.platformModal.hidden = false;
  }

  els.grid.addEventListener('click', e => {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    let item;
    try { item = find(decodeURIComponent(button.dataset.url)); } catch (_) { item = null; }
    if (!item) return;
    if (button.dataset.action === 'favorite') {
      state.favorites.has(item.url) ? state.favorites.delete(item.url) : state.favorites.add(item.url);
      persist();
      render();
    }
    if (button.dataset.action === 'start') openExecution(item);
    if (button.dataset.action === 'info') openInfo(item);
  });

  els.search.addEventListener('input', () => { activeView = 'all'; render(); });
  els.category.addEventListener('change', () => { activeView = 'all'; render(); });
  els.command.addEventListener('keydown', e => { if (e.key === 'Enter') executeCommand(els.command.value); });
  document.querySelectorAll('.command-hints button').forEach(b => b.addEventListener('click', () => { els.command.value = b.dataset.command; executeCommand(b.dataset.command); }));
  $('#clearCommand').addEventListener('click', () => { els.command.value = ''; els.search.value = ''; activeView = 'all'; render(); els.command.focus(); });
  els.platform.addEventListener('change', e => setPlatform(e.target.value, true));
  els.remember.addEventListener('click', () => { state.remember = !state.remember; persist(); render(); });
  document.querySelectorAll('.platform-options button').forEach(b => b.addEventListener('click', () => {
    state.platform = b.dataset.platform;
    state.remember = $('#rememberInitial').checked;
    persist();
    els.platformModal.hidden = true;
    render();
    setStatus(`TARGET // ${state.platform.toUpperCase()}`);
  }));
  $('#cancelExecution').addEventListener('click', closeModals);
  $('#openTarget').addEventListener('click', () => { if (selected) attemptOpen(selected); });
  $('#copyTarget').addEventListener('click', () => { if (selected) copyTarget(selected); });
  $('#infoClose').addEventListener('click', closeModals);
  $('#infoStart').addEventListener('click', () => { if (selected) { const item = selected; closeModals(); openExecution(item); } });
  $('#importBtn').addEventListener('click', () => { els.importText.value = ''; els.importResult.hidden = true; els.importModal.hidden = false; });
  $('#cancelImport').addEventListener('click', closeModals);
  $('#runImport').addEventListener('click', () => {
    const text = els.importText.value || '';
    const matches = text.match(/(?:chrome|chrome-untrusted):\/\/[^\s<>'"\\]+/gi) || [];
    const urls = [...new Set(matches.map(x => x.replace(/[),.;]+$/, '')))];
    const base = new Set(window.CHROSYS_FUNCTIONS.map(x => x.url));
    const additions = urls.filter(u => !base.has(u) && !state.imported.some(x => x.url === u));
    state.imported.push(...additions.map((url, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: url.split('://')[1],
      url,
      category: 'experimental',
      description: 'Imported Chrome internal URL without a local CHROSys description.',
      details: 'Imported from a user-supplied Chrome URL matrix. Review the target in the current Chrome build before relying on it.',
      platforms: ['desktop', 'android', 'webview'],
      risk: 'restricted'
    })));
    persist();
    render();
    els.importResult.hidden = false;
    els.importResult.textContent = `MATRIX SCAN COMPLETE\n\nFOUND: ${urls.length}\nNEW: ${additions.length}\nKNOWN: ${urls.length - additions.length}\nTOTAL LOCAL REGISTRY: ${allFunctions().length}`;
    setStatus(`MATRIX UPDATED // +${additions.length}`);
  });
  $('#resetBtn').addEventListener('click', () => { localStorage.removeItem(KEY); location.reload(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModals();
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); els.search.focus(); }
  });

  function tick() { els.clock.textContent = new Date().toLocaleTimeString([], { hour12: false }); }
  renderCategories();
  render();
  tick();
  setInterval(tick, 1000);
  initializePlatform();
})();
