# Plano do site institucional · Casa da Pizza Caratinga

Data: 16/10/2026. Objetivo: site institucional completo, premium, que **converta em pedido** e que seja
**citado por buscadores e IAs** (Google, ChatGPT, Gemini, Perplexity, Claude, Siri) quando alguém
perguntar sobre pizza em Caratinga.

Regras fixas: **sem combos no site**. Dados oficiais: Rua Manoel Gonçalves de Castro, 164, Esplanada,
Caratinga/MG, 35300-321 · (33) 99956-9957 · todos os dias 18h–23h30, terça fechado · delivery, retirada e
salão · CNPJ 39.630.718/0001-05 · fundada em 30/10/2020 · 5,0 no Google (28 avaliações) · @casadapizzactga.

---

## 1. Diagnóstico: por que hoje o site não ranqueia em IA

| Problema | Por que importa | Correção |
|---|---|---|
| O cardápio não está no site (só link externo) | IA responde "quanto custa", "tem pizza X?" lendo texto da página. Sem texto, ela não cita a Casa. | Cardápio completo em HTML estático. |
| No protótipo o cardápio é montado por JavaScript | Os robôs de IA (GPTBot, ClaudeBot, PerplexityBot) em geral **não executam JS**. Eles veriam a lista vazia. | Gerar o HTML do cardápio na hora do build (script) a partir de `menu-data.js`. JS fica só para abas/busca. |
| Uma página só | Cada pergunta diferente ("cardápio", "salão", "delivery", "horário") rende mais com uma página dedicada a ela. | Site com várias páginas (seção 3). |
| Dados divergentes na internet | IA cruza fontes. Endereço 615 x 164, horário de sexta/sábado no Google, site pizzapertodemim com endereço antigo (R. Francisco Vítor de Assis, 925). Divergência = baixa confiança = não citado. | Corrigir NAP (nome, endereço, telefone) e horário em todas as fontes (seção 6). |
| Schema incompleto | Hoje só tem nome, telefone e endereço. | Restaurant + Menu + horário + geo + FAQ completos (seção 5). |
| Sem domínio, sitemap, robots, Search Console | O site nem existe para os buscadores ainda. | Seção 7. |
| FAQ diz "sem salão" e o site ignora o salão | Informação errada é pior que nenhuma. | Corrigir e dar destaque ao salão. |
| Texto pouco factual | IA gosta de frases objetivas que respondem perguntas ("A Casa da Pizza fica no bairro Esplanada e abre todos os dias, exceto terça, das 18h às 23h30"). | Copy "resposta primeiro" (seção 4). |

---

## 2. Direção visual (aprovar no protótipo)

- Paleta da loja real: preto quente `#0F0D0B`, creme `#F3EDE3`, vermelho tomate `#B8281D` só em detalhe, âmbar `#D9A55B` (luz do salão).
- Tipografia: Fraunces (serifa editorial, itálico nas palavras-chave) + Inter.
- Menos efeito, mais espaço. Movimento lento e discreto. Sem folhas flutuando, sem blocos vermelhos chapados.
- Fotos: recorte quadrado padronizado; já geradas em `assets/images/menu/`.
- Faltam fotos de: **interior do salão** (jardim vertical com o neon, mesas), **forno/preparo**, **equipe/donos atual**, **pizza saindo na caixa**. São as que mais vendem "casa".

---

## 3. Arquitetura (páginas)

| URL | Página | Para qual busca/pergunta |
|---|---|---|
| `/` | Início | "pizzaria em Caratinga", "melhor pizza de Caratinga" |
| `/cardapio/` | Cardápio completo com preços | "cardápio Casa da Pizza", "preço pizza Caratinga", "pizza de strogonoff Caratinga" |
| `/salao/` | O salão (jantar no local) | "pizzaria com salão em Caratinga", "onde jantar pizza em Caratinga" |
| `/delivery/` | Delivery e retirada | "pizza delivery Caratinga", "entrega de pizza Esplanada", bairros atendidos |
| `/sobre/` | Nossa história | quem são, desde quando, o que fazem diferente |
| `/perguntas-frequentes/` | FAQ completo | perguntas diretas que as IAs recebem |
| `/contato/` | Endereço, mapa, WhatsApp, horários | "Casa da Pizza endereço/telefone/horário" |
| `/politica-de-privacidade/`, `/acessibilidade/` | Já existem | — |

