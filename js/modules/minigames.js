import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { setTab } from '../ui/views.js';
import { startTetris } from './tetris.js';
import { startKolobok } from './kolobok.js';
import { startChess } from './chess.js';
import { startFishing } from './fishing.js';

export let gameMode = null;
export let gameData = {};
let runnerLoop = null;

// Helper global for HTML onclick
window.stopGameUI = stopGame;

export function startGame(type) {
    if(gameMode) {
        if(!confirm("Завершить текущую игру?")) return;
        stopGame();
    }

    gameMode = type;
    
    // Activate Fullscreen Game Mode
    document.body.classList.add('game-mode');
    document.getElementById('main-scene').classList.add('game-active');
    
    document.querySelectorAll('.adv-scene').forEach(e => e.classList.remove('active'));
    document.getElementById('game-'+type).classList.add('active');
    
    // Hide quiz tab for all minigames to avoid conflict
    document.getElementById('tab-quiz').style.display = 'none';
    
    if(type === 'dog') { 
        // Dog game is special: it runs IN the main view but needs space?
        // Actually, let's keep Dog game mostly as is, but maybe fullscreen too?
        // User complained about "Run Home" buttons.
        // Let's make "dog" run in the standard view for now OR fullscreen it.
        // If fullscreen, we need to show quiz controls inside the game scene.
        // For now, let's EXCLUDE Dog from fullscreen mode if it relies on the bottom panel quiz.
        // BUT user said "game selection buttons remain". 
        // If we fullscreen, the bottom panel is hidden. 
        // Dog game uses `setTab('quiz')`.
        
        // REVISION: Dog Game needs the bottom panel. So we DON'T add game-mode for Dog.
        document.body.classList.remove('game-mode'); 
        
        gameData = { dogPos: 0, catPos: 40 }; 
        updateDogScene(); 
        setTab('quiz'); 
        document.getElementById('tab-quiz').style.display = 'flex';
        
        // Start Runner Loop
        runnerLoop = setInterval(() => {
            if(gameMode !== 'dog') return clearInterval(runnerLoop);
            // Dog chases cat slowly
            gameData.dogPos += 0.5; // Pressure
            updateDogScene();
        }, 1000);
        
    } else if (type === 'fish') { 
        startFishing();
    } else if (type === 'tetris') {
        startTetris();
    } else if (type === 'kolobok') {
        startKolobok();
    } else if (type === 'chess') {
        startChess();
    }
}

export function stopGame() {
    gameMode = null;
    
    // Disable Fullscreen
    document.body.classList.remove('game-mode');
    document.getElementById('main-scene').classList.remove('game-active');
    
    // Reset loops
    if(runnerLoop) clearInterval(runnerLoop);
    
    // Reset tabs
    document.getElementById('tab-quiz').style.display = 'none';
    setTab('adv');
}

export function updateDogScene() {
    let dogEl = document.getElementById('dog-el');
    let catEl = document.getElementById('cat-run-el');
    
    if(!dogEl || !catEl) return;

    dogEl.style.left = gameData.dogPos + '%';
    catEl.style.left = gameData.catPos + '%';
    
    // CSS Running animation
    dogEl.classList.add('running');
    catEl.classList.add('running');
    
    if(gameData.dogPos >= gameData.catPos - 5) { 
        alert("Ой! Собака догнала! 🐕"); 
        stopGame(); 
    } else if (gameData.catPos >= 85) { 
        alert("Ура! Ты убежал домой! 🏠 +10 монет"); 
        state.coins += 10; 
        saveState(); 
        updateUI(); 
        stopGame(); 
    }
}

export function catchFishAnim() {
    let f = document.getElementById('fish-target');
    if(!f) return;
    f.style.left = (20 + Math.random()*60) + '%'; 
    f.style.opacity = 1; 
    f.style.top = '10px';
    setTimeout(() => f.style.top = '50px', 300); 
    setTimeout(() => f.style.opacity = 0, 1000);
}
