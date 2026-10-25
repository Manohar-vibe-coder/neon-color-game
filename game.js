// Audio Controller using HTML5 Audio element with fallback to synthesizers
class SoundManager {
    constructor() {
        this.sounds = {
            click: new Audio('assets/sounds/click.wav'),
            match: new Audio('assets/sounds/match.wav'),
            combo: new Audio('assets/sounds/combo.wav'),
            error: new Audio('assets/sounds/error.wav'),
            gameover: new Audio('assets/sounds/gameover.wav')
        };

        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.preload = 'auto';
            sound.volume = 0.5;
        });
    }

    play(name) {
        if (this.sounds[name]) {
            const soundClone = this.sounds[name].cloneNode();
            soundClone.volume = 0.6;
            soundClone.play().catch(() => {
                // Autoplay policy fallback (silent catch)
            });
        }
    }
}

const sounds = new SoundManager();

// Game Colors definition with Tailwind classes and glowing effects
const NEON_COLORS = [
    { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-400', glow: 'shadow-cyan-500/50', hex: '#22d3ee' },
    { id: 'fuchsia', name: 'Fuchsia', bg: 'bg-fuchsia-500', glow: 'shadow-fuchsia-500/50', hex: '#d946ef' },
    { id: 'amber', name: 'Amber', bg: 'bg-amber-400', glow: 'shadow-amber-500/50', hex: '#fbbf24' },
    { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-400', glow: 'shadow-emerald-500/50', hex: '#34d399' }
];

// Game State
let score = 0;
let streak = 0;
let timeLeft = 20;
let timerInterval = null;
let currentTarget = null;
let highScore = localStorage.getItem('neon_rush_high_score') || 0;

// DOM Elements
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const streakEl = document.getElementById('streak');
const targetBox = document.getElementById('target-box');
const targetGlow = document.getElementById('target-glow');
const targetLabel = document.getElementById('target-label');
const buttonGrid = document.getElementById('button-grid');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');
const startBtn = document.getElementById('start-btn');
const highScoreContainer = document.getElementById('high-score-container');
const highScoreVal = document.getElementById('high-score-val');

// Event Listeners
startBtn.addEventListener('click', () => {
    sounds.play('click');
    startGame();
});

function startGame() {
    score = 0;
    streak = 0;
    timeLeft = 20;

    scoreEl.textContent = score;
    streakEl.textContent = `${streak}x`;
    timerEl.textContent = `${timeLeft}s`;

    overlay.classList.add('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `${timeLeft}s`;

        if (timeLeft <= 5) {
            timerEl.classList.add('text-red-500', 'animate-pulse');
        } else {
            timerEl.classList.remove('text-red-500', 'animate-pulse');
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);

    nextRound();
}

function nextRound() {
    // Select random target
    currentTarget = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];

    // Update target styling
    targetBox.className = `relative w-20 h-20 rounded-2xl shadow-xl transition-all duration-300 transform scale-100 flex items-center justify-center ${currentTarget.bg}`;
    targetGlow.className = `absolute inset-0 rounded-2xl blur-xl opacity-70 transition-all duration-300 ${currentTarget.bg}`;
    targetLabel.textContent = currentTarget.name;

    // Shuffle & Render option buttons
    buttonGrid.innerHTML = '';
    const shuffled = [...NEON_COLORS].sort(() => Math.random() - 0.5);

    shuffled.forEach(color => {
        const btn = document.createElement('button');
        btn.className = `h-20 rounded-2xl ${color.bg} shadow-lg ${color.glow} hover:scale-105 active:scale-95 transition-all duration-150 border border-white/20 flex items-center justify-center font-space font-bold text-white text-lg tracking-wider uppercase drop-shadow-md`;
        btn.textContent = color.name;
        btn.onclick = () => handleChoice(color);
        buttonGrid.appendChild(btn);
    });
}

function handleChoice(selectedColor) {
    if (selectedColor.id === currentTarget.id) {
        streak++;
        const streakBonus = Math.floor(streak / 3) * 5;
        const pointsEarned = 10 + streakBonus;
        score += pointsEarned;

        scoreEl.textContent = score;
        streakEl.textContent = `${streak}x`;

        if (streak % 3 === 0) {
            sounds.play('combo');
            // Bonus time for streak
            timeLeft += 2;
            timerEl.textContent = `${timeLeft}s`;
        } else {
            sounds.play('match');
        }

        // Target bounce animation
        targetBox.classList.add('scale-110');
        setTimeout(() => targetBox.classList.remove('scale-110'), 150);

        nextRound();
    } else {
        streak = 0;
        streakEl.textContent = `${streak}x`;
        score = Math.max(0, score - 5);
        scoreEl.textContent = score;

        sounds.play('error');

        // Shake animation
        targetBox.classList.add('translate-x-2');
        setTimeout(() => targetBox.classList.remove('translate-x-2'), 100);
    }
}

function endGame() {
    sounds.play('gameover');

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('neon_rush_high_score', highScore);
    }

    overlayTitle.textContent = "GAME OVER";
    overlayDesc.innerHTML = `Your final score is <strong class="text-cyan-400 font-space text-lg">${score}</strong> with a max streak multiplier!`;
    
    highScoreVal.textContent = highScore;
    highScoreContainer.classList.remove('hidden');
    startBtn.textContent = "Play Again";

    overlay.classList.remove('hidden');
}
