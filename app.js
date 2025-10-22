// app.js - Logique principale
let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
let selectedMinor = false;
let selectedQuality = '';
let selectedSimpleExtension = '';
let selectedAlteredExtension = '';
let randomNoteCount = 4;
let isListening = false;
let audioContext = null;
let mediaStream = null;
let analyser = null;
let lastSelectedChordName = '';
let quizMode = false;
let quizChord = null;
let chordNotesVisible = true;

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

document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  initializeUI();
});

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
  
  // Oscillateurs pour créer un son de piano plus réaliste
  const fundamental = ctx.createOscillator();
  const harmonic2 = ctx.createOscillator();
  const harmonic3 = ctx.createOscillator();
  const harmonic4 = ctx.createOscillator();
  const harmonic5 = ctx.createOscillator();
  const harmonic6 = ctx.createOscillator();
  
  const gainNode = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();
  const gain4 = ctx.createGain();
  const gain5 = ctx.createGain();
  const gain6 = ctx.createGain();
  const masterGain = ctx.createGain();
  
  // Filtre pour adoucir le son
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(frequency * 6, ctx.currentTime + startTime);
  filter.Q.setValueAtTime(0.8, ctx.currentTime + startTime);
  
  // Types d'oscillateurs pour un son plus naturel
  fundamental.type = 'sine';
  harmonic2.type = 'sine';
  harmonic3.type = 'sine';
  harmonic4.type = 'sine';
  harmonic5.type = 'triangle';
  harmonic6.type = 'triangle';
  
  // Fréquences harmoniques
  fundamental.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
  harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime + startTime);
  harmonic3.frequency.setValueAtTime(frequency * 3, ctx.currentTime + startTime);
  harmonic4.frequency.setValueAtTime(frequency * 4, ctx.currentTime + startTime);
  harmonic5.frequency.setValueAtTime(frequency * 5, ctx.currentTime + startTime);
  harmonic6.frequency.setValueAtTime(frequency * 6, ctx.currentTime + startTime);
  
  // Enveloppe ADSR plus proche du piano - attaque rapide, decay moyen, release court
  const attackTime = 0.005;
  const decayTime = 0.15;
  const sustainLevel = 0.2;
  const releaseTime = Math.min(duration * 0.6, 0.8); // Durée plus courte
  
  // Enveloppe fondamentale (la plus forte)
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + startTime + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(sustainLevel, ctx.currentTime + startTime + attackTime + decayTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + releaseTime);
  
  // Harmoniques qui s'éteignent plus vite (comme un vrai piano)
  gain2.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startTime + attackTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.3);
  
  gain3.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain3.gain.linearRampToValueAtTime(0.18, ctx.currentTime + startTime + attackTime);
  gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.25);
  
  gain4.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain4.gain.linearRampToValueAtTime(0.12, ctx.currentTime + startTime + attackTime);
  gain4.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.2);
  
  gain5.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain5.gain.linearRampToValueAtTime(0.08, ctx.currentTime + startTime + attackTime);
  gain5.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.15);
  
  gain6.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain6.gain.linearRampToValueAtTime(0.04, ctx.currentTime + startTime + attackTime);
  gain6.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.1);
  
  masterGain.gain.setValueAtTime(0.5, ctx.currentTime + startTime);
  
  // Connexions
  fundamental.connect(gainNode);
  harmonic2.connect(gain2);
  harmonic3.connect(gain3);
  harmonic4.connect(gain4);
  harmonic5.connect(gain5);
  harmonic6.connect(gain6);
  
  gainNode.connect(filter);
  gain2.connect(filter);
  gain3.connect(filter);
  gain4.connect(filter);
  gain5.connect(filter);
  gain6.connect(filter);
  
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);
  
  const startMoment = ctx.currentTime + startTime;
  fundamental.start(startMoment);
  harmonic2.start(startMoment);
  harmonic3.start(startMoment);
  harmonic4.start(startMoment);
  harmonic5.start(startMoment);
  harmonic6.start(startMoment);
  
  const stopMoment = ctx.currentTime + startTime + Math.min(duration, 1.2);
  fundamental.stop(stopMoment);
  harmonic2.stop(stopMoment);
  harmonic3.stop(stopMoment);
  harmonic4.stop(stopMoment);
  harmonic5.stop(stopMoment);
  harmonic6.stop(stopMoment);
}

window.playChord = function() {
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
    getAudioContext();
    playedNotes.forEach((note, index) => {
      playNoteSound(note, 0.6, index * 0.15);
    });
    playedNotes.forEach((note, index) => {
      playNoteSound(note, 2.5, playedNotes.length * 0.15 + 0.2 + index * 0.05);
    });
  }
};

