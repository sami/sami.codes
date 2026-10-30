// Theme switcher, contact button and cookie consent for sami.codes
;(function () {
  var themes = [
    { name: 'midnight', complaint: 'Too Dark!' },
    { name: 'mint', complaint: 'Too Pastel!' },
    { name: 'terminal', complaint: 'Too Hackery!' },
    { name: 'blueprint', complaint: 'Too Blue!' },
    { name: 'vampire', complaint: 'Too Edgy!' },
    { name: 'coffee', complaint: 'Too Cozy!' },
    { name: 'flashbang', complaint: 'Too Bright!' },
    { name: 'abyss', complaint: "Can't See!" },
    { name: 'retrowave', complaint: 'Too Discoy!' },
    { name: 'grayscale', complaint: 'Too Boring!' },
    { name: 'desert', complaint: 'Too Dry!' },
    { name: 'oceanic', complaint: 'Too Wet!' },
    { name: 'royal', complaint: 'Too Fancy!' },
    { name: 'forest', complaint: 'Too Earthy!' },
    { name: 'candy', complaint: 'Too Sweet!' },
  ]

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key)
      localStorage.setItem(key, value)
    } catch (e) {
      return null
    }
  }

  // ---- Theme switcher ----
  function getTheme() {
    var stored = store('theme')
    if (stored && themes.some(function (t) { return t.name === stored })) return stored
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'mint'
  }

  function updateFavicon() {
    var s = getComputedStyle(document.documentElement)
    var brand = s.getPropertyValue('--color-brand').trim() || '#38BDF8'
    var surface = s.getPropertyValue('--color-surface').trim() || '#0F172A'
    var text = s.getPropertyValue('--color-text-primary').trim() || '#F1F5F9'
    var svg =
      '<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="64" height="64" fill="' + surface + '"/>' +
      '<text x="2" y="45" font-family="monospace" font-size="24" fill="' + brand + '" font-weight="bold">&lt;</text>' +
      '<text x="18" y="45" font-family="monospace" font-size="24" fill="' + text + '" font-weight="bold">S</text>' +
      '<text x="34" y="45" font-family="monospace" font-size="24" fill="' + brand + '" font-weight="bold">/&gt;</text>' +
      '</svg>'
    var encoded = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
    document
      .querySelectorAll('link[rel="icon"], link[rel="alternate icon"], link[rel="apple-touch-icon"]')
      .forEach(function (link) {
        link.href = encoded
        if (link.rel === 'icon') link.type = 'image/svg+xml'
      })
  }

  function setTheme(name) {
    var buttons = document.querySelectorAll('[data-theme-toggle]')
    buttons.forEach(function (btn) {
      btn.textContent = 'Loading...'
      btn.classList.add('opacity-60', 'pointer-events-none')
    })

    var root = document.documentElement
    root.className = root.className
      .split(' ')
      .filter(function (c) { return c.indexOf('theme-') !== 0 })
      .join(' ')
    if (name !== 'midnight') root.classList.add('theme-' + name)
    store('theme', name)

    setTimeout(function () {
      var theme = themes.filter(function (t) { return t.name === name })[0] || themes[0]
      buttons.forEach(function (btn) {
        btn.textContent = theme.complaint
        btn.classList.remove('opacity-60', 'pointer-events-none')
        btn.setAttribute('aria-label', 'Switch theme (current: ' + theme.name + ')')
      })
      document.querySelectorAll('.theme-toggle-announcer').forEach(function (el) {
        el.textContent =
          'Theme changed to ' + theme.name.charAt(0).toUpperCase() + theme.name.slice(1) + '. ' + theme.complaint
      })
      updateFavicon()
    }, 100)
  }

  function randomTheme() {
    var current = getTheme()
    var others = themes.filter(function (t) { return t.name !== current })
    setTheme(others[Math.floor(Math.random() * others.length)].name)
  }

  // ---- Contact button ----
  function initContact() {
    var btn = document.getElementById('contact-trigger')
    if (!btn) return
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email')
      if (!email) return
      window.location.href = 'mailto:' + email
      btn.textContent = email
    })
  }

  // ---- Cookie consent ----
  function initCookies() {
    var banner = document.getElementById('cookie-banner')
    if (!banner) return

    function show() {
      banner.classList.remove('hidden')
      setTimeout(function () { banner.classList.remove('translate-y-full') }, 50)
    }
    function hide() {
      banner.classList.add('translate-y-full')
      setTimeout(function () { banner.classList.add('hidden') }, 300)
    }
    function consent(granted) {
      store('cookieConsent', granted ? 'granted' : 'denied')
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' })
      }
      hide()
    }

    if (!store('cookieConsent')) show()
    document.getElementById('cookie-accept').addEventListener('click', function () { consent(true) })
    document.getElementById('cookie-decline').addEventListener('click', function () { consent(false) })
    var prefs = document.getElementById('cookie-preferences')
    if (prefs) {
      prefs.addEventListener('click', function (e) {
        e.preventDefault()
        show()
      })
    }
  }

  function init() {
    setTheme(getTheme())
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', randomTheme)
    })
    initContact()
    initCookies()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
