// audio-manager.js - Gestion audio (son et microphone)

const NOTE_FREQUENCIES = {
  'C': [16.35, 32.70, 65.41, 130.81, 261.63, 523.25, 1046.50, 2093.00],
  'C#': [17.32, 34.65, 69.30, 138.59, 277.18, 554.37, 1108.73, 2217.46],
  'D': [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32],
  'D#': [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02],
  'E': [20.60, 41.20, 82.41, 164.81, 329.63, 659.25, 1318.51, 2637.02],
  'F': [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
  'F#': [23.12, 46.25, 92.50, 185.00, 369.99, 739.99, 1479.98, 2959.96],
  'G': [24.50, 49.00, 98.00, 196.00, 392.00, 783.99, 1567.98, 3135.96],
  'G#': [25.96, 51.91, 103.83, 207.65, 415.30, 830.61, 1661.22, 3322.44],
  'A': [27.50, 55.00, 110.00, 220.00, 440.00, 880.00, 1760.00, 3520.00],
  'A#': [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
  'B': [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07]
};

let audioContext = null;
let mediaStream = null;
let analyser = null;
let isListening = false;
let lastDetectedNote = null;
let lastDetectionTime = 0;

// Piano échantillonné avec Tone.js
let piano = null;
let pianoLoaded = false;

function initializePiano() {
  if (piano) return Promise.resolve();
  
  // OPTION 1 : Salamander Grand Piano (actuel) - Bonne qualité, chargement rapide
  // OPTION 2 : Pour utiliser un Steinway de meilleure qualité, décommenter ci-dessous
  
  // Créer le sampler avec plus d'échantillons pour une meilleure qualité
  piano = new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3"
    },
    release: 1.5,
    attack: 0.001,
    curve: "exponential",
    baseUrl: "https://tonejs.github.io/audio/salamander/"
  }).toDestination();
  
  // Ajouter un léger reverb pour plus de profondeur et de réalisme
  const reverb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.15,
    preDelay: 0.01
  }).toDestination();
  
  piano.connect(reverb);
  
  return Tone.loaded().then(() => {
    pianoLoaded = true;
    console.log('Piano haute qualité chargé avec reverb');
  });
}


function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // iOS nécessite une interaction utilisateur pour débloquer l'audio
    if (audioContext.state === 'suspended') {
      const resume = () => {
        audioContext.resume();
        document.removeEventListener('touchstart', resume);
        document.removeEventListener('touchend', resume);
        document.removeEventListener('click', resume);
      };
      document.addEventListener('touchstart', resume, { once: true });
      document.addEventListener('touchend', resume, { once: true });
      document.addEventListener('click', resume, { once: true });
    }
  }
  return audioContext;
}

function playNoteSound(note, duration = 1.0, startTime = 0, transpose = 0) {
  // Transposer la note si demandé
  let finalNote = note;
  if (transpose !== 0) {
    const noteWithoutOctave = note.replace(/\d+$/, '');
    const octave = parseInt(note.match(/\d+$/)?.[0] || '4');
    finalNote = noteWithoutOctave + (octave + transpose);
  }
  
  // Initialiser le piano si ce n'est pas déjà fait (pour les clics sur le clavier)
  if (!piano) {
    initializePiano().then(() => {
      if (Tone.context.state !== 'running') {
        Tone.start().then(() => {
          playNoteSound(note, duration, startTime, transpose);
        });
      } else {
        playNoteSound(note, duration, startTime, transpose);
      }
    });
    return;
  }
  
  // Démarrer Tone.js au premier clic si nécessaire
  if (Tone.context.state !== 'running') {
    Tone.start().then(() => {
      const now = Tone.now();
      piano.triggerAttackRelease(finalNote, duration, now + startTime);
    });
  } else {
    // Jouer la note avec le piano échantillonné
    const now = Tone.now();
    piano.triggerAttackRelease(finalNote, duration, now + startTime);
  }
}

