/* ===================================================================
   CASA DA PIZZA · gerador do site
   Uso: npm run build   (ou: node scripts/build.mjs)

   Gera todas as páginas em HTML estático a partir de data/cardapio.json
   e dos textos abaixo. O cardápio sai escrito no HTML (e não montado por
   JavaScript) para que Google e robôs de IA consigam ler sabores e preços.

   Domínio: casadapizzacaratinga.com.br, hospedado na Hostinger com deploy
   pelo Git (os HTML gerados vão no commit). Para outro endereço, rode com
   SITE_URL=...
   =================================================================== */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MENU = JSON.parse(readFileSync(join(ROOT, "data/cardapio.json"), "utf8"));

/* ============================ DADOS DA CASA ======================== */

const SITE = {
  url: (process.env.SITE_URL || "https://casadapizzacaratinga.com.br").replace(/\/$/, ""),
  name: "Casa da Pizza",
  legalName: "Casa da Pizza Delivery Caratinga LTDA",
  cnpj: "39.630.718/0001-05",
  founded: "2020-10-30",
  slogan: "Da nossa Casa, para sua Casa.",
  phone: "+55-33-99956-9957",
  phoneDisplay: "(33) 99956-9957",
  whatsapp: "5533999569957",
  street: "Rua Manoel Gonçalves de Castro, 164",
  district: "Esplanada",
  city: "Caratinga",
  state: "MG",
  cep: "35300-321",
  instagram: "https://www.instagram.com/casadapizzactga/",
  instagramHandle: "@casadapizzactga",
  instagramFollowers: "7,2 mil",
  order: "https://pedir.delivery/app/casadapizza-mg/menu",
  google: "https://share.google/fEjlEVdemwa1Arjca",
  rating: "5,0",
  reviews: 28,
  updated: "outubro de 2026",
  owners: ["Leandra", "Alan"]
};

// Bairros de Caratinga (zona urbana). Entregamos na cidade toda.
const BAIRROS = ["Anápolis", "Barro Branco", "Bela Vista", "Bom Pastor", "Centro", "Dário Grossi", "Dos Rodoviários", "Doutor Eduardo Daladier Pereira", "Esperança", "Esplanada", "Floresta", "Graça", "Itaúna", "Jardim Francisco Pena", "José Moysés Nacif", "Limoeiro", "Manoel Ribeiro Sobrino", "Maria da Glória", "Monte Líbano", "Morro Escorpião", "Nossa Senhora Aparecida", "Nossa Senhora das Graças", "Rafael José de Lima", "Salatiel", "Santa Cruz", "Santa Zita", "Santo Antônio", "Vale do Sol", "Zacarias"];

const MAPS_QUERY = encodeURIComponent(`Casa da Pizza, ${SITE.street}, ${SITE.district}, ${SITE.city} - ${SITE.state}`);
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

// Domingo = 0 … Sábado = 6 (mesma convenção do JavaScript).
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SCHEMA_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CLOSED_DAY = 2;
const OPENS = "18:00";
const CLOSES = "23:30";
const HOURS_TEXT = "todos os dias, menos terça, das 18h às 23h30";

const REVIEWS = [
  { text: "Umas das pizzas mais equilibradas q ja comi. Chegou em casa parecendo q saiu do forno. Super recomendo", author: "Pedro Laércio" },
  { text: "Melhor pizza da cidade! Produtos de alta qualidade, a um preço muito acessível!", author: "Fabio Ferreira" },
  { text: "Melhor pizza de Caratinga!! 🤤 E com a entrega mais rápida da cidade! 👏🏽", author: "Alexander Vieira" },
  { text: "Pizza deliciosa, melhor da cidade, a minha preferida é metade strogonoff metade calabresa Premium!", author: "Jose Wagner" },
  { text: "Pedi pra entregar e foi bem rápido, e as delícias são as melhores da cidade", author: "Maria Vieira" }
];

/* ============================ UTILITÁRIOS ========================== */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const money = (v) => v.toFixed(2).replace(".", ",");
const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const wa = (msg) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
const abs = (path) => SITE.url + path;
const joinList = (arr) => arr.join(", ").replace(/, ([^,]*)$/, " e $1");

const WA_ORDER = wa("Olá! Vim pelo site da Casa da Pizza.");
const WA_RESERVA = wa("Olá! Gostaria de reservar uma mesa no salão da Casa da Pizza.");
const WA_ANIVER = wa("Olá! Quero comemorar um aniversário no salão da Casa da Pizza.");

const salgadas = MENU.categorias.find((c) => c.id === "salgadas");
const doces = MENU.categorias.find((c) => c.id === "doces");
const totalSabores = salgadas.itens.length + doces.itens.length;
const pizzas = [...salgadas.itens, ...doces.itens];
const min25 = Math.min(...pizzas.map((i) => i.p25));
const min35 = Math.min(...pizzas.map((i) => i.p35));
const max25 = Math.max(...pizzas.map((i) => i.p25));
const max35 = Math.max(...pizzas.map((i) => i.p35));
const find = (nome) => pizzas.find((i) => i.nome === nome);

const ICON = {
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M4 12h15M13 6l6 6-6 6"/></svg>',
  out: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M8 7h9v9"/></svg>',
  prev: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M20 12H5M11 6l-6 6 6 6"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M4 12h15M13 6l6 6-6 6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.9.53 3.68 1.45 5.2L2 22l5.1-1.6a9.79 9.79 0 0 0 4.94 1.32h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.9h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.03.95.96-2.95-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.68-8.16 8.2-8.16 2.19 0 4.24.85 5.79 2.39a8.09 8.09 0 0 1 2.4 5.78c0 4.5-3.68 8.16-8.2 8.16Zm4.5-6.11c-.24-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.28.18-.52.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.3-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.73 2.64 4.2 3.7.58.26 1.04.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.45-.59 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.1-.22-.16-.46-.29Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></g></svg>'
};

const NEW_TAB = ' target="_blank" rel="noopener noreferrer"';
const orderLink = (label, cls = "btn btn--solid") =>
  `<a class="${cls}" href="${SITE.order}"${NEW_TAB} data-track="pedido">${label} ${ICON.out}<span class="sr-only"> (abre o cardápio online)</span></a>`;

/* ------------------------------ imagens ------------------------------ */

function photo(slug, alt, sizes = "(max-width: 640px) 80vw, 33vw", extra = "") {
  const base = `/assets/images/menu/${slug}`;
  return `<img src="${base}-960.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w" sizes="${sizes}" width="960" height="960" loading="lazy" decoding="async" alt="${esc(alt)}"${extra}>`;
}

function fachada(alt, sizes = "(max-width: 1023px) 100vw, 60vw", extra = "") {
  return `<picture><source type="image/webp" srcset="/assets/images/fachada-900.webp 900w, /assets/images/fachada-1440.webp 1440w" sizes="${sizes}"><img src="/assets/images/fachada-1440.jpg" srcset="/assets/images/fachada-900.jpg 900w, /assets/images/fachada-1440.jpg 1440w" sizes="${sizes}" width="1440" height="1080" loading="lazy" decoding="async" alt="${esc(alt)}"${extra}></picture>`;
}

const FACHADA_ALT = "Fachada da Casa da Pizza à noite, com o letreiro aceso e o salão iluminado, com mesas e jardim vertical ao fundo.";

function donos(extra = "") {
  return `<img src="/assets/images/foto-donos-900.jpg" srcset="/assets/images/foto-donos-500.jpg 500w, /assets/images/foto-donos-900.jpg 900w" sizes="(max-width: 1023px) 100vw, 45vw" width="900" height="1125" loading="lazy" decoding="async" alt="A família por trás da Casa da Pizza."${extra}>`;
}

/* ---------------------------- componentes ---------------------------- */

function hoursList() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `<ul class="hours">${order.map((d) =>
    `<li data-day="${d}"><span>${DAYS[d]}</span><span>${d === CLOSED_DAY ? "Fechado" : "18h – 23h30"}</span></li>`
  ).join("")}</ul>`;
}

function carousel(items, { wide = false, label }) {
  return `<div class="carousel${wide ? " carousel--wide" : ""}" data-carousel>
    <ul class="carousel__track" aria-label="${esc(label)}">${items.join("")}</ul>
    <div class="wrap carousel__ui">
      <div class="carousel__bar" aria-hidden="true"><span></span></div>
      <div class="carousel__btns">
        <button class="carousel__btn" type="button" data-prev aria-label="Anterior">${ICON.prev}</button>
        <button class="carousel__btn" type="button" data-next aria-label="Próximo">${ICON.next}</button>
      </div>
    </div>
  </div>`;
}

function pizzaCard(item, badge) {
  return `<li>
    <a class="card" href="${SITE.order}"${NEW_TAB} data-track="pedido">
      <div class="card__media">
        ${photo(item.foto, `Pizza ${item.nome} da Casa da Pizza`, "(max-width: 640px) 78vw, 30vw")}
        ${badge ? `<span class="card__badge">${badge}</span>` : ""}
        <span class="card__order">Pedir ${ICON.out}</span>
      </div>
      <div class="card__row"><h3 class="card__name">${esc(item.nome)}</h3><span class="card__price">a partir de R$ ${money(item.p25)}</span></div>
      <p class="card__desc">${esc(item.desc)}</p>
      <span class="sr-only">(abre o cardápio online)</span>
    </a>
  </li>`;
}

