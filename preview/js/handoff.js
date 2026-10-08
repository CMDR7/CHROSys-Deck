(() => {
  const status = msg => window.dispatchEvent(new CustomEvent('chrosys:status',{detail:msg}));
  window.CHROSYS_HANDOFF = {
    attempt(item){
      if(!item) return;
      let opened=null;
      try { opened=window.open(item.url,'_blank','noopener,noreferrer'); } catch (_) {}
      if(opened){ status('NAVIGATION REQUEST SENT // VERIFY TARGET'); return; }
      status('DIRECT WEB LAUNCH BLOCKED // COPY TARGET');
    },
    copy(item){
      if(!item) return;
      const done=()=>status('TARGET COPIED TO CLIPBOARD');
      const fail=()=>status('CLIPBOARD UNAVAILABLE // SELECT TARGET MANUALLY');
      try { const p=navigator.clipboard?.writeText?.(item.url); if(p?.then) p.then(done).catch(fail); else fail(); } catch(_){fail();}
    }
  };
})();