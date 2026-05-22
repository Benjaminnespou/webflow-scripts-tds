console.log("🟢 V3: SCRIPT BLINDÉ, ANTI-FANTÔMES ET SCROLL FIXÉ !");

//
// OSMO PAGE TRANSITION BOILERPLATE
//
gsap.registerPlugin(CustomEase, Observer, ScrollTrigger, ScrambleTextPlugin, SplitText, Draggable);

history.scrollRestoration = "manual";
let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;

rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);
let staggerDefault = 0.05;
let durationDefault = 0.6;
CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

// --- LE BOUCLIER ANTI-CRASH ---
// Cette fonction empêche une erreur JS isolée de casser tout le site et de créer des pages fantômes
function safeInit(fn, ...args) {
  try { fn(...args); } catch (err) { console.warn(`⚠️ Erreur ignorée dans l'effet ${fn.name}:`, err); }
}

//
// FUNCTION REGISTRY
//
function initOnceFunctions() {
  initLenis();
  if (hasLenis && lenis) lenis.start(); // Débloque le scroll immédiatement en cas de hard-reload (Page Event)
  
  safeInit(initLogoRevealLoader);
  safeInit(initFooterDeformation, document); // Le footer est global, on l'initialise ici (sans le blur)

  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  safeInit(initTwostepScalingNavigation);
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  
  // Effets globaux (Document-wide)
  safeInit(initScrambleOnHover, document);
  safeInit(addMagneticEffect, document);
  safeInit(initDraggableStickers, document);
  
  // Effets spécifiques aux conteneurs de page
  safeInit(initHighlightMarkerTextReveal, next);
  safeInit(initFooterParallax, next);
  safeInit(initRectangleReveal, next);
  safeInit(initScrambleOnLoad, next);
  safeInit(initScrambleOnScroll, next);
  safeInit(initMwg026Effect, next);
  safeInit(initMouseTrailEffect, next);
  safeInit(initCSSMarquee, next);
  safeInit(initMwg005AboutScroll, next);
  safeInit(initMaskTextScrollReveal, next);
  safeInit(initMwg008TeamCarousel, next);
  safeInit(initPixelatedImageReveal, next);
  safeInit(initPixelatedScrollTransition, next);
  safeInit(initPixelReveal, next);
  safeInit(initTitleReveal, next);
  safeInit(initEventCarousel, next);
  safeInit(initPreviewFollower, next);

  // Forcer la réinitialisation du moteur natif Webflow IX2
  if (window.Webflow && window.Webflow.require) {
    try {
      window.Webflow.destroy();
      window.Webflow.ready();
      window.Webflow.require('ix2').init();
    } catch(e) {}
  }
}

//
// PAGE TRANSITIONS (Osmo Pixel Grid)
//
const pixelHorizontalAmount = 12;
const transitionDuration = 1;
const pixelFadeDuration = 0.2;
const pixelOverlap = 0.3;

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();
  tl.call(() => { resetPage(next); }, null, 0);
  return tl;
}

function runPageLeaveAnimation(current, next) {
  const tl = gsap.timeline();
  if (reducedMotion) {
    tl.set(current, { autoAlpha: 0 });
    tl.call(() => current.remove(), null, 0);
    return tl;
  }

  const isPortrait = window.innerHeight > window.innerWidth;
  pixelGrid(isPortrait);
  
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
  const lines = Array.from(transitionPanel.querySelectorAll("[data-transition-col]"));
  const allPixels = transitionPanel.querySelectorAll("[data-transition-pixel]");
  const overlap = Math.max(0, Math.min(1, pixelOverlap));
  
  const clipFrom = isPortrait ? "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
  const clipTo = isPortrait ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  
  const clipStart = Math.min(pixelFadeDuration, transitionDuration * 0.5);
  const clipDuration = Math.max(0.001, transitionDuration - 2 * clipStart);
  const stepDur = clipDuration / Math.max(1, pixelHorizontalAmount);
  const transitionEndDelay = transitionDuration / Math.max(1, pixelHorizontalAmount);
  
  gsap.set(allPixels, { opacity: 0, willChange: "opacity" });
  gsap.set(transitionPanel, { opacity: 1, willChange: "opacity" });
  gsap.set(next, {
    autoAlpha: 1, clipPath: clipFrom, webkitClipPath: clipFrom,
    willChange: "clip-path", force3D: true, maxHeight: "100dvh"
  });

  lines.forEach((line, i) => {
    const pixels = Array.from(line.querySelectorAll("[data-transition-pixel]"));
    if (!pixels.length) return;
    
    const revealTime = clipStart + i * stepDur;
    const fillStart = Math.max(0, revealTime - pixelFadeDuration);
    const fadeStart = Math.min(transitionDuration, revealTime + stepDur);
    const perPixelMin = pixelFadeDuration / pixels.length;
    const perPixelDur = perPixelMin * (1 - overlap) + pixelFadeDuration * overlap;
    const spread = Math.max(0, pixelFadeDuration - perPixelDur);
    
    tl.to(pixels, { opacity: 1, duration: Math.max(0.001, perPixelDur), ease: "none", stagger: { amount: spread, from: "random" } }, fillStart);
    tl.to(pixels, { opacity: 0, duration: Math.max(0.001, perPixelDur), ease: "none", stagger: { amount: spread, from: "random" } }, fadeStart);
  });

  tl.to(next, { clipPath: clipTo, webkitClipPath: clipTo, ease: `steps(${pixelHorizontalAmount}, start)`, duration: clipDuration }, clipStart);
  tl.set(next, { clearProps: "clipPath,webkitClipPath,willChange,force3D,maxHeight" }, clipStart + clipDuration);
  tl.call(() => { current.remove(); }, null, transitionDuration + transitionEndDelay);
  tl.set(allPixels, { clearProps: "willChange" }, transitionDuration + transitionEndDelay);
  tl.set(transitionPanel, { clearProps: "willChange" }, transitionDuration + transitionEndDelay);
  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();
  const transitionEndDelay = transitionDuration / Math.max(1, pixelHorizontalAmount);
  
  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }
  
  tl.add("pageReady", transitionDuration + transitionEndDelay);
  tl.call(resetPage, [next], "pageReady");
  return new Promise((resolve) => { tl.call(resolve, null, "pageReady"); });
}

