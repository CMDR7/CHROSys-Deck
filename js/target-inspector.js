(() => {
  window.CHROSYS_TARGET = { current:null, select(item){ this.current=item; window.CHROSYS_STATE.selected=item?.url||null; window.CHROSYS_ROUTER.go('target'); window.dispatchEvent(new CustomEvent('chrosys:target',{detail:item})); } };
})();