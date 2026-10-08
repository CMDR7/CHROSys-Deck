(() => {
  const detect = () => { const ua=navigator.userAgent||''; if(/Android/i.test(ua)) return /wv|; wv\)/i.test(ua)?'webview':'android'; return 'desktop'; };
  window.CHROSYS_PLATFORM = { detect, isStandalone: () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true };
})();