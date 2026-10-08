/** Keep the interactive workspace aligned with the visible phone viewport. */
export function initMobileWorkspace() {
  let baseline=window.innerHeight;
  const update=()=>{
    const viewport=window.visualViewport;
    const height=Math.round(viewport?.height||window.innerHeight);
    baseline=Math.max(baseline,window.innerHeight);
    document.documentElement.style.setProperty('--app-height',height+'px');
    const editing=/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName||'');
    document.body.dataset.keyboard=String(editing&&height<baseline*.78);
  };
  window.addEventListener('resize',update);
  window.visualViewport?.addEventListener('resize',update);
  document.addEventListener('focusin',update);document.addEventListener('focusout',update);
  update();
}
export function setMobileLayout(route,phase='prepare') {
  document.body.dataset.layout=route==='/studio'?'studio':route==='/ruang'?'room':route==='/buat'?'capture':'default';
  document.body.dataset.capturePhase=phase;
}