function pixelGrid(isPortrait) {
  const panel = document.querySelector("[data-transition-panel]");
  if (!panel) return;
  const rect = panel.getBoundingClientRect();
  panel.style.flexDirection = isPortrait ? "column" : "row";
  
  const lineSizePx = isPortrait ? rect.height / pixelHorizontalAmount : rect.width / pixelHorizontalAmount;
  const crossAmount = Math.ceil((isPortrait ? rect.width : rect.height) / lineSizePx);
  
  let lines = panel.querySelectorAll("[data-transition-col]");
  const lineTemplate = lines[0];
  const pixelTemplate = lineTemplate.querySelector("[data-transition-pixel]");
  
  if (lines.length !== pixelHorizontalAmount) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < pixelHorizontalAmount; i++) frag.appendChild(lineTemplate.cloneNode(false));
    panel.replaceChildren(frag);
  }
  
  lines = panel.querySelectorAll("[data-transition-col]");
  lines.forEach((line) => {
    line.style.flexDirection = isPortrait ? "row" : "column";
    line.style.flex = "1 1 auto";
    line.style.justifyContent = "center";
    
    const diff = crossAmount - line.childElementCount;
    if (diff > 0) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < diff; i++) frag.appendChild(pixelTemplate.cloneNode(true));
      line.appendChild(frag);
    } else if (diff < 0) {
      for (let i = diff; i < 0; i++) line.lastElementChild.remove();
    }
  });
}

//
// BARBA HOOKS + INIT
//
barba.hooks.beforeEnter(data => {
  gsap.set(data.next.container, { position: "fixed", top: 0, left: 0, right: 0 });
  if (lenis && typeof lenis.stop === "function") lenis.stop();
  
  const navStatusEl = document.querySelector("[data-nav-status]");
  if (navStatusEl) navStatusEl.setAttribute("data-nav-status", "not-active");

  initBeforeEnterFunctions(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  // FIX MAJEUR DOM : On vide le cache Barba pour forcer un HTML neuf. 
  // Sans ça, les effets comme Rectangle Reveal refusent de s'appliquer car ils croient avoir déjà wrappé le texte.
  barba.cache.clear(); 
});

barba.hooks.enter(data => { initBarbaNavUpdate(data); });

barba.hooks.afterEnter(data => {
  // LE NETTOYEUR DE FANTÔMES ABSOLU : Si une erreur se produit, on force la suppression de TOUS les anciens containers
  const containers = document.querySelectorAll('[data-barba="container"]');
  if (containers.length > 1) {
      for (let i = 0; i < containers.length - 1; i++) {
          containers[i].remove();
      }
  }

  initAfterEnterFunctions(data.next.container);
});

barba.init({
  debug: true,
  timeout: 7000,
  preventRunning: true,
  transitions: [{
    name: "default",
    sync: true,
    async once(data) {
      initOnceFunctions();
      initAfterEnterFunctions(data.next.container);
      return runPageOnceAnimation(data.next.container);
    },
    async leave(data) { 
      return runPageLeaveAnimation(data.current.container, data.next.container); 
    },
    async enter(data) { 
      return runPageEnterAnimation(data.next.container); 
    }
  }]
});

//
// GENERIC + HELPERS
//
function initLenis() {
  if (lenis || !hasLenis) return;
  lenis = new Lenis({ lerp: 0.05, wheelMultiplier: 1 });
  if (hasScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  if (hasLenis) { lenis.resize(); lenis.start(); }
  
  // FIX SCROLLTRIGGERS : On rafraîchit impérativement APRÈS avoir enlevé le position: fixed
  // Sinon, Rectangle Reveal et mwg005 se croient tous à la position Y = 0.
  setTimeout(() => {
    if (hasScrollTrigger) ScrollTrigger.refresh();
  }, 50);
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');
  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) curr.setAttribute('aria-current', newStatus);
    else curr.removeAttribute('aria-current');
    curr.setAttribute('class', next.getAttribute('class') || '');
  });
}

//
// EFFECTS
//

/* HIGHLIGHT MARKER REVEAL */
function initHighlightMarkerTextReveal(container = document) {
  const defaults = { direction: "right", theme: "blue", scrollStart: "top 95%", staggerStart: "start", stagger: 100, barDuration: 0.9, barEase: "power3.inOut" };
  const colorMap = { pink: "#350AFF", white: "#FFFFFF" };
  const directionMap = { right: { prop: "scaleX", origin: "right center" }, left: { prop: "scaleX", origin: "left center" }, up: { prop: "scaleY", origin: "center top" }, down: { prop: "scaleY", origin: "center bottom" } };
  
  function resolveColor(value) {
    if (colorMap[value]) return colorMap[value];
    if (value.startsWith("--")) return getComputedStyle(document.body).getPropertyValue(value).trim() || value;
    return value;
  }
  
  function createBar(color, origin) {
    const bar = document.createElement("div");
    bar.className = "highlight-marker-bar";
    Object.assign(bar.style, { backgroundColor: color, transformOrigin: origin });
    return bar;
  }

  let reduceMotion = false;
  gsap.matchMedia().add({ reduce: "(prefers-reduced-motion: reduce)" }, (context) => { reduceMotion = context.conditions.reduce; });
  if (reduceMotion) {
    container.querySelectorAll("[data-highlight-marker-reveal]").forEach((el) => gsap.set(el, { autoAlpha: 1 }));
    return;
  }

  container.querySelectorAll("[data-highlight-marker-reveal]").forEach((el) => {
    const direction = el.getAttribute("data-marker-direction") || defaults.direction;
    const theme = el.getAttribute("data-marker-theme") || defaults.theme;
    const scrollStart = el.getAttribute("data-marker-scroll-start") || defaults.scrollStart;
    const staggerStart = el.getAttribute("data-marker-stagger-start") || defaults.staggerStart;
    const staggerOffset = (parseFloat(el.getAttribute("data-marker-stagger")) || defaults.stagger) / 1000;
    const color = resolveColor(theme);
    const dirConfig = directionMap[direction] || directionMap.right;
    
    SplitText.create(el, {
      type: "lines", linesClass: "highlight-marker-line", autoSplit: true,
      onSplit(self) {
        el.querySelectorAll(".highlight-marker-bar").forEach((bar) => bar.remove());
        const lines = self.lines;
        const tl = gsap.timeline({ paused: true });
        lines.forEach((line, i) => {
          gsap.set(line, { position: "relative", overflow: "hidden" });
          const bar = createBar(color, dirConfig.origin);
          line.appendChild(bar);
          const staggerIndex = staggerStart === "end" ? lines.length - 1 - i : i;
          tl.to(bar, { [dirConfig.prop]: 0, duration: defaults.barDuration, ease: defaults.barEase }, staggerIndex * staggerOffset);
        });
        gsap.set(el, { autoAlpha: 1 });
        ScrollTrigger.create({ trigger: el, start: scrollStart, once: true, onEnter: () => tl.play() });
      }
    });
  });
}

