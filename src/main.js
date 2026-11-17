import '@fontsource/shrikhand/400.css'
import '@fontsource-variable/caveat/index.css'
import '@fontsource-variable/figtree/index.css'
import 'lenis/dist/lenis.css'
import './styles.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]
const html = document.documentElement
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
if (reduceMotion) html.classList.add('no-motion')

/* --------------------------------------------------------------------------
   Hoje na Tati: horário real, no fuso de São Paulo
   Loja (Google Maps): ter–sáb 10h–20h · dom 10h–14h · seg fechada
   Delivery (bio do Instagram): seg–sáb 13h–18h
   Site de pedidos (posts do Instagram): abre às 12h40
   -------------------------------------------------------------------------- */
const LOJA = { 0: [600, 840], 1: null, 2: [600, 1200], 3: [600, 1200], 4: [600, 1200], 5: [600, 1200], 6: [600, 1200] }
const DELIVERY = { 0: null, 1: [780, 1080], 2: [780, 1080], 3: [780, 1080], 4: [780, 1080], 5: [780, 1080], 6: [780, 1080] }
const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const fmt = (m) => { const h = Math.floor(m / 60); const mm = m % 60; return mm ? `${h}h${String(mm).padStart(2, '0')}` : `${h}h` }
const span = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return h ? `${h}h${m ? ` ${String(m).padStart(2, '0')}min` : ''}` : `${m} min` }

function spNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', year: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]))
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday)
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute), hh: parts.hour, mm: parts.minute, year: parts.year }
}

function stateOf(table, day, minutes, verbs) {
  const t = table[day]
  if (t && minutes >= t[0] && minutes < t[1]) {
    const left = t[1] - minutes
    return { live: true, text: left <= 60 ? `${verbs.open} · ${verbs.closes} em ${span(left)}` : `${verbs.open} · até ${fmt(t[1])}` }
  }
  if (t && minutes < t[0]) {
    const left = t[0] - minutes
    return { live: false, text: left <= 180 ? `${verbs.opens} em ${span(left)}` : `${verbs.opens} hoje às ${fmt(t[0])}` }
  }
  let d = (day + 1) % 7
  while (!table[d]) d = (d + 1) % 7
  return { live: false, text: `${verbs.opens} ${d === (day + 1) % 7 ? 'amanhã' : DAY_NAMES[d]} às ${fmt(table[d][0])}` }
}

function setRow(name, st) {
  const row = $(`[data-row="${name}"]`)
  if (!row) return
  row.classList.toggle('is-live', st.live)
  $('[data-state]', row).textContent = st.text
}

function updateStatus() {
  const { day, minutes, hh, mm, year } = spNow()
  const loja = stateOf(LOJA, day, minutes, { open: 'Aberta agora', closes: 'fecha', opens: 'Abre' })
  const delivery = stateOf(DELIVERY, day, minutes, { open: 'Entregando agora', closes: 'encerra', opens: 'Começa' })
  setRow('loja', loja)
  setRow('delivery', delivery)
  const site = DELIVERY[day]
    ? (minutes < 760 ? { live: false, text: minutes >= 580 ? `Abre em ${span(760 - minutes)}` : 'Abre hoje às 12h40' } : minutes < 1080 ? { live: true, text: 'Aberto desde 12h40' } : { live: false, text: 'Abre de novo às 12h40' })
    : { live: false, text: 'Abre de novo às 12h40' }
  setRow('site', site)
  $$('[data-clock]').forEach((el) => { el.textContent = `${hh}:${mm}` })
  $$('[data-day]').forEach((el) => { if (el.tagName !== 'TR') el.textContent = DAY_NAMES[day] })
  const short = loja.live ? `Loja aberta agora, até ${fmt(LOJA[day][1])}` : `Loja fechada, ${loja.text.replace('Abre', 'abre')}`
  $$('[data-status-short]').forEach((el) => { el.textContent = short })
  html.classList.toggle('is-open-now', loja.live)
  const door = $('[data-door]')
  if (door) {
    door.classList.toggle('is-closed', !loja.live)
    const next = $('[data-door-next]')
    if (next) next.textContent = loja.text.replace('Abre', 'abre').replace(' às ', ' às ')
  }
  $$('[data-status]').forEach((el) => { el.textContent = loja.live ? `Aberta agora · até ${fmt(LOJA[day][1])}` : `Fechada agora · ${loja.text.replace('Abre', 'abre')}` })
  $$('.hours tr').forEach((tr) => {
    const [a, b] = tr.dataset.day.split('-').map(Number)
    tr.classList.toggle('is-today', day >= a && day <= (b ?? a))
  })
  $$('[data-year]').forEach((el) => { el.textContent = year })
}
updateStatus()
setInterval(updateStatus, 15000)

/* --------------------------------------------------------------------------
   Lenis + ScrollTrigger
   -------------------------------------------------------------------------- */
