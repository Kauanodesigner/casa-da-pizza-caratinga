/* ===================================================================
   EFEITO PARALLAX PREMIUM · MANJERICÃO
   script.js — Vanilla JS, sem bibliotecas.

   Como funciona:
   1. Cada folha (.leaf) guarda uma posição ALVO (target), calculada a
      partir do scroll, e uma posição ATUAL (current).
   2. A cada frame, a posição atual "persegue" o alvo com um pouco de
      atraso (lerp = interpolação linear). É esse atraso que dá a
      sensação de suavidade/peso, em vez de um movimento mecânico.
   3. Só a propriedade transform é tocada (translate3d + rotate), então
      não há reflow — apenas composição em GPU.
   =================================================================== */

(function () {
  "use strict";

  var leafEls = document.querySelectorAll(".leaf");
  if (!leafEls.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cada folha tem sua própria velocidade de parallax e rotação base,
  // lidas diretamente do HTML (data-speed / data-rotate).
  var leaves = Array.prototype.map.call(leafEls, function (el) {
    return {
      el: el,
      speed: parseFloat(el.dataset.speed) || 0.5,
      baseRotate: parseFloat(el.dataset.rotate) || 0,
      current: { x: 0, y: 0, rotate: parseFloat(el.dataset.rotate) || 0 },
      target: { x: 0, y: 0, rotate: parseFloat(el.dataset.rotate) || 0 }
    };
  });

  var EASE = 0.07;              // suavização do lerp: menor = mais lento/suave
  var MAX_EXTRA_ROTATE = 5;     // rotação extra máxima durante o scroll (±5°)
  var MAX_SWAY = 20;            // deslocamento horizontal orgânico máximo, em px
  var MAX_DRIFT_Y = 70;         // deslocamento vertical máximo, em px

  var mobileQuery = window.matchMedia("(max-width: 640px)");
  var ticking = false;

  function lerp(from, to, t) {
    return from + (to - from) * t;
  }

  // Recalcula o alvo de cada folha com base no scroll atual.
  //
  // As folhas são "fixed" (ancoradas na tela, não na página). Por isso o
  // movimento oscila de forma LIMITADA em torno da posição base, em vez
  // de acumular deslocamento sem fim — assim elas continuam visíveis do
  // início ao fim da página, "rolando" sobre todas as seções, com cada
  // camada reagindo numa velocidade e fase diferente (sensação de
  // profundidade sem nunca sair de tela).
  function updateTargets() {
    var scrollY = window.scrollY || window.pageYOffset;

    // No mobile o movimento é reduzido pela metade, como pedido.
    var movementScale = mobileQuery.matches ? 0.5 : 1;

    leaves.forEach(function (leaf, index) {
      leaf.target.y = Math.sin(scrollY / 420 + index * 2.1) * MAX_DRIFT_Y * leaf.speed * movementScale;
      leaf.target.x = Math.sin(scrollY / 360 + index * 1.7) * MAX_SWAY * leaf.speed * movementScale;
      leaf.target.rotate =
        leaf.baseRotate + Math.sin(scrollY / 300 + index * 1.3) * MAX_EXTRA_ROTATE;
    });

    ticking = false;
  }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateTargets);
  }

  // Loop principal: interpola suavemente até o alvo e aplica o transform.
  function animate() {
    leaves.forEach(function (leaf) {
      leaf.current.x = lerp(leaf.current.x, leaf.target.x, EASE);
      leaf.current.y = lerp(leaf.current.y, leaf.target.y, EASE);
      leaf.current.rotate = lerp(leaf.current.rotate, leaf.target.rotate, EASE);

      leaf.el.style.transform =
        "translate3d(" + leaf.current.x.toFixed(2) + "px, " + leaf.current.y.toFixed(2) + "px, 0) " +
        "rotate(" + leaf.current.rotate.toFixed(2) + "deg)";
    });

    requestAnimationFrame(animate);
  }

  if (reduceMotion) {
    // Respeita a preferência do usuário: mantém as folhas na posição
    // base, sem nenhuma animação contínua.
    leaves.forEach(function (leaf) {
      leaf.el.style.transform = "rotate(" + leaf.baseRotate + "deg)";
    });
    return;
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });

  updateTargets();
  requestAnimationFrame(animate);
})();
