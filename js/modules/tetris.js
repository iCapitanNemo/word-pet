import { getWords } from '../config/dictionary.js';
import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { stopGame } from './minigames.js';

let tetrisLoop;
let blocks = [];
let speed = 1; // % per tick
let spawnRate = 2000;
let lastSpawn = 0;
let gameOver = false;

export function startTetris() {
    const scene = document.getElementById('game-tetris');
    scene.innerHTML = `
        <div id="t-area"></div>
        <div id="t-controls"></div>
        <div id="t-score">Score: 0</div>
    `;

    blocks = [];
    speed = 0.3; // Slower start for kids
    gameOver = false;

    // Initial spawn
    spawnBlock();

    lastSpawn = Date.now();
    requestAnimationFrame(loop);
}

function loop() {
    if (gameOver) return;

    // Spawn
    if (Date.now() - lastSpawn > spawnRate) {
        spawnBlock();
        lastSpawn = Date.now();
    }

    // Move
    blocks.forEach((b, i) => {
        b.y += speed;
        b.el.style.top = b.y + '%';

        if (b.y > 90) {
            endTetris(false);
        }
    });

    tetrisLoop = requestAnimationFrame(loop);
}

function spawnBlock() {
    const words = getWords();
    const word = words[Math.floor(Math.random() * words.length)];

    const area = document.getElementById('t-area');
    const el = document.createElement('div');
    el.className = 't-block';
    el.innerText = word.en;
    el.style.left = (Math.random() * 80) + '%';
    el.style.top = '-10%';
    area.appendChild(el);

    blocks.push({ el, word, y: -10 });

    // Always update options when new block spawns to ensure the lowest one (which might change or be the new one in empty board) is covered
    updateTetrisOptions();
}

function updateTetrisOptions() {
    if (blocks.length === 0) return;

    // Sort blocks by Y descending (highest Y = lowest on screen)
    blocks.sort((a, b) => b.y - a.y);

    // Target is the block closest to bottom
    const target = blocks[0];

    const words = getWords();
    // Start with the correct answer
    let opts = [target.word.ru];

    // Add 3 random wrong answers
    while (opts.length < 4) {
        let r = words[Math.floor(Math.random() * words.length)];
        // Ensure unique options
        if (!opts.includes(r.ru)) opts.push(r.ru);
    }
    // Shuffle
    opts.sort(() => Math.random() - 0.5);

    const c = document.getElementById('t-controls');
    if (!c) return; // Safety check
    c.innerHTML = '';

    opts.forEach(o => {
        let btn = document.createElement('button');
        btn.className = 't-btn';
        btn.innerText = o;
        btn.onclick = () => checkTetrisAns(o);
        c.appendChild(btn);
    });
}

function checkTetrisAns(ans) {
    // We check against the lowest block specifically
    if (blocks.length === 0) return;

    blocks.sort((a, b) => b.y - a.y);
    const targetBlock = blocks[0];

    if (targetBlock.word.ru === ans) {
        // Correct
        targetBlock.el.remove();
        // Remove from array
        blocks.shift(); // Since we sorted, it's the first one

        state.coins += 1;
        state.xp += 2;
        saveState();
        updateUI();

        // Speed up slightly
        speed += 0.01;

        document.getElementById('t-score').innerText = "Score: " + state.coins;

        // Immediately update options for the NEXT lowest block
        updateTetrisOptions();
    } else {
        // Wrong
        document.querySelector('.scene-container').classList.add('shake');
        setTimeout(() => document.querySelector('.scene-container').classList.remove('shake'), 500);
    }
}

function endTetris(win) {
    gameOver = true;
    cancelAnimationFrame(tetrisLoop);
    alert("Game Over! Try again.");
    stopGame();
}
