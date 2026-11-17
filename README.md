# Doce Beijo Tati · prévia de redesign

Site-proposta não solicitado da **Verenna Digital** para a Doce Beijo Tati, confeitaria artesanal na Vila Zat (Pirituba, São Paulo). Hoje a marca não tem site próprio: a ficha do Google mostra "Adicionar website", e os pedidos acontecem pelo WhatsApp e por um site de pedidos que só aparece nos stories.

```bash
npm install
npm run dev      # desenvolvimento
npm run images   # regera public/img a partir de assets-src (correção de cor única)
npm run build    # gera dist/
npm run deploy   # publica no GitHub Pages (Twyck/doce-beijo-tati-preview), só com autorização
```

## Direção (v2 — "rosa como a loja")
A primeira versão (neutra, editorial) foi descartada: a loja é toda rosa, e o site precisa ter a cara dela.
- **Paleta da própria loja:** rosa-choque da bandeira `#F0388A`, rosa-claro da fachada `#F9C5DA` / `#FDEBF2`, chocolate `#3A1A1F`, creme `#FFF7EF`.
- **Tipografia:** Shrikhand (letreiro de doceria), Caveat (a letra de mão da bandeira "Busque sempre olhar o lado DOCE da vida") e Figtree.
- **Assinaturas visuais:** cobertura escorrendo como transição entre seções (`public/drip.svg`, escorre com o scroll); toldo listrado sobre a vitrine; etiquetas com furinho, como as plaquinhas rosa penduradas nos potes da loja; fotos coladas como adesivos; botões com sombra sólida.
- **Interação própria:** a **plaquinha da porta** vira sozinha entre ABERTO e FECHADO conforme o horário real da loja (fuso de São Paulo), com o relógio ao vivo, o delivery e o site de pedidos.

## Roteiro das cenas
1. **Abertura:** "busque sempre olhar / o lado **DOCE** da vida." As letras de DOCE caem e quicam, e três fotos são "coladas" na tela.
2. **Letreiro corrido** com os doces da casa; acelera com o scroll.
3. **A casa:** fachada emoldurada que gira com o scroll, "Nosso império, a realização dos nossos sonhos!", e os números (30 mil, 4,6).
4. **Vitrine (fixa no desktop):** toldo desenrola, e a prateleira de 8 doces anda com o scroll. Etiquetas e adesivos ("lote limitado", "campeão de vendas") pulam ao chegar. No mobile vira carrossel nativo.
5. **Bolos de festa:** cinco bolos colocados na mesa, um a um.
6. **Hoje na Tati:** plaquinha da porta + relógio ao vivo.
7. **Avaliações** como bilhetes colados.
8. **Visite** e rodapé com a frase da bandeira.

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
- **Logo em vetor:** o wordmark do site é tipográfico (Shrikhand), porque a logo só existe em baixa resolução.
- **Foto da Tati:** a seção "A casa" comporta um retrato.

## QA (17/11/2026)
`auditoria-layout` e `auditoria-midia` sem problemas nas 14 resoluções. Sem erros de console, sem overflow horizontal ao redimensionar através de 1024px, e conteúdo todo visível com movimento reduzido. Só a vitrine fica fixa (engata em 1024, 1280, 1440 e 1920).
