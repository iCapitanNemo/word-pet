import { state, saveState } from '../core/state.js';
import { SHOP, TITLES } from '../config/items.js';
import { toggleFridge, say } from './views.js';

export function updateUI() {
    let nextLvlXp = state.lvl * 50;
    if (state.xp >= nextLvlXp) {
        state.lvl++;
        state.xp = 0;
        alert("НОВЫЙ УРОВЕНЬ!");
    }

    document.getElementById('coins').innerText = state.coins;
    document.getElementById('lvl').innerText = state.lvl;
    document.getElementById('lvl-name').innerText = TITLES[Math.min(state.lvl - 1, TITLES.length - 1)];

    // Bars
    document.getElementById('hunger-bar').style.width = state.hunger + '%';
    document.getElementById('hunger-bar').style.background = state.hunger < 30 ? '#EF5350' : '#66BB6A';

    // XP Bar
    let xpPercent = (state.xp / nextLvlXp) * 100;
    document.getElementById('xp-bar').style.width = xpPercent + '%';
}

export function renderShop() {
    let c = document.getElementById('tab-shop'); c.innerHTML = '';
    SHOP.forEach(i => {
        let d = document.createElement('div'); d.className = 'item';
        d.innerHTML = `<div style="font-size:20px">${i.icon}</div><div>${i.name}</div><div style="color:orange">${i.price}💰</div>`;
        d.onclick = (e) => {
            if (state.coins < i.price) return alert("Мало денег!");
            state.coins -= i.price;

            // Floating feedback
            showFloatingText(e.clientX, e.clientY, `-${i.price}💰`);
            setTimeout(() => showFloatingText(e.clientX, e.clientY - 30, `+${i.name}`), 200);

            if (i.type === 'food') state.fridge[i.id] = (state.fridge[i.id] || 0) + 1;
            else if (i.type === 'toy') state.inventory.push(i.id);
            else if (i.type === 'furniture') {
                if (!state.furniture) state.furniture = [];
                if (!state.furniture.includes(i.id)) state.furniture.push(i.id);
            }
            else state.activeHouse = i.color;
            saveState();
            updateUI();
            renderShop();
            applyDecor();
        };
        c.appendChild(d);
    });
}

function showFloatingText(x, y, txt) {
    const el = document.createElement('div');
    el.innerText = txt;
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = '#FF9800';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '20px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '1000';
    el.style.transition = 'all 1s ease-out';

    document.body.appendChild(el);

    requestAnimationFrame(() => {
        el.style.top = (y - 100) + 'px';
        el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 1000);
}

export function renderFridge() {
    let c = document.getElementById('fridge-content'); c.innerHTML = '';
    for (let k in state.fridge) {
        if (state.fridge[k] > 0) {
            let i = SHOP.find(x => x.id === k);
            let d = document.createElement('div'); d.className = 'item';
            d.innerHTML = `<div style="font-size:20px">${i.icon}</div><div>x${state.fridge[k]}</div>`;
            d.onclick = () => {
                document.getElementById('bowl-food').innerText = i.icon;
                document.getElementById('bowl-food').style.display = 'block';
                document.getElementById('bowl').dataset.val = i.val;
                state.fridge[k]--;
                toggleFridge();
            };
            c.appendChild(d);
        }
    }
}

export function applyDecor() {
    if (state.activeHouse) {
        let bg = state.activeHouse;
        // Fix for gradient patterns (simple CSS hack for dots)
        if (bg.includes('radial')) {
            document.querySelector('.scene-container').style.background = '#fff';
            document.querySelector('.scene-container').style.backgroundImage = bg;
            document.querySelector('.scene-container').style.backgroundSize = '20px 20px';
            document.querySelector('.scene-container').style.backgroundPosition = '0 0, 10px 10px';
        } else {
            document.querySelector('.scene-container').style.background = bg;
        }
    }
    let l = document.getElementById('toys-layer'); l.innerHTML = '';
    if (state.inventory.includes('t_yarn')) l.innerHTML += '<div class="toy-obj" style="right:20%">🧶</div>';

    // Furniture
    if (state.furniture) {
        if (state.furniture.includes('fur_bed')) document.getElementById('bed').style.display = 'block';
        if (state.furniture.includes('fur_table')) document.getElementById('table').style.display = 'block';
    }
}
