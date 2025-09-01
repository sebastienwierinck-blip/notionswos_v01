<script>
(function(){
  const STEP_RATIO = 0.9;

  // --- utils ---
  const toNoDash = id => id.replace(/-/g,'').replace(/^#?block-/, '');
  const toDashed = id => {
    const x = toNoDash(id);
    if (x.length !== 32) return id;
    return `${x.slice(0,8)}-${x.slice(8,12)}-${x.slice(12,16)}-${x.slice(16,20)}-${x.slice(20)}`;
  };

  function findById(raw){
    const a = toDashed(raw), b = toNoDash(raw);
    // 1) direct match data-block-id (dashed)
    let el = document.querySelector(`.notion-collection[data-block-id="${a}"]`);
    if (el) return el;
    // 2) direct match data-block-id (no dash)
    el = document.querySelector(`.notion-collection[data-block-id="${b}"]`);
    if (el) return el;
    // 3) partir de l’ancre #block-… puis remonter jusqu’à la collection
    const anchor = document.querySelector(`#block-${b}`) || document.querySelector(`#${a}`);
    if (anchor){
      const col = anchor.closest('.notion-collection, .notion-collection_view, [class*="collection"]');
      if (col) return col;
    }
    // 4) secours : n’importe quelle collection qui contient ce block-id dans l’arbre
    return document.querySelector(`.notion-collection [data-block-id="${a}"], .notion-collection [data-block-id="${b}"]`)?.closest('.notion-collection') || null;
  }

  function getScrollContainer(base){
    if (!base) return null;
    // on cherche le conteneur qui contient plusieurs .notion-collection-item
    const candidates = [base, ...base.querySelectorAll(':scope *')];
    for (const c of candidates){
      const items = c.querySelectorAll('.notion-collection-item');
      if (items.length >= 2) return c;
    }
    return base;
  }

  function makeWrap(scroller){
    if (scroller.closest('.gallery-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'gallery-wrap gallery--nav';
    const prev = document.createElement('button'); prev.className = 'nav-btn nav-prev'; prev.ariaLabel='Précédent';
    const next = document.createElement('button'); next.className = 'nav-btn nav-next'; next.ariaLabel='Suivant';
    const parent = scroller.parentNode;
    parent.insertBefore(wrap, scroller);
    wrap.appendChild(scroller); wrap.appendChild(prev); wrap.appendChild(next);
    const step = () => Math.max(100, scroller.clientWidth * STEP_RATIO);
    prev.addEventListener('click', ()=> scroller.scrollBy({left:-step(), behavior:'smooth'}));
    next.addEventListener('click', ()=> scroller.scrollBy({left: step(), behavior:'smooth'}));
  }

  function enhanceById(rawId, size='gallery--large'){
    const host = findById(rawId);
    if (!host) return false;
    const scroller = getScrollContainer(host);
    scroller.classList.add('gallery-horizontal');
    scroller.classList.remove('gallery--large','gallery--medium','gallery--small');
    scroller.classList.add(size);
    makeWrap(scroller);
    return true;
  }

  function init(){
    // —— CONFIG ICI : mets tes IDs (avec ou sans #block-, peu importe)
    const targets = [
      "17895fdcc23e8026b341eeff283aa7ad" // ton ID communiqué
      // ajoute d'autres IDs si besoin
    ];
    targets.forEach(id => enhanceById(id, 'gallery--large'));
  }

  (document.readyState==='loading') ? document.addEventListener('DOMContentLoaded', init) : init();
  // re-init si Super recharge la page dynamiquement
  const obs = new MutationObserver(() => setTimeout(init,120));
  obs.observe(document.documentElement, {childList:true, subtree:true});
})();
</script>
