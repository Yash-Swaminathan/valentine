// ============================================
// STATE
// ============================================
const state = {
    noClickCount: 0,
    yesScale: 1,
    noScale: 1,
    easterEggShown: false,
    celebrating: false
};

const noMessages = [
    "Are you sure?",
    "Really?",
    "But... but...",
    "You're breaking my heart!",
    "Please reconsider?",
    "I made this whole website for you",
    "The Yes button is right there!",
    "See how happy you could be if you said yes",
    "I'll take that as a maybe?",
    "Fine, keep trying...",
    "You're only making Yes bigger!",
    "I can do this all day",
    "The No button is getting tiny...",
    "Okay this is just silly now"
];

// ============================================
// DOM ELEMENTS
// ============================================
const $ = (id) => document.getElementById(id);
const yesBtn = $('yesButton');
const noBtn = $('noButton');
const noMsg = $('noMessage');
const questionSection = $('questionSection');
const celebrationSection = $('celebrationSection');
const typewriterMsg = $('typewriterMessage');
const heartsContainer = $('heartsContainer');
const easterEgg = $('easterEgg');
const celebrationGif = $('celebrationGif');
const startGif = $('startGif');
const swapPhoto = $('swapPhoto');
const swapPhoto2 = $('swapPhoto2');

// ============================================
// NO BUTTON HANDLER
// ============================================
let noDebounce = false;

function handleNo(e) {
    e.preventDefault();
    e.stopPropagation();
    if (noDebounce || state.celebrating) return;
    noDebounce = true;
    setTimeout(() => { noDebounce = false; }, 250);

    state.noClickCount++;

    // Shrink No button (15-20%)
    const shrink = 0.15 + Math.random() * 0.05;
    state.noScale = Math.max(state.noScale - shrink, 0.25);
    noBtn.style.transform = `scale(${state.noScale})`;

    // Grow Yes button (20%)
    state.yesScale += 0.2;
    yesBtn.style.transform = `scale(${state.yesScale})`;

    // Update Yes pulse intensity
    yesBtn.classList.remove('intensify-1', 'intensify-2', 'intensify-3', 'intensify-4');
    if (state.noClickCount >= 12)      yesBtn.classList.add('intensify-4');
    else if (state.noClickCount >= 8)  yesBtn.classList.add('intensify-3');
    else if (state.noClickCount >= 5)  yesBtn.classList.add('intensify-2');
    else if (state.noClickCount >= 3)  yesBtn.classList.add('intensify-1');

    // Show message
    const idx = Math.min(state.noClickCount - 1, noMessages.length - 1);
    noMsg.textContent = noMessages[idx];
    noMsg.classList.remove('show');
    void noMsg.offsetWidth; // force reflow
    noMsg.classList.add('show');

    // Reposition No button
    repositionNo();

    // Swap GIF for photo at 7 clicks
    if (state.noClickCount === 7 && startGif && swapPhoto) {
        startGif.style.display = 'none';
        swapPhoto.classList.remove('hidden');
    }

    // Swap to second photo at 10 clicks
    if (state.noClickCount === 10 && swapPhoto && swapPhoto2) {
        swapPhoto.classList.add('hidden');
        swapPhoto2.classList.remove('hidden');
    }

    // Easter egg at 15 clicks
    if (state.noClickCount === 15 && !state.easterEggShown) {
        state.easterEggShown = true;
        easterEgg.classList.remove('hidden');
        easterEgg.classList.add('show');
        setTimeout(() => {
            easterEgg.classList.remove('show');
            easterEgg.classList.add('hidden');
        }, 3500);
    }
}

