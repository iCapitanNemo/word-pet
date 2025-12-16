export function playAudio(txt) {
    if ('speechSynthesis' in window) {
        // Ensure voices are loaded
        const voices = speechSynthesis.getVoices();

        let u = new SpeechSynthesisUtterance(txt);
        u.lang = 'en-US';

        // Try to find a good voice
        if (voices.length > 0) {
            // Prefer "Google US English" or similar if available, else first en-US
            const preferred = voices.find(v => v.name.includes("Google") && v.lang.includes("en-US"));
            if (preferred) u.voice = preferred;
        }

        u.onerror = (e) => console.error("Speech Error:", e);

        speechSynthesis.cancel(); // Stop previous
        speechSynthesis.speak(u);
    } else {
        console.warn("Web Speech API not supported");
    }
}
