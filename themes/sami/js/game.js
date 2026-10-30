// Jump game for the sami.codes home page
;(function () {
  if (!document.getElementById('gameCanvas')) return
  const container = document.getElementById('game-container')
  const canvas = document.getElementById('gameCanvas')
  const ctx = canvas.getContext('2d')
  const overlay = document.getElementById('game-overlay')
  const startBtn = document.getElementById('start-btn')
  const gameAnnouncer = document.getElementById('game-announcer')

  const FPS = 60
  const frameDuration = 1000 / FPS
  let lastFrameTime = 0

  function resize() {
    if (!container) return
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
  }

  if (container) {
    window.addEventListener('resize', resize)
    resize()
  }

  let gameRunning = false
  let animationId
  let score = 0
  let lastAnnouncedScore = 0
  let gameSpeed = 3

  let colPlayer = '#38BDF8'
  let colObs = '#EF4444'
  let colAccent = '#38BDF8'

  function updateGameColors() {
    const s = getComputedStyle(document.documentElement)
    colPlayer = s.getPropertyValue('--color-brand').trim() || '#38BDF8'
    // Fallback for obs: reuse brand if obs variable isn't mapped, reference used custom var but we'll use text-secondary for contrast.
    colObs = s.getPropertyValue('--color-text-secondary').trim() || '#EF4444'
    colAccent = s.getPropertyValue('--color-brand').trim() || '#38BDF8'

    if (!gameRunning && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Observe theme changes
  const observer = new MutationObserver(() => updateGameColors())
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  const player = { x: 50, y: 0, w: 20, h: 20, dy: 0, jump: -9, grounded: false }
  const gravity = 0.5
  let obstacles = []

  function update(currentTime) {
    if (!gameRunning || !ctx) return

    if (currentTime - lastFrameTime < frameDuration) {
      animationId = requestAnimationFrame(update)
      return
    }

    lastFrameTime = currentTime
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const groundY = canvas.height

    player.dy += gravity
    player.y += player.dy

    if (player.y + player.h > groundY) {
      player.y = groundY - player.h
      player.dy = 0
      player.grounded = true
    } else {
      player.grounded = false
    }

    ctx.fillStyle = colPlayer
    ctx.fillRect(player.x, player.y, player.w, player.h)

    const difficulty = Math.min(score / 100, 1)
    gameSpeed = 3 + difficulty * 5
    const minGap = gameSpeed * 22 + 100 * (1 - difficulty)
    const lastObs = obstacles[obstacles.length - 1]
    const dist = lastObs ? canvas.width - lastObs.x : 9999

    if (dist > minGap + Math.random() * 150) {
      obstacles.push({
        x: canvas.width,
        w: 15 + Math.random() * 10,
        h: 20 + Math.random() * 20,
      })
    }

    obstacles.forEach((obs, i) => {
      obs.x -= gameSpeed
      ctx.fillStyle = colObs
      ctx.fillRect(obs.x, groundY - obs.h, obs.w, obs.h)

      if (
        player.x < obs.x + obs.w &&
        player.x + player.w > obs.x &&
        player.y + player.h > groundY - obs.h + 5
      ) {
        gameOver()
      }

      if (obs.x + obs.w < 0) {
        obstacles.shift()
        score++

        if (
          score > 0 &&
          score % 10 === 0 &&
          score !== lastAnnouncedScore &&
          gameAnnouncer
        ) {
          gameAnnouncer.textContent = `Score: ${score}`
          lastAnnouncedScore = score
        }
      }
    })

    ctx.fillStyle = colAccent
    ctx.font = 'bold 12px "Fira Code", monospace'
    ctx.fillText(`SCORE: ${score}`, canvas.width - 100, 30)

    animationId = requestAnimationFrame(update)
  }

  function jump() {
    if (player.grounded && gameRunning) player.dy = player.jump
  }

  function gameOver() {
    gameRunning = false
    cancelAnimationFrame(animationId)
    if (overlay && startBtn && gameAnnouncer) {
      overlay.style.display = 'flex'
      const pTag = overlay.querySelector('p')
      if (pTag) pTag.textContent = `SCORE: ${score}`
      startBtn.textContent = 'RETRY'
      gameAnnouncer.textContent = `Game over! Final score: ${score}. Press the retry button or space to play again.`
    }
  }

  function reset() {
    resize()
    updateGameColors()
    obstacles = []
    score = 0
    lastAnnouncedScore = 0
    player.y = canvas.height - player.h
    player.dy = 0
    gameRunning = true
    lastFrameTime = 0
    if (overlay && gameAnnouncer) {
      overlay.style.display = 'none'
      gameAnnouncer.textContent =
        'Game started! Press space or tap to jump over obstacles.'
    }
    animationId = requestAnimationFrame(update)
  }

  if (startBtn && container) {
    startBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      reset()
    })
    container.addEventListener('mousedown', () => {
      if (gameRunning) jump()
    })

    container.addEventListener(
      'touchstart',
      (e) => {
        if (e.target === startBtn) return
        e.preventDefault()
        if (gameRunning) jump()
      },
      { passive: false }
    )
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      if (
        !gameRunning &&
        overlay &&
        overlay.style.display !== 'none' &&
        document.activeElement !== startBtn
      ) {
        reset()
      } else {
        jump()
      }
      if (e.target === document.body) e.preventDefault()
    }
  })

  // Initial color fetch
  setTimeout(updateGameColors, 100)
})()