function repositionNo() {
    // Switch to fixed positioning after first click
    if (!noBtn.classList.contains('repositioned')) {
        noBtn.classList.add('repositioned');
    }

    const pad = 30;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = noBtn.offsetWidth * state.noScale;
    const btnH = noBtn.offsetHeight * state.noScale;

    // Yes button bounding box
    const yesRect = yesBtn.getBoundingClientRect();
    const yesCX = yesRect.left + yesRect.width / 2;
    const yesCY = yesRect.top + yesRect.height / 2;
    const minDist = Math.max(yesRect.width, yesRect.height) + 40;

    let x, y, attempts = 0;
    do {
        x = pad + Math.random() * (vw - btnW - pad * 2);
        y = pad + Math.random() * (vh - btnH - pad * 2);
        const cx = x + btnW / 2;
        const cy = y + btnH / 2;
        const dist = Math.hypot(yesCX - cx, yesCY - cy);
        if (dist >= minDist) break;
        attempts++;
    } while (attempts < 60);

    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
}

// ============================================
// YES BUTTON HANDLER
// ============================================
function handleYes(e) {
    e.preventDefault();
    if (state.celebrating) return;
    state.celebrating = true;
    yesBtn.disabled = true;
    noBtn.disabled = true;

    startCelebration();
}

// ============================================
// CELEBRATION SEQUENCE
// ============================================
function startCelebration() {
    // T+0: Confetti
    launchConfetti();

    // T+500: Fade out question, show celebration
    setTimeout(() => {
        questionSection.classList.add('fade-out');
        noBtn.style.display = 'none';

        setTimeout(() => {
            questionSection.style.display = 'none';
            celebrationSection.classList.remove('hidden');
            celebrationSection.classList.add('visible');
        }, 600);
    }, 500);

    // T+1500: Typewriter
    setTimeout(() => {
        typewriter("I knew you'd say yes!\nYour day is now booked with me on February 14th!", 45);
    }, 1800);

    // T+2500: Show celebration GIF
    setTimeout(() => {
        celebrationGif.classList.remove('hidden');
        celebrationGif.style.display = 'block';
    }, 2500);

    // T+2000: Floating hearts
    setTimeout(() => {
        spawnHearts();
    }, 2000);

    // Additional confetti bursts
    setTimeout(() => launchConfetti(), 3000);
    setTimeout(() => launchConfetti(), 5500);
}

// ============================================
// CONFETTI
// ============================================
function launchConfetti() {
    if (typeof confetti === 'undefined') return;

    const colors = ['#f4c2c2', '#e8a0a0', '#ffffff', '#dbdbdb', '#f0b0b0'];

    // Center burst
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['circle', 'square'],
        ticks: 200
    });

    // Side streams
    const end = Date.now() + 2500;
    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: colors
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: colors
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    })();
}

// ============================================
// TYPEWRITER
// ============================================
function typewriter(text, speed) {
    typewriterMsg.classList.add('visible');
    typewriterMsg.textContent = '';
    let i = 0;

    function tick() {
        if (i < text.length) {
            typewriterMsg.textContent += text.charAt(i);
            i++;
            setTimeout(tick, speed);
        }
    }
    tick();
}

// ============================================
// FLOATING HEARTS
// ============================================
function spawnHearts() {
    const emojis = ['♥', '♡', '❤'];
    let count = 0;
    const max = 25;

    const interval = setInterval(() => {
        if (count >= max) { clearInterval(interval); return; }
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        heart.style.left = Math.random() * window.innerWidth + 'px';
        heart.style.setProperty('--drift-x', (Math.random() - 0.5) * 120 + 'px');
        const dur = 4 + Math.random() * 3;
        const del = Math.random() * 0.5;
        heart.style.setProperty('--duration', dur + 's');
        heart.style.setProperty('--delay', del + 's');
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), (dur + del) * 1000 + 500);
        count++;
    }, 350);
}

// ============================================
// EVENT LISTENERS
// ============================================
function init() {
    // No button — click + touchstart
    noBtn.addEventListener('click', handleNo);
    noBtn.addEventListener('touchend', handleNo, { passive: false });

    // Yes button
    yesBtn.addEventListener('click', handleYes);
    yesBtn.addEventListener('touchend', handleYes, { passive: false });

    // Prevent context menu on buttons (iOS long-press)
    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.btn')) e.preventDefault();
    });

    // Prevent iOS rubber-band / pull-to-refresh
    document.body.addEventListener('touchmove', (e) => {
        if (!state.celebrating) e.preventDefault();
    }, { passive: false });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
