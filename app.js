// app.js - Logique principale
let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
let selectedQuality = '';
let selectedExtension = '';
let randomNoteCount = 4;
let isListening = false;
let audioContext = null;
let mediaStream = null;
let analyser = null;
let lastSelectedChordName = '';
let quizMode = false;
let quizChord = null;
let chordNotesVisible = true;

const NOTE_FR_SHARP = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 'G': 'Sol', 'G#': 'Sol#',
  'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 'B': 'Si'
};

document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  initializeUI();
});

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
  if (!frequency) return;
  
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
  // En mode quiz, jouer l'accord secret
  if (quizMode && quizChord) {
    getAudioContext();
    const notesToPlay = quizChord.notesWithOctave.map(n => n.note + (4 + n.octave));
    
    notesToPlay.forEach((note, index) => {
      playNoteSound(note, 0.6, index * 0.15);
    });
    notesToPlay.forEach((note, index) => {
      playNoteSound(note, 2.5, notesToPlay.length * 0.15 + 0.2 + index * 0.05);
    });
  } else if (playedNotes.length > 0) {
    // Mode manuel
    getAudioContext();
    playedNotes.forEach((note, index) => {
      playNoteSound(note, 0.6, index * 0.15);
    });
    playedNotes.forEach((note, index) => {
      playNoteSound(note, 2.5, playedNotes.length * 0.15 + 0.2 + index * 0.05);
    });
  }
};

function initializeUI() {
  // Notes en ordre A-B-C-D-E-F-G
  const rootNotesDiv = document.getElementById('rootNotes');
  const orderedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  orderedNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = note;
    btn.onclick = () => selectRootNote(note);
    rootNotesDiv.appendChild(btn);
  });

  // Altérations
  const alterationsDiv = document.getElementById('alterations');
  ALTERATIONS.forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = alt;
    btn.dataset.value = alt;
    btn.onclick = () => selectAlteration(alt);
    alterationsDiv.appendChild(btn);
  });

  // Qualités
  const qualitiesDiv = document.getElementById('qualities');
  const shortQualityLabels = {
    'm': 'min', 'dim': 'dim', 'aug': 'aug', '7': '7', 
    'maj7': 'maj7', 'm7': 'mi7', 'dim7': 'dim7', 'm7b5': 'ø7'
  };
  CHORD_QUALITIES.forEach(quality => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = shortQualityLabels[quality.value] || quality.label;
    btn.dataset.value = quality.value;
    btn.onclick = () => selectQuality(quality.value);
    qualitiesDiv.appendChild(btn);
  });

  // Extensions
  const extensionsDiv = document.getElementById('extensions');
  EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectExtension(ext);
    extensionsDiv.appendChild(btn);
  });

  // Boutons de contrôle
  document.getElementById('resetNotes').onclick = resetNotes;
  document.getElementById('micToggle').onclick = toggleMicrophone;
  document.getElementById('toggleChordVisibility').onclick = toggleChordVisibility;
  document.getElementById('playChordBtn').onclick = window.playChord;

  // Nombre de notes aléatoires - Mode quiz automatique au clic
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.onclick = () => {
      selectNoteCount(parseInt(btn.dataset.count));
      startQuizMode();
    };
  });
}

