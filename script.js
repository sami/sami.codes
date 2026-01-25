document.addEventListener('DOMContentLoaded', () => {

    // --- COOKIE CONSENT ---
    const COOKIE_CONSENT_KEY = 'cookie-consent';
    const GA_ID = 'G-S52J51L0RC';

    function loadGoogleAnalytics() {
        // Create and load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GA_ID);
    }

    function handleCookieConsent(accepted) {
        // Store user's choice
        localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'declined');

        // Hide banner
        const banner = document.getElementById('cookie-consent');
        banner.style.display = 'none';

        // Load Google Analytics if accepted
        if (accepted) {
            loadGoogleAnalytics();
        }
    }

    function checkCookieConsent() {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);

        if (consent === 'accepted') {
            // User previously accepted, load Google Analytics
            loadGoogleAnalytics();
        } else if (consent === 'declined') {
            // User previously declined, do nothing
            return;
        } else {
            // No previous choice, show banner
            const banner = document.getElementById('cookie-consent');
            banner.style.display = 'block';
        }
    }

    // Cookie consent buttons
    document.getElementById('cookie-accept').addEventListener('click', () => {
        handleCookieConsent(true);
    });

    document.getElementById('cookie-decline').addEventListener('click', () => {
        handleCookieConsent(false);
    });

    // Cookie preferences link in footer - allows users to change their choice
    document.getElementById('cookie-preferences').addEventListener('click', () => {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        const banner = document.getElementById('cookie-consent');
        banner.style.display = 'block';
    });

    // Check consent on page load
    checkCookieConsent();


    // --- THEME ENGINE ---
    const html = document.documentElement;
    const themeBtn = document.getElementById('theme-switcher');
    const themeAnnouncer = document.getElementById('theme-announcer');
    const gameAnnouncer = document.getElementById('game-announcer');

    const themes = [
        'midnight', 'mint', 'terminal', 'blueprint',
        'vampire', 'coffee', 'flashbang', 'abyss',
        'retrowave', 'grayscale', 'desert', 'oceanic',
        'royal', 'forest', 'candy'
    ];

    // 1. Time of Day Logic (Auto Detect via System Prefs)
    function setAutoTheme() {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'midnight' : 'mint');
    }

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            setTheme(event.matches ? 'midnight' : 'mint');
        });
    }

    // 2. Set Theme Function with Loading State
    function setTheme(themeName) {
        // Add loading state
        themeBtn.classList.add('loading');
        themeBtn.textContent = 'Loading';

        if (themeName !== 'custom') {
            html.removeAttribute('style');
        }

        html.setAttribute('data-theme', themeName);

        setTimeout(() => {
            const style = getComputedStyle(html);
            const complaint = style.getPropertyValue('--complaint').replace(/"/g, '').trim();
            themeBtn.textContent = complaint || "Switch Theme";
            themeBtn.classList.remove('loading');
            updateGameColors();

            // Announce theme change to screen readers
            const themeNameFormatted = themeName.charAt(0).toUpperCase() + themeName.slice(1);
            themeAnnouncer.textContent = `Theme changed to ${themeNameFormatted}. ${complaint}`;
        }, 100);
    }

    // 3. Button Switch Logic (Random Shuffle)
    themeBtn.addEventListener('click', () => {
        if (themeBtn.classList.contains('loading')) return;

        const current = html.getAttribute('data-theme');
        const available = themes.filter(t => t !== current);
        const randomTheme = available[Math.floor(Math.random() * available.length)];
        setTheme(randomTheme);
    });

    // Initialize
    setAutoTheme();


    // --- OPTIMIZED GAME ENGINE ---
    const container = document.getElementById('game-container');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('game-overlay');
    const startBtn = document.getElementById('start-btn');

    // FPS Limiting
    const FPS = 60;
    const frameDuration = 1000 / FPS;
    let lastFrameTime = 0;

    function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let gameRunning = false;
    let animationId;
    let score = 0;
    let lastAnnouncedScore = 0; // Track last announced score for milestones
    let gameSpeed = 3;

    let colPlayer = '#38BDF8';
    let colObs = '#EF4444';
    let colAccent = '#38BDF8';

    function updateGameColors() {
        const s = getComputedStyle(html);
        colPlayer = s.getPropertyValue('--accent').trim() || '#38BDF8';
        colObs = s.getPropertyValue('--game-obs').trim() || '#EF4444';
        colAccent = s.getPropertyValue('--accent').trim() || '#38BDF8';

        if (!gameRunning) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    const player = { x: 50, y: 0, w: 20, h: 20, dy: 0, jump: -9, grounded: false };
    const gravity = 0.5;
    let obstacles = [];

    function update(currentTime) {
        if (!gameRunning) return;

        // FPS Limiting - only update if enough time has passed
        if (currentTime - lastFrameTime < frameDuration) {
            animationId = requestAnimationFrame(update);
            return;
        }

        lastFrameTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const groundY = canvas.height;

        player.dy += gravity;
        player.y += player.dy;

        if (player.y + player.h > groundY) {
            player.y = groundY - player.h;
            player.dy = 0;
            player.grounded = true;
        } else {
            player.grounded = false;
        }

        ctx.fillStyle = colPlayer;
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // SPEED LOGIC: Slow start (3), ramp up to 8 max
        const difficulty = Math.min(score / 100, 1);
        gameSpeed = 3 + (difficulty * 5);

        // Gap logic adjustment for slower speeds
        const minGap = (gameSpeed * 22) + (100 * (1 - difficulty));

        const lastObs = obstacles[obstacles.length - 1];
        const dist = lastObs ? canvas.width - lastObs.x : 9999;

        if (dist > minGap + (Math.random() * 150)) {
            obstacles.push({
                x: canvas.width,
                w: 15 + (Math.random() * 10),
                h: 20 + (Math.random() * 20)
            });
        }

        obstacles.forEach((obs, i) => {
            obs.x -= gameSpeed;

            ctx.fillStyle = colObs;
            ctx.fillRect(obs.x, groundY - obs.h, obs.w, obs.h);

            if (player.x < obs.x + obs.w &&
                player.x + player.w > obs.x &&
                player.y + player.h > groundY - obs.h + 5) {
                gameOver();
            }

            if (obs.x + obs.w < 0) {
                obstacles.shift();
                score++;

                // Announce score milestones to screen readers
                if (score > 0 && score % 10 === 0 && score !== lastAnnouncedScore) {
                    gameAnnouncer.textContent = `Score: ${score}`;
                    lastAnnouncedScore = score;
                }
            }
        });

        ctx.fillStyle = colAccent;
        ctx.font = '12px "Fira Code"';
        ctx.fillText(`SCORE: ${score}`, canvas.width - 100, 30);

        animationId = requestAnimationFrame(update);
    }

    function jump() {
        if (player.grounded && gameRunning) player.dy = player.jump;
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        overlay.style.display = 'flex';
        overlay.querySelector('p').textContent = `SCORE: ${score}`;
        startBtn.textContent = "RETRY";

        // Announce game over to screen readers
        gameAnnouncer.textContent = `Game over! Final score: ${score}. Press the retry button or space to play again.`;
    }

    function reset() {
        resize();
        obstacles = [];
        score = 0;
        lastAnnouncedScore = 0; // Reset score announcements
        player.y = canvas.height - player.h;
        player.dy = 0;
        gameRunning = true;
        lastFrameTime = 0; // Reset frame timer
        overlay.style.display = 'none';
        animationId = requestAnimationFrame(update);

        // Announce game start to screen readers
        gameAnnouncer.textContent = 'Game started! Press space or tap to jump over obstacles.';
    }

    startBtn.addEventListener('click', (e) => { e.stopPropagation(); reset(); });
    container.addEventListener('mousedown', () => { if (gameRunning) jump(); });
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameRunning && overlay.style.display !== 'none' && document.activeElement !== startBtn) reset();
            else jump();
            if (e.target === document.body) e.preventDefault();
        }
    });
    container.addEventListener('touchstart', (e) => {
        if (e.target === startBtn) return;
        e.preventDefault();
        if (gameRunning) jump();
    }, { passive: false });

    // Contact CTA Handler
    document.getElementById('contact-trigger').addEventListener('click', function (e) {
        const email = 'hello@sami.codes';
        window.location.href = 'mailto:' + email;
        this.textContent = email;
    });
});
