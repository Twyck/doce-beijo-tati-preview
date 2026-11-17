# Doce Beijo Tati · prévia de redesign

Site-proposta não solicitado da **Verenna Digital** para a Doce Beijo Tati, confeitaria artesanal na Vila Zat (Pirituba, São Paulo). Hoje a marca não tem site próprio: a ficha do Google mostra "Adicionar website", e os pedidos acontecem pelo WhatsApp e por um site de pedidos que só aparece nos stories.

```bash
npm install
npm run dev      # desenvolvimento
npm run images   # regera public/img a partir de assets-src (correção de cor única)
npm run build    # gera dist/
npm run deploy   # publica no GitHub Pages (Twyck/doce-beijo-tati-preview), só com autorização
```

## Direção
- **A fotografia da casa é a protagonista:** fotos de fundo em tela cheia ou meia tela, sem molduras, sem círculos.
- **Paleta tirada dos próprios doces:** chantilly `#F7F1EA`, massa `#EEE4D8`, cacau `#2A1D17`. O rosa da fachada entra só como acento empoeirado (`#A9646B`).
- **Correção de cor única** (`scripts/build-images.py`): acalma o magenta das paredes e do papel de fundo sem tirar o rosa, aquece de leve e suaviza o contraste. Assim as fotos de celular parecem da mesma sessão.
- **Tipografia:** Fraunces (serifa macia, eixo SOFT e WONK no itálico) e Figtree.
- **Conceito próprio, "Hoje na Tati":** relógio de São Paulo ao vivo, com o estado real da loja, do delivery e do site de pedidos (abre às 12h40).

## Roteiro das cenas
1. **Abertura:** a vitrine em tela cheia. O título "O lado *doce* da vida." vem da bandeira da porta.
2. **A casa:** a frase da bandeira acende palavra por palavra, ao lado da fachada em meia tela.
3. **Vitrine (fixa no desktop):** bolo nuvem, marmita de cookies, rocamboles e donuts. Cada doce entra como uma cortina subindo sobre o anterior. No mobile, os blocos ficam empilhados e as fotos se aproximam ao entrar.
4. **Saiu no Instagram:** lançamentos recentes do perfil, com data.
5. **Bolos de festa:** galeria horizontal guiada pelo scroll no desktop e carrossel nativo no mobile.
6. **Hoje na Tati:** horário ao vivo.
7. **Avaliações do Google.**
8. **Visite:** endereço, WhatsApp, horário da loja (o dia de hoje fica destacado).

## Fontes de cada informação

| Informação | Fonte |
|---|---|
| Nome, endereço (R. Prof. José Lourenço, 503 · Vila Zat · 02977-020), telefone, coordenadas, categoria "Confeitaria" | Ficha "Doce beijo tati" no Google Maps |
| Horário da loja: ter. a sáb. 10h–20h, dom. 10h–14h, seg. fechada | Google Maps (consultado em 17/11/2026) |
| Nota 4,6 e 9 avaliações; citações de Brunna S., Priscila H. e dos destaques | Google Maps |
| "Confeitaria artesanal · Bolos, Doces e Salgados · Delivery das 13h às 18h · Segunda a Sábado · Pirituba SP · 11 98733-7834"; 30 mil seguidores | Bio pública de @docebeijotati |
| "Busque sempre olhar o lado doce da vida" | Bandeira na porta (foto da fachada, post de 05/11/2025) |
| "Nosso império, a realização dos nossos sonhos!"; "Loja aberta até as 20h" | Post de 05/11/2025 |
| Bolo nuvem / nhabenta: massa 55% cacau, recheio de chocolate cremoso, creme de leite Ninho; lotes limitados | Posts de 06/11/2026 |
| Marmita de cookies: 220 g de recheio, até 450 g | Post de 10/11/2026 |
| Trufado de maracujá: mais de 80 unidades por semana | Reel de 09/11/2026 |
| Fatia de cookies de cacau black com Kinder Bueno (pré-venda) | Reel de 10/11/2026 |
| Bolo pudim ("lembra casa de vó") | Reel de 10/11/2026 |
| Copo duo de frutas com Ninho e Nutella | Reel de 06/11/2026 |
| Cone trufado de morango cravejado, pronta entrega limitada | Reel de 02/09/2026 |
| Site de pedidos abre às 12h40, link nos stories | Posts de 06/11 e 12/11/2026 |
| Cupcakes para chá revelação | Avaliação de Brunna S. no Google |
| Fotos | Instagram público @docebeijotati e fotos do proprietário na ficha do Google Maps |

Preços foram omitidos de propósito.

## Pendências para a cliente
- **Horários divergentes:** o Google diz segunda fechada e domingo aberto (10h–14h); o Instagram diz "atendimento de segunda a sábado". O site usa o Google para a loja e a bio para o delivery. Confirmar com ela.
- **Link do site de pedidos** (citado nos stories): não é público. Quando chegar, vira o botão principal ao lado do WhatsApp.
- **Fotos em alta:** as capas de reels têm 360 px (o ícone de "play" foi removido com `scripts/remove-play-icon.py`; os originais estão em `research/reel-orig/`). Os bolos de festa vêm de capas de vídeo de 480 px. Uma sessão de fotos curta (vitrine, bolo nuvem, bolos decorados, a Tati trabalhando) eleva tudo.
- **Logo em vetor:** o wordmark do site é tipográfico (Fraunces itálico), porque a logo só existe em baixa resolução.
- **Foto da Tati:** a seção "A casa" comporta um retrato.

## QA (17/11/2026)
`auditoria-layout` e `auditoria-midia` sem problemas nas 14 resoluções. Os pins (vitrine e festas) engatam em 1024, 1280, 1440 e 1920. Sem erros de console, sem overflow horizontal ao redimensionar através de 1024px, e conteúdo todo visível com movimento reduzido. O `checar-menu-ativo` aponta "Vitrine" ao medir "A casa", mas é artefato da ferramenta: ela mede 60% de uma tela abaixo do topo, e a seção tem exatamente uma tela.
