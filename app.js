// app.js - Logique principale
let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
let selectedQuality = '';
let selectedExtension = '';
let randomNoteCount = 4;
let isListening = false;
let currentMode = 'manual';
let audioContext = null;
let mediaStream = null;
let analyser = null;
let lastSelectedChordName = ''; // Mémoriser l'accord sélectionné

// Conversion notes vers français
const NOTE_FR_SHARP = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 'G': 'Sol', 'G#': 'Sol#',
  'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 'B': 'Si'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  initializeUI();
  updateChordCount();
});

// Fréquences des notes (A4 = 440Hz)
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

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playNoteSound(note, duration = 1.0, startTime = 0) {
  const ctx = getAudioContext();
  
  const noteName = note.replace(/[0-9]/g, '');
  const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
  
  const frequency = NOTE_FREQUENCIES[noteName]?.[octave];
  if (!frequency) {
    console.log('Fréquence non trouvée pour', note, noteName, octave);
    return;
  }
  
  // Son de piano plus réaliste avec harmoniques
  const fundamental = ctx.createOscillator();
  const harmonic2 = ctx.createOscillator();
  const harmonic3 = ctx.createOscillator();
  const harmonic4 = ctx.createOscillator();
  
  const gainNode = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();
  const gain4 = ctx.createGain();
  
  fundamental.type = 'sine';
  harmonic2.type = 'sine';
  harmonic3.type = 'sine';
  harmonic4.type = 'triangle';
  
  fundamental.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
  harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime + startTime);
  harmonic3.frequency.setValueAtTime(frequency * 3, ctx.currentTime + startTime);
  harmonic4.frequency.setValueAtTime(frequency * 4, ctx.currentTime + startTime);
  
  // Enveloppe ADSR pour piano
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
  
  gain2.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.8);
  
  gain3.gain.setValueAtTime(0.05, ctx.currentTime + startTime);
  gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.6);
  
  gain4.gain.setValueAtTime(0.02, ctx.currentTime + startTime);
  gain4.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.4);
  
  fundamental.connect(gainNode);
  harmonic2.connect(gain2);
  harmonic3.connect(gain3);
  harmonic4.connect(gain4);
  
  gainNode.connect(ctx.destination);
  gain2.connect(ctx.destination);
  gain3.connect(ctx.destination);
  gain4.connect(ctx.destination);
  
  fundamental.start(ctx.currentTime + startTime);
  harmonic2.start(ctx.currentTime + startTime);
  harmonic3.start(ctx.currentTime + startTime);
  harmonic4.start(ctx.currentTime + startTime);
  
  fundamental.stop(ctx.currentTime + startTime + duration);
  harmonic2.stop(ctx.currentTime + startTime + duration);
  harmonic3.stop(ctx.currentTime + startTime + duration);
  harmonic4.stop(ctx.currentTime + startTime + duration);
}

window.playChord = function() {
  if (playedNotes.length === 0) return;
  
  getAudioContext();
  
  // Arpège de notes séparées d'abord
  playedNotes.forEach((note, index) => {
    playNoteSound(note, 0.6, index * 0.15);
  });
  
  // Puis jouer l'accord complet
  playedNotes.forEach((note, index) => {
    playNoteSound(note, 2.5, playedNotes.length * 0.15 + 0.2 + index * 0.05);
  });
};

function initializeUI() {
  // Notes naturelles dans l'ordre A-B-C-D-E-F-G
  const rootNotesDiv = document.getElementById('rootNotes');
  const orderedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  orderedNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = note;
    btn.onclick = () => selectRootNote(note);
    rootNotesDiv.appendChild(btn);
  });

  // Altérations - Mini clavier
  const alterationsDiv = document.getElementById('alterations');
  ALTERATIONS.forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = alt;
    btn.dataset.value = alt;
    btn.onclick = () => selectAlteration(alt);
    alterationsDiv.appendChild(btn);
  });

  // Qualités - Mini clavier
  const qualitiesDiv = document.getElementById('qualities');
  CHORD_QUALITIES.forEach(quality => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = quality.label;
    btn.dataset.value = quality.value;
    btn.onclick = () => selectQuality(quality.label, quality.value);
    qualitiesDiv.appendChild(btn);
  });

  // Extensions - Mini clavier
  const extensionsDiv = document.getElementById('extensions');
  EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectExtension(ext);
    extensionsDiv.appendChild(btn);
  });

  // Boutons de contrôle
  document.getElementById('modeManual').onclick = () => switchMode('manual');
  document.getElementById('modeRandom').onclick = () => switchMode('random');
  document.getElementById('generateRandom').onclick = generateRandomChord;
  document.getElementById('resetNotes').onclick = resetNotes;
  document.getElementById('micToggle').onclick = toggleMicrophone;

  // Nombre de notes aléatoires
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.onclick = () => selectNoteCount(parseInt(btn.dataset.count));
  });
}