/* FOOTER PARALLAX */
function initFooterParallax(container = document){
  container.querySelectorAll('[data-footer-parallax]').forEach(el => {
    if (el._parallaxInit) return;
    el._parallaxInit = true;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'clamp(top bottom)', end: 'clamp(top top)', scrub: true, invalidateOnRefresh: true } });
    const inner = el.querySelector('[data-footer-parallax-inner]');
    const dark = el.querySelector('[data-footer-parallax-dark]');
    
    if (inner) tl.fromTo(inner, { yPercent: -55 }, { yPercent: 0, ease: 'power1.in' });
    if (dark) tl.fromTo(dark, { opacity: 0.3 }, { opacity: 0, ease: 'power1.in' }, '<');
  });
}

/* RECTANGLE REVEAL */
function initRectangleReveal(container = document) {
  const CONFIG = { duration: 1, ease: "power2.inOut", color: "#350AFF", startScrub: "top 80%" };
  container.querySelectorAll('[data-effect="swipe-reveal"]').forEach((text) => {
    // Si Barba cache la page, on ignore le re-wrap
    if (text._swipeRevealInit) return;
    text._swipeRevealInit = true;
    
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative"; 
    wrapper.style.display = "inline-block";
    wrapper.style.overflow = "hidden";
    text.parentNode.insertBefore(wrapper, text); 
    wrapper.appendChild(text);
    
    const overlay = document.createElement("div");
    overlay.style.position = "absolute"; 
    overlay.style.top = "0"; 
    overlay.style.left = "0"; 
    overlay.style.width = "100%"; 
    overlay.style.height = "100%";
    overlay.style.backgroundColor = CONFIG.color; 
    overlay.style.transform = "scaleX(0)"; 
    overlay.style.transformOrigin = "left"; 
    overlay.style.zIndex = "2";
    wrapper.appendChild(overlay);
    
    gsap.set(text, { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: wrapper, start: CONFIG.startScrub, toggleActions: "play none none reverse" } });
    tl.to(overlay, { duration: CONFIG.duration / 2, scaleX: 1, transformOrigin: "left", ease: CONFIG.ease })
      .set(text, { autoAlpha: 1 })
      .to(overlay, { duration: CONFIG.duration / 2, scaleX: 0, transformOrigin: "right", ease: CONFIG.ease });
  });
}

/* MAGNETIC HOVER */
function addMagneticEffect(container = document) {
  if (!window.gsap || !window.Draggable) return;
  const stickers = container.querySelectorAll('[data-sticker="item"]');
  if (!stickers.length) return;
  const maxMovePx = 5, stepPx = 1, exponent = 0.9, followDuration = 0.22, returnDuration = 0.28, ease = "power3.out";
  const soften = (t) => Math.sign(t) * Math.pow(Math.abs(t), exponent);
  const quant = (v) => Math.round(v / stepPx) * stepPx;
  
  stickers.forEach((sticker) => {
    if (sticker._magneticInit) return;
    sticker._magneticInit = true;
    gsap.set(sticker, { xPercent: 0, yPercent: 0 });
    sticker.addEventListener("mousemove", (e) => {
      const inst = Draggable.get(sticker);
      if (inst && inst.isDragging) return;
      const r = sticker.getBoundingClientRect();
      const cx = r.left + r.width / 2; const cy = r.top + r.height / 2;
      const nx = (e.clientX - cx) / (r.width / 2); const ny = (e.clientY - cy) / (r.height / 2);
      let xPx = quant(soften(gsap.utils.clamp(-1, 1, nx)) * maxMovePx);
      let yPx = quant(soften(gsap.utils.clamp(-1, 1, ny)) * maxMovePx);
      gsap.to(sticker, { xPercent: (xPx / r.width) * 100, yPercent: (yPx / r.height) * 100, duration: followDuration, ease, overwrite: "auto" });
    });
    sticker.addEventListener("mouseleave", () => {
      gsap.to(sticker, { xPercent: 0, yPercent: 0, duration: returnDuration, ease, overwrite: "auto" });
    });
  });
}

/* DRAGGABLE STICKERS */
function initDraggableStickers(container = document) {
  const wrapper = document.querySelector('[data-sticker="wrap"]');
  const stickers = container.querySelectorAll('[data-sticker="item"]');
  if (!wrapper || !stickers.length) return;
  
  stickers.forEach(sticker => {
    if (sticker._dragInit) return;
    sticker._dragInit = true;
    Draggable.create(sticker, {
      bounds: wrapper, dragResistance: 0.1,
      onPress() { gsap.to(this.target, { scale: 1.05, rotation: gsap.utils.random(-1, 1), filter: "drop-shadow(0px 12px 24px rgba(0,0,0,0.12))", duration: 0.25 }); },
      onDrag() {
        const rot = gsap.utils.clamp(-14, 14, this.deltaX * 0.08);
        gsap.to(this.target, { rotation: rot, duration: 0.2, ease: "power3.out", overwrite: true });
      },
      onRelease() { gsap.to(this.target, { scale: 1, rotation: 0, ease: "power3.out", filter: "drop-shadow(0px 0px 0px rgba(0,0,0,0))", duration: 0.25, overwrite: true }); }
    });
  });
}

/* SUIVI OEIL CURSEUR (Global) */
window.addEventListener("mousemove", (e) => {
  document.querySelectorAll('[data-move="iris"]').forEach(target => {
    const movement = 30;
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    target.style.transform = `translate(${x * movement}px, ${y * movement}px)`;
  });
});