function selectRootNote(note) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
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
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  if (selectedAlteration === alt) {
    selectedAlteration = '';
  } else {
    selectedAlteration = alt;
  }
  
  document.querySelectorAll('#alterations .mini-key[data-type="alteration"]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === selectedAlteration);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectMinor() {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  selectedMinor = !selectedMinor;
  
  document.querySelectorAll('#alterations .mini-key[data-type="minor"]').forEach(btn => {
    btn.classList.toggle('active', selectedMinor);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectQuality(value) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
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

function selectSimpleExtension(ext) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  if (selectedSimpleExtension === ext) {
    selectedSimpleExtension = '';
  } else {
    selectedSimpleExtension = ext;
  }
  
  document.querySelectorAll('#simpleExtensions .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedSimpleExtension);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function selectAlteredExtension(ext) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  if (selectedAlteredExtension === ext) {
    selectedAlteredExtension = '';
  } else {
    selectedAlteredExtension = ext;
  }
  
  document.querySelectorAll('#alteredExtensions .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedAlteredExtension);
    btn.classList.remove('error');
  });
  buildManualChordLive();
}

function resetManualSelection() {
  selectedRootNote = '';
  selectedAlteration = '';
  selectedMinor = false;
  selectedQuality = '';
  selectedSimpleExtension = '';
  selectedAlteredExtension = '';
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
  const minorPart = selectedMinor ? 'm' : '';
  let chordName = fullRoot + minorPart + selectedQuality + selectedSimpleExtension + selectedAlteredExtension;
  
  const chord = ALL_CHORDS[chordName];
  
  if (chord) {
    lastSelectedChordName = chordName;
    playedNotes = chord.notesWithOctave.map(n => n.note + (4 + n.octave));
    
    document.querySelectorAll('.mini-key.error').forEach(btn => {
      btn.classList.remove('error');
    });
    
    document.getElementById('playChordBtn').style.display = 'flex';
    updateDisplay(true, chordName);
  } else {
    playedNotes = [];
    lastSelectedChordName = '';
    document.getElementById('playChordBtn').style.display = 'none';
    
    if (selectedRootNote) {
      document.querySelectorAll('#rootNotes .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedAlteration !== '') {
      document.querySelectorAll('#alterations .mini-key[data-type="alteration"].active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedMinor) {
      document.querySelectorAll('#alterations .mini-key[data-type="minor"].active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedQuality !== '') {
      document.querySelectorAll('#qualities .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedSimpleExtension !== '') {
      document.querySelectorAll('#simpleExtensions .mini-key.active').forEach(btn => {
        btn.classList.add('error');
      });
    }
    if (selectedAlteredExtension !== '') {
      document.querySelectorAll('#alteredExtensions .mini-key.active').forEach(btn => {
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

function deselectNoteCountButtons() {
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function startQuizMode() {
  quizMode = true;
  playedNotes = [];
  resetManualSelection();
  
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
  
  chordNotesVisible = false;
  updateChordVisibilityButton();
  
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
  document.getElementById('playChordBtn').style.display = 'none';
  updateDisplay();
}

// Fonction pour convertir une note jouée en nom français selon le contexte de l'accord
function getPlayedNoteFrenchName(playedNote, chord) {
  if (!chord || !chord.notesWithOctave) {
    // Pas de contexte d'accord, utiliser la notation par défaut
    const noteName = playedNote.replace(/[0-9]/g, '');
    return NOTE_FR_SHARP[noteName] || noteName;
  }
  
  // Extraire la note sans octave
  const playedNoteName = playedNote.replace(/[0-9]/g, '');
  
  // Chercher la correspondance dans les notes de l'accord
  for (let i = 0; i < chord.notesWithOctave.length; i++) {
    const chordNote = chord.notesWithOctave[i];
    if (chordNote.note === playedNoteName) {
      // Utiliser le displayNote de l'accord (qui respecte les degrés)
      return chord.notesFr[i];
    }
  }
  
  // Note non trouvée dans l'accord, utiliser la notation par défaut
  return NOTE_FR_SHARP[playedNoteName] || playedNoteName;
}

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  
  // Récupérer l'accord actuel pour le contexte
  let currentChord = null;
  if (quizMode && quizChord) {
    currentChord = quizChord;
  } else if (lastSelectedChordName) {
    currentChord = ALL_CHORDS[lastSelectedChordName];
  }
  
  if (quizMode && quizChord) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      const quizChordNotes = quizChord.notes;
      const playedBaseNotes = playedNotes.map(n => n.replace(/[0-9]/g, ''));
      
      let allCorrect = true;
      
      const notesHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          const noteFr = getPlayedNoteFrenchName(note, currentChord);
          
          const isCorrect = quizChordNotes.includes(noteName);
          const colorClass = isCorrect ? 'correct' : 'incorrect';
          
          if (!isCorrect) {
            allCorrect = false;
          }
          
          return `<span class="note-badge ${colorClass}">${noteFr}</span>`;
        })
        .join(' ');
      
      const allNotesFound = quizChordNotes.every(note => playedBaseNotes.includes(note));
      const perfectMatch = allNotesFound && allCorrect && playedBaseNotes.length === quizChordNotes.length;
      
      // Ajouter le pouce juste après les notes si réussite
      if (perfectMatch) {
        playedNotesDiv.innerHTML = notesHTML + ' <span class="success-indicator">👍</span>';
      } else {
        playedNotesDiv.innerHTML = notesHTML;
      }
    }
  } else {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      const notesHTML = playedNotes
        .map(note => {
          const noteFr = getPlayedNoteFrenchName(note, currentChord);
          return `<span class="note-badge">${noteFr}</span>`;
        })
        .join(' ');
      
      playedNotesDiv.innerHTML = notesHTML;
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
  const toggleBtn = document.getElementById('toggleChordVisibility');
  
  if (!chord) {
    chordName.textContent = '-';
    chordName.style.color = '#22c55e';
    chordNotesList.innerHTML = '<span class="empty-state">-</span>';
    return;
  }
  
  if (chordExists === false) {
    chordName.textContent = '✗';
    chordName.style.color = '#ef4444';
    chordNotesList.innerHTML = '<span class="empty-state">Accord introuvable</span>';
  } else {
    chordName.textContent = chord.notation;
    chordName.style.color = '#22c55e';
    
    if (quizMode === true && chordNotesVisible === false) {
      chordNotesList.innerHTML = '<span class="quiz-message">Bouton orange pour voir les notes →</span>';
      // Changer l'icône en œil fermé
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>`;
    } else {
      const notesDisplay = chord.notesFr.map(noteFr => {
        return `<span class="chord-note">${noteFr}</span>`;
      }).join(' ');
      
      chordNotesList.innerHTML = notesDisplay;
      // Changer l'icône en œil ouvert
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>`;
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