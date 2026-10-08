(() => {
  window.CHROSYS_IMPORT = text => {
    const s=window.CHROSYS_STATE, matches=text.match(/(?:chrome|chrome-untrusted):\/\/[^\s<>'"\\]+/gi)||[], urls=[...new Set(matches.map(x=>x.replace(/[),.;]+$/,'')))], base=new Set(window.CHROSYS_FUNCTIONS.map(x=>x.url)), additions=urls.filter(u=>!base.has(u)&&!s.imported.some(x=>x.url===u));
    s.imported.push(...additions.map((url,i)=>({id:`imported-${Date.now()}-${i}`,name:url.split('://')[1],url,category:'experimental',description:'Imported Chrome internal URL without a local CHROSys description.',details:'Imported from a user-supplied Chrome URL matrix. Review the target in the current Chrome build before relying on it.',platforms:['desktop','android','webview'],risk:'restricted'})));
    window.CHROSYS_PERSIST(); return {found:urls.length,newCount:additions.length,total:base.size+s.imported.length};
  };
})();