/* SCRAMBLE EFFECTS */
function initScrambleOnLoad(container = document){
  container.querySelectorAll('[data-scramble="load"]').forEach((target) => {
    if (target._scrambleLoadInit) return;
    target._scrambleLoadInit = true;
    let split = new SplitText(target, { type: "words, chars", wordsClass: "word", charsClass: "char" });
    gsap.to(split.words, { duration: 1.2, stagger: 0.01, scrambleText: { text: "{original}", chars: 'upperCase', speed: 0.85 }, onComplete: () => split.revert() });
  });
}

function initScrambleOnScroll(container = document){
  container.querySelectorAll('[data-scramble="scroll"]').forEach((target) => {
    if (target._scrambleScrollInit) return;
    target._scrambleScrollInit = true;
    let isAlternative = target.hasAttribute("data-scramble-alt");
    let split = new SplitText(target, { type: "words, chars", wordsClass: "word", charsClass: "char" });
    gsap.to(split.words, { duration: 1.4, stagger: 0.015, scrambleText: { text: "{original}", chars: isAlternative ? ' ' : 'upperCase', speed: 0.95 }, scrollTrigger: { trigger: target, start: "top bottom", once: true }, onComplete: () => split.revert() });
  });
}

function initScrambleOnHover(container = document){
  container.querySelectorAll('[data-scramble-hover="link"]').forEach((target) => {
    if (target._scrambleHoverInit) return;
    target._scrambleHoverInit = true;
    let textEl = target.querySelector('[data-scramble-hover="target"]');
    if(!textEl) return;
    let originalText = textEl.textContent;
    let customHoverText = textEl.getAttribute("data-scramble-text");
    new SplitText(textEl, { type: "words, chars", wordsClass: "word", charsClass: "char" });
    
    target.addEventListener("mouseenter", () => { 
      gsap.to(textEl, { duration: 1.2, scrambleText: { text: customHoverText ? customHoverText : originalText, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#", speed: 0.5 } }); 
    });
    target.addEventListener("mouseleave", () => { 
      gsap.to(textEl, { duration: 1, scrambleText: { text: originalText, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ&@#", speed: 1 } }); 
    });
  });
}

/* MARQUEE EFFECT */
function initCSSMarquee(container = document) {
  const pixelsPerSecond = 75;
  const marquees = container.querySelectorAll('[data-css-marquee]');
  marquees.forEach(marquee => {
    if (marquee._marqueeInit) return;
    marquee._marqueeInit = true;
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => { marquee.appendChild(list.cloneNode(true)); });
  });
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.querySelectorAll('[data-css-marquee-list]').forEach(list => list.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused');
    });
  }, { threshold: 0 });
  
  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => { 
      list.style.animationDuration = (list.offsetWidth / pixelsPerSecond) + 's';
      list.style.animationPlayState = 'paused'; 
    });
    observer.observe(marquee);
  });
}

/* TOP BAR MENU */
function initTwostepScalingNavigation() {
  const navElement = document.querySelector("[data-twostep-nav]");
  const navStatusEl = document.querySelector("[data-nav-status]");
  if (!navElement || !navStatusEl) return;
  if (navElement._navInit) return;
  navElement._navInit = true;
  
  const setNavStatus = (status) => navStatusEl.setAttribute("data-nav-status", status);
  const isActive = () => navStatusEl.getAttribute("data-nav-status") === "active";
  const closeNav = () => setNavStatus("not-active");
  const toggleNav = () => (isActive() ? closeNav() : setNavStatus("active"));
  
  document.querySelectorAll('[data-nav-toggle="toggle"]').forEach((btn) => btn.addEventListener("click", toggleNav));
  document.querySelectorAll('[data-nav-toggle="close"]').forEach((btn) => btn.addEventListener("click", closeNav));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isActive()) closeNav(); });
}

/* INFINITE GRID MWG026 */
function initMwg026Effect(pageContainer = document) {
  pageContainer.querySelectorAll('.mwg026').forEach(root => {
    const container = root.querySelector('.mwg026-container');
    if (!container) return;
    const halfX = container.clientWidth / 2; const wrapX = gsap.utils.wrap(-halfX, 0);
    const xTo = gsap.quickTo(container, 'x', { duration: 1.5, ease: "power4", modifiers: { x: gsap.utils.unitize(wrapX) } });
    const halfY = container.clientHeight / 2; const wrapY = gsap.utils.wrap(-halfY, 0);
    const yTo = gsap.quickTo(container, 'y', { duration: 1.5, ease: "power4", modifiers: { y: gsap.utils.unitize(wrapY) } });
    let incrX = 0, incrY = 0;
    
    Observer.create({
      target: window, type: "wheel, touch, pointer",
      onChangeX: (self) => { if(self.event.type === "wheel") incrX -= self.deltaX; else incrX += self.deltaX * 2; xTo(incrX); },
      onChangeY: (self) => { if(self.event.type === "wheel") incrY -= self.deltaY; else incrY += self.deltaY * 2; yTo(incrY); }
    });
  });
}

/* MOUSE TRAIL MWG020 */
function initMouseTrailEffect(container = document) {
  container.querySelectorAll('.mwg020').forEach(root => {
    if (root.__mouseTrailInit) return;
    root.__mouseTrailInit = true;
    const images = [];
    root.querySelectorAll('.mwg020-media').forEach(image => { images.push(image.getAttribute('src')); });
    if(!images.length) return;
    
    let incr = 0, oldIncrX = 0, oldIncrY = 0, resetDist = window.innerWidth / 8, indexImg = 0;
    const onFirstMove = e => { oldIncrX = e.clientX; oldIncrY = e.clientY; root.removeEventListener("mousemove", onFirstMove); };
    root.addEventListener("mousemove", onFirstMove);
    
    const handleMouseMove = e => {
      const valX = e.clientX; const valY = e.clientY;
      incr += Math.abs(valX - oldIncrX) + Math.abs(valY - oldIncrY);
      if(incr > resetDist) { 
        incr = 0; 
        createMedia(valX, valY - root.getBoundingClientRect().top, valX - oldIncrX, valY - oldIncrY); 
      }
      oldIncrX = valX; oldIncrY = valY;
    };
    root.addEventListener("mousemove", handleMouseMove);
    
    function createMedia(x, y, deltaX, deltaY) {
      const image = document.createElement("img");
      image.classList.add('created-img');
      image.setAttribute('src', images[indexImg]);
      root.appendChild(image);
      
      const tl = gsap.timeline({ onComplete: () => { if (root.contains(image)) root.removeChild(image); } });
      tl.fromTo(image, { xPercent: -50 + (Math.random() - 0.5) * 80, yPercent: -50 + (Math.random() - 0.5) * 10, scaleX: 1.3, scaleY: 1.3 }, { scaleX:1, scaleY:1, ease:'elastic.out(2, 0.6)', duration:0.6 });
      tl.fromTo(image, { x, y, rotation:(Math.random() - 0.5) * 20 }, { x: '+=' + deltaX * 4, y: '+=' + deltaY * 4, rotation:(Math.random() - 0.5) * 20, ease:'power4.out', duration: 1.5 }, '<');
      tl.to(image, { duration: 0.3, scale: 0.5, delay: 0.1, ease:'back.in(1.5)' });
      indexImg = (indexImg + 1) % images.length;
    }
  });
}

