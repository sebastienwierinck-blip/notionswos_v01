<script>
/* Gallery Module – Super.so/Notion
   - Opt-in: n’active que les galeries listées dans la config
   - Tailles: gallery--large / --medium / --small
   - Options: boutons, autoplay
   - Configuration via un <script type="application/json" id="sw-gallery-config"> (voir plus bas)
*/
(function(){
  const STEP_RATIO = 0.9; // clic = ~90% de la largeur visible

  function readConfig(){
    try{
      const el = document.getElementById('sw-gallery-config');
      return el ? JSON.parse(el.textContent) : { targets:[], autoplay:false, interval:4000 };
    }catch(e){ return { targets:[], autoplay:false, interval:4000 }; }
  }

  function makeWrap(collectionEl){
    if (collectionEl.closest('.gallery-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'gallery-wrap gallery--nav';
    const prev = document.createElement('button');
    prev.className = 'nav-btn nav-prev'; prev.setAttribute('aria-label','Précédent');
    const next = document.createElement('button');
    next.className = 'nav-btn nav-next'; next.setAttribute('aria-label','Suivant');
    const parent = collectionEl.parentNode;
    parent.insertBefore(wrap, collectionEl);
    wrap.appendChild(collectionEl); wrap.appendChild(prev); wrap.appendChild(next);
    prev.addEventListener('click', ()=>scrollByStep(collectionEl, -1));
    next.addEventListener('click', ()=>scrollByStep(collectionEl,  1));
  }

  function scrollByStep(el, dir){
    const step = Math.max(100, el.clientWidth * STEP_RATIO);
    el.scrollBy({ left: dir*step, behavior: 'smooth' });
  }

  function enhance(el, sizeClass){
    el.classList.add('gallery-horizontal');
    el.classList.remove('gallery--large','gallery--medium','gallery--small');
    el.classList.add(sizeClass || 'gallery--medium');
    makeWrap(el);
  }

  function initOnce(cfg){
    // n’active QUE les IDs ciblés
    (cfg.targets||[]).forEach(t=>{
      if (!t.id) return;
      const el = document.querySelector(`.notion-collection[data-block-id="${t.id}"]`);
      if (el) enhance(el, t.size);
    });

    // autoplay (optionnel)
    if (cfg.autoplay){
      (cfg.targets||[]).forEach(t=>{
        const el = document.querySelector(`.notion-collection[data-block-id="${t.id}"]`);
        if (!el) return;
        let timer = setInterval(()=>scrollByStep(el, 1), Math.max(2000, cfg.interval||4000));
        el.addEventListener('mouseenter', ()=>clearInterval(timer));
        el.addEventListener('mouseleave', ()=>{
          timer = setInterval(()=>scrollByStep(el, 1), Math.max(2000, cfg.interval||4000));
        });
      });
    }
  }

  function init(){
    const cfg = readConfig();
    initOnce(cfg);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-init si Super recharge la page en PJAX
  const obs = new MutationObserver((muts)=>{
    if (muts.some(m=>[...m.addedNodes].some(n => n.nodeType===1 && n.matches?.('.notion-collection,[data-block-id]')))){
      setTimeout(init, 120);
    }
  });
  obs.observe(document.documentElement, { childList:true, subtree:true });
})();
</script>
