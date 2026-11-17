import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
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
  const short = loja.live ? `Loja aberta até ${fmt(LOJA[day][1])}` : `Loja fechada · ${loja.text.replace('Abre', 'abre')}`
  $$('[data-status-short]').forEach((el) => { el.textContent = short })
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
   Manifesto: palavras acendem conforme a leitura
   -------------------------------------------------------------------------- */
function splitWords(el) {
  const walk = (node) => {
    ;[...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment()
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) frag.append(part)
          else { const s = document.createElement('span'); s.className = 'word'; s.textContent = part; frag.append(s) }
        })
        n.replaceWith(frag)
      } else if (n.nodeType === 1) walk(n)
    })
  }
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim())
  walk(el)
  $$('.word', el).forEach((w) => w.setAttribute('aria-hidden', 'true'))
}

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
   Abertura: a vitrine assenta, o título sobe
   -------------------------------------------------------------------------- */
async function intro() {
  if (reduceMotion) { html.classList.remove('js-intro'); return }
  await Promise.race([document.fonts?.ready, wait(1200)])
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onStart: () => html.classList.remove('js-intro') })
  tl.fromTo('[data-hero-bg]', { scale: 1.12 }, { scale: 1, duration: 2.8, ease: 'power3.out' }, 0)
    .fromTo('[data-hero-bg] img', { opacity: 0.35 }, { opacity: 1, duration: 1.8, ease: 'power2.out' }, 0)
    .fromTo('[data-hero-line]', { opacity: 0, yPercent: 70 }, { opacity: 1, yPercent: 0, duration: 1.6, stagger: 0.14 }, 0.25)
    .fromTo('[data-hero-fade]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.8)
}

/* --------------------------------------------------------------------------
   Coreografia por tamanho de tela
   -------------------------------------------------------------------------- */
const manifesto = $('[data-manifesto]')
const mm = gsap.matchMedia()

if (!reduceMotion) {
  splitWords(manifesto)

  mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023.98px)' }, (ctx) => {
    const { desktop } = ctx.conditions

    // A frase da porta acende palavra por palavra
    gsap.to($$('.word', manifesto), {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 55%', scrub: true },
    })

    $$('[data-rise]').forEach((el) => {
      gsap.from(el, { y: 28, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
    })

    $$('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count)
      const dec = Number(el.dataset.decimals || 0)
      const o = { v: 0 }
      gsap.to(o, {
        v: end, duration: 1.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = o.v.toFixed(dec).replace('.', ',') },
      })
    })

    if (desktop) {
      html.classList.add('has-pin')

      // Abertura: a foto desce mais devagar que o texto
      gsap.to('[data-hero-bg] img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hero__inner', { yPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom top', scrub: true } })

      $$('[data-parallax]').forEach((wrap) => {
        gsap.fromTo($('img', wrap), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: wrap.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
      })

      // Vitrine: seção fixa; cada doce entra como uma cortina que sobe
      const chapters = $$('[data-chapter]')
      const chapNum = $('[data-chap-num]')
      const n = chapters.length
      gsap.set(chapters.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.vitrine', start: 'top top', end: () => `+=${window.innerHeight * (n - 0.4)}`, pin: '.vitrine__stage', scrub: 0.7, refreshPriority: 2,
          onUpdate(self) {
            const i = Math.min(n - 1, Math.floor(self.progress * n * 0.999 + 0.08))
            chapNum.textContent = String(i + 1).padStart(2, '0')
            gsap.set('[data-chap-bar]', { scaleX: self.progress })
          },
        },
      })
      chapters.forEach((ch, i) => {
        if (i === 0) return
        const img = $('img', ch)
        const copy = $('.chapter__copy', ch)
        const at = i - 0.6
        tl.to(ch, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.inOut' }, at)
          .fromTo(img, { scale: 1.18 }, { scale: 1.02, duration: 0.6, ease: 'power2.out' }, at)
          .fromTo(copy, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, i - 0.3)
          .to($('img', chapters[i - 1]), { filter: 'brightness(0.7)', duration: 0.4, ease: 'power1.in' }, at + 0.2)
          .to($('.chapter__copy', chapters[i - 1]), { autoAlpha: 0, y: -30, duration: 0.3, ease: 'power2.in' }, at)
      })
      tl.to({}, { duration: 0.3 })

      // Bolos de festa: galeria horizontal guiada pelo scroll
      const track = $('[data-cake-track]')
      const viewport = $('[data-cake-viewport]')
      const cakes = $$('.cake', track)
      const cakeNum = $('[data-cake-num]')
      const dist = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.festas', start: 'top top', end: () => `+=${dist() + window.innerHeight * 0.3}`,
          pin: '.festas__stage', scrub: 0.6, invalidateOnRefresh: true, refreshPriority: 1,
          onUpdate: (self) => { cakeNum.textContent = String(Math.min(cakes.length, 1 + Math.floor(self.progress * cakes.length))).padStart(2, '0') },
        },
      })

      return () => {
        html.classList.remove('has-pin')
        gsap.set(chapters, { clearProps: 'clipPath' })
        gsap.set($$('.chapter img, .chapter__copy'), { clearProps: 'all' })
      }
    }

    // Mobile: sem seções fixas. As fotos dos doces se aproximam ao entrar.
    $$('.chapter__bg img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.closest('.chapter'), start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    const viewport = $('[data-cake-viewport]')
    const cakes = $$('.cake')
    const cakeNum = $('[data-cake-num]')
    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth
      const p = max > 0 ? viewport.scrollLeft / max : 0
      cakeNum.textContent = String(Math.min(cakes.length, 1 + Math.round(p * (cakes.length - 1)))).padStart(2, '0')
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