/* PIXEL SCROLL REVEAL */
function initPixelReveal(container = document) {
  const pixelSize = 20; 
  const durationOut = 0.2;
  const waveSpeed = 0.04;
  const noise = 0.2;
  container.querySelectorAll('[data-pixel-reveal]').forEach((el) => {
    if (el.__pixelRevealInit) return;
    el.__pixelRevealInit = true;
    if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const color = el.getAttribute('data-pixel-color') || '#5a32fa';
    el.style.setProperty('--pixel-color', color);
    
    const wrap = document.createElement('div');
    wrap.className = 'pixel-reveal-wrap';
    const rect = el.getBoundingClientRect();
    const cols = Math.ceil(rect.width / pixelSize);
    const rows = Math.ceil(rect.height / pixelSize);
    wrap.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    wrap.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    const totalPixels = cols * rows;
    
    for (let i = 0; i < totalPixels; i++) {
      const pixel = document.createElement('div');
      pixel.className = 'pixel-box';
      wrap.appendChild(pixel);
    }
    el.appendChild(wrap);
    
    const pixels = wrap.querySelectorAll('.pixel-box');
    gsap.to(pixels, {
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
      opacity: 0, duration: durationOut, ease: "power1.inOut",
      stagger: function(index) { const colIndex = index % cols; return (colIndex * waveSpeed) + (Math.random() * noise); }
    });
  });
}

/* MWG005 ABOUT SCROLL */
function initMwg005AboutScroll(container = document) {
  document.fonts.ready.then(() => {
    container.querySelectorAll('.mwg005').forEach((root) => {
      if (root.__mwg005Init) return;
      root.__mwg005Init = true;
      const pinHeight = root.querySelector('.mwg005-pin-height');
      const containerEl = root.querySelector('.mwg005-container');
      const paragraph = root.querySelector(".mwg005-paragraph");
      if (!pinHeight || !containerEl || !paragraph) return; 
      
      const text = paragraph.textContent;
      paragraph.innerHTML = text.split(' ').map(word => `<span class="word">${word}</span>`).join(' ');
      gsap.to(paragraph.querySelectorAll(".word"), {
        x: 0, stagger: 0.02, ease: 'power4.inOut',
        scrollTrigger: { trigger: pinHeight, start: 'top top', end: 'bottom bottom', scrub: true, pin: containerEl, pinSpacing: false }
      });
    });
  });
}

/* MASK TEXT SCROLL REVEAL */
const splitConfig = {
  lines: { duration: 0.9, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 }
};
function initMaskTextScrollReveal(container = document) {
  container.querySelectorAll('[data-split="heading"]').forEach(heading => {
    if (heading.__maskTextInit) return;
    heading.__maskTextInit = true;
    const type = heading.dataset.splitReveal || 'lines';
    const typesToSplit = type === 'lines' ? ['lines'] : type === 'words' ? ['lines','words'] : ['lines','words','chars'];
    
    SplitText.create(heading, {
      type: typesToSplit.join(', '), mask: 'lines', autoSplit: true,
      linesClass: 'line', wordsClass: 'word', charsClass: 'letter',
      onSplit: function(instance) {
        const targets = instance[type];
        const config = splitConfig[type];
        return gsap.from(targets, {
          yPercent: 110, duration: config.duration, stagger: config.stagger, ease: 'expo.out',
          scrollTrigger: { trigger: heading, start: 'clamp(top 80%)', once: true }
        });
      }
    });
  });
}

/* TEAM CAROUSEL MWG008 */
function initMwg008TeamCarousel(container = document) {
  const root = container.querySelector('.mwg008');
  if (!root) return;
  if (root.__mwg008Init) return;
  root.__mwg008Init = true;
  
  const content = root.querySelector('.mwg008-container');
  const cards = root.querySelectorAll('.mwg008-card');
  if (!content || cards.length === 0) return;
  
  let total = 0;
  const half = content.clientWidth / 2;
  cards.forEach((card, index) => { card.style.position = 'relative'; card.style.zIndex = cards.length - index; });
  
  const wrap = gsap.utils.wrap(-half, 0);
  const xTo = gsap.quickTo(content, "x", { duration: 0.5, modifiers: { x: gsap.utils.unitize(wrap) }, ease: 'power3' });
  const rotateTo = gsap.quickTo(cards, "rotation", { duration: 0.8, ease: 'power3' });
  
  Observer.create({
    target: content, type: "pointer,touch",
    onDrag: (self) => { total += self.deltaX; rotateTo(self.velocityX * 0.002); },
    onRelease: () => rotateTo(0), onStop: () => rotateTo(0)
  });
  
  function tick(time, deltaTime) { total -= deltaTime / 10; xTo(total); }
  gsap.ticker.add(tick);
}

