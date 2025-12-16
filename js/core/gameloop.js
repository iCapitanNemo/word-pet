import { state, saveState } from './state.js';
import { updateUI } from '../ui/render.js';
import { startPetAI } from '../modules/pet.js';

export function startGameLoop() {
    startPetAI();

    // Hunger tick
    setInterval(() => {
        if (state.hunger > 0) {
            state.hunger--;
            updateUI();
            saveState();
        }
    }, 30000);
}