function updateChordCount() {
  document.getElementById('chordCount').textContent = 
    `${Object.keys(ALL_CHORDS).length} accords disponibles`;
}

function switchMode(mode) {
  currentMode = mode;
  document.getElementById('modeManual').classList.toggle('active', mode === 'manual');
  document.getElementById('modeRandom').classList.toggle('active', mode === 'random');
  document.getElementById('manualMode').style.display = mode === 'manual' ? 'flex' : 'none';
  document.getElementById('randomMode').style.display = mode === 'random' ? 'flex' : 'none';
  
  resetNotes();
  resetManualSelection();
}

function selectRootNote(note) {
  if (selectedRootNote === note) {
    selectedRootNote = '';
  } else {
    selectedRootNote = note;
  }
  
  document.querySelectorAll('#rootNotes .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedRootNote);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectAlteration(alt) {
  if (selectedAlteration === alt) {
    selectedAlteration = '';
  } else {
    selectedAlteration = alt;
  }
  
  document.querySelectorAll('#alterations .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === selectedAlteration);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectQuality(label, value) {
  if (selectedQuality === value) {
    selectedQuality = '';
  } else {
    selectedQuality = value;
  }

  document.querySelectorAll('#qualities .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === selectedQuality);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectExtension(ext) {
  // Une seule extension à la fois
  if (selectedExtension === ext) {
    selectedExtension = '';
  } else {
    selectedExtension = ext;
  }
  
  document.querySelectorAll('#extensions .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedExtension);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function resetManualSelection() {
  selectedRootNote = '';
  selectedAlteration = '';
  selectedQuality = '';
  selectedExtension = '';
  lastSelectedChordName = '';
  
  document.querySelectorAll('.mini-key').forEach(btn => {
    btn.classList.remove('active', 'error');
  });
}

function buildManualChordLive() {
  if (!selectedRootNote) {
    playedNotes = [];
    updateDisplay();
    return;
  }
  
  const fullRoot = selectedRootNote + selectedAlteration;
  const chordName = fullRoot + selectedQuality + selectedExtension;
  const chord = ALL_CHORDS[chordName];
  
  if (chord) {
    // Mémoriser le nom de l'accord sélectionné
    lastSelectedChordName = chordName;
    
    // Commencer à l'octave 4
    playedNotes = chord.notesWithOctave.map(n => n.note + (4 + n.octave));
    document.querySelectorAll('#rootNotes .mini-key.active').forEach(btn => {
      btn.classList.remove('error');
    });
    document.querySelectorAll('#alterations .mini-key.active').forEach(btn => {
      btn.classList.remove('error');
    });
    document.querySelectorAll('#qualities .mini-key.active').forEach(btn => {
      btn.classList.remove('error');
    });
    document.querySelectorAll('#extensions .mini-key.active').forEach(btn => {
      btn.classList.remove('error');
    });
    updateDisplay(true, chordName);
  } else {
    playedNotes = [];
    lastSelectedChordName = '';
    if (selectedRootNote) {
      document.querySelectorAll('#rootNotes .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedAlteration !== '') {
      document.querySelectorAll('#alterations .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedQuality !== '') {
      document.querySelectorAll('#qualities .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedExtension !== '') {
      document.querySelectorAll('#extensions .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    updateDisplay(false);
  }
}

function selectNoteCount(count) {
  randomNoteCount = count;
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.count) === count);
  });
}

function generateRandomChord() {
  resetNotes();
  
  // Filtrer les accords par nombre de notes
  const availableChords = Object.entries(ALL_CHORDS).filter(([name, chord]) => {
    return chord.notes.length === randomNoteCount;
  });
  
  if (availableChords.length === 0) {
    // Si pas d'accord avec ce nombre exact, prendre n'importe quel accord
    const allChordNames = Object.keys(ALL_CHORDS);
    const randomChordName = allChordNames[Math.floor(Math.random() * allChordNames.length)];
    const chord = ALL_CHORDS[randomChordName];
    playedNotes = chord.notesWithOctave.map(n => n.note + (4 + n.octave));
    lastSelectedChordName = randomChordName;
  } else {
    // Choisir un accord aléatoire avec le bon nombre de notes
    const randomIndex = Math.floor(Math.random() * availableChords.length);
    const [chordName, chord] = availableChords[randomIndex];
    playedNotes = chord.notesWithOctave.map(n => n.note + (4 + n.octave));
    lastSelectedChordName = chordName;
  }
  
  updateDisplay();
}

window.playNote = function(note) {
  // Toggle : si la note est déjà jouée, on l'enlève
  const index = playedNotes.indexOf(note);
  if (index > -1) {
    playedNotes.splice(index, 1);
  } else {
    playedNotes.push(note);
    playNoteSound(note, 1.0);
  }
  updateDisplay();
};

function resetNotes() {
  playedNotes = [];
  resetManualSelection();
  updateDisplay();
}

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  if (playedNotes.length === 0) {
    playedNotesDiv.innerHTML = '<div class="empty-state">Aucune note jouée</div>';
  } else {
    playedNotesDiv.innerHTML = playedNotes
      .map(note => {
        const noteName = note.replace(/[0-9]/g, '');
        let noteFr = NOTE_FR_SHARP[noteName] || noteName;
        
        // Si on est en mode manuel avec un accord bémol, afficher les notes en bémol
        if (currentMode === 'manual' && lastSelectedChordName && lastSelectedChordName.includes('b')) {
          const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
          const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
          const idx = sharpNotes.indexOf(noteName);
          if (idx !== -1) {
            noteFr = NOTE_FR_SHARP[flatNotes[idx]] || noteFr;
          }
        }
        
        return `<div class="note-badge">${noteFr}</div>`;
      })
      .join('');
  }

  updateKeyboardHighlight(playedNotes);

  // Si on vient du mode manuel, utiliser l'accord mémorisé
  let chord = null;
  if (currentMode === 'manual' && lastSelectedChordName) {
    chord = ALL_CHORDS[lastSelectedChordName];
  } else {
    chord = detectChord(playedNotes);
  }
  displayDetectedChord(chord, chordExists);
}

async function toggleMicrophone() {
  if (isListening) {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    isListening = false;
    const btn = document.getElementById('micToggle');
    const text = document.getElementById('micText');
    btn.classList.remove('active');
    text.textContent = 'Activer le micro';
  } else {
    try {
      const ctx = getAudioContext();
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      
      const source = ctx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      
      isListening = true;
      const btn = document.getElementById('micToggle');
      const text = document.getElementById('micText');
      btn.classList.add('active');
      text.textContent = 'Arrêter le micro';
      
      detectPitchFromMic();
    } catch (err) {
      console.error('Erreur d\'accès au microphone:', err);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
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
    
    const detectedFreq = autoCorrelate(buffer, audioContext.sampleRate);
    
    if (detectedFreq > 0) {
      const note = frequencyToNote(detectedFreq);
      if (note && !playedNotes.includes(note)) {
        playedNotes.push(note);
        updateDisplay();
      }
    }
    
    requestAnimationFrame(analyze);
  }
  
  analyze();
}

function autoCorrelate(buffer, sampleRate) {
  let size = buffer.length;
  let maxSamples = Math.floor(size / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;
  
  for (let i = 0; i < size; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / size);
  
  if (rms < 0.01) return -1;
  
  let lastCorrelation = 1;
  for (let offset = 0; offset < maxSamples; offset++) {
    let correlation = 0;
    
    for (let i = 0; i < maxSamples; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    
    correlation = 1 - (correlation / maxSamples);
    
    if (correlation > 0.9 && correlation > lastCorrelation) {
      let foundGoodCorrelation = false;
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
        foundGoodCorrelation = true;
      }
      
      if (foundGoodCorrelation) {
        let shift = (buffer[0] < 0 ? -1 : 1);
        return sampleRate / (bestOffset + shift);
      }
    }
    
    lastCorrelation = correlation;
  }
  
  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  
  return -1;
}

function frequencyToNote(frequency) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  
  if (frequency < 50 || frequency > 2000) return null;
  
  const halfSteps = 12 * Math.log2(frequency / C0);
  const octave = Math.floor(halfSteps / 12);
  const noteIndex = Math.round(halfSteps % 12);
  
  if (octave < 2 || octave > 6) return null;
  
  return noteNames[noteIndex] + octave;
}