/* PIXELATED IMAGE REVEAL */
function initPixelatedImageReveal(container = document) { 
  const animationStepDuration = 0.4;
  const gridSize = 8; 
  const pixelSize = 100 / gridSize; 
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
  
  container.querySelectorAll('[data-pixelated-image-reveal]').forEach((card) => {
    if (card.__pixelatedRevealInit) return;
    card.__pixelatedRevealInit = true;
    
    const pixelGrid = card.querySelector('[data-pixelated-image-reveal-grid]');
    const activeCard = card.querySelector('[data-pixelated-image-reveal-active]');
    pixelGrid.querySelectorAll('.pixelated-image-card__pixel').forEach(pixel => pixel.remove());
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixelated-image-card__pixel');
        pixel.style.width = `${pixelSize}%`;
        pixel.style.height = `${pixelSize}%`;
        pixel.style.left = `${col * pixelSize}%`;
        pixel.style.top = `${row * pixelSize}%`;
        pixelGrid.appendChild(pixel);
      }
    }
    const pixels = pixelGrid.querySelectorAll('.pixelated-image-card__pixel');
    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;
    let isActive = false;
    let delayedCall;
    
    const animatePixels = (activate) => {
      isActive = activate;
      gsap.killTweensOf(pixels);
      if (delayedCall) delayedCall.kill();
      gsap.set(pixels, { display: 'none' });
      gsap.to(pixels, { display: 'block', duration: 0, stagger: { each: staggerDuration, from: 'random' } });
      
      delayedCall = gsap.delayedCall(animationStepDuration, () => {
        activeCard.style.display = activate ? 'block' : 'none';
        activeCard.style.pointerEvents = activate ? 'none' : '';
      });
      gsap.to(pixels, { display: 'none', duration: 0, delay: animationStepDuration, stagger: { each: staggerDuration, from: 'random' } });
    };
    
    if (isTouchDevice) card.addEventListener('click', () => animatePixels(!isActive));
    else {
      card.addEventListener('mouseenter', () => { if (!isActive) animatePixels(true); });
      card.addEventListener('mouseleave', () => { if (isActive) animatePixels(false); });
    }
  });
}

/* FOOTER DEFORMATION (CORRIGÉ : PLUS DE BLUR) */
function initFooterDeformation(container = document) {
  // Changé pour Cibler document globalement, vu que le footer est hors du wrapper
  container.querySelectorAll('.effet-deformation').forEach(el => {
    if (el.__deformationInit) return;
    el.__deformationInit = true;
    
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top; 
      const centerX = rect.width / 2; const centerY = rect.height / 2;
      const distX = (x - centerX) / centerX;
      const distY = (y - centerY) / centerY;
      const rotateX = -distY * 15;
      const rotateY = distX * 15;
      const skewX = distX * 5; 
      const skewY = distY * 5;
      
      el.style.transition = 'transform 0.1s ease-out';
      el.style.transform = `perspective(1000px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg) skew(${skewX}deg, ${skewY}deg)`;
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      el.style.transform = 'perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg) skew(0deg, 0deg)';
    });
  });
}

/* PIXELATED SCROLL TRANSITION */
function initPixelatedScrollTransition(container = document) {
  const defaultColumns = 12;
  const defaultRows = 6;
  const defaultMode = "cover";
  const defaultScrollStart = { cover: "bottom bottom", reveal: "top bottom" };
  const defaultScrollEnd = { cover: "bottom top", reveal: "top center" };
  const defaultScrub = 0.3;
  const defaultPixelDuration = 0.1;
  const defaultStaggerAmount = 1.5;
  const panelClass = "pixelated-scroll-transition__panel";
  const columnClass = "pixelated-scroll-transition__col";
  const pixelClass = "pixelated-scroll-transition__pixel";
  const breakpoints = { mobile: "(max-width: 478px)", landscape: "(max-width: 767px)", tablet: "(max-width: 991px)" };
  
  function getColumns(wrapper) {
    const base = parseInt(wrapper.dataset.columns, 10) || defaultColumns;
    if (window.matchMedia(breakpoints.mobile).matches) return parseInt(wrapper.dataset.columnsMobile, 10) || Math.max(4, Math.round(base * 0.4));
    if (window.matchMedia(breakpoints.landscape).matches) return parseInt(wrapper.dataset.columnsLandscape, 10) || Math.max(6, Math.round(base * 0.6));
    if (window.matchMedia(breakpoints.tablet).matches) return parseInt(wrapper.dataset.columnsTablet, 10) || Math.max(8, Math.round(base * 0.75));
    return base;
  }
  
  function getMode(wrapper) { return wrapper.dataset.mode === "reveal" ? "reveal" : defaultMode; }
  
  function getRows(wrapper) {
    const base = parseInt(wrapper.dataset.rows, 10) || defaultRows;
    if (window.matchMedia(breakpoints.mobile).matches) return parseInt(wrapper.dataset.rowsMobile, 10) || base;
    if (window.matchMedia(breakpoints.landscape).matches) return parseInt(wrapper.dataset.rowsLandscape, 10) || base;
    if (window.matchMedia(breakpoints.tablet).matches) return parseInt(wrapper.dataset.rowsTablet, 10) || base;
    return base;
  }
  
  function getScrollStart(wrapper, mode) { return wrapper.dataset.scrollStart || defaultScrollStart[mode]; }
  function getScrollEnd(wrapper, mode) { return wrapper.dataset.scrollEnd || defaultScrollEnd[mode]; }
  
  container.querySelectorAll("[data-pixelated-scroll-transition]").forEach(wrapper => {
    if (wrapper.__pstInit) return;
    wrapper.__pstInit = true;
    
    const section = wrapper.closest("section") || wrapper.parentElement;
    const cols = getColumns(wrapper);
    const rows = getRows(wrapper);
    const mode = getMode(wrapper);
    
    const panel = document.createElement("div");
    panel.classList.add(panelClass);
    panel.setAttribute("data-pixelated-scroll-panel", "");
    const fragment = document.createDocumentFragment();
    
    for (let c = 0; c < cols; c++) {
      const col = document.createElement("div");
      col.classList.add(columnClass);
      col.setAttribute("data-pixelated-scroll-column", "");
      for (let r = 0; r < rows; r++) {
        const pixel = document.createElement("div");
        pixel.classList.add(pixelClass);
        pixel.setAttribute("data-pixelated-scroll-pixel", "");
        col.appendChild(pixel);
      }
      fragment.appendChild(col);
    }
    panel.appendChild(fragment);
    wrapper.appendChild(panel);
    
    const columns = panel.querySelectorAll("[data-pixelated-scroll-column]");
    const cellData = [];
    
    for (let r = 0; r < rows; r++) {
      columns.forEach((col, c) => {
        const pixel = col.children[r];
        if (!pixel) return;
        const dist = rows - 1 - r;
        const priority = dist * 50 + Math.random() * 300 + Math.sin(c * 0.3) * 30;
        cellData.push({ element: pixel, priority });
      });
    }
    
    cellData.sort((a, b) => a.priority - b.priority);
    const cells = cellData.map(d => d.element);
    
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: getScrollStart(wrapper, mode), end: getScrollEnd(wrapper, mode), scrub: defaultScrub, invalidateOnRefresh: true } });
    const fromAlpha = mode === "cover" ? 0 : 1;
    const toAlpha = mode === "cover" ? 1 : 0;
    
    gsap.set(cells, { autoAlpha: fromAlpha });
    tl.to(cells, { autoAlpha: toAlpha, duration: defaultPixelDuration, stagger: { amount: defaultStaggerAmount, from: "start" }, ease: "none" });
  });
}