async function toggleMicrophone() {
  if (isListening) {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    isListening = false;
    lastDetectedNote = null;
    const btn = document.getElementById('micToggle');
    btn.classList.remove('active');
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" x2="12" y1="19" y2="22"></line>
    </svg>`;
  } else {
    try {
      const ctx = getAudioContext();
      
      mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }
      });
      
      analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.3;
      
      const source = ctx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      
      isListening = true;
      const btn = document.getElementById('micToggle');
      btn.classList.add('active');
      btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M16 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M23 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="16" x2="16" y1="19" y2="22"></line>
      <path d="M24 7c1.5 1.5 2 3.5 2 5s-0.5 3.5-2 5" stroke-width="4" opacity="0.9"></path>
      <path d="M7 7c-1.5 1.5-2 3.5-2 5s0.5 3.5 2 5" stroke-width="4" opacity="0.9"></path>
      <path d="M28 4c2 2 3 5 3 8s-1 6-3 8" stroke-width="3.5" opacity="0.7"></path>
      <path d="M3 4c-2 2-3 5-3 8s1 6 3 8" stroke-width="3.5" opacity="0.7"></path>
    </svg>`;
      
      detectPitchFromMic();
    } catch (err) {
      console.error('Erreur microphone:', err);
      alert('Impossible d\'accéder au microphone. Erreur : ' + err.message);
    }
  }
}

function detectPitchFromMic() {
  if (!isListening || !analyser) return;
  
  const bufferLength = analyser.fftSize;
  const buffer = new Float32Array(bufferLength);
  
  function analyze() {
    if (!isListening) return;
    
    analyser.getFloatTimeDomainData(buffer);
    
    const rms = getRMS(buffer);
    if (rms < 0.003) {
      requestAnimationFrame(analyze);
      return;
    }
    
    const detectedFreq = simpleAutoCorrelate(buffer, audioContext.sampleRate);
    
    if (detectedFreq > 0) {
      const note = frequencyToNote(detectedFreq);
      const now = Date.now();
      
      if (note && (now - lastDetectionTime) > 400) {
        if (note !== lastDetectedNote) {
          if (!playedNotes.includes(note)) {
            playedNotes.push(note);
            updateDisplay();
          }
          lastDetectedNote = note;
        }
        lastDetectionTime = now;
      }
    }
    
    requestAnimationFrame(analyze);
  }
  
  analyze();
}

function getRMS(buffer) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

function simpleAutoCorrelate(buffer, sampleRate) {
  const size = buffer.length;
  const halfSize = Math.floor(size / 2);
  
  let rms = 0;
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);
  if (rms < 0.003) return -1;
  
  const yinBuffer = new Float32Array(halfSize);
  
  yinBuffer[0] = 1;
  let runningSum = 0;
  
  for (let tau = 1; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    yinBuffer[tau] = sum;
  }
  
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += yinBuffer[tau];
    yinBuffer[tau] *= tau / runningSum;
  }
  
  const threshold = 0.15;
  let tau = 2;
  
  const minTau = Math.floor(sampleRate / 1000);
  const maxTau = Math.floor(sampleRate / 80);
  
  while (tau < maxTau && tau < halfSize) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfSize && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++;
      }
      
      let betterTau = tau;
      if (tau > 0 && tau < halfSize - 1) {
        const s0 = yinBuffer[tau - 1];
        const s1 = yinBuffer[tau];
        const s2 = yinBuffer[tau + 1];
        betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
      }
      
      return sampleRate / betterTau;
    }
    tau++;
  }
  
  return -1;
}

function frequencyToNote(frequency) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  
  if (frequency < 60 || frequency > 2000) return null;
  
  const halfSteps = 12 * Math.log2(frequency / C0);
  const octave = Math.floor(halfSteps / 12);
  let noteIndex = Math.round(halfSteps % 12);
  
  const theoreticalFreq = C0 * Math.pow(2, (octave * 12 + noteIndex) / 12);
  const cents = 1200 * Math.log2(frequency / theoreticalFreq);
  
  if (Math.abs(cents) > 45) return null;
  
  if (octave < 2 || octave > 6) return null;
  
  return noteNames[noteIndex] + octave;
}