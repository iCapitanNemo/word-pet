import { gameMode, stopGame } from '../modules/minigames.js';
import { renderShop, renderFridge, updateUI } from './render.js';
import { state, saveState } from '../core/state.js';

export function setTab(id) {
    // If leaving adv tab during game - stop game
    if(gameMode && id !== 'adv') stopGame();

    ['quiz','shop','adv'].forEach(t => {
        const el = document.getElementById('tab-'+t);
        if(el) el.style.display = 'none';
    });
    
    const target = document.getElementById('tab-'+id);
    if(target) target.style.display = (id==='shop'?'grid':(id==='quiz'?'flex':'block'));
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const btns = document.querySelectorAll('.tab-btn');
    // Safer index selection based on onclick attribute
    btns.forEach(btn => {
        if(btn.getAttribute('onclick').includes(id)) {
            btn.classList.add('active');
        }
    });
    
    if(id==='shop') renderShop();
}

export function toggleFridge() {
    let p = document.getElementById('fridge-panel');
    let open = p.classList.contains('open');
    open ? p.classList.remove('open') : (renderFridge(), p.classList.add('open'));
}

export function say(txt) {
    let b = document.getElementById('bubble'); 
    b.innerText = txt; 
    b.classList.add('show'); 
    setTimeout(()=>b.classList.remove('show'), 3000);
    
    // Auto-speak if it's a greeting
    if(txt.includes("Good morning")) {
        // Simple TTS for greeting
         if ('speechSynthesis' in window) {
            let u = new SpeechSynthesisUtterance(txt);
            u.lang = 'en-US';
            speechSynthesis.speak(u);
        }
    }
}

export function updateDailyGoal(val) {
    state.dailyGoal = parseInt(val);
    saveState();
}

export function updateStats() {
    const div = document.getElementById('p-stats');
    if(!div) return;
    
    if(!state.mistakes || Object.keys(state.mistakes).length === 0) {
        div.innerText = "Ошибок пока нет!";
        return;
    }
    
    let html = "";
    for(let [word, count] of Object.entries(state.mistakes)) {
        html += `<div><b>${word}</b>: ${count} ошибок</div>`;
    }
    div.innerHTML = html;
}

// Hook into existing function
let pressTimer;

export function initParentalEvents() {
    const trigger = document.querySelector('.stat-box'); 
    if(!trigger) return;

    trigger.addEventListener('mousedown', startPress);
    trigger.addEventListener('touchstart', startPress);
    trigger.addEventListener('mouseup', cancelPress);
    trigger.addEventListener('touchend', cancelPress);
    trigger.addEventListener('mouseleave', cancelPress);
}

function startPress() {
    pressTimer = setTimeout(() => {
        const pin = prompt("Введите PIN для родителей (0000):");
        if(pin === "0000") {
            document.getElementById('parental-panel').classList.add('open');
            if(state.dailyGoal) document.getElementById('p-goal').value = state.dailyGoal;
            updateStats();
        }
    }, 1500); 
}

function cancelPress() {
    clearTimeout(pressTimer);
}

export function closeParental() {
    document.getElementById('parental-panel').classList.remove('open');
}

export function addCustomWord() {
    const en = document.getElementById('p-en').value.trim();
    const ru = document.getElementById('p-ru').value.trim();
    const em = document.getElementById('p-em').value.trim();
    
    if(!en || !ru || !em) return alert("Заполните все поля!");
    
    if(!state.customWords) state.customWords = [];
    state.customWords.push({
        en, ru, em, ctx: "This is a " + en
    });
    saveState();
    
    document.getElementById('p-en').value = '';
    document.getElementById('p-ru').value = '';
    document.getElementById('p-em').value = '';
    
    const msg = document.getElementById('p-msg');
    msg.innerText = "Слово добавлено!";
    setTimeout(() => msg.innerText = "", 2000);
}