function marquee(names, cream = false) {
  const row = names.map((n) => `<span>${esc(n)}</span>`).join("");
  return `<div class="marquee${cream ? " marquee--cream" : ""}" aria-hidden="true"><div class="marquee__track">${row}${row}</div></div>`;
}

function faqList(items) {
  return `<div class="faq">${items.map((q) => `
    <details>
      <summary>${esc(q.q)}</summary>
      <div class="faq__a">${q.a}</div>
    </details>`).join("")}</div>`;
}

function crumbs(trail) {
  return `<nav aria-label="Você está em"><ol class="crumbs">${trail.map((t, i) =>
    i === trail.length - 1 ? `<li aria-current="page">${esc(t.name)}</li>` : `<li><a href="${t.path}">${esc(t.name)}</a></li>`
  ).join("")}</ol></nav>`;
}

// Título em linhas que sobem: cada string do array vira uma linha.
const lines = (arr) => arr.map((l) => `<span class="line"><span>${l}</span></span>`).join("");

function pageHead({ trail, kicker, title, lead, bg, actions = "" }) {
  return `<header class="page-head">
    <div class="page-head__bg" aria-hidden="true"><div data-parallax="0.12">${bg}</div></div>
    <div class="wrap">
      ${crumbs(trail)}
      <p class="kicker" style="margin-top:36px">${kicker}</p>
      <h1 class="title">${title}</h1>
      <p class="lead" data-in>${lead}</p>
      ${actions ? `<div class="actions" data-in>${actions}</div>` : ""}
    </div>
  </header>`;
}

function placeBlock(extraClass = "block--ink-2") {
  return `<section class="block ${extraClass}" aria-labelledby="onde-title">
    <div class="wrap place">
      <div>
        <p class="kicker">Onde estamos</p>
        <h2 class="title" id="onde-title">Onde estamos</h2>
        <address class="lead" style="margin-top:24px">${SITE.street}<br>${SITE.district} · ${SITE.city}, ${SITE.state} · ${SITE.cep}</address>
        <dl class="data">
          <div><dt>WhatsApp e telefone</dt><dd><a href="${WA_ORDER}"${NEW_TAB}>${SITE.phoneDisplay}</a></dd></div>
          <div><dt>Instagram</dt><dd><a href="${SITE.instagram}"${NEW_TAB}>${SITE.instagramHandle}</a></dd></div>
          <div><dt>Horário · delivery, retirada e salão</dt><dd>${hoursList()}</dd></div>
        </dl>
        <div class="actions">
          <a class="btn btn--ghost" href="${MAPS_LINK}"${NEW_TAB}>Como chegar ${ICON.out}</a>
          <a class="btn btn--ghost" href="${WA_ORDER}"${NEW_TAB}>${ICON.wa} WhatsApp</a>
        </div>
      </div>
      <div class="map" data-map="${esc(MAPS_EMBED)}">
        <div class="map__load">
          <button class="btn btn--ghost" type="button">Carregar o mapa</button>
          <p>O mapa é do Google e só carrega se você clicar.</p>
        </div>
      </div>
    </div>
  </section>`;
}

function ctaBlock(title = "Bateu a fome? O cardápio tá aqui.", slug = "executiva") {
  return `<section class="cta" aria-labelledby="cta-title">
    <img src="/assets/images/menu/${slug}-960.webp" width="960" height="960" loading="lazy" decoding="async" alt="" data-parallax="0.08">
    <div class="wrap">
      <h2 class="title title--xl" id="cta-title">${title}</h2>
      <div class="actions" data-in>${orderLink("Ver cardápio e pedir")}<a class="btn btn--ghost" href="${WA_ORDER}"${NEW_TAB}>${ICON.wa} Chamar no WhatsApp</a></div>
      <p class="note" data-in>O pedido é feito no nosso cardápio online: lá você escolhe entrega ou retirada e paga.</p>
    </div>
  </section>`;
}

/* ============================ PERGUNTAS ============================ */

const veg = salgadas.itens.filter((i) => !/(calabresa|frango|bacon|presunto|lombo|lombinho|peru|atum|tilápia|filé|pepperoni|strogonoff)/i.test(i.desc + " " + i.nome));

const FAQ = [
  { group: "Pedidos e entrega", items: [
    { home: true, q: "Como faço um pedido na Casa da Pizza?", a: `<p>Pelo nosso <a href="${SITE.order}"${NEW_TAB}>cardápio online</a>: lá você monta a pizza, escolhe entrega ou retirada e faz o pagamento. Se preferir, também atendemos pelo WhatsApp <a href="${WA_ORDER}"${NEW_TAB}>${SITE.phoneDisplay}</a>.</p>` },
    { home: true, q: "Quanto tempo demora a entrega?", a: "<p>Cerca de 1 hora a 1h10 para entrega em Caratinga. Na retirada, a pizza fica pronta em cerca de 30 minutos. Nas noites de sexta e sábado pode passar um pouco disso.</p>" },
    { q: "Vocês entregam no meu bairro? Qual é a taxa?", a: `<p>Entregamos em todos os bairros de Caratinga, como ${joinList(BAIRROS.slice(0, 12))}, entre outros. A taxa depende do endereço e aparece no <a href="${SITE.order}"${NEW_TAB}>cardápio online</a> antes de você fechar o pedido. <a href="/delivery/#bairros">Ver todos os bairros</a>.</p>` },
    { home: true, q: "Quais são as formas de pagamento?", a: "<p>Pix, cartão ou dinheiro. Se for pagar em dinheiro, avise no pedido se precisa de troco.</p>" },
    { q: "O entregador sobe até o apartamento?", a: "<p>Pela Lei Municipal nº 4056/2025, os entregadores não são obrigados a subir em prédios. Se precisar que o motoboy suba, avise na hora do pedido.</p>" }
  ]},
  { group: "Pizzas e cardápio", items: [
    { q: "Quais são os tamanhos de pizza?", a: "<p>Dois: 25 cm, com 4 pedaços, e 35 cm, com 8 pedaços.</p>" },
    { home: true, q: "Posso pedir pizza meio a meio?", a: "<p>Pode. Toda pizza aceita até dois sabores, inclusive metade salgada e metade doce. No meio a meio, vale o preço do sabor mais caro.</p>" },
    { q: "Quanto custa uma pizza na Casa da Pizza?", a: `<p>A pizza de 25 cm custa de R$ ${money(min25)} a R$ ${money(max25)}, e a de 35 cm de R$ ${money(min35)} a R$ ${money(max35)}, conforme o sabor. Veja todos os preços no <a href="/cardapio/">cardápio</a>.</p>` },
    { q: "Tem borda recheada?", a: `<p>Tem: ${joinList(MENU.bordas.map((b) => b.nome.toLowerCase()))}. A partir de R$ ${money(Math.min(...MENU.bordas.map((b) => b.p25)))} na pizza de 25 cm e R$ ${money(Math.min(...MENU.bordas.map((b) => b.p35)))} na de 35 cm.</p>` },
    { q: "Quais são as pizzas mais pedidas?", a: `<p>${joinList(salgadas.itens.filter((i) => i.destaque).map((i) => i.nome))}.</p>` },
    { q: "Tem pizza sem carne?", a: `<p>Tem. Entre as salgadas, não levam carne: ${joinList(veg.map((i) => i.nome))}. As ${doces.itens.length} pizzas doces também não levam carne.</p>` },
    { q: "Além de pizza, o que tem no cardápio?", a: "<p>Massas (fettuccine, espaguete à bolonhesa e espaguete ao alho e óleo com bacon, em porções P, M e G), filé de tilápia e porções de fritas.</p>" }
  ]},
  { group: "Salão, reservas e aniversários", items: [
    { home: true, q: "A Casa da Pizza tem salão para comer no local?", a: `<p>Tem. O salão abre no mesmo horário do delivery: ${HOURS_TEXT}.</p>` },
    { q: "Vocês aceitam reserva de mesa?", a: `<p>Aceitamos. Chame no <a href="${WA_RESERVA}"${NEW_TAB}>WhatsApp</a> com o dia, o horário e o número de pessoas.</p>` },
    { q: "Posso comemorar aniversário na Casa da Pizza?", a: `<p>Pode. Combine com a gente pelo <a href="${WA_ANIVER}"${NEW_TAB}>WhatsApp</a> a data, o horário e quantas pessoas vêm, para a gente reservar as mesas.</p>` },
    { q: "Vocês fazem pizza para evento fora do horário?", a: `<p>Pode ser. Chame a gente no <a href="${WA_ORDER}"${NEW_TAB}>WhatsApp</a> contando a data e o horário do evento, e a gente vê a disponibilidade.</p>` }
  ]},
  { group: "Horário e endereço", items: [
    { q: "Quem são os donos da Casa da Pizza?", a: "<p>Leandra e Alan. A Casa começou no quintal de casa, vendendo duas pizzas por R$ 50, e abriu como empresa em outubro de 2020, no bairro Esplanada.</p>" },
    { home: true, q: "Qual é o horário de funcionamento?", a: `<p>Abrimos ${HOURS_TEXT}. Terça é o dia de folga da equipe.</p>` },
    { q: "A Casa da Pizza abre na terça-feira?", a: "<p>Não. Terça é o dia de folga. Abrimos de quarta a segunda, das 18h às 23h30.</p>" },
    { q: "Onde fica a Casa da Pizza?", a: `<p>Na ${SITE.street}, bairro ${SITE.district}, em ${SITE.city}, ${SITE.state}. <a href="${MAPS_LINK}"${NEW_TAB}>Abrir no mapa</a>.</p>` },
    { q: "Qual é o telefone da Casa da Pizza?", a: `<p>${SITE.phoneDisplay}, que também é o nosso <a href="${WA_ORDER}"${NEW_TAB}>WhatsApp</a>.</p>` }
  ]}
];
const ALL_FAQ = FAQ.flatMap((g) => g.items);
const homeFaq = ALL_FAQ.filter((q) => q.home);

