import { getWords } from '../config/dictionary.js';
import { state, saveState } from '../core/state.js';
import { updateUI } from '../ui/render.js';
import { playAudio } from '../core/audio.js';
import { say } from '../ui/views.js';
import { gameMode, gameData, updateDogScene, catchFishAnim } from './minigames.js';

export let currentQ = null;

export function nextQ() {
    const words = getWords();
    currentQ = words[Math.floor(Math.random() * words.length)];
    let mode = Math.floor(Math.random() * 3);
    let qCtx = document.getElementById('q-ctx'), 
        qTxt = document.getElementById('q-text'), 
        qEmo = document.getElementById('q-emoji'), 
        audioBtn = document.getElementById('audio-btn');
    
    qCtx.innerText = ""; qTxt.innerText = ""; qEmo.innerText = ""; audioBtn.style.display = 'none';

    if(mode === 0) { qEmo.innerText = currentQ.em; qTxt.innerText = currentQ.en; }
    else if (mode === 1) { qEmo.innerText = "🎧"; audioBtn.style.display = 'block'; setTimeout(() => playAudio(currentQ.en), 300); }
    else { qCtx.innerText = currentQ.ctx.replace("___", "___"); qTxt.innerText = "???"; }

    let opts = [currentQ.ru];
    if(mode === 2) opts = [currentQ.en];
    
    while(opts.length < 4) {
        let r = words[Math.floor(Math.random()*words.length)];
        let val = (mode === 2) ? r.en : r.ru;
        if(!opts.includes(val)) opts.push(val);
    }
    opts.sort(() => Math.random() - 0.5);

    let cont = document.getElementById('q-opts'); cont.innerHTML = '';
    opts.forEach(o => {
        let b = document.createElement('button'); b.className = 'opt-btn'; b.innerText = o;
        let isCorrect = (mode === 2) ? (o === currentQ.en) : (o === currentQ.ru);
        b.onclick = () => checkAns(isCorrect, b);
        cont.appendChild(b);
    });
}

export function checkAns(isCorrect, btn) {
    if(isCorrect) {
        btn.classList.add('correct'); 
        state.coins += 2; 
        state.xp += 10; 
        saveState(); 
        updateUI();
        
        if(gameMode === 'dog') { 
            gameData.catPos += 15; 
            updateDogScene(); 
        } else if (gameMode === 'fish') { 
            catchFishAnim(); 
            if(Math.random() > 0.5) { 
                state.fridge['f_fish'] = (state.fridge['f_fish']||0)+1; 
                say("Поймал рыбу!"); 
            }
        }
        setTimeout(nextQ, 1000);
    } else {
        btn.classList.add('wrong'); 
        say("Oh no...");
        
        // Track mistakes
        if(!state.mistakes) state.mistakes = {};
        state.mistakes[currentQ.en] = (state.mistakes[currentQ.en] || 0) + 1;
        saveState();

        if(gameMode === 'dog') { 
            gameData.dogPos += 15; 
            updateDogScene(); 
        } else if (gameMode === 'fish') { 
            alert("Рыбка сорвалась! 💦"); 
        }
    }
}
