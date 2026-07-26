/* ===================================================================
   CASA DA PIZZA · CARATINGA/MG
   script.js — JavaScript puro, sem dependências.

   Configuração rápida:
   - businessConfig.hoursVerified : só ative depois de conferir os horários.
   - reviewsConfig.verified       : só ative depois de conferir nota e total.
   =================================================================== */

(function () {
  "use strict";

  /* ================================================================
     CONFIGURAÇÃO
     ================================================================ */

  const businessConfig = {
    hoursVerified: true,
    schedule: {
      sunday: ["18:00", "23:30"],
      monday: ["18:00", "23:30"],
      tuesday: null,
      wednesday: ["18:00", "23:30"],
      thursday: ["18:00", "23:30"],
      friday: ["18:00", "23:30"],
      saturday: ["18:00", "00:00"]
    }
  };

  const reviewsConfig = {
    verified: false,
    rating: "5,0",
    total: 27
  };

  const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  const FILL_MARKER = "[PREENCHER";

  /* ================================================================
     UTILITÁRIOS
     ================================================================ */

  function trackEvent(name, data = {}) {
    console.info("[analytics]", name, data);
  }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.prototype.slice.call(ctx.querySelectorAll(sel));

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function focusableIn(container) {
    return $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
    });
  }

  function lockScroll(lock) {
    document.body.classList.toggle("is-locked", lock);
  }

  /* ================================================================
     1. MENU MOBILE
     ================================================================ */

  function initMobileMenu() {
    const toggle = $("[data-menu-toggle]");
    const panel = $("[data-menu-panel]");
    const label = $("[data-menu-label]");
    if (!toggle || !panel) return;

    let open = false;

    function setLabel() {
      if (label) label.textContent = open ? "Fechar menu de navegação" : "Abrir menu de navegação";
    }

    function openMenu() {
      if (open) return;
      open = true;
      panel.hidden = false;
      // força reflow para a transição acontecer
      void panel.offsetWidth;
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      setLabel();
      lockScroll(true);

      const first = focusableIn(panel)[0];
      if (first) first.focus();

      trackEvent("mobile_menu_open", { source: "header" });
    }

    function closeMenu(restoreFocus) {
      if (!open) return;
      open = false;
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      setLabel();
      lockScroll(false);

      const finish = function () { panel.hidden = true; };
      if (prefersReducedMotion()) finish();
      else window.setTimeout(finish, 200);

      if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      if (open) closeMenu(true); else openMenu();
    });

    // Fecha ao clicar em um link
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    // Escape fecha e devolve o foco
    document.addEventListener("keydown", function (event) {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key === "Tab") {
        const items = focusableIn(panel);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle.focus();
        }
      }
    });

    // Clique fora fecha
    document.addEventListener("click", function (event) {
      if (!open) return;
      if (panel.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu(false);
    });

    // Voltou para desktop: fecha e limpa estado
    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
      if (event.matches) closeMenu(false);
    });

    setLabel();
  }

  /* ================================================================
     2. ANO DO COPYRIGHT
     ================================================================ */

  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ================================================================
     3. STATUS DO FORNO
     ================================================================ */

  function toMinutes(value) {
    const parts = String(value).split(":");
    return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
  }

  function isOpenAt(date) {
    const dayIndex = date.getDay();
    const minutes = (date.getHours() * 60) + date.getMinutes();

    // Faixa do próprio dia
    const today = businessConfig.schedule[DAY_KEYS[dayIndex]];
    if (today) {
      const start = toMinutes(today[0]);
      let end = toMinutes(today[1]);
      if (end <= start) end += 24 * 60; // fecha depois da meia-noite
      if (minutes >= start && minutes < end) return true;
    }

    // Faixa do dia anterior que atravessa a meia-noite
    const prevIndex = (dayIndex + 6) % 7;
    const prev = businessConfig.schedule[DAY_KEYS[prevIndex]];
    if (prev) {
      const start = toMinutes(prev[0]);
      let end = toMinutes(prev[1]);
      if (end <= start) {
        end += 24 * 60;
        if ((minutes + 24 * 60) >= start && (minutes + 24 * 60) < end) return true;
      }
    }

    return false;
  }

  function formatHour(value) {
    const parts = String(value).split(":");
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    return m === "00" ? h + "h" : h + "h" + m;
  }

  function renderSchedule() {
    const list = $("[data-oven-schedule]");
    if (!list) return;

    const todayIndex = new Date().getDay();
    let html = "";

    for (let i = 0; i < DAY_KEYS.length; i++) {
      const range = businessConfig.schedule[DAY_KEYS[i]];
      const text = range ? formatHour(range[0]) + " – " + formatHour(range[1]) : "Fechado";
      html += '<li' + (i === todayIndex ? ' data-today="true"' : '') +
              '><span>' + DAY_NAMES[i] + '</span><span>' + text + '</span></li>';
    }

    list.innerHTML = html;
    list.hidden = false;
  }

  let ovenTimer = null;

  // Quando fechado: acha o próximo horário de abertura (hoje mais tarde,
  // ou o próximo dia com expediente). Quando aberto: acha o horário de
  // encerramento de hoje. Considera a virada da meia-noite (sexta/sábado).
  function findNextOpening(date) {
    const dayIndex = date.getDay();
    const minutes = (date.getHours() * 60) + date.getMinutes();

    const today = businessConfig.schedule[DAY_KEYS[dayIndex]];
    if (today && minutes < toMinutes(today[0])) {
      return { label: "Hoje", time: formatHour(today[0]) };
    }

    for (let i = 1; i <= 7; i++) {
      const idx = (dayIndex + i) % 7;
      const range = businessConfig.schedule[DAY_KEYS[idx]];
      if (range) {
        return { label: DAY_NAMES[idx], time: formatHour(range[0]) };
      }
    }
    return null;
  }

  function findClosingTime(date) {
    const dayIndex = date.getDay();
    const minutes = (date.getHours() * 60) + date.getMinutes();

    const today = businessConfig.schedule[DAY_KEYS[dayIndex]];
    if (today) {
      const start = toMinutes(today[0]);
      let end = toMinutes(today[1]);
      if (end <= start) end += 24 * 60;
      if (minutes >= start && minutes < end) {
        return { label: "Hoje", time: formatHour(today[1]) };
      }
    }

    const prevIndex = (dayIndex + 6) % 7;
    const prev = businessConfig.schedule[DAY_KEYS[prevIndex]];
    if (prev) {
      const start = toMinutes(prev[0]);
      let end = toMinutes(prev[1]);
      if (end <= start) {
        end += 24 * 60;
        if ((minutes + 24 * 60) >= start && (minutes + 24 * 60) < end) {
          return { label: "Hoje de madrugada", time: formatHour(prev[1]) };
        }
      }
    }
    return null;
  }

  function initOvenStatus() {
    const bar = $("[data-oven-bar]");
    const title = $("[data-oven-title]");
    const desc = $("[data-oven-desc]");
    const scheduleLabel = $("[data-schedule-label]");
    const nextOpening = $("[data-next-opening]");
    const scheduleSupport = $("[data-schedule-support]");
    const ctaLabel = $("[data-oven-cta-label]");
    const finalTitle = $("[data-final-title]");

    if (!businessConfig.hoursVerified) {
      // Sem confirmação: mantém o texto neutro que já está no HTML.
      if (bar) bar.setAttribute("data-state", "unknown");
      return;
    }

    const open = isOpenAt(new Date());

    if (bar) {
      bar.setAttribute("data-state", open ? "open" : "closed");
      bar.classList.toggle("oven-status--open", open);
      bar.classList.toggle("oven-status--closed", !open);
    }

    if (title) title.textContent = open ? "Forno aceso" : "Forno apagado";
    if (desc) {
      desc.textContent = open
        ? "A gente está recebendo pedidos agora."
        : "A gente acende de novo no próximo horário de atendimento.";
    }

    if (scheduleLabel) scheduleLabel.textContent = open ? "Encerramento" : "Próxima abertura";
    if (ctaLabel) ctaLabel.textContent = open ? "Pedir agora" : "Ver cardápio";

    const info = open ? findClosingTime(new Date()) : findNextOpening(new Date());
    if (nextOpening) {
      nextOpening.textContent = info ? (info.label + ", às " + info.time) : "Consulte o horário";
    }
    if (scheduleSupport) {
      scheduleSupport.textContent = open
        ? "Depois desse horário, é só voltar amanhã."
        : "Confira os horários completos de atendimento.";
    }

    if (finalTitle && open) {
      // Mantém a estrutura de title-mask (duas linhas, cada uma com seu
      // próprio <span> de máscara) em vez de substituir por texto solto.
      finalTitle.innerHTML =
        '<span class="title-mask"><span>A noite está passando.</span></span>' +
        '<span class="title-mask"><span style="transition-delay:130ms">E o forno está aceso.</span></span>';
    }

    // Texto de horário nas seções de contato
    $$("[data-oven-hours]").forEach(function (el) {
      el.textContent = open
        ? "A Casa está aberta agora. Confira o horário completo abaixo."
        : "A Casa está fechada agora. Confira o horário completo abaixo.";
    });

    renderSchedule();

    // Reavalia a cada minuto para o status não envelhecer na tela
    if (ovenTimer) window.clearInterval(ovenTimer);
    ovenTimer = window.setInterval(function () {
      if (isOpenAt(new Date()) !== open) initOvenStatus();
    }, 60000);
  }

  /* ================================================================
     4. AVALIAÇÕES
     ================================================================ */

  function initReviews() {
    const section = $("[data-reviews-section]");
    const seal = $("[data-reviews-seal]");

    if (!reviewsConfig.verified) {
      if (section) section.hidden = true;
      if (seal) seal.hidden = true;
      return;
    }

    $$("[data-reviews-rating]").forEach(function (el) {
      el.textContent = reviewsConfig.rating;
    });

    const summary = $("[data-reviews-summary]");
    if (summary) {
      summary.textContent = reviewsConfig.total + " avaliações no Google";
    }

    if (section) section.hidden = false;
    if (seal) seal.hidden = false;
  }

  /* ================================================================
     5. BLOCOS AINDA NÃO PREENCHIDOS
     ================================================================ */

  function initFillGuard() {
    $$("[data-fill]").forEach(function (el) {
      if (el.textContent.indexOf(FILL_MARKER) === -1) return;
      const block = el.closest("[data-fill-block]") || el;
      block.hidden = true;
    });
  }

  /* ================================================================
     6. ACCORDION (PERGUNTAS RÁPIDAS)
     ================================================================ */

  function initAccordion() {
    const root = $("[data-faq]");
    if (!root) return;

    const buttons = $$(".faq__button", root);
    if (!buttons.length) return;

    function panelOf(button) {
      return document.getElementById(button.getAttribute("aria-controls"));
    }

    function collapse(button, animate) {
      const panel = panelOf(button);
      if (!panel) return;
      button.setAttribute("aria-expanded", "false");

      if (!animate) {
        panel.setAttribute("data-collapsed", "true");
        panel.hidden = true;
        return;
      }

      panel.setAttribute("data-collapsed", "true");
      window.setTimeout(function () {
        if (button.getAttribute("aria-expanded") === "false") panel.hidden = true;
      }, prefersReducedMotion() ? 0 : 300);
    }

    function expand(button) {
      const panel = panelOf(button);
      if (!panel) return;
      button.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      void panel.offsetWidth;
      panel.removeAttribute("data-collapsed");
      trackEvent("open_faq", { question: button.textContent.trim() });
    }

    // Estado inicial: tudo recolhido (sem JS os painéis ficam abertos e legíveis)
    buttons.forEach(function (button) { collapse(button, false); });

    buttons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        const expanded = button.getAttribute("aria-expanded") === "true";
        if (expanded) collapse(button, true); else expand(button);
      });

      button.addEventListener("keydown", function (event) {
        const visible = buttons.filter(function (b) { return !b.closest("[hidden]"); });
        const pos = visible.indexOf(button);
        let next = -1;

        if (event.key === "ArrowDown") next = (pos + 1) % visible.length;
        else if (event.key === "ArrowUp") next = (pos - 1 + visible.length) % visible.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = visible.length - 1;
        else return;

        event.preventDefault();
        visible[next].focus();
      });

      void index;
    });
  }

  /* ================================================================
     7. LIGHTBOX DA GALERIA
     ================================================================ */

  function initLightbox() {
    const gallery = $("[data-gallery]");
    const box = $("[data-lightbox]");
    if (!gallery || !box) return;

    const image = $("[data-lightbox-img]", box);
    const caption = $("[data-lightbox-caption]", box);
    const closeButton = $(".lightbox__close", box);
    let lastFocused = null;
    let open = false;

    function openBox(trigger) {
      const source = trigger.getAttribute("href");
      const text = trigger.getAttribute("data-caption") || "";
      const img = trigger.querySelector("img");

      lastFocused = trigger;
      image.setAttribute("src", source);
      image.setAttribute("alt", img ? img.getAttribute("alt") : text);
      caption.textContent = text;

      box.hidden = false;
      lockScroll(true);
      open = true;
      if (closeButton) closeButton.focus();

      trackEvent("open_gallery", { image: source });
    }

    function closeBox() {
      if (!open) return;
      open = false;
      box.hidden = true;
      lockScroll(false);
      image.removeAttribute("src");
      image.setAttribute("alt", "");
      if (lastFocused) lastFocused.focus();
    }

    gallery.addEventListener("click", function (event) {
      const trigger = event.target.closest(".gallery__item");
      if (!trigger) return;
      event.preventDefault();
      openBox(trigger);
    });

    $$("[data-lightbox-close]", box).forEach(function (el) {
      el.addEventListener("click", closeBox);
    });

    document.addEventListener("keydown", function (event) {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeBox();
        return;
      }

      if (event.key === "Tab") {
        // Só o botão de fechar é focável: mantém o foco preso no diálogo
        event.preventDefault();
        if (closeButton) closeButton.focus();
      }
    });
  }

  /* ================================================================
     8. ANIMAÇÕES DE ENTRADA
     ================================================================ */

  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    let pending = items.slice();

    function reveal(el) {
      el.classList.add("is-visible");
      observer.unobserve(el);
      pending = pending.filter(function (item) { return item !== el; });
      if (!pending.length) window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    /* Rede de segurança: numa rolagem muito rápida (ou num salto por âncora)
       o elemento pode nunca ser amostrado dentro da viewport pelo observer.
       Aqui a gente varre o que já passou e revela na marra. */
    let ticking = false;

    function sweep() {
      ticking = false;
      const limit = window.innerHeight * 0.92;
      pending.slice().forEach(function (el) {
        if (el.getBoundingClientRect().top < limit) reveal(el);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
    }

    // stagger moderado entre irmãos do mesmo bloco
    const counters = new Map();
    items.forEach(function (el) {
      const parent = el.parentElement;
      const index = counters.get(parent) || 0;
      counters.set(parent, index + 1);
      el.style.setProperty("--reveal-delay", Math.min(index, 4) * 70 + "ms");
      observer.observe(el);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* ================================================================
     9. CABEÇALHO STICKY
     ================================================================ */

  function initStickyHeader() {
    const header = $("[data-header]");
    if (!header) return;

    let ticking = false;

    function update() {
      header.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ================================================================
     11. NAVEGAÇÃO INTERNA E aria-current
     ================================================================ */

  function initInPageNav() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute("href").slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });

      // move o foco para o destino, sem criar tabstop permanente
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", function handler() {
          target.removeAttribute("tabindex");
          target.removeEventListener("blur", handler);
        });
      }
      target.focus({ preventScroll: true });

      if (history.replaceState) history.replaceState(null, "", "#" + id);
    });
  }

  function initScrollSpy() {
    const links = $$('.nav-link[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach(function (link) {
      const section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) map.set(section, link);
    });
    if (!map.size) return;

    let current = null;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const link = map.get(entry.target);
        if (!link || link === current) return;

        links.forEach(function (item) { item.removeAttribute("aria-current"); });
        link.setAttribute("aria-current", "true");
        current = link;
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    map.forEach(function (link, section) {
      observer.observe(section);
      void link;
    });
  }

  /* ================================================================
     12. IMAGENS COM FALLBACK
     ================================================================ */

  function initImageFallback() {
    function swap(img) {
      const fallback = img.getAttribute("data-fallback") || "assets/images/ph-hero.svg";
      if (img.getAttribute("src") === fallback) return;
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
      img.setAttribute("src", fallback);
    }

    $$("img:not([data-lightbox-img])").forEach(function (img) {
      img.addEventListener("error", function handler() {
        img.removeEventListener("error", handler);
        swap(img);
      });

      // A imagem pode ter falhado antes deste script rodar
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap(img);
    });
  }

  /* ================================================================
     12a. ALTURA REAL DO CARD DE STATUS
     Alimenta --oven-status-height com a altura real (o CSS usa isso
     para achar o meio exato do card e reservar espaço na seção seguinte).
     ================================================================ */

  function initOvenStatusHeight() {
    const ovenStatus = $(".oven-status");
    if (!ovenStatus) return;

    function updateOvenStatusHeight() {
      const height = ovenStatus.offsetHeight;
      if (height > 0) {
        document.documentElement.style.setProperty("--oven-status-height", height + "px");
      }
    }

    updateOvenStatusHeight();

    if ("ResizeObserver" in window) {
      const ovenResizeObserver = new ResizeObserver(updateOvenStatusHeight);
      ovenResizeObserver.observe(ovenStatus);
    }

    window.addEventListener("resize", updateOvenStatusHeight, { passive: true });
  }

  /* ================================================================
     12b. VÍDEO DO HERO
     ================================================================ */

  function initHeroVideo() {
    const video = $(".hero-video");
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      video.pause();
      video.removeAttribute("autoplay");
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {
          document.documentElement.classList.add("hero-video-unavailable");
        });
      }
    }

    // Dispara a transição de entrada (opacity/scale) já definida em CSS
    // via body.is-loaded — um frame depois do load para garantir que a
    // transição seja visível em vez de "pular" direto pro estado final.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.add("is-loaded");
      });
    });
  }

  /* ================================================================
     13. FOLHAS DE MANJERICÃO (PARALLAX)
     ================================================================ */

  function initParallaxLeaves() {
    const leafEls = $$(".leaf");
    if (!leafEls.length) return;

    if (prefersReducedMotion()) {
      leafEls.forEach(function (el) {
        el.style.transform = "rotate(" + (parseFloat(el.getAttribute("data-rotate")) || 0) + "deg)";
      });
      return;
    }

    const leaves = leafEls.map(function (el) {
      const baseRotate = parseFloat(el.getAttribute("data-rotate")) || 0;
      return {
        el: el,
        speed: parseFloat(el.getAttribute("data-speed")) || 0.5,
        baseRotate: baseRotate,
        current: { x: 0, y: 0, rotate: baseRotate },
        target: { x: 0, y: 0, rotate: baseRotate }
      };
    });

    const EASE = 0.045;          // mais baixo = alcança o alvo mais devagar, sensação de peso/queda suave
    const MAX_EXTRA_ROTATE = 3.5;
    const MAX_SWAY = 12;
    const MAX_DRIFT_Y = 46;
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    function lerp(from, to, t) { return from + (to - from) * t; }

    // As folhas são fixed (ancoradas na tela). Em vez de um deslocamento
    // acumulado sem limite (que as levaria pra fora da tela num site
    // longo), o movimento oscila de forma limitada em torno da posição
    // base — assim elas continuam visíveis, "rolando" sobre todas as
    // seções, com cada camada reagindo numa velocidade/fase diferente.
    // O período é curto o bastante pra reagir de forma perceptível a
    // cada trecho normal de rolagem, não só nos primeiros pixels.
    function updateTargets() {
      const scrollY = window.scrollY || window.pageYOffset;
      const movementScale = mobileQuery.matches ? 0.5 : 1;

      leaves.forEach(function (leaf, index) {
        leaf.target.y = Math.sin(scrollY / 560 + index * 2.1) * MAX_DRIFT_Y * leaf.speed * movementScale;
        leaf.target.x = Math.sin(scrollY / 480 + index * 1.7) * MAX_SWAY * leaf.speed * movementScale;
        leaf.target.rotate = leaf.baseRotate + Math.sin(scrollY / 420 + index * 1.3) * MAX_EXTRA_ROTATE;
      });
    }

    let ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { updateTargets(); ticking = false; });
    }

    function animate() {
      leaves.forEach(function (leaf) {
        leaf.current.x = lerp(leaf.current.x, leaf.target.x, EASE);
        leaf.current.y = lerp(leaf.current.y, leaf.target.y, EASE);
        leaf.current.rotate = lerp(leaf.current.rotate, leaf.target.rotate, EASE);

        leaf.el.style.transform =
          "translate3d(" + leaf.current.x.toFixed(2) + "px, " + leaf.current.y.toFixed(2) + "px, 0) " +
          "rotate(" + leaf.current.rotate.toFixed(2) + "deg)";
      });
      window.requestAnimationFrame(animate);
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    updateTargets();
    window.requestAnimationFrame(animate);
  }

  /* ================================================================
     14. EVENTOS DE ANALYTICS
     ================================================================ */

  function initTracking() {
    document.addEventListener("click", function (event) {
      const el = event.target.closest("[data-track]");
      if (!el) return;
      trackEvent(el.getAttribute("data-track"), {
        href: el.getAttribute("href") || "",
        label: el.textContent.trim().slice(0, 60)
      });
    });
  }

  /* ================================================================
     BOOT
     ================================================================ */

  function boot() {
    initFillGuard();
    initHeroVideo();
    initMobileMenu();
    initYear();
    initOvenStatus();
    initOvenStatusHeight();
    initReviews();
    initAccordion();
    initLightbox();
    initReveal();
    initStickyHeader();
    initInPageNav();
    initScrollSpy();
    initImageFallback();
    initTracking();
    initParallaxLeaves();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