/* ============================ SCHEMA.ORG ========================== */

const RESTAURANT_ID = abs("/#restaurante");

function restaurantSchema() {
  return {
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    taxID: SITE.cnpj,
    foundingDate: SITE.founded,
    founder: SITE.owners.map((name) => ({ "@type": "Person", name })),
    slogan: SITE.slogan,
    description: `Pizzaria no bairro ${SITE.district}, em ${SITE.city} (${SITE.state}). Pizzas de 25 cm e 35 cm com até dois sabores, massas e porções. Delivery, retirada e salão.`,
    url: abs("/"),
    telephone: SITE.phone,
    image: [abs("/assets/images/fachada-1440.jpg"), abs("/assets/images/menu/calabresa-960.webp")],
    logo: abs("/assets/images/logo-casa-da-pizza-lockup-completo-transparente.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${SITE.street} - ${SITE.district}`,
      addressLocality: SITE.city,
      addressRegion: SITE.state,
      postalCode: SITE.cep,
      addressCountry: "BR"
    },
    hasMap: MAPS_LINK,
    areaServed: [{ "@type": "City", name: `${SITE.city}, ${SITE.state}` }, ...BAIRROS.map((b) => ({ "@type": "Place", name: `${b}, ${SITE.city}` }))],
    servesCuisine: ["Pizza", "Italiana", "Massas"],
    priceRange: "R$ 20–40",
    currenciesAccepted: "BRL",
    paymentAccepted: "Pix, cartão de crédito, cartão de débito, dinheiro",
    acceptsReservations: true,
    hasMenu: abs("/cardapio/"),
    openingHoursSpecification: [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAYS.filter((_, i) => i !== CLOSED_DAY).map((d) => `https://schema.org/${d}`),
      opens: OPENS,
      closes: CLOSES
    }],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Salão para refeições no local", value: true },
      { "@type": "LocationFeatureSpecification", name: "Delivery", value: true },
      { "@type": "LocationFeatureSpecification", name: "Retirada no balcão", value: true },
      { "@type": "LocationFeatureSpecification", name: "Reserva de mesa", value: true },
      { "@type": "LocationFeatureSpecification", name: "Comemoração de aniversário", value: true }
    ],
    sameAs: [SITE.instagram, SITE.order],
    potentialAction: {
      "@type": "OrderAction",
      target: { "@type": "EntryPoint", urlTemplate: SITE.order, actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"] },
      deliveryMethod: ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet", "http://purl.org/goodrelations/v1#DeliveryModePickUp"]
    }
  };
}

function menuSchema() {
  return {
    "@type": "Menu",
    "@id": abs("/cardapio/#menu"),
    name: "Cardápio da Casa da Pizza",
    inLanguage: "pt-BR",
    hasMenuSection: MENU.categorias.map((cat) => ({
      "@type": "MenuSection",
      name: cat.nome,
      hasMenuItem: cat.itens.map((item) => {
        let offers;
        if (cat.tamanhos) offers = [["25 cm", item.p25], ["35 cm", item.p35]];
        else if (item.variantes) offers = item.variantes;
        else offers = [[null, item.preco]];
        return {
          "@type": "MenuItem",
          name: item.nome,
          description: item.desc,
          ...(item.foto ? { image: abs(`/assets/images/menu/${item.foto}-960.webp`) } : {}),
          offers: offers.map(([name, price]) => ({ "@type": "Offer", ...(name ? { name } : {}), price: price.toFixed(2), priceCurrency: "BRL" }))
        };
      })
    }))
  };
}

function faqSchema(items) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: strip(q.a) } }))
  };
}

function graph(page) {
  const nodes = [
    { "@type": "WebSite", "@id": abs("/#site"), url: abs("/"), name: SITE.name, inLanguage: "pt-BR", publisher: { "@id": RESTAURANT_ID } },
    restaurantSchema(),
    {
      "@type": page.type || "WebPage",
      "@id": abs(page.path + "#pagina"),
      url: abs(page.path),
      name: page.title,
      description: page.description,
      inLanguage: "pt-BR",
      isPartOf: { "@id": abs("/#site") },
      about: { "@id": RESTAURANT_ID }
    }
  ];
  if (page.trail) {
    nodes.push({
      "@type": "BreadcrumbList",
      itemListElement: page.trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.path) }))
    });
  }
  if (page.schema) nodes.push(...page.schema);
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }, null, 1).replace(/</g, "\\u003c");
}

/* ============================ LAYOUT ============================== */

const NAV = [
  { path: "/cardapio/", label: "Cardápio", hint: `${totalSabores} sabores` },
  { path: "/salao/", label: "O salão", hint: "reservas e aniversários" },
  { path: "/delivery/", label: "Delivery", hint: "entrega e retirada" },
  { path: "/sobre/", label: "Sobre", hint: "desde 2020" },
  { path: "/contato/", label: "Contato", hint: "endereço e horário" }
];

function header(path) {
  const links = NAV.map((n) => `<a href="${n.path}"${n.path === path ? ' aria-current="page"' : ""}>${n.label}</a>`).join("");
  return `<header class="top" data-top>
    <div class="wrap top__inner">
      <a class="top__logo" href="/" aria-label="Casa da Pizza, página inicial"><img src="/assets/images/logo-casa-da-pizza-completo-transparente.png" width="585" height="329" alt="Casa da Pizza"></a>
      <nav class="top__nav" aria-label="Principal">${links}</nav>
      <span class="top__cta">${orderLink("Pedir agora", "btn btn--solid btn--sm")}</span>
      <button class="burger" type="button" data-burger aria-expanded="false" aria-controls="menu"><span aria-hidden="true"></span><span class="sr-only">Abrir menu</span></button>
    </div>
  </header>
  <div class="drawer" id="menu" data-drawer hidden>
    <nav aria-label="Menu do celular">
      <a href="/">Início <small>a Casa</small></a>
      ${NAV.map((n) => `<a href="${n.path}">${n.label} <small>${n.hint}</small></a>`).join("")}
      <a href="/perguntas-frequentes/">Perguntas <small>respostas rápidas</small></a>
    </nav>
    <div class="actions">${orderLink("Ver cardápio e pedir")}<a class="btn btn--ghost" href="${WA_ORDER}"${NEW_TAB}>${ICON.wa} WhatsApp</a></div>
  </div>`;
}

function footer() {
  return `<footer class="foot">
    <div class="wrap">
      <p class="foot__big"><a href="${SITE.order}"${NEW_TAB}>Hoje tem pizza da Casa. ↗<span class="sr-only"> Abrir o cardápio online</span></a></p>
      <div class="foot__grid">
        <div class="foot__brand">
          <img src="/assets/images/logo-casa-da-pizza-lockup-completo-transparente.png" width="681" height="371" alt="Casa da Pizza, da nossa Casa, pra sua Casa!" loading="lazy" decoding="async">
          <p>${SITE.slogan} Pizzaria em ${SITE.city} desde 2020: delivery, retirada e salão.</p>
        </div>
        <div>
          <h2>Visite</h2>
          <address>${SITE.street}<br>${SITE.district} · ${SITE.city}, ${SITE.state}<br>CEP ${SITE.cep}</address>
          <p style="margin-top:12px"><a href="${MAPS_LINK}"${NEW_TAB}>Abrir no mapa ↗</a></p>
        </div>
        <div>
          <h2>Horário</h2>
          ${hoursList()}
        </div>
        <div>
          <h2>A Casa</h2>
          <ul>
            <li><a href="/cardapio/">Cardápio e preços</a></li>
            <li><a href="/salao/">Salão e reservas</a></li>
            <li><a href="/delivery/">Delivery e retirada</a></li>
            <li><a href="/sobre/">Nossa história</a></li>
            <li><a href="/perguntas-frequentes/">Perguntas frequentes</a></li>
            <li><a href="/contato/">Contato</a></li>
            <li><a href="${WA_ORDER}"${NEW_TAB}>WhatsApp ${SITE.phoneDisplay}</a></li>
            <li><a href="${SITE.instagram}"${NEW_TAB}>Instagram ${SITE.instagramHandle}</a></li>
          </ul>
        </div>
      </div>
      <div class="foot__bottom">
        <p>${SITE.legalName} · CNPJ ${SITE.cnpj}</p>
        <ul>
          <li><a href="/politica-de-privacidade/">Política de privacidade</a></li>
          <li><a href="/acessibilidade/">Acessibilidade</a></li>
          <li>© ${new Date().getFullYear()} ${SITE.name}</li>
        </ul>
      </div>
    </div>
  </footer>
  <div class="dock" data-dock>
    ${orderLink("Ver cardápio e pedir")}
    <a class="btn btn--ghost" href="${WA_ORDER}"${NEW_TAB} aria-label="Chamar no WhatsApp">${ICON.wa}</a>
  </div>`;
}

