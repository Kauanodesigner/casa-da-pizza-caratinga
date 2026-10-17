/* ===================================================================
   CASA DA PIZZA · CARATINGA/MG
   site.js — JavaScript puro, sem dependências. Todo o conteúdo já
   está no HTML (gerado por scripts/build.mjs); aqui só entram
   comportamento e animação.
   =================================================================== */

(function () {
  "use strict";

  // Todos os dias 18h–23h30, exceto terça (getDay() === 2).
  const HOURS = { open: 18 * 60, close: 23 * 60 + 30, closedDay: 2 };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------------- menu do celular -------------------------- */

  function initDrawer() {
    const button = $("[data-burger]");
    const drawer = $("[data-drawer]");
    if (!button || !drawer) return;

    function set(open) {
      button.setAttribute("aria-expanded", String(open));
      button.querySelector(".sr-only").textContent = open ? "Fechar menu" : "Abrir menu";
      document.documentElement.classList.toggle("is-menu-open", open);
      if (open) {
        drawer.hidden = false;
        requestAnimationFrame(() => drawer.classList.add("is-open"));
        const first = drawer.querySelector("a");
        if (first) first.focus();
      } else {
        drawer.classList.remove("is-open");
        drawer.hidden = true;
      }
    }

    button.addEventListener("click", () => set(button.getAttribute("aria-expanded") !== "true"));
    drawer.addEventListener("click", (event) => { if (event.target.closest("a")) set(false); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        set(false);
        button.focus();
      }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) set(false); });
  }

  /* ------------------------ cabeçalho e barra fixa ---------------------- */

  function initScrollChrome() {
    const top = $("[data-top]");
    const dock = $("[data-dock]");
    const hasHero = !!$(".hero");
    let ticking = false;

    function update() {
      const y = window.scrollY;
      if (top) top.classList.toggle("is-solid", y > 40 || !hasHero);
      if (dock) dock.classList.toggle("is-shown", y > window.innerHeight * 0.75);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------ entradas ------------------------------ */

  function initReveal() {
    const items = $$("[data-in], .reveal-img, .split-lines");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    // Atraso escalonado entre irmãos do mesmo bloco.
    const counters = new Map();
    items.forEach((el) => {
      if (el.hasAttribute("data-in")) {
        const n = counters.get(el.parentElement) || 0;
        counters.set(el.parentElement, n + 1);
        el.style.setProperty("--d", Math.min(n, 5) * 90 + "ms");
      }
      io.observe(el);
    });
  }

  /* ------------------------------ parallax ------------------------------ */

  function initParallax() {
    const items = $$("[data-parallax]");
    if (!items.length || reduceMotion) return;
    let ticking = false;

    function update() {
      const vh = window.innerHeight;
      items.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------ contadores ---------------------------- */

  function initCounters() {
    const items = $$("[data-count]");
    if (!items.length || reduceMotion || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const final = el.textContent;
        const target = parseFloat(el.getAttribute("data-count"));
        const decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
        const start = performance.now();
        const duration = 1600;

        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals).replace(".", ",");
          if (t < 1) requestAnimationFrame(frame);
          else el.textContent = final;
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.6 });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------ carrosséis ---------------------------- */

  function initCarousels() {
    $$("[data-carousel]").forEach((root) => {
      const track = $(".carousel__track", root);
      const prev = $("[data-prev]", root);
      const next = $("[data-next]", root);
      const bar = $(".carousel__bar span", root);
      if (!track) return;

      function step() {
        const item = track.firstElementChild;
        if (!item) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return item.getBoundingClientRect().width + gap;
      }

      function update() {
        const max = track.scrollWidth - track.clientWidth;
        const ratio = max > 0 ? track.scrollLeft / max : 0;
        const size = Math.min(1, track.clientWidth / track.scrollWidth);
        if (bar) {
          bar.style.width = (size * 100) + "%";
          bar.style.transform = "translateX(" + (ratio * (1 / size - 1) * 100) + "%)";
        }
        if (prev) prev.disabled = track.scrollLeft <= 4;
        if (next) next.disabled = track.scrollLeft >= max - 4;
      }

      if (prev) prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
      if (next) next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
      track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
      window.addEventListener("resize", update);

      // Arrastar com o mouse (no toque o navegador já faz isso).
      let down = false;
      let moved = false;
      let startX = 0;
      let startLeft = 0;
      track.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "mouse") return;
        down = true;
        moved = false;
        startX = event.clientX;
        startLeft = track.scrollLeft;
      });
      window.addEventListener("pointermove", (event) => {
        if (!down) return;
        const dx = event.clientX - startX;
        if (Math.abs(dx) > 5 && !moved) {
          moved = true;
          track.classList.add("is-dragging");
        }
        if (moved) track.scrollLeft = startLeft - dx;
      });
      window.addEventListener("pointerup", () => {
        if (!down) return;
        down = false;
        // Solta e deixa o scroll-snap encaixar no cartão mais próximo.
        if (moved) requestAnimationFrame(() => track.classList.remove("is-dragging"));
      });
      track.addEventListener("click", (event) => {
        if (moved) { event.preventDefault(); moved = false; }
      }, true);
      track.addEventListener("dragstart", (event) => event.preventDefault());

      update();
    });
  }

  /* ------------------------- avaliações (slider) ------------------------ */

  function initQuotes() {
    const root = $("[data-quotes]");
    if (!root) return;
    const quotes = $$(".quote", root);
    const dots = $$("[data-dot]", root.parentElement);
    if (quotes.length < 2) return;
    let index = 0;
    let timer = null;

    function show(i) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach((q, n) => {
        q.classList.toggle("is-active", n === index);
        q.setAttribute("aria-hidden", String(n !== index));
      });
      dots.forEach((d, n) => d.setAttribute("aria-current", String(n === index)));
    }
    function stop() { if (timer) window.clearInterval(timer); }
    function play() {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(() => show(index + 1), 6500);
    }

    dots.forEach((dot, n) => dot.addEventListener("click", () => { show(n); play(); }));
    root.parentElement.addEventListener("mouseenter", stop);
    root.parentElement.addEventListener("mouseleave", play);
    root.parentElement.addEventListener("focusin", stop);
    show(0);
    play();
  }

  /* --------------------------- status do forno -------------------------- */

  function initStatus() {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const open = day !== HOURS.closedDay && minutes >= HOURS.open && minutes < HOURS.close;

    let text;
    if (open) text = "Forno aceso · pedidos até 23h30";
    else if (day !== HOURS.closedDay && minutes < HOURS.open) text = "Forno apagado · acende hoje às 18h";
    else text = "Forno apagado · acende " + ((day + 1) % 7 === HOURS.closedDay ? "na quarta" : "amanhã") + " às 18h";

    $$("[data-status]").forEach((el) => el.setAttribute("data-state", open ? "open" : "closed"));
    $$("[data-status-text]").forEach((el) => { el.textContent = text; });
    $$('.hours li[data-day="' + day + '"]').forEach((li) => li.setAttribute("data-today", ""));
  }

  /* ------------------------ mapa (carrega no clique) -------------------- */

  function initMap() {
    $$("[data-map]").forEach((root) => {
      const button = $("button", root);
      if (!button) return;
      button.addEventListener("click", () => {
        const frame = document.createElement("iframe");
        frame.src = root.getAttribute("data-map");
        frame.title = "Mapa com a localização da Casa da Pizza";
        frame.loading = "lazy";
        frame.referrerPolicy = "no-referrer-when-downgrade";
        root.appendChild(frame);
        $(".map__load", root).remove();
      });
    });
  }

  /* ------------------------------ cardápio ------------------------------ */

  function normalize(text) {
    return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }

  function initMenu() {
    const menu = $("[data-menu]");
    if (!menu) return;

    const groups = $$(".group", menu);
    const tabs = $$(".tab");
    const search = $("[data-search]");
    const empty = $("[data-empty]");
    const preview = $("[data-preview]");

    // Aba ativa acompanha a categoria visível.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const href = "#" + entry.target.id;
          tabs.forEach((t) => t.setAttribute("aria-current", String(t.getAttribute("href") === href)));
          const active = tabs.find((t) => t.getAttribute("href") === href);
          const row = active && active.parentElement;
          if (row && row.scrollWidth > row.clientWidth) {
            row.scrollTo({ left: active.offsetLeft - 20, behavior: "smooth" });
          }
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      groups.forEach((g) => io.observe(g));
    }

    // Busca: esconde pratos e grupos sem resultado.
    if (search) {
      search.addEventListener("input", () => {
        const q = normalize(search.value.trim());
        let total = 0;
        groups.forEach((group) => {
          let count = 0;
          $$(".dish", group).forEach((dish) => {
            const hit = !q || normalize(dish.textContent).indexOf(q) !== -1;
            dish.hidden = !hit;
            if (hit) count++;
          });
          group.hidden = count === 0;
          total += count;
        });
        if (empty) empty.hidden = total > 0;
      });
    }

    // Foto ao lado (desktop): troca conforme o mouse passa pelos sabores.
    if (preview) {
      const img = $("img", preview);
      const cap = $("[data-preview-cap]", preview);
      let active = null;
      let timer = null;

      function show(dish) {
        if (!dish || dish === active || !dish.dataset.foto) return;
        if (active) active.classList.remove("is-active");
        active = dish;
        dish.classList.add("is-active");
        preview.classList.add("is-swapping");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          img.onload = () => preview.classList.remove("is-swapping");
          img.src = dish.dataset.foto;
          img.alt = "Pizza " + dish.dataset.nome;
          cap.textContent = dish.dataset.nome;
        }, 160);
      }

      menu.addEventListener("mouseover", (event) => show(event.target.closest(".dish")));
    }
  }

  /* -------------------------------- boot -------------------------------- */

  function boot() {
    initDrawer();
    initScrollChrome();
    initReveal();
    initParallax();
    initCounters();
    initCarousels();
    initQuotes();
    initStatus();
    initMap();
    initMenu();
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