let lenis = null
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}
const scrollToY = (y, done) => {
  if (lenis) lenis.scrollTo(y, { duration: 1.3, onComplete: done })
  else { window.scrollTo(0, y); done?.() }
}
const scrollToEl = (el) => scrollToY(el.getBoundingClientRect().top + window.scrollY, () => el.focus({ preventScroll: true }))

/* --------------------------------------------------------------------------
   Navegação e menu mobile (foco preso, Esc)
   -------------------------------------------------------------------------- */
const nav = $('[data-nav]')
const burger = $('[data-burger]')
const mmenu = $('[data-mmenu]')

function openMenu() {
  mmenu.hidden = false
  requestAnimationFrame(() => mmenu.classList.add('is-open'))
  burger.setAttribute('aria-expanded', 'true')
  $('[data-burger-label]').textContent = 'Fechar'
  nav.classList.add('is-open')
  document.body.style.overflow = 'hidden'
  lenis?.stop()
  if (!reduceMotion) gsap.fromTo($$('.mmenu__links li, .mmenu__cta, .mmenu__foot', mmenu), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.04, delay: 0.1 })
  $('a', mmenu).focus({ preventScroll: true })
}
function closeMenu({ restoreFocus = true } = {}) {
  if (mmenu.hidden) return
  mmenu.classList.remove('is-open')
  burger.setAttribute('aria-expanded', 'false')
  $('[data-burger-label]').textContent = 'Menu'
  nav.classList.remove('is-open')
  document.body.style.overflow = ''
  lenis?.start()
  setTimeout(() => { mmenu.hidden = true }, reduceMotion ? 0 : 500)
  if (restoreFocus) burger.focus({ preventScroll: true })
}
burger.addEventListener('click', () => (mmenu.hidden ? openMenu() : closeMenu()))
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mmenu.hidden) closeMenu() })
mmenu.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return
  const items = [burger, ...$$('a', mmenu)]
  if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items.at(-1).focus() }
  else if (!e.shiftKey && document.activeElement === items.at(-1)) { e.preventDefault(); items[0].focus() }
})
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) closeMenu({ restoreFocus: false }) })

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]')
  if (!a) return
  const id = a.getAttribute('href').slice(1)
  const target = id && document.getElementById(id)
  if (!target) return
  e.preventDefault()
  const wasOpen = !mmenu.hidden
  closeMenu({ restoreFocus: false })
  const go = () => (id === 'inicio' ? scrollToY(0) : scrollToEl(target))
  wasOpen ? setTimeout(go, 120) : go()
  history.replaceState(null, '', `#${id}`)
})

/* --------------------------------------------------------------------------
   Fotos de seções fixas: carregam antes de chegar (o lazy nativo atrasa
   quando a seção é atravessada rápido)
   -------------------------------------------------------------------------- */
if ('IntersectionObserver' in window) {
  const eager = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return
    $$('img[loading="lazy"]', target).forEach((img) => { img.loading = 'eager' })
    eager.unobserve(target)
  }), { rootMargin: '150% 0px' })
  $$('.vitrine, .festas, .hoje, .visit').forEach((s) => eager.observe(s))
}

/* --------------------------------------------------------------------------
   Abertura: o "DOCE" cai letra por letra e quica; as fotos são coladas
   -------------------------------------------------------------------------- */
async function intro() {
  if (reduceMotion) { html.classList.remove('js-intro'); return }
  await Promise.race([document.fonts?.ready, wait(1200)])
  const tl = gsap.timeline({ onStart: () => html.classList.remove('js-intro') })
  tl.fromTo('[data-hero-fade]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, 0.05)
    .fromTo('[data-hero-line]', { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.5 }, 0.15)
    .fromTo('[data-doce] span', { opacity: 0, yPercent: -120, rotate: () => gsap.utils.random(-25, 25) },
      { opacity: 1, yPercent: 0, rotate: 0, duration: 1.1, ease: 'bounce.out', stagger: 0.09 }, 0.3)
    .fromTo('[data-snap]', { opacity: 0, scale: 1.35, y: -40 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2.2)', stagger: 0.14 }, 0.75)
}

/* --------------------------------------------------------------------------
   Letreiro corrido (anda sozinho e acelera com o scroll)
   -------------------------------------------------------------------------- */
const marquee = $('[data-marquee]')
let marqueeTween = null
if (!reduceMotion && marquee) {
  marqueeTween = gsap.to(marquee, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 })
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (self) => gsap.to(marqueeTween, { timeScale: 1 + Math.min(4, Math.abs(self.getVelocity()) / 400), duration: 0.2, overwrite: true, onComplete: () => gsap.to(marqueeTween, { timeScale: 1, duration: 1 }) }),
  })
}

/* --------------------------------------------------------------------------
   Coreografia por tamanho de tela
   -------------------------------------------------------------------------- */
const mm = gsap.matchMedia()

