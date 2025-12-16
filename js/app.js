import { loadState, state, saveState } from './core/state.js';
import { startGameLoop } from './core/gameloop.js';
import { updateUI, applyDecor } from './ui/render.js';
import { nextQ } from './modules/learning.js';
import { setTab, toggleFridge, closeParental, addCustomWord, initParentalEvents, say, updateDailyGoal } from './ui/views.js';
import { pokeCat } from './modules/pet.js';
import { startGame, stopGame } from './modules/minigames.js';
import { playAudio } from './core/audio.js';
import { interact } from './modules/interaction.js';

// Expose functions to global scope for HTML event handlers
window.setTab = setTab;
window.toggleFridge = toggleFridge;
window.playAudio = playAudio;
window.pokeCat = pokeCat;
window.startGame = startGame;
window.stopGame = stopGame;
window.closeParental = closeParental;
window.addCustomWord = addCustomWord;
window.interact = interact;
window.saveName = saveName;
window.updateDailyGoal = updateDailyGoal;

// Initialize
window.onload = () => {
    loadState();
    
    if(!state.userName) {
        document.getElementById('onboarding').style.display = 'flex';
    } else {
        greetUser();
    }

    updateUI();
    applyDecor();
    nextQ();
    startGameLoop();
    initParentalEvents();
    
    console.log("Word Pet App Initialized");
};

function saveName() {
    const name = document.getElementById('name-input').value.trim();
    if(name) {
        state.userName = name;
        saveState();
        document.getElementById('onboarding').style.display = 'none';
        greetUser();
    }
}

function greetUser() {
    say(`Good morning, ${state.userName}!`);
}