// Sem etiquetas acima dos títulos: as que nomeiam uma seção (têm id)
// ficam só para leitores de tela; as demais saem do HTML.
function dropKickers(html) {
  return html.replace(/<p class="kicker[^"]*"( id="[^"]+")?[^>]*>([\s\S]*?)<\/p>\s*/g,
    (m, id, inner) => (id ? `<p class="sr-only"${id}>${inner}</p>` : ""));
}

function layout(page) {
  page.body = dropKickers(page.body);
  const ogImage = abs("/assets/images/og-casa-da-pizza.jpg");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${abs(page.path)}">
<meta name="robots" content="${page.noindex ? "noindex" : "index, follow, max-image-preview:large"}">
<meta name="theme-color" content="#0F0D0B">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:url" content="${abs(page.path)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Fachada da Casa da Pizza em Caratinga à noite.">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="BR-MG">
<meta name="geo.placename" content="${SITE.city}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/barlow-condensed-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${page.preload || ""}
<link rel="stylesheet" href="/assets/css/site.css">
<script>document.documentElement.classList.add("js")</script>
<script type="application/ld+json">${graph(page)}</script>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${header(page.path)}
<main id="conteudo">
${page.body}
</main>
${footer()}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

/* ============================ PÁGINAS ============================== */

const pages = [];
const HOME = { name: "Início", path: "/" };

/* ------------------------------ início ------------------------------ */

const picks = salgadas.itens.filter((i) => i.destaque);
const elogiadas = ["Calabresa Premium", "Strogonoff de Carne", "Palmito Real"].map(find);

pages.push({
  path: "/",
  title: "Casa da Pizza · Pizzaria em Caratinga, MG | Delivery e salão",
  description: `Pizzaria no bairro ${SITE.district}, em ${SITE.city}. ${totalSabores} sabores de pizza em 25 e 35 cm com até dois sabores, massas e porções. Delivery, retirada e salão ${HOURS_TEXT}.`,
  preload: '<link rel="preload" as="image" href="/assets/images/hero-poster-1920.webp" imagesrcset="/assets/images/hero-poster-900.webp 900w, /assets/images/hero-poster-1920.webp 1920w" imagesizes="100vw" fetchpriority="high">',
  schema: [faqSchema(homeFaq)],
  body: `
<section class="hero" aria-labelledby="hero-title">
  <video class="hero__video" autoplay muted loop playsinline preload="metadata" poster="/assets/images/hero-poster-1920.webp" aria-hidden="true">
    <source src="/assets/videos/video-hero-pizza-mobile.mp4" type="video/mp4" media="(max-width: 767px)">
    <source src="/assets/videos/video-hero-pizza.mp4" type="video/mp4">
  </video>
  <div class="hero__shade" aria-hidden="true"></div>
  <div class="wrap hero__content">
    <p class="kicker hero__fade">Pizzaria · ${SITE.district}, ${SITE.city}</p>
    <h1 class="hero__title split-lines" id="hero-title">${lines(["Da nossa <em>Casa</em>,", "para a sua."])}</h1>
    <p class="hero__lead hero__fade">Pizza feita na hora em Caratinga. Pra receber em casa, buscar no balcão ou comer aqui no salão.</p>
    <div class="actions hero__fade">${orderLink("Ver cardápio e pedir")}<a class="btn btn--ghost" href="/salao/">Conhecer o salão</a></div>
  </div>
  <div class="status" data-status data-state="closed">
    <div class="wrap status__inner">
      <p class="status__now"><span class="status__dot" aria-hidden="true"></span><span data-status-text>Aberto ${HOURS_TEXT}</span></p>
      <p class="status__hours">Delivery, retirada e salão · 18h às 23h30 · terça fechado</p>
      <a class="status__rating" href="${SITE.google}"${NEW_TAB}><span aria-hidden="true">★</span> ${SITE.rating} <small>· ${SITE.reviews} avaliações no Google</small></a>
    </div>
  </div>
</section>

${marquee(pizzas.map((i) => i.nome))}

<section class="block block--cream on-cream" aria-labelledby="casa-title">
  <div class="wrap intro">
    <div>
      <p class="kicker" id="casa-title">A Casa</p>
      <p class="intro__text">A gente começou no quintal de casa, vendendo duas pizzas por R$ 50. Hoje a Casa da Pizza fica no bairro ${SITE.district}, em ${SITE.city}, e faz ${totalSabores} sabores de pizza, além de massas e porções.</p>
      <p class="intro__text" style="margin-top:20px">Dá pra pedir pra entregar, buscar no balcão ou comer aqui no salão. Só não abrimos na terça, que é a folga da equipe.</p>
      <p class="intro__sign">Leandra e Alan</p>
    </div>
    <div class="mosaic">
      <figure class="reveal-img">${photo("pepperoni", "Pizza de pepperoni com azeitonas", "(max-width: 1023px) 55vw, 28vw")}</figure>
      <figure class="reveal-img">${photo("marguerita", "Pizza marguerita com tomate e manjericão", "(max-width: 1023px) 45vw, 22vw")}</figure>
      <figure class="reveal-img">${fachada(FACHADA_ALT, "(max-width: 1023px) 50vw, 25vw")}</figure>
      <span class="mosaic__tag">assada na hora</span>
    </div>
  </div>
</section>

<section class="block" aria-labelledby="picks-title">
  <div class="wrap head head--row">
    <div>
      <p class="kicker">Mais pedidas</p>
      <h2 class="title" id="picks-title">O que mais sai do forno</h2>
    </div>
    <a class="link" href="/cardapio/">Ver os ${totalSabores} sabores ${ICON.arrow}</a>
  </div>
  ${carousel([...picks.map((i) => pizzaCard(i, "Mais pedida")), ...elogiadas.map((i) => pizzaCard(i, "Elogiada no Google"))], { label: "Pizzas mais pedidas" })}
</section>

<section class="block block--ink-2" aria-labelledby="jeito-title">
  <div class="wrap craft">
    <figure class="craft__photo reveal-img">${photo("do-chef", "Pizza Do Chef com presunto, bacon, tomate e manjericão", "(max-width: 1023px) 100vw, 45vw")}</figure>
    <div>
      <p class="kicker">Do nosso jeito</p>
      <h2 class="title" id="jeito-title" style="margin-bottom:40px">Pizza do jeito que a gente come em casa</h2>
      <ol class="craft__list">
        <li data-in><h3>Massa na medida</h3><p>Leve, no ponto de segurar o recheio sem virar pão. Foi a primeira coisa que a gente acertou.</p></li>
        <li data-in><h3>Recheio sem economia</h3><p>Ingrediente até a borda, do primeiro ao último pedaço.</p></li>
        <li data-in><h3>Assada na hora</h3><p>A pizza só entra no forno depois que o pedido chega. Nada fica pronto esperando.</p></li>
        <li data-in><h3>Dois sabores, sem complicação</h3><p>Meio a meio em qualquer tamanho, inclusive metade salgada e metade doce.</p></li>
      </ol>
    </div>
  </div>
</section>

<section class="block" aria-labelledby="cats-title">
  <div class="wrap">
    <div class="head head--row">
      <div>
        <p class="kicker">Cardápio</p>
        <h2 class="title" id="cats-title">Cardápio</h2>
      </div>
      <a class="link" href="/cardapio/">Cardápio completo com preços ${ICON.arrow}</a>
    </div>
    <div class="cats">
      <a class="cat" href="/cardapio/#salgadas" data-in>${photo("calabresa-premium", "Pizza Calabresa Premium", "(max-width: 640px) 100vw, 50vw")}<span class="cat__body"><span><span class="cat__name">Pizzas salgadas</span><span class="cat__count" style="display:block">${salgadas.itens.length} sabores</span></span><span class="cat__arrow">${ICON.arrow}</span></span></a>
      <a class="cat" href="/cardapio/#doces" data-in>${photo("brigadeiro", "Pizza de brigadeiro com morango", "(max-width: 640px) 50vw, 50vw")}<span class="cat__body"><span><span class="cat__name">Pizzas doces</span><span class="cat__count" style="display:block">${doces.itens.length} sabores</span></span><span class="cat__arrow">${ICON.arrow}</span></span></a>
      <a class="cat" href="/cardapio/#massas" data-in>${photo("fettuccine", "Fettuccine gratinado", "(max-width: 640px) 50vw, 17vw")}<span class="cat__body"><span><span class="cat__name">Massas</span><span class="cat__count" style="display:block">P, M e G</span></span></span></a>
      <a class="cat" href="/cardapio/#porcoes" data-in>${photo("porcao-de-tilapia-com-fritas", "Filé de tilápia com fritas", "(max-width: 640px) 50vw, 17vw")}<span class="cat__body"><span><span class="cat__name">Pratos e porções</span><span class="cat__count" style="display:block">tilápia e fritas</span></span></span></a>
    </div>
  </div>
</section>

<section class="block block--ink-2" aria-labelledby="jeitos-title">
  <div class="wrap">
    <div class="head head--row">
      <div>
        <p class="kicker">Do seu jeito</p>
        <h2 class="title" id="jeitos-title">Peça, busque ou venha comer aqui</h2>
      </div>
      <p class="lead">Todo pedido é feito pelo nosso cardápio online. No salão, é só chegar.</p>
    </div>
    <div class="ways">
      <a class="way" href="/delivery/" data-in>${photo("executiva", "", "(max-width: 1023px) 100vw, 33vw")}<h3>Delivery</h3><p>A pizza sai do forno direto para a sua porta, quentinha.</p><span class="way__meta">Cerca de 1 hora</span></a>
      <a class="way" href="/delivery/#retirada" data-in>${photo("da-casa", "", "(max-width: 1023px) 100vw, 33vw")}<h3>Retirada</h3><p>Peça online, escolha retirada e busque no balcão.</p><span class="way__meta">Cerca de 30 minutos</span></a>
      <a class="way" href="/salao/" data-in>${fachada("", "(max-width: 1023px) 100vw, 33vw")}<h3>No salão</h3><p>Mesa, luz quente e pizza direto do forno. Aceitamos reservas.</p><span class="way__meta">Mesmo horário do delivery</span></a>
    </div>
    <div class="facts" data-in>
      <span><strong>Pagamento:</strong> Pix, cartão ou dinheiro</span>
      <span><strong>Tamanhos:</strong> 25 cm (4 pedaços) e 35 cm (8 pedaços)</span>
      <span><strong>Sabores:</strong> até dois por pizza</span>
    </div>
  </div>
</section>

<section class="split" aria-labelledby="salao-title">
  <div class="split__photo reveal-img">${fachada(FACHADA_ALT, "(max-width: 1023px) 100vw, 56vw")}</div>
  <div class="split__text">
    <p class="kicker">O salão</p>
    <h2 class="title" id="salao-title">Tem mesa pra você no salão</h2>
    <p class="lead" data-in>Além do delivery, a Casa recebe você no salão: luz quente, jardim vertical e pizza saindo do forno para a mesa. Aceitamos reservas, e dá para comemorar aniversário com a gente.</p>
    <dl class="data" data-in>
      <div><dt>Reservas e aniversários</dt><dd>Pelo WhatsApp ${SITE.phoneDisplay}</dd></div>
      <div><dt>Horário</dt><dd>Quarta a segunda, das 18h às 23h30</dd></div>
    </dl>
    <div class="actions" data-in><a class="btn btn--solid" href="${WA_RESERVA}"${NEW_TAB}>${ICON.wa} Reservar mesa</a><a class="btn btn--ghost" href="/salao/">Ver o salão</a></div>
  </div>
</section>

<section class="block" aria-labelledby="forno-title">
  <div class="wrap">
    <div class="head head--row">
      <div>
        <p class="kicker">Saindo do forno</p>
        <h2 class="title" id="forno-title">Direto do forno</h2>
      </div>
      <a class="link" href="${SITE.instagram}"${NEW_TAB}>Mais no Instagram ${ICON.out}</a>
    </div>
    <div class="gallery">
      ${[["portuguesa", "Pizza portuguesa"], ["romanesca", "Pizza romanesca com rúcula e tomate-cereja"], ["queijo-brie", "Pizza de queijo brie"], ["kit-kat", "Pizza doce de Kit Kat"], ["mexicana", "Pizza mexicana com Doritos"], ["frango-com-catupiry", "Pizza de frango com catupiry"], ["fettuccine", "Fettuccine gratinado"], ["franbacon", "Pedaço de pizza Franbacon com queijo derretendo"]]
        .map(([s, a]) => `<figure class="reveal-img">${photo(s, a, "(max-width: 1023px) 50vw, 40vw")}</figure>`).join("")}
    </div>
  </div>
</section>

<section class="split split--rev split--cream on-cream" aria-labelledby="quem-title">
  <div class="split__photo reveal-img">${donos()}</div>
  <div class="split__text">
    <p class="kicker">Quem faz</p>
    <h2 class="title" id="quem-title">Leandra e Alan</h2>
    <p class="lead">Os donos da Casa. Tudo começou no quintal de casa, vendendo duas pizzas por R$ 50. Em 2020 a pizzaria abriu no ${SITE.district}, e a pizza continua saindo do jeito que a gente serviria pra família.</p>
    <div class="actions" data-in><a class="btn btn--line-dark" href="/sobre/">Nossa história ${ICON.arrow}</a></div>
  </div>
</section>

<section class="block" aria-labelledby="aval-title">
  <div class="wrap reviews">
    <div>
      <p class="kicker" id="aval-title">Quem provou</p>
      <p class="reviews__score" data-in style="margin-top:24px"><span>${SITE.rating}</span></p>
      <p class="reviews__stars" aria-hidden="true">★★★★★</p>
      <p class="reviews__meta">${SITE.reviews} avaliações no Google, todas com cinco estrelas.</p>
      <div class="actions"><a class="btn btn--ghost" href="${SITE.google}"${NEW_TAB}>Ver no Google ${ICON.out}</a></div>
    </div>
    <div>
      <div class="quote-slider" data-quotes>
        ${REVIEWS.map((r, i) => `<figure class="quote${i === 0 ? " is-active" : ""}"><blockquote>${esc(r.text)}</blockquote><figcaption>${esc(r.author)} · avaliação no Google</figcaption></figure>`).join("")}
      </div>
      <div class="dots">${REVIEWS.map((r, i) => `<button type="button" data-dot aria-label="Mostrar avaliação ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`).join("")}</div>
    </div>
  </div>
</section>

<section class="block" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="head">
      <p class="kicker">Perguntas</p>
      <h2 class="title" id="faq-title">Perguntas frequentes</h2>
      <a class="link" href="/perguntas-frequentes/">Todas as perguntas ${ICON.arrow}</a>
    </div>
    ${faqList(homeFaq)}
  </div>
</section>

${placeBlock()}
${ctaBlock()}`
});

/* ------------------------------ cardápio ----------------------------- */

function dishHTML(item, cat) {
  let prices;
  if (cat.tamanhos) prices = `<span><span class="sr-only">25 cm: R$ </span>${money(item.p25)}</span><span><span class="sr-only">35 cm: R$ </span>${money(item.p35)}</span>`;
  else if (item.variantes) prices = item.variantes.map(([t, p]) => `<span><small>${t}</small><span class="sr-only"> R$ </span>${money(p)}</span>`).join("");
  else prices = `<span><span class="sr-only">R$ </span>${money(item.preco)}</span>`;

  const thumb = item.foto
    ? `<img class="dish__thumb" src="/assets/images/menu/${item.foto}-480.webp" width="64" height="64" loading="lazy" decoding="async" alt="">`
    : `<span class="dish__thumb" aria-hidden="true"></span>`;
  const data = item.foto ? ` data-foto="/assets/images/menu/${item.foto}-960.webp" data-nome="${esc(item.nome)}"` : "";

  return `<article class="dish"${data}>
        ${thumb}
        <h3 class="dish__name">${esc(item.nome)}${item.destaque ? '<span class="dish__tag">Mais pedida</span>' : ""}</h3>
        <p class="dish__desc">${esc(item.desc)}</p>
        <p class="dish__prices">${prices}</p>
      </article>`;
}

const first = salgadas.itens[0];

pages.push({
  path: "/cardapio/",
  title: "Cardápio e preços · Casa da Pizza Caratinga",
  description: `${totalSabores} sabores de pizza com preços de 25 cm e 35 cm, bordas recheadas, massas e porções da Casa da Pizza, em ${SITE.city}, ${SITE.state}.`,
  trail: [HOME, { name: "Cardápio", path: "/cardapio/" }],
  schema: [menuSchema()],
  body: `
${pageHead({
  trail: [HOME, { name: "Cardápio", path: "/cardapio/" }],
  kicker: "Cardápio completo",
  title: "Cardápio",
  lead: `${totalSabores} sabores de pizza em 25 cm (4 pedaços) e 35 cm (8 pedaços), com até dois sabores por pizza. Também tem massas e porções.`,
  bg: photo("calabresa-premium", "", "100vw"),
  actions: orderLink("Fazer meu pedido")
})}

<section class="block block--sm block--cream on-cream" aria-label="Itens do cardápio" style="padding-top:0">
  <div class="wrap">
    <div class="menu-bar">
      <nav class="tabs" aria-label="Categorias">
        ${MENU.categorias.map((c, i) => `<a class="tab" href="#${c.id}"${i === 0 ? ' aria-current="true"' : ""}>${esc(c.nome)}</a>`).join("")}
      </nav>
      <label class="search">
        <span class="sr-only">Buscar sabor ou ingrediente</span>
        ${ICON.search}
        <input type="search" placeholder="Buscar sabor ou ingrediente" autocomplete="off" data-search>
      </label>
    </div>

    <div class="menu">
      <div data-menu>
        ${MENU.categorias.map((cat) => `
        <section class="group" id="${cat.id}" aria-labelledby="g-${cat.id}">
          <header class="group__head">
            <h2 class="group__title" id="g-${cat.id}">${esc(cat.nome)}</h2>
            ${cat.tamanhos ? '<p class="group__cols" aria-hidden="true"><span>25 cm</span><span>35 cm</span></p>' : ""}
          </header>
          ${cat.nota ? `<p class="group__note">${esc(cat.nota)}</p>` : ""}
          ${cat.itens.map((i) => dishHTML(i, cat)).join("")}
        </section>`).join("")}
        <p class="menu__empty" data-empty hidden>Nenhum item encontrado. Tente outro sabor ou ingrediente.</p>

        <div class="bordas">
          <h2>Borda recheada</h2>
          ${MENU.bordas.map((b) => `<span>${esc(b.nome)} · R$ ${money(b.p25)} (25 cm) / R$ ${money(b.p35)} (35 cm)</span>`).join("")}
        </div>
      </div>

      <aside class="menu__preview" aria-hidden="true">
        <figure class="preview" data-preview>
          <div class="preview__frame"><img src="/assets/images/menu/${first.foto}-960.webp" width="960" height="960" alt="" decoding="async"></div>
          <figcaption><span data-preview-cap>${esc(first.nome)}</span></figcaption>
        </figure>
      </aside>
    </div>

    <div class="menu-foot">
      <p>Preços conferidos em ${SITE.updated}. Na hora do pedido, valem sempre os do cardápio online.</p>
      ${orderLink("Pedir pelo cardápio online", "btn btn--dark")}
    </div>
  </div>
</section>

${marquee(pizzas.map((i) => i.nome))}

<section class="block" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="head">
      <p class="kicker">Dúvidas sobre o cardápio</p>
      <h2 class="title" id="faq-title">Dúvidas sobre o cardápio</h2>
      <a class="link" href="/perguntas-frequentes/">Todas as perguntas ${ICON.arrow}</a>
    </div>
    ${faqList(FAQ[1].items)}
  </div>
</section>

${ctaBlock("Já escolheu o sabor?", "quatro-queijos")}`
});

/* ------------------------------- salão ------------------------------- */

pages.push({
  path: "/salao/",
  title: "Salão, reservas e aniversários · Casa da Pizza Caratinga",
  description: `Jante no salão da Casa da Pizza, no bairro ${SITE.district}, em ${SITE.city}. Aceitamos reservas e comemorações de aniversário. Aberto ${HOURS_TEXT}.`,
  trail: [HOME, { name: "O salão", path: "/salao/" }],
  schema: [faqSchema(FAQ[2].items)],
  body: `
${pageHead({
  trail: [HOME, { name: "O salão", path: "/salao/" }],
  kicker: "O salão",
  title: "O salão",
  lead: "Luz quente, jardim vertical e pizza saindo do forno direto para a mesa. O salão abre no mesmo horário do delivery.",
  bg: fachada("", "100vw"),
  actions: `<a class="btn btn--solid" href="${WA_RESERVA}"${NEW_TAB}>${ICON.wa} Reservar mesa</a><a class="btn btn--ghost" href="${MAPS_LINK}"${NEW_TAB}>Como chegar ${ICON.out}</a>`
})}

<section class="split" aria-labelledby="mesa-title">
  <div class="split__photo reveal-img">${fachada(FACHADA_ALT, "(max-width: 1023px) 100vw, 56vw")}</div>
  <div class="split__text">
    <p class="kicker">O espaço</p>
    <h2 class="title" id="mesa-title">Do forno direto pra mesa</h2>
    <p class="lead" data-in>No salão, a pizza vai do forno para a mesa sem caixa no meio. É o jeito mais quente de provar a Casa. Venha com a família, com os amigos ou para comemorar.</p>
    <dl class="data" data-in>
      <div><dt>Endereço</dt><dd>${SITE.street}<br>${SITE.district}, ${SITE.city}</dd></div>
      <div><dt>Horário</dt><dd>Quarta a segunda, das 18h às 23h30 · terça fechado</dd></div>
    </dl>
  </div>
</section>

<section class="block" aria-labelledby="ocasioes-title">
  <div class="wrap">
    <div class="head head--row">
      <div>
        <p class="kicker">Reservas e aniversários</p>
        <h2 class="title" id="ocasioes-title">Reservas e aniversários</h2>
      </div>
      <p class="lead">Combine tudo pelo WhatsApp: dia, horário e quantas pessoas vêm.</p>
    </div>
    <div class="ways ways--2">
      <a class="way" href="${WA_RESERVA}"${NEW_TAB} data-in>${photo("quatro-queijos", "", "(max-width: 1023px) 100vw, 50vw")}<h3>Mesa reservada</h3><p>Mande uma mensagem com o dia, o horário e o número de pessoas, e a mesa fica separada.</p><span class="way__meta">Reservar pelo WhatsApp ↗</span></a>
      <a class="way" href="${WA_ANIVER}"${NEW_TAB} data-in>${photo("brigadeiro", "", "(max-width: 1023px) 100vw, 50vw")}<h3>Comemore na Casa</h3><p>Aniversário com pizza salgada, pizza doce e a turma toda junta. A gente reserva as mesas.</p><span class="way__meta">Combinar pelo WhatsApp ↗</span></a>
    </div>
  </div>
</section>

<section class="block block--sm block--ink-2" aria-label="Fotos">
  <div class="wrap strip">
    ${[["da-casa", "Pizza Da Casa"], ["romeu-e-julieta", "Pizza Romeu e Julieta"], ["peito-de-peru", "Pizza de peito de peru"], ["espaguete", "Espaguete à bolonhesa"]]
      .map(([s, a]) => `<figure class="reveal-img">${photo(s, a, "(max-width: 1023px) 50vw, 25vw")}</figure>`).join("")}
  </div>
</section>

<section class="block" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="head">
      <p class="kicker">Perguntas</p>
      <h2 class="title" id="faq-title">Dúvidas sobre o salão</h2>
    </div>
    ${faqList(FAQ[2].items)}
  </div>
</section>

${placeBlock()}
${ctaBlock("Prefere receber em casa?", "suprema")}`
});

/* ------------------------------ delivery ----------------------------- */

pages.push({
  path: "/delivery/",
  title: "Delivery e retirada de pizza em Caratinga · Casa da Pizza",
  description: `Pizza delivery em ${SITE.city} em cerca de 1 hora, ou retirada no balcão em cerca de 30 minutos. Peça pelo cardápio online e pague com Pix, cartão ou dinheiro.`,
  trail: [HOME, { name: "Delivery", path: "/delivery/" }],
  schema: [faqSchema(FAQ[0].items)],
  body: `
${pageHead({
  trail: [HOME, { name: "Delivery", path: "/delivery/" }],
  kicker: "Delivery e retirada",
  title: "Delivery e retirada",
  lead: `Entregamos em ${SITE.city} em cerca de 1 hora. Se preferir, busque no balcão em cerca de 30 minutos. O pedido é feito pelo nosso cardápio online.`,
  bg: photo("executiva", "", "100vw"),
  actions: orderLink("Fazer meu pedido")
})}

<section class="block" aria-labelledby="passos-title">
  <div class="wrap">
    <div class="head">
      <p class="kicker">Como funciona</p>
      <h2 class="title" id="passos-title">Como pedir</h2>
    </div>
    <ol class="steps">
      <li data-in><h3>Escolha no cardápio online</h3><p>Monte a pizza em 25 ou 35 cm, com até dois sabores e borda recheada, se quiser.</p></li>
      <li data-in><h3>Pague do seu jeito</h3><p>Pix, cartão ou dinheiro. Se for em dinheiro, avise se precisa de troco.</p></li>
      <li data-in><h3>Receba ou busque</h3><p>Entrega em cerca de 1 hora a 1h10, ou retirada no balcão em cerca de 30 minutos.</p></li>
    </ol>
    <div class="actions" data-in>${orderLink("Abrir o cardápio online")}<a class="btn btn--ghost" href="${WA_ORDER}"${NEW_TAB}>${ICON.wa} Pedir pelo WhatsApp</a></div>
    <p class="notice" data-in><strong>Aviso ao cliente.</strong> Conforme a Lei Municipal nº 4056/2025, os entregadores não são obrigados a subir em prédios. Se precisar que o motoboy suba, avise na hora do pedido.</p>
  </div>
</section>

<section class="split split--cream on-cream" id="retirada" aria-labelledby="retirada-title">
  <div class="split__photo reveal-img">${photo("calabresa", "Pizza de calabresa com cebola", "(max-width: 1023px) 100vw, 56vw")}</div>
  <div class="split__text">
    <p class="kicker">Retirada</p>
    <h2 class="title" id="retirada-title">Retirada no balcão</h2>
    <p class="lead" data-in>Faça o pedido no cardápio online, escolha retirada e venha buscar. A pizza fica pronta em cerca de 30 minutos.</p>
    <dl class="data" data-in>
      <div><dt>Onde retirar</dt><dd>${SITE.street} · ${SITE.district}</dd></div>
      <div><dt>Horário</dt><dd>Quarta a segunda, das 18h às 23h30</dd></div>
    </dl>
  </div>
</section>

<section class="block" aria-labelledby="area-title">
  <div class="wrap">
    <div class="head head--row">
      <div>
        <p class="kicker">Área de entrega</p>
        <h2 class="title" id="area-title">Entregamos em toda Caratinga</h2>
      </div>
      <p class="lead">Entregamos em todos os bairros de Caratinga. A taxa depende do endereço e aparece no cardápio online antes de você fechar o pedido.</p>
    </div>
    <ul class="bairros" id="bairros" aria-label="Bairros atendidos">${BAIRROS.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    <p class="note">Não achou o seu? A gente entrega na cidade toda. Na dúvida, chame no <a href="${WA_ORDER}"${NEW_TAB}>WhatsApp</a>.</p>
    <div class="facts" data-in>
      <span><strong>Entrega:</strong> cerca de 1h a 1h10</span>
      <span><strong>Retirada:</strong> cerca de 30 min</span>
      <span><strong>Pagamento:</strong> Pix, cartão ou dinheiro</span>
      <span><strong>Horário:</strong> 18h às 23h30, terça fechado</span>
    </div>
  </div>
</section>

<section class="block block--ink-2" aria-labelledby="faq-title">
  <div class="wrap faq-wrap">
    <div class="head">
      <p class="kicker">Perguntas</p>
      <h2 class="title" id="faq-title">Dúvidas sobre a entrega</h2>
    </div>
    ${faqList(FAQ[0].items)}
  </div>
</section>

${ctaBlock("Bateu a fome? Peça a sua.", "frango-com-cheddar")}`
});

/* -------------------------------- sobre ------------------------------ */

pages.push({
  path: "/sobre/",
  title: "Sobre a Casa da Pizza · Pizzaria em Caratinga desde 2020",
  description: `A Casa da Pizza é de Leandra e Alan: começou no quintal de casa, vendendo duas pizzas por R$ 50, e abriu em outubro de 2020 no bairro ${SITE.district}, em ${SITE.city}.`,
  trail: [HOME, { name: "Sobre", path: "/sobre/" }],
  type: "AboutPage",
  body: `
${pageHead({
  trail: [HOME, { name: "Sobre", path: "/sobre/" }],
  kicker: "Nossa história",
  title: "Nossa história",
  lead: `De Leandra e Alan: do quintal de casa para o bairro ${SITE.district}, em ${SITE.city}.`,
  bg: photo("do-chef", "", "100vw")
})}

<section class="split split--cream on-cream" aria-labelledby="historia-title">
  <div class="split__photo reveal-img">${donos()}</div>
  <div class="split__text">
    <p class="kicker">Desde 2020</p>
    <h2 class="title" id="historia-title">Começou no quintal de casa</h2>
    <p class="lead" data-in>A Casa da Pizza é de Leandra e Alan. Tudo começou no quintal de casa, vendendo duas pizzas por R$ 50.</p>
    <p class="lead" data-in style="margin-top:16px">Em 30 de outubro de 2020, a Casa virou empresa, no bairro ${SITE.district}. O nome e o lema vêm dessa origem: servir a pizza do jeito que a gente serviria em casa.</p>
    <p class="lead" data-in style="margin-top:16px">Hoje, além da entrega e da retirada, a Casa também recebe você no salão.</p>
  </div>
</section>

<section class="block" aria-labelledby="linha-title">
  <div class="wrap">
    <h2 class="title" id="linha-title">Do quintal ao salão</h2>
    <ol class="timeline">
      <li data-in><span class="timeline__when">No começo</span><h3>O quintal</h3><p>Leandra e Alan vendiam duas pizzas por R$ 50, feitas no quintal de casa.</p></li>
      <li data-in><span class="timeline__when">Outubro de 2020</span><h3>Nasce a Casa</h3><p>A Casa da Pizza abre como empresa no bairro ${SITE.district}, em ${SITE.city}.</p></li>
      <li data-in><span class="timeline__when">Hoje</span><h3>${totalSabores} sabores e salão</h3><p>Delivery, retirada e salão, nota ${SITE.rating} no Google e ${SITE.instagramFollowers} seguidores no Instagram.</p></li>
    </ol>
  </div>
</section>

<section class="block block--ink-2" aria-labelledby="regras-title">
  <div class="wrap craft">
    <figure class="craft__photo reveal-img">${photo("marguerita", "Pizza marguerita com tomate e manjericão", "(max-width: 1023px) 100vw, 45vw")}</figure>
    <div>
      <p class="kicker">O que a gente não muda</p>
      <h2 class="title" id="regras-title" style="margin-bottom:40px">O que a gente não muda</h2>
      <ol class="craft__list">
        <li data-in><h3>Massa na medida</h3><p>Leve, no ponto de segurar o recheio sem virar pão. É a reclamação mais comum de quem pede pizza, e foi a primeira coisa que a gente resolveu.</p></li>
        <li data-in><h3>Recheio sem economia</h3><p>Ingrediente até a borda, do primeiro ao último pedaço.</p></li>
        <li data-in><h3>Assada na hora</h3><p>Cada pizza vai para o forno depois que o pedido chega. Nada fica pronto esperando.</p></li>
      </ol>
    </div>
  </div>
</section>

<section class="block" aria-labelledby="aval-title">
  <div class="wrap head head--row">
    <div>
      <p class="kicker">O que dizem</p>
      <h2 class="title" id="aval-title">O que os clientes dizem</h2>
    </div>
    <a class="link" href="${SITE.google}"${NEW_TAB}>Ver todas no Google ${ICON.out}</a>
  </div>
  ${carousel(REVIEWS.map((r) => `<li class="review-card"><blockquote>${esc(r.text)}</blockquote><p>${esc(r.author)} · <span aria-label="5 estrelas">★★★★★</span></p></li>`), { wide: true, label: "Avaliações de clientes" })}
</section>

${ctaBlock("Vem provar.", "pepperoni")}`
});

/* ------------------------- perguntas frequentes ---------------------- */

pages.push({
  path: "/perguntas-frequentes/",
  title: "Perguntas frequentes · Casa da Pizza Caratinga",
  description: "Horário, entrega, tamanhos, preços, meio a meio, bordas, salão, reservas e aniversários: respostas rápidas sobre a Casa da Pizza, em Caratinga.",
  trail: [HOME, { name: "Perguntas frequentes", path: "/perguntas-frequentes/" }],
  schema: [faqSchema(ALL_FAQ)],
  body: `
${pageHead({
  trail: [HOME, { name: "Perguntas frequentes", path: "/perguntas-frequentes/" }],
  kicker: "Perguntas frequentes",
  title: "Perguntas frequentes",
  lead: "Tudo o que perguntam pra gente no WhatsApp, respondido aqui.",
  bg: photo("napolitana", "", "100vw")
})}

<section class="block" aria-label="Perguntas e respostas">
  <div class="wrap--narrow">
    ${FAQ.map((g) => `<div class="faq-group"><h2>${esc(g.group)}</h2>${faqList(g.items)}</div>`).join("")}
    <p class="note" style="margin-top:48px">Não achou a resposta? <a href="${WA_ORDER}"${NEW_TAB}>Chame a gente no WhatsApp</a>.</p>
  </div>
</section>

${ctaBlock()}`
});

/* ------------------------------- contato ----------------------------- */

pages.push({
  path: "/contato/",
  title: "Endereço, horário e contato · Casa da Pizza Caratinga",
  description: `Casa da Pizza: ${SITE.street}, ${SITE.district}, ${SITE.city}-${SITE.state}. WhatsApp ${SITE.phoneDisplay}. Aberto ${HOURS_TEXT}.`,
  trail: [HOME, { name: "Contato", path: "/contato/" }],
  type: "ContactPage",
  body: `
${pageHead({
  trail: [HOME, { name: "Contato", path: "/contato/" }],
  kicker: "Contato",
  title: "Contato",
  lead: `WhatsApp ${SITE.phoneDisplay} · ${SITE.street}, ${SITE.district} · ${HOURS_TEXT}.`,
  bg: fachada("", "100vw"),
  actions: `<a class="btn btn--solid" href="${WA_ORDER}"${NEW_TAB}>${ICON.wa} Chamar no WhatsApp</a><a class="btn btn--ghost" href="tel:${SITE.phone.replace(/-/g, "")}">Ligar ${SITE.phoneDisplay}</a>`
})}

${placeBlock("")}

<section class="block block--sm block--ink-2" aria-labelledby="atalhos-title">
  <div class="wrap">
    <h2 class="sr-only" id="atalhos-title">Atalhos</h2>
    <div class="ways">
      <a class="way" href="${SITE.order}"${NEW_TAB} data-in>${photo("calabresa", "", "(max-width: 1023px) 100vw, 33vw")}<h3>Cardápio online</h3><p>Monte a pizza, escolha entrega ou retirada e pague por lá.</p><span class="way__meta">Abrir ↗</span></a>
      <a class="way" href="${WA_RESERVA}"${NEW_TAB} data-in>${photo("quatro-queijos", "", "(max-width: 1023px) 100vw, 33vw")}<h3>Reservas</h3><p>Mesa reservada e aniversários, combinados pelo WhatsApp.</p><span class="way__meta">Reservar ↗</span></a>
      <a class="way" href="${SITE.instagram}"${NEW_TAB} data-in>${photo("sensacao", "", "(max-width: 1023px) 100vw, 33vw")}<h3>${SITE.instagramHandle}</h3><p>Novidades, bastidores e as pizzas do dia.</p><span class="way__meta">Seguir ↗</span></a>
    </div>
    <p class="note" style="margin-top:32px">${SITE.legalName} · CNPJ ${SITE.cnpj}</p>
  </div>
</section>`
});

/* --------------------------- páginas de texto ------------------------ */

function legal(path, name, lead, html) {
  pages.push({
    path,
    title: `${name} · Casa da Pizza`,
    description: lead,
    trail: [HOME, { name, path }],
    body: `
<header class="page-head page-head--plain">
  <div class="wrap--narrow">
    ${crumbs([HOME, { name, path }])}
    <h1 class="title" style="margin-top:36px">${esc(name)}</h1>
    <p class="lead" style="margin-top:20px">Última atualização: ${SITE.updated}.</p>
  </div>
</header>
<section class="block block--sm"><div class="wrap--narrow prose">${html}</div></section>`
  });
}

legal("/politica-de-privacidade/", "Política de privacidade", "Como o site da Casa da Pizza trata os seus dados.", `
<p>Esta página explica, em português simples, o que acontece com seus dados quando você navega no site da Casa da Pizza. <strong>Este site é institucional</strong>: ele mostra a Casa, o cardápio e o salão, e leva você para o cardápio online ou para o WhatsApp. O pedido e o pagamento acontecem fora daqui.</p>
<h2>O que a gente não coleta</h2>
<p>O site não tem formulário, cadastro, carrinho nem pagamento. Por isso, não pede nem guarda:</p>
<ul><li>nome, telefone ou e-mail;</li><li>endereço de entrega;</li><li>dados de cartão ou qualquer informação de pagamento;</li><li>senha ou conta de usuário.</li></ul>
<h2>Cookies e rastreamento</h2>
<p>O site não instala cookies próprios e não usa ferramentas de rastreamento publicitário. Se no futuro passarmos a usar alguma ferramenta de medição de visitas, esta página será atualizada antes.</p>
<h2>Serviços de terceiros</h2>
<p>As fontes e as imagens do site são servidas pelo próprio site. Algumas partes dependem de serviços externos. Quando o navegador busca esses recursos, o endereço de IP e informações básicas do aparelho chegam a essas empresas, que têm políticas próprias:</p>
<ul>
<li><strong>Google Maps</strong>: o mapa só é carregado se você clicar em "Carregar o mapa" ou "Como chegar".</li>
<li><strong>pedir.delivery</strong>: plataforma do cardápio online, aberta quando você clica em um botão de pedido.</li>
<li><strong>WhatsApp</strong> e <strong>Instagram</strong>: abertos somente quando você clica nos links.</li>
</ul>
<h2>Dados do pedido</h2>
<p>Quando você faz um pedido pelo cardápio online ou pelo WhatsApp, os dados necessários para a entrega (nome, endereço, telefone e forma de pagamento) são tratados nessas plataformas e usados pela Casa da Pizza apenas para preparar e entregar o pedido e cumprir obrigações fiscais.</p>
<h2>Seus direitos</h2>
<p>A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante que você peça acesso, correção ou exclusão dos seus dados pessoais. Para isso, fale com a gente pelo WhatsApp <a href="${WA_ORDER}"${NEW_TAB}>${SITE.phoneDisplay}</a>.</p>
<h2>Responsável</h2>
<p>${SITE.legalName} · CNPJ ${SITE.cnpj} · ${SITE.street}, ${SITE.district}, ${SITE.city}/${SITE.state}.</p>`);

legal("/acessibilidade/", "Acessibilidade", "O que o site da Casa da Pizza faz para ser acessível a todas as pessoas.", `
<p>A gente quer que qualquer pessoa consiga ver o cardápio, entender como pedir e chegar até a Casa, usando o dedo, o teclado, um leitor de tela ou o zoom do celular.</p>
<h2>O que o site faz</h2>
<ul>
<li>HTML semântico, com um título principal por página e hierarquia correta de subtítulos.</li>
<li>Idioma declarado como português do Brasil.</li>
<li>Link "pular para o conteúdo" no começo de cada página.</li>
<li>Navegação completa por teclado, com contorno de foco visível.</li>
<li>Cardápio completo em texto, com preços lidos corretamente por leitores de tela.</li>
<li>Perguntas frequentes que abrem e fecham sem depender de JavaScript.</li>
<li>Carrosséis com botões de anterior e próximo, além do arraste.</li>
<li>Texto alternativo nas fotografias e alternativo vazio nas imagens decorativas.</li>
<li>Animações desligadas automaticamente quando o aparelho pede menos movimento.</li>
<li>Status do forno indicado por texto, e não apenas pela cor.</li>
</ul>
<h2>O que depende de terceiros</h2>
<p>O pedido, o pagamento e o acompanhamento acontecem na plataforma <a href="${SITE.order}"${NEW_TAB}>pedir.delivery</a>, que não é controlada pela Casa da Pizza.</p>
<h2>Encontrou uma barreira?</h2>
<p>Avise pelo WhatsApp <a href="${WA_ORDER}"${NEW_TAB}>${SITE.phoneDisplay}</a>, contando o que aconteceu e qual aparelho você usava. Se preferir, ligue para o mesmo número e faça o pedido falando com a gente.</p>
<h2>Referência</h2>
<p>O site tem como meta o nível AA das diretrizes WCAG 2.1, base da Lei Brasileira de Inclusão (Lei nº 13.146/2015).</p>`);

/* --------------------------------- 404 ------------------------------- */

pages.push({
  path: "/404.html",
  noindex: true,
  title: "Página não encontrada · Casa da Pizza",
  description: "Esta página não existe.",
  body: `
<section class="page-head page-head--404">
  <div class="page-head__bg" aria-hidden="true">${photo("kids", "", "100vw")}</div>
  <div class="wrap">
    <p class="kicker">Erro 404</p>
    <h1 class="title">Página não encontrada</h1>
    <p class="lead">A página que você procurou não existe. Mas o forno continua aceso.</p>
    <div class="actions"><a class="btn btn--solid" href="/">Voltar para o início</a><a class="btn btn--ghost" href="/cardapio/">Ver o cardápio</a></div>
  </div>
</section>`
});

/* ============================ ESCRITA ============================== */

function write(rel, content) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

for (const page of pages) {
  const rel = page.path.endsWith(".html") ? page.path.slice(1) : join(page.path.slice(1), "index.html");
  write(rel, layout(page));
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);

// robots.txt — buscadores e robôs de IA são bem-vindos.
const BOTS = ["Googlebot", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended"];
write("robots.txt", `# Casa da Pizza · Caratinga/MG
User-agent: *
Allow: /

${BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${abs("/sitemap.xml")}
`);

// llms.txt — resumo em texto puro para assistentes de IA.
const menuText = MENU.categorias.map((cat) => {
  const rows = cat.itens.map((i) => {
    if (cat.tamanhos) return `- ${i.nome}: ${i.desc} 25 cm R$ ${money(i.p25)} · 35 cm R$ ${money(i.p35)}${i.destaque ? " (mais pedida)" : ""}`;
    if (i.variantes) return `- ${i.nome}: ${i.desc} ${i.variantes.map(([t, p]) => `${t} R$ ${money(p)}`).join(" · ")}`;
    return `- ${i.nome} (${i.desc}): R$ ${money(i.preco)}`;
  });
  return `### ${cat.nome}\n${cat.nota ? cat.nota + "\n" : ""}${rows.join("\n")}`;
}).join("\n\n");

write("llms.txt", `# Casa da Pizza · Caratinga, MG

> Pizzaria no bairro ${SITE.district}, em ${SITE.city} (${SITE.state}), aberta desde 30 de outubro de 2020. Faz pizzas de 25 cm (4 pedaços) e 35 cm (8 pedaços) com até dois sabores, além de massas e porções. Atende por delivery, retirada no balcão e no salão, ${HOURS_TEXT}. Nota ${SITE.rating} no Google, com ${SITE.reviews} avaliações.

## Informações
- Endereço: ${SITE.street}, ${SITE.district}, ${SITE.city} - ${SITE.state}, CEP ${SITE.cep}
- WhatsApp e telefone: ${SITE.phoneDisplay}
- Horário: ${HOURS_TEXT} (delivery, retirada e salão)
- Pedidos: cardápio online ${SITE.order} ou WhatsApp
- Entrega: cerca de 1h a 1h10 em ${SITE.city}; retirada em cerca de 30 minutos
- Pagamento: Pix, cartão ou dinheiro
- Salão: aceita reservas e comemorações de aniversário (combinar pelo WhatsApp)
- Meio a meio: até dois sabores, inclusive salgado e doce; vale o preço do sabor mais caro
- Donos: Leandra e Alan. A Casa começou no quintal de casa, vendendo duas pizzas por R$ 50
- Área de entrega: todos os bairros de ${SITE.city}, entre eles ${BAIRROS.join(", ")}
- Instagram: ${SITE.instagram}
- Razão social: ${SITE.legalName} · CNPJ ${SITE.cnpj}

## Páginas
- [Início](${abs("/")})
- [Cardápio e preços](${abs("/cardapio/")}): todos os sabores com preços
- [Salão, reservas e aniversários](${abs("/salao/")})
- [Delivery e retirada](${abs("/delivery/")})
- [Sobre](${abs("/sobre/")})
- [Perguntas frequentes](${abs("/perguntas-frequentes/")})
- [Contato](${abs("/contato/")})

## Cardápio (preços conferidos em ${SITE.updated})

${menuText}

### Borda recheada
${MENU.bordas.map((b) => `- ${b.nome}: 25 cm R$ ${money(b.p25)} · 35 cm R$ ${money(b.p35)}`).join("\n")}
`);

console.log(`Gerado: ${pages.length} páginas, sitemap.xml, robots.txt, llms.txt (domínio: ${SITE.url})`);