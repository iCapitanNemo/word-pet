export const state = {
    coins: 30, lvl: 1, xp: 0, hunger: 80,
    fridge: { 'f_apple': 1 }, inventory: [],
    activeHouse: null,
    customWords: []
};

export function loadState() {
    const saved = localStorage.getItem('wp9_save');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
    }
}

export function saveState() {
    localStorage.setItem('wp9_save', JSON.stringify(state));
}