A home resume tudo e aponta para as páginas internas. Cada página tem título, descrição e schema próprios.

---

## 4. Home: dobras na ordem, com copy

**0. Cabeçalho** — Logo · Cardápio · O salão · Delivery · Sobre · Contato · [Pedir agora]

**1. Hero (vídeo)**
- Kicker: PIZZARIA · ESPLANADA, CARATINGA
- Título: Da nossa *Casa*, para a sua.
- Texto: Massa leve, recheio generoso e forno aceso todas as noites. Peça em casa ou venha jantar no salão.
- Botões: [Fazer meu pedido] [Ver o cardápio]

**2. Barra de status** — ● Forno aceso · recebendo pedidos até 23h30 | Quarta a segunda, 18h às 23h30 | ★ 5,0 · 28 avaliações no Google

**3. Resumo factual (nova, curta, para IA e para quem lê rápido)**
> A Casa da Pizza é uma pizzaria de Caratinga, MG, no bairro Esplanada. Desde 2020 faz pizzas de 25 cm e
> 35 cm com até dois sabores, além de massas e porções. Atende por delivery, retirada e no salão, todos os
> dias exceto terça, das 18h às 23h30.

Em linha, quatro números: **5,0** no Google · **56** sabores · **7,2 mil** no Instagram · **desde 2020**.

**4. As mais pedidas** — 6 pizzas com foto, ingredientes e "a partir de R$".

**5. Por que a Casa** (diferenciais, 3 colunas)
- *Massa na medida.* Leve, no ponto de segurar o recheio sem virar pão.
- *Recheio sem economia.* Ingrediente até a borda, do primeiro ao último pedaço.
- *Assada na hora.* A pizza só entra no forno depois que o pedido chega.

**6. Cardápio** (resumo com abas + link para `/cardapio/`; na home pode ficar só salgadas e doces)

**7. Três jeitos de comer Casa da Pizza**
- *Delivery* — Cerca de 1h. Peça pelo cardápio online ou WhatsApp.
- *Retirada* — Pronta em cerca de 30 minutos.
- *No salão* — Mesa, luz baixa e pizza direto do forno.
Faixa: Pix, cartão ou dinheiro · Aviso da Lei Municipal nº 4056/2025 (motoboy não sobe em prédio).

**8. O salão** — foto da fachada + (fotos internas) · "Venha jantar na Casa" · endereço · horário · [Como chegar]

**9. Nossa história** — foto dos donos + 3 parágrafos reais (precisa do conteúdo, ver seção 8).
Fecho: "Desde 2020, o nome continua fazendo sentido: a pizza sai daqui do jeito que a gente serviria em casa."

**10. Avaliações** — 5,0 · 28 avaliações · 3–6 comentários reais (Pedro L., Fabio F., Alexander V., Jose W., Maria V.) · [Ver todas no Google] · [Avaliar a Casa]

**11. Instagram** — 6 fotos + @casadapizzactga · 7,2 mil seguidores

**12. Perguntas frequentes** (6 na home, completo em `/perguntas-frequentes/`)

**13. Localização** — mapa incorporado, endereço, horário completo dia a dia, WhatsApp, estacionamento na rua

**14. CTA final** — "A sua próxima pizza começa aqui." [Fazer meu pedido]

**15. Rodapé** — NAP completo, horários, CNPJ, links, redes, políticas

**Fixo no celular** — barra "Fazer meu pedido" + botão WhatsApp.

---

## 5. Dados estruturados (schema.org) — o que mais pesa para IA e Google

