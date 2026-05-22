console.log("🟢 LE SCRIPT EST BLINDÉ ET CONNECTÉ !");

//
// OSMO PAGE TRANSITION BOILERPLATE - SÉCURISÉ
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

let staggerDefault = 0.05;
let durationDefault = 0.6;
CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

//
// REGISTRE DES FONCTIONS
//
function initOnceFunctions() {
  initLenis();
  initLogoRevealLoader();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  initTwostepScalingNavigation();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  
  // Effets Globaux
  initScrambleOnHover(document);
  addMagneticEffect(document);
  initDraggableStickers(document);
  
  // Effets Locaux (Nouvelle Page)
  initHighlightMarkerTextReveal(next);
  initFooterParallax(next);
  initRectangleReveal(next);
  initScrambleOnLoad(next);
  initScrambleOnScroll(next);
  initMwg026Effect(next);
  initMouseTrailEffect(next);
  initCSSMarquee(next);
  initMwg005AboutScroll(next);
  initMaskTextScrollReveal(next);
  initMwg008TeamCarousel(next);
  initPixelatedImageReveal(next);
  initFooterDeformation(next);
  initPixelatedScrollTransition(next);
  initPixelReveal(next);
  initTitleReveal(next);
  initEventCarousel(next);
  initPreviewFollower(next);

  // RELANCE WEBFLOW IX2 SÉCURISÉE
  setTimeout(() => {
    try {
      if (window.Webflow && window.Webflow.require) {
        window.Webflow.destroy();
        window.Webflow.ready();
        window.Webflow.require('ix2').init();
      }
    } catch(e) { console.error("Webflow IX2 Init Error:", e); }
    
    // Refresh des ScrollTriggers une fois que le DOM est repeint
    if (hasScrollTrigger) ScrollTrigger.refresh();
  }, 100);
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
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap ? transitionWrap.querySelector("[data-transition-panel]") : null;

  // Si pas de pixels Osmo sur cette page, on fait un fade simple et on protège le code
  if (reducedMotion || !transitionPanel) {
    tl.set(current, { autoAlpha: 0 });
    return tl;
  }

  const isPortrait = window.innerHeight > window.innerWidth;
  pixelGrid(isPortrait);
  
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
  gsap.set(next, { autoAlpha: 1, clipPath: clipFrom, webkitClipPath: clipFrom, willChange: "clip-path", force3D: true, maxHeight: "100dvh" });

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
    return new Promise(resolve => tl.call(() => resolve(), null, "pageReady"));
  }
  
  tl.add("pageReady", transitionDuration + transitionEndDelay);
  tl.call(resetPage, [next], "pageReady");
  return new Promise((resolve) => { tl.call(() => resolve(), null, "pageReady"); });
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
  
  // Fermeture du menu masquée
  const navStatusEl = document.querySelector("[data-nav-status]");
  if (navStatusEl) navStatusEl.setAttribute("data-nav-status", "not-active");

  // On nettoie TOUS les anciens ScrollTriggers avant d'en recréer
  if (hasScrollTrigger) {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  initBeforeEnterFunctions(data.next.container);
});

barba.hooks.enter(data => { initBarbaNavUpdate(data); });

barba.hooks.afterEnter(data => {
  // Le DOM est nettoyé automatiquement par Barba ici, on lance les nouveaux scripts
  initAfterEnterFunctions(data.next.container);
  if (hasLenis) { lenis.resize(); lenis.start(); }
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

function initRectangleReveal(container = document) {
  const CONFIG = { duration: 1, ease: "power2.inOut", color: "#350AFF", startScrub: "top 80%" };
  container.querySelectorAll('[data-effect="swipe-reveal"]').forEach((text) => {
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

window.addEventListener("mousemove", (e) => {
  document.querySelectorAll('[data-move="iris"]').forEach(target => {
    const movement = 30;
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    target.style.transform = `translate(${x * movement}px, ${y * movement}px)`;
  });
});

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
  
  document.querySelectorAll('[data-nav-toggle="toggle"]').forEach((btn) => btn.