/* TITLE REVEAL */
function initTitleReveal(container = document) {
  document.fonts.ready.then(() => {
    container.querySelectorAll('[data-animate="title-reveal"]').forEach(target => {
      if (target.__titleRevealInit) return;
      target.__titleRevealInit = true;
      
      const text = target.textContent.trim();
      const words = text.split(' ');
      target.innerHTML = '';
      
      const tempSpans = words.map(w => {
        const s = document.createElement('span');
        s.textContent = w + ' ';
        s.style.display = 'inline-block';
        target.appendChild(s);
        return s;
      });
      
      const linesByTop = {};
      tempSpans.forEach(s => {
        const top = s.offsetTop;
        if (!linesByTop[top]) linesByTop[top] = [];
        linesByTop[top].push(s.textContent);
      });
      target.innerHTML = '';
      
      const lineEls = [];
      Object.keys(linesByTop).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(top => {
        const mask = document.createElement('div');
        mask.className = 'line-mask';
        const inner = document.createElement('div');
        inner.className = 'line-inner';
        inner.textContent = linesByTop[top].join('').trim();
        mask.appendChild(inner);
        target.appendChild(mask);
        lineEls.push(inner);
      });
      
      gsap.set(target, { opacity: 1 });
      gsap.set(lineEls, { yPercent: 110, rotation: 5, opacity: 0 });
      gsap.to(lineEls, {
        yPercent: 0, rotation: 0, opacity: 1,
        duration: 1.4, stagger: 0.1, ease: 'power4.out', force3D: true,
        scrollTrigger: { trigger: target, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  });
}

/* EVENT CAROUSEL (Page Event) */
function initEventCarousel(container = document) {
  const slots = Array.from(container.querySelectorAll('.gallery-slot'));
  const contents = container.querySelectorAll('.event-content');
  if (!slots.length || !contents.length) return;
  
  const AUTOPLAY_DURATION = 6;
  let autoplayTween = null;
  let isAnimating = false;
  const splitInstances = new Map();
  
  document.fonts.ready.then(() => {
    contents.forEach(content => {
      const title = content.querySelector('.event-title');
      if (title) {
        const split = new SplitText(title, { type: 'lines', linesClass: 'line-inner' });
        split.lines.forEach(line => {
          const wrapper = document.createElement('div');
          wrapper.className = 'line-mask';
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });
        splitInstances.set(content, split);
      }
    });
    initEventCarouselScrollTrigger();
  });
  
  slots.forEach(slot => {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'slot-progress-container';
    const progressFill = document.createElement('div');
    progressFill.className = 'slot-progress-fill';
    progressContainer.appendChild(progressFill);
    slot.appendChild(progressContainer);
  });
  
  function startAutoplay(activeIndex) {
    if (autoplayTween) autoplayTween.kill();
    gsap.set(container.querySelectorAll('.slot-progress-fill'), { width: '0%' });
    const currentSlot = slots[activeIndex];
    if (!currentSlot) return;
    const fillBar = currentSlot.querySelector('.slot-progress-fill');
    autoplayTween = gsap.to(fillBar, {
      width: '100%', duration: AUTOPLAY_DURATION, ease: 'none',
      onComplete: () => {
        const nextIndex = (activeIndex + 1) % slots.length;
        if (!isAnimating) slots[nextIndex].click();
      }
    });
  }
  
  function prepareContentIn(content) {
    const titleSplit = splitInstances.get(content);
    const description = content.querySelector('.event-description, .text-block-6');
    const badges = content.querySelectorAll('.badge-square, .badge-round');
    const button = content.querySelector('.event-button, .btn-bubble-arrow');
    
    if (titleSplit) gsap.set(titleSplit.lines, { yPercent: 110, rotation: 5, opacity: 0 });
    if (description) gsap.set(description, { y: 30, opacity: 0 });
    if (badges.length) gsap.set(badges, { yPercent: 120, rotation: 10, opacity: 0 });
    if (button) gsap.set(button, { y: 30, opacity: 0 });
  }
  
  function animateContentIn(content) {
    const titleSplit = splitInstances.get(content);
    const description = content.querySelector('.event-description, .text-block-6');
    const badges = content.querySelectorAll('.badge-square, .badge-round');
    const button = content.querySelector('.event-button, .btn-bubble-arrow');
    const tl = gsap.timeline();
    
    if (badges.length) tl.to(badges, { yPercent: 0, rotation: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out', force3D: true }, 0);
    if (titleSplit) tl.to(titleSplit.lines, { yPercent: 0, rotation: 0, opacity: 1, duration: 1.4, stagger: 0.1, ease: 'power4.out', force3D: true, rotationZ: 0.001 }, 0.1);
    if (description) tl.to(description, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.4);
    if (button) tl.to(button, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.6);
    return tl;
  }
  
  function animateContentOut(content) {
    const titleSplit = splitInstances.get(content);
    const description = content.querySelector('.event-description, .text-block-6');
    const badges = content.querySelectorAll('.badge-square, .badge-round');
    const button = content.querySelector('.event-button, .btn-bubble-arrow');
    const tl = gsap.timeline();
    
    if (titleSplit) tl.to(titleSplit.lines, { yPercent: -110, rotation: -2, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0);
    const elementsOut = [];
    if (description) elementsOut.push(description);
    if (badges.length) elementsOut.push(badges);
    if (button) elementsOut.push(button);
    if (elementsOut.length) tl.to(elementsOut, { y: -20, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0.1);
    return tl;
  }
  
  function initEventCarouselScrollTrigger() {
    const initialContent = container.querySelector('.event-content.is-active');
    const initialSlotIndex = slots.findIndex(slot => slot.classList.contains('is-active'));
    const safeInitialIndex = initialSlotIndex === -1 ? 0 : initialSlotIndex;
    if (initialContent) prepareContentIn(initialContent);
    
    ScrollTrigger.create({
      trigger: container.querySelector('.event-pin-height'),
      start: 'top 85%', once: true,
      onEnter: () => {
        if (initialContent) animateContentIn(initialContent).eventCallback('onComplete', () => startAutoplay(safeInitialIndex));
      }
    });
  }
  
  slots.forEach((slot, index) => {
    slot.addEventListener('click', function() {
      if (isAnimating) return;
      if (slot.classList.contains('is-active')) return;
      const target = slot.dataset.target;
      const targetContent = document.getElementById(target);
      const currentContent = container.querySelector('.event-content.is-active');
      if (!targetContent || !currentContent) return;
      
      isAnimating = true;
      if (autoplayTween) autoplayTween.pause();
      slots.forEach(s => s.classList.remove('is-active'));
      slot.classList.add('is-active');
      
      const outTl = animateContentOut(currentContent);
      outTl.eventCallback('onComplete', () => {
        currentContent.classList.remove('is-active');
        prepareContentIn(targetContent);
        targetContent.classList.add('is-active');
        const inTl = animateContentIn(targetContent);
        isAnimating = false; 
        inTl.eventCallback('onComplete', () => startAutoplay(index));
      });
    });
  });
}

/* PREVIEW FOLLOWER (List Cursor Follow) */
function initPreviewFollower(container = document) {
  container.querySelectorAll('[data-follower-wrap]').forEach(wrap => {
    if (wrap.__followerInit) return;
    wrap.__followerInit = true;
    
    const collection = wrap.querySelector('[data-follower-collection]');
    const items = wrap.querySelectorAll('[data-follower-item]');
    const follower = wrap.querySelector('[data-follower-cursor]');
    const followerInner = wrap.querySelector('[data-follower-cursor-inner]');
    if (!follower || !followerInner) return;
    
    let prevIndex = null;
    let firstEntry = true;
    const offset = 100;
    const duration = 0.5;
    const ease = 'power2.inOut';
    
    gsap.set(follower, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(follower, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(follower, 'y', { duration: 0.6, ease: 'power3' });
    
    const onMove = e => {
      if (!wrap.isConnected) {
        window.removeEventListener('mousemove', onMove);
        return;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    
    items.forEach((item, index) => {
      item.addEventListener('mouseenter', () => {
        const forward = prevIndex === null || index > prevIndex;
        prevIndex = index;
        
        follower.querySelectorAll('[data-follower-visual]').forEach(el => {
          gsap.killTweensOf(el);
          gsap.to(el, { yPercent: forward ? -offset : offset, duration, ease, overwrite: 'auto', onComplete: () => el.remove() });
        });
        
        const visual = item.querySelector('[data-follower-visual]');
        if (!visual) return;
        
        // FIX IMAGE NON VISIBLE : On clone l'image et on force son affichage au cas où Webflow l'a masquée en CSS
        const clone = visual.cloneNode(true);
        clone.style.display = 'block';
        clone.style.opacity = '1';
        
        followerInner.appendChild(clone);
        
        if (!firstEntry) {
          gsap.fromTo(clone, { yPercent: forward ? offset : -offset }, { yPercent: 0, duration, ease, overwrite: 'auto' });
        } else firstEntry = false;
      });
      
      item.addEventListener('mouseleave', () => {
        const el = follower.querySelector('[data-follower-visual]');
        if (!el) return;
        gsap.killTweensOf(el);
        gsap.to(el, { yPercent: -offset, duration, ease, overwrite: 'auto', onComplete: () => el.remove() });
      });
    });
    
    if (collection) {
      collection.addEventListener('mouseleave', () => {
        follower.querySelectorAll('[data-follower-visual]').forEach(el => {
          gsap.killTweensOf(el);
          gsap.delayedCall(duration, () => el.remove());
        });
        firstEntry = true;
        prevIndex = null;
      });
    }
  });
}

/* LOADER */
function initLogoRevealLoader() {
  gsap.registerPlugin(CustomEase, SplitText);
  CustomEase.create("loader", "0.65, 0.01, 0.05, 0.99");
  const wrap = document.querySelector("[data-load-wrap]");
  if (!wrap) return;
  const container = wrap.querySelector("[data-load-container]");
  const bg = wrap.querySelector("[data-load-bg]");
  const progressBar = wrap.querySelector("[data-load-progress]");
  const logo = wrap.querySelector("[data-load-logo]");
  const textElements = Array.from(wrap.querySelectorAll("[data-load-text]"));
  const resetTargets = Array.from(wrap.querySelectorAll('[data-load-reset]:not([data-load-text])'));
  
  const loadTimeline = gsap.timeline({ defaults: { ease: "loader", duration: 3 } })
    .set(wrap, { display: "block" })
    .to(progressBar, { scaleX: 1 })
    .to(logo, { clipPath: "inset(0% 0% 0% 0%)" }, "<")
    .to(container, { autoAlpha: 0, duration: 0.5 })
    .to(progressBar, { scaleX: 0, transformOrigin: "right center", duration: 0.5 }, "<")
    .add("hideContent", "<")
    .to(bg, { yPercent: -101, duration: 1 }, "hideContent")
    .set(wrap, { display: "none" });

  if (resetTargets.length) {
    loadTimeline.set(resetTargets, { autoAlpha: 1 }, 0);
  }
  
  if (textElements.length >= 2) {
    const firstWord = new SplitText(textElements[0], { type: "lines,chars", mask: "lines" });
    const secondWord = new SplitText(textElements[1], { type: "lines,chars", mask: "lines" });
    gsap.set([firstWord.chars, secondWord.chars], { autoAlpha: 0, yPercent: 125 });
    gsap.set(textElements, { autoAlpha: 1 });
    
    loadTimeline.to(firstWord.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, 0);
    loadTimeline.to(firstWord.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, ">+=0.4");
    loadTimeline.to(secondWord.chars, { autoAlpha: 1, yPercent: 0, duration: 0.6, stagger: { each: 0.02 } }, "<");
    loadTimeline.to(secondWord.chars, { autoAlpha: 0, yPercent: -125, duration: 0.4, stagger: { each: 0.02 } }, "hideContent-=0.5");
  }
}