Na home e em `/contato/`:
- `Restaurant` com `name`, `legalName` (Casa da Pizza Delivery Caratinga LTDA), `taxID` (CNPJ), `foundingDate` 2020-10-30,
  `address` completo com CEP, `geo` (latitude/longitude do nº 164), `telephone`, `url`, `image` (fachada, pizzas),
  `logo`, `priceRange` "R$ 20–40" (o que o Google mostra), `servesCuisine` ["Pizza", "Italiana"],
  `openingHoursSpecification` (seg, qua, qui, sex, sáb, dom 18:00–23:30), `hasMenu` → `/cardapio/`,
  `acceptsReservations` (confirmar), `amenityFeature` (salão, estacionamento na rua), `paymentAccepted`
  ("Pix, cartão de crédito, cartão de débito, dinheiro"), `areaServed` Caratinga,
  `sameAs` [Instagram, pedir.delivery] (iFood não é divulgado).
- `potentialAction` → `OrderAction` apontando para o pedir.delivery.

Em `/cardapio/`: `Menu` → `MenuSection` (Salgadas, Doces, Massas, Porções, Bebidas) → `MenuItem` com
`description` e `offers` (`price`, `priceCurrency` BRL, nome do tamanho).

Em `/perguntas-frequentes/`: `FAQPage`. Em todas: `BreadcrumbList` e `WebSite`.

Avaliações: **não** marcar `aggregateRating` com as notas do Google no próprio site (o Google trata como
"autoavaliação" e pode ignorar ou penalizar). Mostrar a nota em texto, com link para o Google.

---

## 6. Presença fora do site (pesa tanto quanto o site para IA)

1. **Google Meu Negócio** — corrigir horário de sexta e sábado; adicionar link do site, cardápio, fotos do salão, posts semanais; responder todas as avaliações.
2. **Bing Places** — cadastrar/reivindicar. O ChatGPT busca pelo Bing.
3. **Apple Business Connect** — Siri e Apple Maps.
4. **Corrigir/remover dados velhos**: pizzapertodemim.com.br (endereço antigo); páginas de CNPJ mostram "Deposito" no complemento. (Delivery Much não existe mais.)
5. **Mais avaliações**: QR code na caixa da pizza e no salão → "Avalie a Casa no Google". Meta: 100 avaliações. Volume e recência são o que as IAs mais usam para "a melhor de Caratinga".
6. **Instagram**: bio com link do site; destaques "Cardápio", "Salão", "Horário".
7. Menções locais: portais de Caratinga, guias da cidade, parcerias. Cada menção com nome + endereço + site iguais.

---

## 7. Técnico

- Domínio próprio (.com.br) e HTTPS. Atualizar canonical, og:url e schema.
- `sitemap.xml`, `robots.txt` liberando GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot.
- `llms.txt` na raiz com o resumo factual, links das páginas e o cardápio em texto (baixo custo, ajuda IAs).
- Google Search Console e Bing Webmaster Tools; enviar o sitemap.
- Imagem de compartilhamento própria (`og-image.jpg` 1200×630 com fachada/pizza), hoje vem de link externo.
- Performance: vídeo do hero com versão mais leve, `preload` da imagem poster, fontes com `display=swap`, fotos WebP com `srcset` (feito).
- Analytics leve (GA4 ou Plausible) com evento de clique em "Pedir" e "WhatsApp".
- Corrigir: logo com fundo preto (feito: versões transparentes), FAQ "sem salão", preço "a partir de R$ 62,99" (o certo é R$ 64,99).

---

## 8. O que preciso de vocês

1. **História**: como começou em 2020, quem são os donos (nomes), o que não abrem mão.
2. **Fotos**: interior do salão, forno, equipe, pizza na caixa.
3. **Delivery**: bairros atendidos e taxa (ou faixa de taxa), pedido mínimo.
4. **Salão**: quantos lugares, aceita reserva?, área kids?, acessível para cadeirante?, Wi-Fi?
5. **Restrições**: tem opção sem lactose / sem glúten? (se não, dizemos que não)
6. **Eventos**: fazem pizza para festa/evento fora do horário?
7. ~~iFood~~: está ativo, mas não deve ser divulgado no site.
8. **Domínio**: quando definir.
