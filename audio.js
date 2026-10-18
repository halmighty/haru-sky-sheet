let currentInstrument = 'piano';
let audioCtx = null;

const INSTRUMENT_AUDIO_URLS = {
    piano: generateInstrumentUrls('piano'),
    winterpiano: generateInstrumentUrls('winterpiano'),
    kalimba: generateInstrumentUrls('kalimba'),
    ocarina: generateInstrumentUrls('ocarina'),
    guitar: generateInstrumentUrls('guitar'),
    flute: generateInstrumentUrls('flute')
};

function generateInstrumentUrls(instName) {
    let urls = {};
    for (let i = 1; i <= 15; i++) {
        urls[i] = `assets/sounds/${instName}/${i}.mp3`;
    }
    return urls;
}

export function changeInstrument(inst) {
    currentInstrument = inst;
}

const SKY_PITCHES = {
    1: 261.63, 2: 293.66, 3: 329.63, 4: 349.23, 5: 392.00,
    6: 440.00, 7: 493.88, 8: 523.25, 9: 587.33, 10: 659.25,
    11: 698.46, 12: 783.99, 13: 880.00, 14: 987.77, 15: 1046.50
};

export function playSkyNote(noteNum, duration = 0.6, chordSize = 1) {
    if (!noteNum) return;
    const audioUrl = INSTRUMENT_AUDIO_URLS[currentInstrument][noteNum];

    if (audioUrl) {
        const sampleAudio = new Audio(audioUrl);
        sampleAudio.volume = Math.min(1, 0.85 / Math.max(1, chordSize * 0.7));
        sampleAudio.currentTime = 0;
        sampleAudio.play().catch(e => {
            playSynthFallback(noteNum, duration, chordSize);
        });
        return;
    }
}

function playSynthFallback(noteNum, duration, chordSize) {
    const freq = SKY_PITCHES[noteNum];
    if (!freq) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gainNode = audioCtx.createGain();
    const peakGain = 0.3 / Math.max(1, chordSize * 0.75);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
}