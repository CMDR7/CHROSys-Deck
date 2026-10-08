(() => {
  const $ = (s) => document.querySelector(s);
  const els = {
    grid: $('#functionGrid'), search: $('#searchInput'), category: $('#categorySelect'), command: $('#commandInput'), summary: $('#matrixSummary'), stats: $('#telemetryStats'), platform: $('#platformSelect'), remember: $('#rememberToggle'), clock: $('#clock'), state: $('#systemState'),
    platformModal: $('#platformModal'), executionModal: $('#executionModal'), infoModal: $('#infoModal'), importModal: $('#importModal'),
    execName: $('#execName'), execUrl: $('#execUrl'), execCategory: $('#execCategory'), infoTitle: $('#infoTitle'), infoUrl: $('#infoUrl'), infoMeta: $('#infoMeta'), infoDescription: $('#infoDescription'), infoDetails: $('#infoDetails'), importText: $('#importText'), importResult: $('#importResult')
  };
  const KEY = 'chrosys.deck.v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { localStorage.removeItem(KEY); }
  const state = {
    platform: saved.platform || detectPlatform(),
    remember: !!saved.remember,
    favorites: new Set(saved.favorites || []),
    recent: saved.recent || [],
    imported: saved.imported || []
  };
  let selected = null;
  let activeView = 'all';

  function detectPlatform() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return /wv|; wv\)/i.test(ua) ? 'webview' : 'android';
    return 'desktop';
  }
  function persist() {
    localStorage.setItem(KEY, JSON.stringify({platform:state.platform,remember:state.remember,favorites:[...state.favorites],recent:state.recent,imported:state.imported}));
  }
  function allFunctions() {
    const base = window.CHROSYS_FUNCTIONS.map(x => ({...x, imported:false}));
    const extra = state.imported.filter(x => !base.some(b => b.url === x.url)).map(x => ({...x, imported:true}));
    return base.concat(extra);
  }
  function categoryLabel(c) { return window.CHROSYS_CATEGORIES[c] || c.toUpperCase(); }
  function riskLabel(r) { return r === 'experimental' ? 'EXPERIMENTAL' : r === 'restricted' ? 'RESTRICTED' : 'DIAGNOSTIC'; }
  function compatible(item) { return !item.platforms || item.platforms.includes(state.platform); }
  function saveRecent(item) {
    state.recent = [item.url, ...state.recent.filter(u => u !== item.url)].slice(0,8);
    persist();
  }
  function setStatus(text) { els.state.textContent = text; setTimeout(() => els.state.textContent = 'SYSTEM READY', 1400); }
  function renderCategories() {
    const current = els.category.value;
    els.category.innerHTML = '<option value="all">ALL SECTORS</option>' + Object.entries(window.CHROSYS_CATEGORIES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
    els.category.value = window.CHROSYS_CATEGORIES[current] ? current : 'all';
  }
  function filtered() {
    const q = (els.search.value || '').trim().toLowerCase();
    let list = allFunctions();
    if (activeView === 'favorites') list = list.filter(x => state.favorites.has(x.url));
    if (activeView === 'recent') list = list.filter(x => state.recent.includes(x.url)).sort((a,b) => state.recent.indexOf(a.url)-state.recent.indexOf(b.url));
    if (els.category.value !== 'all') list = list.filter(x => x.category === els.category.value);
    if (q) list = list.filter(x => `${x.name} ${x.url} ${x.category} ${x.description}`.toLowerCase().includes(q));
    return list;
  }
  function card(item, index) {
    const fav = state.favorites.has(item.url);
    const compatibleClass = compatible(item) ? '' : ' restricted';
    return `<article class="function-card${compatibleClass}" data-risk="${item.risk}" data-url="${item.url}">
      <div class="card-head"><span class="card-index">${String(index+1).padStart(2,'0')} // ${categoryLabel(item.category)}</span><button class="favorite ${fav?'active':''}" data-action="favorite" data-url="${encodeURIComponent(item.url)}" aria-label="Favorite ${item.name}">${fav?'◆':'◇'}</button></div>
      <h3>${item.name}</h3><code class="url">${item.url}</code>
      <p class="desc">${item.description}</p>
      <div class="badges"><span class="badge">${state.platform.toUpperCase()}</span><span class="badge">${riskLabel(item.risk)}</span>${!compatible(item)?'<span class="badge restricted">PLATFORM MISMATCH</span>':''}</div>
      <div class="card-actions"><button class="green-btn" data-action="start" data-url="${encodeURIComponent(item.url)}">START FUNCTION</button><button class="ghost-btn" data-action="info" data-url="${encodeURIComponent(item.url)}">DETAILS</button></div>
    </article>`;
  }
  function render() {
    const list = filtered();
    els.grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty"><strong>NO FUNCTIONS MATCH THE CURRENT VECTOR</strong>Adjust the search, sector, platform or command view.</div>';
    const total = allFunctions().length, shown = list.length, restricted = allFunctions().filter(x => x.risk === 'restricted').length;
    els.summary.textContent = `${shown} SHOWN // ${total} REGISTERED // ${restricted} RESTRICTED // TARGET: ${state.platform.toUpperCase()}`;
    els.stats.textContent = `FUNCTIONS: ${total} // VIEW: ${shown} // FAV: ${state.favorites.size} // RECENT: ${state.recent.length}`;
    els.platform.value = state.platform;
    els.remember.textContent = `REMEMBER: ${state.remember ? 'ON' : 'OFF'}`;
    els.remember.setAttribute('aria-pressed', String(state.remember));
  }
  function find(url) { return allFunctions().find(x => x.url === url); }
  function openExecution(item) {
    selected = item; saveRecent(item); els.execName.textContent = item.name; els.execUrl.textContent = item.url; els.execCategory.textContent = `${categoryLabel(item.category)} // ${riskLabel(item.risk)} // ${state.platform.toUpperCase()}`; els.executionModal.hidden = false;
  }
  function openInfo(item) {
    selected = item; els.infoTitle.textContent = item.name; els.infoUrl.textContent = item.url; els.infoMeta.innerHTML = `<span class="badge">${categoryLabel(item.category)}</span><span class="badge">${riskLabel(item.risk)}</span><span class="badge">${item.platforms.join(' / ').toUpperCase()}</span>`; els.infoDescription.textContent = item.description; els.infoDetails.textContent = item.details; els.infoModal.hidden = false;
  }
  function closeModals() { document.querySelectorAll('.modal-backdrop').forEach(x => x.hidden = true); selected = null; }
  function attemptOpen(item) {
    setStatus(`NAV REQUEST // ${item.url}`);
    try { window.open(item.url, '_blank', 'noopener'); } catch (_) { setStatus('NAVIGATION BLOCKED // COPY URL'); }
  }
  function copyTarget(item) {
    const write = navigator.clipboard?.writeText?.(item.url);
    if (write && typeof write.then === 'function') write.then(() => setStatus('URL COPIED TO CLIPBOARD')).catch(() => setStatus('COPY BLOCKED // SELECT URL MANUALLY'));
    else setStatus('CLIPBOARD API UNAVAILABLE // SELECT URL MANUALLY');
  }
  function executeCommand(raw) {
    const input = raw.trim(); if (!input) return;
    const parts = input.split(/\s+/), cmd = parts[0].toLowerCase(), arg = parts.slice(1).join(' ').toLowerCase();
    activeView = 'all';
    if (cmd === 'clear') { els.command.value=''; els.search.value=''; render(); return; }
    if (cmd === 'favorites' || cmd === 'favs') { activeView='favorites'; els.search.value=''; els.category.value='all'; render(); return; }
    if (cmd === 'recent') { activeView='recent'; els.search.value=''; els.category.value='all'; render(); return; }
    if (cmd === 'open' && arg) { const item = allFunctions().find(x => x.url === arg || x.name.toLowerCase() === arg); if(item) openExecution(item); else setStatus('TARGET NOT FOUND'); return; }
    if (cmd === 'info' && arg) { const item = allFunctions().find(x => x.url === arg || x.name.toLowerCase() === arg); if(item) openInfo(item); else setStatus('TARGET NOT FOUND'); return; }
    if (cmd === 'category' && arg) { const key = Object.keys(window.CHROSYS_CATEGORIES).find(k => k === arg || window.CHROSYS_CATEGORIES[k].toLowerCase() === arg); if(key){els.category.value=key; render();} else setStatus('SECTOR NOT FOUND'); return; }
    if (cmd === 'platform' && arg) { if(['desktop','android','webview'].includes(arg)){setPlatform(arg,true);} else setStatus('PLATFORM UNKNOWN'); return; }
    els.search.value = input.replace(/^(search\s+)/i,''); render();
  }
  function setPlatform(value, userAction=false) {
    state.platform = value;
    if (userAction && state.remember) persist();
    render();
    if (userAction) setStatus(`TARGET // ${value.toUpperCase()}`);
  }
  function initializePlatform() {
    if (!saved.platform || !saved.remember) els.platformModal.hidden = false;
  }

  els.grid.addEventListener('click', e => {
    const button = e.target.closest('[data-action]'); if(!button) return;
    const item = find(decodeURIComponent(button.dataset.url)); if(!item) return;
    if(button.dataset.action === 'favorite') { state.favorites.has(item.url) ? state.favorites.delete(item.url) : state.favorites.add(item.url); persist(); render(); }
    if(button.dataset.action === 'start') openExecution(item);
    if(button.dataset.action === 'info') openInfo(item);
  });
  els.search.addEventListener('input', () => { activeView='all'; render(); });
  els.category.addEventListener('change', () => { activeView='all'; render(); });
  els.command.addEventListener('keydown', e => { if(e.key==='Enter') executeCommand(els.command.value); });
  document.querySelectorAll('.command-hints button').forEach(b => b.addEventListener('click', () => { els.command.value=b.dataset.command; executeCommand(b.dataset.command); }));
  $('#clearCommand').addEventListener('click', () => { els.command.value=''; els.search.value=''; activeView='all'; render(); els.command.focus(); });
  els.platform.addEventListener('change', e => setPlatform(e.target.value,true));
  els.remember.addEventListener('click', () => { state.remember=!state.remember; persist(); render(); });
  document.querySelectorAll('.platform-options button').forEach(b => b.addEventListener('click', () => { state.platform=b.dataset.platform; state.remember=$('#rememberInitial').checked; persist(); els.platformModal.hidden=true; render(); setStatus(`TARGET // ${state.platform.toUpperCase()}`); }));
  $('#cancelExecution').addEventListener('click', closeModals);
  $('#openTarget').addEventListener('click', () => { if(selected) attemptOpen(selected); });
  $('#copyTarget').addEventListener('click', () => { if(selected) copyTarget(selected); });
  $('#infoClose').addEventListener('click', closeModals);
  $('#infoStart').addEventListener('click', () => { if(selected){const item=selected; closeModals(); openExecution(item);} });
  $('#importBtn').addEventListener('click', () => { els.importText.value=''; els.importResult.hidden=true; els.importModal.hidden=false; });
  $('#cancelImport').addEventListener('click', closeModals);
  $('#runImport').addEventListener('click', () => {
    const text = els.importText.value || '';
    const matches = text.match(/(?:chrome|chrome-untrusted):\/\/[^\s<>'"\\]+/gi) || [];
    const urls = [...new Set(matches.map(x => x.replace(/[),.;]+$/,'')))];
    const base = new Set(window.CHROSYS_FUNCTIONS.map(x=>x.url));
    const additions = urls.filter(u=>!base.has(u) && !state.imported.some(x=>x.url===u));
    state.imported.push(...additions.map((url,i)=>({id:`imported-${Date.now()}-${i}`,name:url.split('://')[1],url,category:'experimental',description:'Imported Chrome internal URL without a local CHROSys description.',details:'Imported from a user-supplied Chrome URL matrix. Review the target in the current Chrome build before relying on it.',platforms:['desktop','android','webview'],risk:'restricted'})));
    persist(); render();
    els.importResult.hidden=false; els.importResult.textContent=`MATRIX SCAN COMPLETE\n\nFOUND: ${urls.length}\nNEW: ${additions.length}\nKNOWN: ${urls.length-additions.length}\nTOTAL LOCAL REGISTRY: ${allFunctions().length}`;
    setStatus(`MATRIX UPDATED // +${additions.length}`);
  });
  $('#resetBtn').addEventListener('click', () => { localStorage.removeItem(KEY); location.reload(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModals(); if(e.key==='/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'){e.preventDefault();els.search.focus();} });
  function tick(){ els.clock.textContent = new Date().toLocaleTimeString([], {hour12:false}); }
  renderCategories(); render(); tick(); setInterval(tick,1000); initializePlatform();
})();
