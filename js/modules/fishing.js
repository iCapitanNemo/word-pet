import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { stopGame } from './minigames.js';

let fishTarget = "FISH";
let fishCollected = "";
let fishLoop;
let fishes = [];

export function startFishing() {
    const scene = document.getElementById('game-fish');
    const words = ["FISH", "SWIM", "BLUE", "WATER", "BOAT"];
    fishTarget = words[Math.floor(Math.random() * words.length)];
    fishCollected = "";
    fishes = [];

    scene.innerHTML = `
        <div id="f-target-word">${getWordHTML()}</div>
        <div class="fishing-cat-zone">
            <div style="font-size:60px; z-index:10">🎣🐱</div>
            <div class="fish-hook" id="f-hook"></div>
        </div>
        <div class="fishing-water" id="f-water"></div>
    `;

    // Spawn initial fish
    for (let i = 0; i < 5; i++) spawnFish();

    fishLoop = requestAnimationFrame(loop);
}

function getWordHTML() {
    let html = "";
    for (let i = 0; i < fishTarget.length; i++) {
        if (i < fishCollected.length) html += `<span style="color:#81C784">${fishTarget[i]}</span>`;
        else html += `<span style="color:#fff; opacity:0.5">${fishTarget[i]}</span>`;
    }
    return html;
}

function spawnFish() {
    const water = document.getElementById('f-water');
    if (!water) return;

    const f = document.createElement('div');
    f.className = 'f-letter';

    // Calculate needed char
    const neededChar = fishTarget[fishCollected.length];

    // Check if needed char is already swimming
    const neededExists = fishes.some(fish => fish.char === neededChar);

    let char;
    if (!neededExists) {
        // Force spawn needed char
        char = neededChar;
    } else {
        // Random
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        char = Math.random() > 0.6 ? neededChar : alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    f.innerText = char;
    // Add fish shape using text-shadow or background image?
    // Let's use a fish emoji as background content, and letter on top
    // Or just simple CSS shape.
    // User requested "letters on fish shapes".
    // Let's modify CSS for .f-letter to look like a fish using emoji logic or CSS.
    // CSS only approach:
    f.innerHTML = `<span style="z-index:2; position:relative">${char}</span><div style="position:absolute; font-size:40px; top:-5px; left:-5px; opacity:0.7">🐟</div>`;
    f.style.background = 'transparent';
    f.style.border = 'none';

    // Random position and speed
    let x = Math.random() * 90;
    let y = 10 + Math.random() * 80;
    let speed = 0.2 + Math.random() * 0.5;
    let dir = Math.random() > 0.5 ? 1 : -1;

    f.style.left = x + '%';
    f.style.top = y + '%';
    f.style.transform = `scaleX(${dir})`; // Face direction

    // We need to handle click on the wrapper
    f.onclick = () => tryCatch(f, char);

    water.appendChild(f);
    fishes.push({ el: f, x, y, speed, dir, char });
}

function loop() {
    if (!document.getElementById('game-fish').classList.contains('active')) return;

    fishes.forEach(f => {
        f.x += f.speed * f.dir;
        if (f.x > 95 || f.x < 0) {
            f.dir *= -1;
            f.el.style.transform = `scaleX(${f.dir})`;
        }
        f.el.style.left = f.x + '%';
    });

    if (Math.random() > 0.98 && fishes.length < 8) spawnFish();

    fishLoop = requestAnimationFrame(loop);
}

function tryCatch(fishEl, char) {
    // Animate hook
    const hook = document.getElementById('f-hook');
    hook.style.height = '150px'; // Dip into water

    setTimeout(() => {
        hook.style.height = '50px'; // Retract

        // Check logic
        const needed = fishTarget[fishCollected.length];
        if (char === needed) {
            fishCollected += char;
            document.getElementById('f-target-word').innerHTML = getWordHTML();

            // Remove fish
            fishEl.remove();
            fishes = fishes.filter(f => f.el !== fishEl);

            if (fishCollected === fishTarget) {
                setTimeout(() => {
                    alert(`You caught ${fishTarget}! +15 coins`);
                    state.coins += 15;
                    saveState();
                    updateUI();
                    stopGame();
                }, 500);
            }
        } else {
            // Wrong fish
            fishEl.querySelector('div').style.filter = 'hue-rotate(90deg)'; // Change fish color
            setTimeout(() => fishEl.querySelector('div').style.filter = 'none', 500);
        }
    }, 500);
}
