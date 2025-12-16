import { state } from '../core/state.js';

const DEFAULT_WORDS = [
    { en: "Cat", ru: "Кошка", em: "🐱", ctx: "My ___ likes milk" },
    { en: "Dog", ru: "Собака", em: "🐶", ctx: "The ___ says woof" },
    { en: "Apple", ru: "Яблоко", em: "🍎", ctx: "Red sweet ___" },
    { en: "Ball", ru: "Мяч", em: "⚽", ctx: "Kick the ___" },
    { en: "Sun", ru: "Солнце", em: "☀️", ctx: "The ___ is hot" },
    { en: "Fish", ru: "Рыба", em: "🐟", ctx: "___ swims in water" },
    { en: "Milk", ru: "Молоко", em: "🥛", ctx: "Drink warm ___" },
    { en: "Book", ru: "Книга", em: "📚", ctx: "Read a ___" },
    { en: "Tree", ru: "Дерево", em: "🌳", ctx: "Green big ___" },
    { en: "Car", ru: "Машина", em: "🚗", ctx: "Drive a ___" }
];

export function getWords() {
    return [...DEFAULT_WORDS, ...(state.customWords || [])];
}
