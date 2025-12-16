import { cat, catMove } from './pet.js';
import { say } from '../ui/views.js';

export function interact(item) {
    if (item === 'bed') {
        catMove(10, () => {
            document.getElementById('cat-container').classList.add('sleeping');
            say("Zzz... 😴");
            setTimeout(() => {
                document.getElementById('cat-container').classList.remove('sleeping');
            }, 5000);
        });
    } else if (item === 'table') {
        catMove(80, () => {
            say("I am sitting! 😺");
            // Logic for eating at table?
        });
    }
}

