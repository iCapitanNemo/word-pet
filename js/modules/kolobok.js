import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { stopGame } from './minigames.js';

let storyStep = 0;

// Story data with English learning tasks
const STORY = [
    {
        text: "Колобок гуляет по лесу. Навстречу Зайка! 🐰\nЗайка спрашивает по-английски: 'Hello! How are you?'",
        icon: "🐰",
        opts: [
            { txt: "I am fine!", next: 1, correct: true },
            { txt: "I am a fox.", next: -1, correct: false }
        ]
    },
    {
        text: "Идет Колобок дальше. Видит Волка. 🐺\nВолк говорит: 'I am hungry! Give me an APPLE!'",
        icon: "🐺",
        opts: [
            { txt: "Вот яблоко 🍎", next: 2, correct: true }, // Logic assumes user knows translation
            { txt: "Вот мяч ⚽", next: -1, correct: false }
        ]
    },
    {
        text: "Встретил Мишку. 🐻\nМишка: 'What color is the SUN?'",
        icon: "🐻",
        opts: [
            { txt: "Yellow", next: 3, correct: true },
            { txt: "Blue", next: -1, correct: false },
            { txt: "Green", next: -1, correct: false }
        ]
    },
    {
        text: "А вот и Лисичка. 🦊\nЛисичка хитрая: 'Count to three!'",
        icon: "🦊",
        opts: [
            { txt: "One, Two, Three", next: 100, correct: true }, // Win
            { txt: "Cat, Dog, Fox", next: -1, correct: false }
        ]
    }
];

export function startKolobok() {
    storyStep = 0;
    renderKolobokScene();
}

function renderKolobokScene() {
    const scene = document.getElementById('game-kolobok');
    const data = STORY[storyStep];

    // Progress Bar Logic
    let progressHTML = `<div style="display:flex; justify-content:center; margin-bottom:20px; font-size:20px;">`;
    STORY.forEach((s, i) => {
        let status = i < storyStep ? "✅" : (i === storyStep ? "📍" : "⚪");
        progressHTML += `<div style="margin:0 5px">${s.icon}<br>${status}</div>`;
    });
    progressHTML += `</div>`;

    // Updated Layout: Scrollable content area + Fixed bottom options
    // Using flex column to ensure fits on screen
    scene.innerHTML = `
        <div style="
            width: 100%; height: 100%; display: flex; flex-direction: column; 
            padding: 20px; box-sizing: border-box; text-align: center; color: white;">
            
            <div style="flex-shrink: 0;">
                ${progressHTML}
                <div style="font-size: 60px; margin-bottom: 10px; animation: bounce 2s infinite;">🍪</div>
            </div>

            <div style="flex: 1; overflow-y: auto; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; padding: 10px; background: rgba(0,0,0,0.2);">
                <div style="font-size: 18px; line-height: 1.5; white-space: pre-wrap;">${data.text}</div>
            </div>

            <div id="k-opts" style="flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; padding-bottom: 20px;"></div>
        </div>
        <style>
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        </style>
    `;

    const optsDiv = document.getElementById('k-opts');
    data.opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = opt.txt;
        btn.onclick = () => checkKolobokAns(opt);
        optsDiv.appendChild(btn);
    });
}

function checkKolobokAns(opt) {
    if (opt.correct) {
        state.xp += 5;
        saveState();
        updateUI();

        if (opt.next === 100) {
            // Win Animation
            const scene = document.getElementById('game-kolobok');
            scene.innerHTML = `
                <div style="text-align:center; color:white; padding-top:100px;">
                    <div style="font-size:80px">🎉🦊🍪🎉</div>
                    <h2>You are smart!</h2>
                    <p>+20 coins</p>
                </div>
            `;
            state.coins += 20;
            saveState();
            updateUI();
            setTimeout(stopGame, 3000);
        } else {
            storyStep = opt.next;
            renderKolobokScene();
        }
    } else {
        alert("Incorrect! Try again.");
    }
}
