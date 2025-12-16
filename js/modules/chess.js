import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { stopGame } from './minigames.js';

let grid = [];
let gridSize = 3;
let currentPos = { x: 0, y: 0 };
let targetWord = "CAT";
let collected = "";
let steps = 0;

export function startChess() {
    const scene = document.getElementById('game-chess');
    const words = ["CAT", "DOG", "SUN", "BUS", "FOX", "BAT", "ANT"];
    targetWord = words[Math.floor(Math.random() * words.length)];
    collected = "";
    steps = 0;

    // Ensure we can actually build the word
    if (!generateGrid()) {
        // Fallback or retry if generation fails
        startChess();
        return;
    }
    renderChess();
}

function generateGrid() {
    grid = [];
    // Initialize empty grid
    for (let y = 0; y < gridSize; y++) {
        let row = [];
        for (let x = 0; x < gridSize; x++) row.push('');
        grid.push(row);
    }

    // Smart Generation Algorithm:
    // 1. Pick random start position
    // 2. Perform a "random walk" using Knight moves
    // 3. Place letters of the word along this path

    let path = [];
    let startX = Math.floor(Math.random() * gridSize);
    let startY = Math.floor(Math.random() * gridSize);
    let current = { x: startX, y: startY };

    // First letter is placed at start
    path.push(current);
    grid[startY][startX] = targetWord[0];

    // Try to place remaining letters
    for (let i = 1; i < targetWord.length; i++) {
        let validMoves = getKnightMoves(current.x, current.y, gridSize);
        // Filter out visited cells to avoid overwriting (simple version)
        validMoves = validMoves.filter(m => grid[m.y][m.x] === '');

        if (validMoves.length === 0) return false; // Dead end

        // Pick random valid move
        let next = validMoves[Math.floor(Math.random() * validMoves.length)];
        grid[next.y][next.x] = targetWord[i];
        path.push(next);
        current = next;
    }

    // Store current player pos at start of word
    currentPos = { x: startX, y: startY };
    // Initial collected is just the first letter? 
    // Usually game starts *on* the first letter, so user needs to find 2nd.
    collected = targetWord[0];

    // Fill empty cells with random distractors
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (grid[y][x] === '') {
                // Avoid placing the NEXT correct letter as a distractor to prevent confusion?
                // Or allow it. Let's just pick random.
                grid[y][x] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
    return true;
}

function getKnightMoves(x, y, size) {
    const moves = [
        { x: x + 1, y: y + 2 }, { x: x + 1, y: y - 2 },
        { x: x - 1, y: y + 2 }, { x: x - 1, y: y - 2 },
        { x: x + 2, y: y + 1 }, { x: x + 2, y: y - 1 },
        { x: x - 2, y: y + 1 }, { x: x - 2, y: y - 1 }
    ];
    return moves.filter(m => m.x >= 0 && m.x < size && m.y >= 0 && m.y < size);
}

function renderChess() {
    const scene = document.getElementById('game-chess');
    scene.innerHTML = `
        <div style="color:white; margin-top:20px; text-align:center">
            <h3>Knight's Quest</h3>
            <div>Find: <b style="color:#FFEB3B; font-size: 24px;">${targetWord}</b></div>
            <div>Collected: <span style="color:#66BB6A; font-weight:bold">${collected}</span>${"_".repeat(targetWord.length - collected.length)}</div>
            <div style="font-size:12px; margin-top:5px; color:#ddd">Tap valid 'L' move to jump!</div>
        </div>
        <div id="c-grid" style="display: grid; grid-template-columns: repeat(${gridSize}, 1fr); gap: 5px; width: 250px; margin: 20px auto;"></div>
    `;

    const gridDiv = document.getElementById('c-grid');
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            const isPlayer = (x === currentPos.x && y === currentPos.y);
            const letter = grid[y][x];

            // Check move validity
            const dx = Math.abs(x - currentPos.x);
            const dy = Math.abs(y - currentPos.y);
            const isValidMove = (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

            cell.style.cssText = `
                height: 70px; display: flex; align-items: center; justify-content: center;
                background: ${isPlayer ? '#FF9800' : (isValidMove ? '#FFF59D' : '#CFD8DC')};
                border-radius: 8px; font-weight: bold; font-size: 24px; color: #333;
                cursor: ${isValidMove ? 'pointer' : 'default'}; 
                transition: 0.2s;
                border: ${isPlayer ? '4px solid #E65100' : 'none'};
                opacity: ${isValidMove || isPlayer ? 1 : 0.6};
            `;
            cell.innerText = letter;

            if (isValidMove) {
                cell.onclick = () => moveChess(x, y, letter);
            }

            gridDiv.appendChild(cell);
        }
    }
}

function moveChess(x, y, letter) {
    // Check if next letter in sequence
    const nextCharNeeded = targetWord[collected.length];

    if (letter === nextCharNeeded) {
        // Valid move
        currentPos = { x, y };
        collected += letter;
        if (collected === targetWord) {
            // Win
            renderChess(); // Update UI one last time to show full word
            setTimeout(() => {
                alert(`Great! Found ${targetWord}! +10 coins`);
                state.coins += 10;
                saveState();
                updateUI();
                stopGame();
            }, 100);
        } else {
            renderChess();
        }
    } else {
        // Wrong letter - don't move, just shake/alert
        const scene = document.querySelector('.scene-container');
        scene.classList.add('shake');
        setTimeout(() => scene.classList.remove('shake'), 500);
    }
}