if (!reduceMotion) {
  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' }, (ctx) => {
    const { desktop } = ctx.conditions

    // A cobertura escorre quando a seção chega
    $$('[data-drip]').forEach((d) => {
      gsap.fromTo(d, { scaleY: 0.28 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: d.parentElement, start: 'top bottom', end: 'top 35%', scrub: 0.6 } })
    })

    // O toldo desenrola
    gsap.fromTo('.awning', { scaleY: 0.2 }, { scaleY: 1, ease: 'back.out(2)', duration: 0.9, scrollTrigger: { trigger: '.vitrine', start: 'top 75%', once: true } })

    // Fotos emolduradas giram de leve com o scroll
    $$('[data-tilt]').forEach((f) => {
      const r = parseFloat(getComputedStyle(f).rotate) || 0
      gsap.fromTo(f, { rotate: r - 6, y: 50 }, { rotate: r + 2, y: -20, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } })
    })

    // Números contam
    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count); const dec = Number(el.dataset.decimals || 0); const o = { v: 0 }
      gsap.to(o, { v: end, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ',') } })
    })

    // Bolos de festa: são "colocados na mesa", um a um
    gsap.from('[data-cake]', { y: 120, rotate: (i) => (i % 2 ? 14 : -14), opacity: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.1, scrollTrigger: { trigger: '.cakes', start: 'top 80%', once: true } })

    // Avaliações: bilhetes colados
    gsap.from('[data-note]', { scale: 0.6, y: 60, opacity: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.12, scrollTrigger: { trigger: '.notes', start: 'top 80%', once: true } })

    // Plaquinha da porta: balança ao chegar
    gsap.from('.door', { rotate: -14, transformOrigin: '50% 0', duration: 2.2, ease: 'elastic.out(1, 0.25)', scrollTrigger: { trigger: '.door', start: 'top 80%', once: true } })

    if (desktop) {
      html.classList.add('has-pin')

      // Abertura: o DOCE afunda devagar, as fotos sobem mais rápido (profundidade)
      gsap.to('[data-doce]', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      $$('[data-snap]').forEach((s, i) => gsap.to(s, { y: -120 - i * 70, rotate: `+=${i % 2 ? -8 : 8}`, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }))

      // A vitrine: prateleira guiada pelo scroll; cada doce dá um "pulinho" ao passar pelo centro
      const shelf = $('[data-shelf]')
      const viewport = $('[data-shelf-viewport]')
      const prods = $$('[data-prod]', shelf)
      const num = $('[data-shelf-num]')
      const dist = () => Math.max(0, shelf.scrollWidth - viewport.clientWidth)
      const move = gsap.to(shelf, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.vitrine', start: 'top top', end: () => `+=${dist() + window.innerHeight * 0.4}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 1,
          onUpdate: (self) => { num.textContent = String(Math.min(prods.length, 1 + Math.floor(self.progress * prods.length * 0.999))).padStart(2, '0') },
        },
      })
      prods.forEach((p) => {
        gsap.fromTo($('.label-tag', p), { y: 46, scale: 0.86 }, {
          y: 0, scale: 1, ease: 'back.out(3)',
          scrollTrigger: { trigger: p, containerAnimation: move, start: 'left 85%', end: 'left 45%', scrub: true },
        })
        const st = $('.sticker', p)
        if (st) gsap.fromTo(st, { scale: 0, rotate: -30 }, { scale: 1, rotate: 8, ease: 'back.out(3)', scrollTrigger: { trigger: p, containerAnimation: move, start: 'left 70%', end: 'left 50%', scrub: true } })
      })

      return () => html.classList.remove('has-pin')
    }

    // Mobile: a prateleira é um carrossel nativo; o contador acompanha
    const viewport = $('[data-shelf-viewport]')
    const prods = $$('[data-prod]')
    const num = $('[data-shelf-num]')
    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth
      const p = max > 0 ? viewport.scrollLeft / max : 0
      num.textContent = String(Math.min(prods.length, 1 + Math.round(p * (prods.length - 1)))).padStart(2, '0')
    }
    viewport.addEventListener('scroll', onScroll, { passive: true })
    return () => viewport.removeEventListener('scroll', onScroll)
  })
}

/* --------------------------------------------------------------------------
   Estado da navegação, menu ativo e CTA fixo (depois dos pins)
   -------------------------------------------------------------------------- */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate(self) {
    const y = self.scroll()
    nav.classList.toggle('is-solid', y > 40)
    const busy = nav.contains(document.activeElement) || !mmenu.hidden
    nav.classList.toggle('is-hidden', y > window.innerHeight * 0.8 && self.direction === 1 && !busy)
  },
})
nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'))

const navLinks = $$('[data-nav-link]')
$$('[data-section]').forEach((section) => {
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle(self) {
      if (!self.isActive) return
      navLinks.forEach((l) => (l.dataset.navLink === section.dataset.section ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')))
    },
  })
})

const sticky = $('[data-sticky-cta]')
ScrollTrigger.create({
  trigger: '.hero', start: 'bottom 70%', endTrigger: '#visite', end: 'top 60%',
  onToggle: (self) => sticky.classList.toggle('is-visible', self.isActive),
})

intro()
window.addEventListener('load', () => ScrollTrigger.refresh())
