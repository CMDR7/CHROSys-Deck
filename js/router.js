(() => {
  const views=['matrix','target','ingestion','settings'];
  const normalize = v => views.includes(v) ? v : 'matrix';
  const render = () => { const v=normalize(location.hash.replace('#/','')); window.CHROSYS_STATE.route=v; document.querySelectorAll('[data-view]').forEach(el=>el.hidden=el.dataset.view!==v); document.querySelectorAll('[data-route]').forEach(el=>el.classList.toggle('active',el.dataset.route===v)); window.dispatchEvent(new CustomEvent('chrosys:route',{detail:v})); };
  window.CHROSYS_ROUTER={go:v=>{location.hash='/'+normalize(v)}, render};
  window.addEventListener('hashchange',render); render();
})();