function selectRootNote(note) {
  // Quitter le mode quiz si on passe en mode manuel
  if (quizMode) {
    exitQuizMode();
  }
  
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
  if (quizMode) {
    exitQuizMode();
  }
  
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

function selectQuality(value) {
  if (quizMode) {
    exitQuizMode();
  }
  
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
  if (quizMode) {
    exitQuizMode();
  }
  
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
  
  // Si extension commence par # ou b, c'est une extension modifiée (pas une altération)
  let actualAlteration = selectedAlteration;
  let actualExtension = selectedExtension;
  
  if (selectedExtension && (selectedExtension.startsWith('#') || selectedExtension.startsWith('b'))) {
    // Extension avec altération : #9, #11, b9, b13, etc.
    actualAlteration = ''; // Pas d'altération de la note fondamentale
    actualExtension = selectedExtension;
  }
  
  const fullRoot = selectedRootNote + actualAlteration;
  const chordName = fullRoot + selectedQuality + actualExtension;
  const chord = ALL_CHORDS[chordName];
  
  if (chord) {
    lastSelectedChordName = chordName;
    playedNotes = chord.notesWithOctave.map(n => n.note + (4 + n.octave));
    
    document.querySelectorAll('.mini-key.error').forEach(btn => {
      btn.classList.remove('error');
    });
    
    // Afficher le bouton play en mode manuel
    document.getElementById('playChordBtn').style.display = 'flex';
    
    updateDisplay(true, chordName);
  } else {
    playedNotes = [];
    lastSelectedChordName = '';
    
    // Masquer le bouton play si pas d'accord
    document.getElementById('playChordBtn').style.display = 'none';
    
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

// Mode Quiz
function startQuizMode() {
  quizMode = true;
  playedNotes = [];
  resetManualSelection();
  
  // Générer un accord aléatoire
  const availableChords = Object.entries(ALL_CHORDS).filter(([name, chord]) => {
    return chord.notes.length === randomNoteCount;
  });
  
  if (availableChords.length === 0) {
    const allChordNames = Object.keys(ALL_CHORDS);
    const randomChordName = allChordNames[Math.floor(Math.random() * allChordNames.length)];
    quizChord = ALL_CHORDS[randomChordName];
    lastSelectedChordName = randomChordName;
  } else {
    const randomIndex = Math.floor(Math.random() * availableChords.length);
    const [chordName, chord] = availableChords[randomIndex];
    quizChord = chord;
    lastSelectedChordName = chordName;
  }
  
  // Masquer les notes de l'accord par défaut en mode quiz
  chordNotesVisible = false;
  updateChordVisibilityButton();
  
  // Afficher le bouton play
  const playBtn = document.getElementById('playChordBtn');
  if (playBtn) {
    playBtn.style.display = 'flex';
  }
  
  updateDisplay();
}

function exitQuizMode() {
  quizMode = false;
  quizChord = null;
  chordNotesVisible = true;
  updateChordVisibilityButton();
  
  // Masquer le bouton play
  document.getElementById('playChordBtn').style.display = 'none';
}

function toggleChordVisibility() {
  chordNotesVisible = !chordNotesVisible;
  updateChordVisibilityButton();
  updateDisplay();
}

function updateChordVisibilityButton() {
  const btn = document.getElementById('toggleChordVisibility');
  if (chordNotesVisible) {
    btn.classList.remove('hidden');
    btn.title = 'Masquer';
  } else {
    btn.classList.add('hidden');
    btn.title = 'Afficher';
  }
}

window.playNote = function(note) {
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
  
  // Masquer le bouton play
  document.getElementById('playChordBtn').style.display = 'none';
  
  updateDisplay();
}

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  
  // En mode quiz, afficher les notes jouées avec couleur (vert/rouge) en temps réel
  if (quizMode && quizChord) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<div class="empty-state">Aucune note jouée</div>';
    } else {
      const quizChordNotes = quizChord.notes; // Notes sans octave
      
      playedNotesDiv.innerHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          let noteFr = NOTE_FR_SHARP[noteName] || noteName;
          
          // Vérifier si la note est dans l'accord
          const isCorrect = quizChordNotes.includes(noteName);
          const colorClass = isCorrect ? 'correct' : 'incorrect';
          
          return `<div class="note-badge ${colorClass}">${noteFr}</div>`;
        })
        .join('');
    }
  } else {
    // Mode manuel normal
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<div class="empty-state">Aucune note jouée</div>';
    } else {
      playedNotesDiv.innerHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          let noteFr = NOTE_FR_SHARP[noteName] || noteName;
          
          if (lastSelectedChordName && lastSelectedChordName.includes('b')) {
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
  }

  updateKeyboardHighlight(playedNotes);

  let chord = null;
  if (quizMode && quizChord) {
    chord = quizChord;
  } else if (lastSelectedChordName) {
    chord = ALL_CHORDS[lastSelectedChordName];
  } else {
    chord = detectChord(playedNotes);
  }
  
  displayDetectedChord(chord, chordExists);
}

function displayDetectedChord(chord, chordExists = null) {
  const chordName = document.getElementById('chordName');
  const chordNotesList = document.getElementById('chordNotesList');
  
  console.log('displayDetectedChord - quizMode:', quizMode, 'chordNotesVisible:', chordNotesVisible);
  
  if (!chord) {
    chordName.textContent = '-';
    chordNotesList.innerHTML = '<div class="empty-state">-</div>';
    return;
  }
  
  if (chordExists === false) {
    chordName.textContent = '✗';
    chordName.style.color = '#ef4444';
    chordNotesList.innerHTML = '<div class="empty-state">Accord introuvable</div>';
  } else {
    chordName.textContent = chord.notation;
    chordName.style.color = '#22c55e';
    
    // En mode quiz ET notes masquées
    if (quizMode === true && chordNotesVisible === false) {
      console.log('Masquage des notes de l\'accord');
      chordNotesList.innerHTML = '<div class="empty-state">???</div>';
    } else {
      console.log('Affichage des notes de l\'accord');
      const notesDisplay = chord.notesFr.map(noteFr => {
        return `<div class="chord-note">${noteFr}</div>`;
      }).join('');
      
      chordNotesList.innerHTML = notesDisplay;
    }
  }
}

async function toggleMicrophone() {
  if (isListening) {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    isListening = false;
    const btn = document.getElementById('micToggle');
    btn.classList.remove('active');
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
      btn.classList.add('active');
      
      detectPitchFromMic();
    } catch (err) {
      console.error('Erreur microphone:', err);
      alert('Impossible d\'accéder au microphone.');
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