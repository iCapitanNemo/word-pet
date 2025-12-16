import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { say } from '../ui/views.js';
import { gameMode } from './minigames.js';

export let cat = { x: 50, dir: 1, busy: false };

export function startPetAI() {
    setInterval(() => {
        if (cat.busy || gameMode) return;

        // Auto eat if food is visible
        if (document.getElementById('bowl-food').style.display === 'block') {
            catMove(10, eat);
            return;
        }

        // Random play with yarn
        if (state.inventory.includes('t_yarn') && Math.random() > 0.7) {
            catMove(80, () => {
                say("Play! 🧶");
                document.getElementById('cat-container').classList.add('eating');
                setTimeout(() => document.getElementById('cat-container').classList.remove('eating'), 1000);
            });
            return;
        }

        // Random walk
        if (Math.random() > 0.6) catMove(10 + Math.random() * 80);
    }, 3500);
}

export function catMove(tx, cb) {
    cat.busy = true;
    let el = document.getElementById('cat-container');
    cat.dir = tx > cat.x ? 1 : -1;
    el.querySelector('.cat-wrapper').style.transform = `scaleX(${cat.dir})`;
    el.className = 'walking';
    let dist = Math.abs(tx - cat.x);
    el.style.transition = `left ${dist * 30}ms linear`;
    el.style.left = tx + '%';
    setTimeout(() => {
        cat.x = tx;
        el.className = 'idle';
        cat.busy = false;
        if (cb) cb();
    }, dist * 30);
}

export function eat() {
    cat.busy = true;
    let el = document.getElementById('cat-container');
    el.className = 'eating';
    say("Yum! 😋");
    setTimeout(() => {
        document.getElementById('bowl-food').style.display = 'none';
        let val = parseInt(document.getElementById('bowl').dataset.val);
        state.hunger = Math.min(100, state.hunger + val);
        saveState();
        updateUI();
        el.className = 'idle';
        cat.busy = false;
    }, 2000);
}

import { playAudio } from '../core/audio.js';

export function pokeCat() {
    const sounds = ["Meow!", "Purr...", "Mew!", "Mrrr!"];
    const sound = sounds[Math.floor(Math.random() * sounds.length)];
    say(sound + " ❤️");
    
    // Play sound with pitch variation
    if ('speechSynthesis' in window) {
        let u = new SpeechSynthesisUtterance(sound);
        u.lang = 'en-US';
        u.pitch = 1.2 + Math.random() * 0.5; // High pitch for cat
        u.rate = 1.2;
        speechSynthesis.speak(u);
    }

    let w = document.querySelector('.cat-wrapper');
    w.style.transform = `scale(1.2) scaleX(${cat.dir})`;
    setTimeout(() => w.style.transform = `scale(1) scaleX(${cat.dir})`, 200);
}

