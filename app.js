// app.js - Logique principale (PARTIE 1/2)
let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
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
  
  // Créer plusieurs oscillateurs pour un son de piano riche
  const fundamental = ctx.createOscillator();
  const harmonic2 = ctx.createOscillator();
  const harmonic3 = ctx.createOscillator();
  const harmonic4 = ctx.createOscillator();
  const harmonic5 = ctx.createOscillator();
  const harmonic6 = ctx.createOscillator();
  const harmonic7 = ctx.createOscillator();
  
  const gainNode = ctx.createGain();
  const gain2 = ctx.createGain();
  const gain3 = ctx.createGain();
  const gain4 = ctx.createGain();
  const gain5 = ctx.createGain();
  const gain6 = ctx.createGain();
  const gain7 = ctx.createGain();
  const masterGain = ctx.createGain();
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(frequency * 8, ctx.currentTime + startTime);
  filter.Q.setValueAtTime(1, ctx.currentTime + startTime);
  
  fundamental.type = 'sine';
  harmonic2.type = 'sine';
  harmonic3.type = 'sine';
  harmonic4.type = 'triangle';
  harmonic5.type = 'sine';
  harmonic6.type = 'sine';
  harmonic7.type = 'triangle';
  
  fundamental.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);
  harmonic2.frequency.setValueAtTime(frequency * 2, ctx.currentTime + startTime);
  harmonic3.frequency.setValueAtTime(frequency * 3, ctx.currentTime + startTime);
  harmonic4.frequency.setValueAtTime(frequency * 4, ctx.currentTime + startTime);
  harmonic5.frequency.setValueAtTime(frequency * 5, ctx.currentTime + startTime);
  harmonic6.frequency.setValueAtTime(frequency * 6, ctx.currentTime + startTime);
  harmonic7.frequency.setValueAtTime(frequency * 7, ctx.currentTime + startTime);
  
  const attackTime = 0.002;
  const decayTime = 0.1;
  const sustainLevel = 0.3;
  const releaseTime = duration * 0.8;
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(sustainLevel, ctx.currentTime + startTime + attackTime + decayTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + releaseTime);
  
  gain2.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + startTime + attackTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.5);
  
  gain3.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain3.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + attackTime);
  gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.4);
  
  gain4.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain4.gain.linearRampToValueAtTime(0.08, ctx.currentTime + startTime + attackTime);
  gain4.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.3);
  
  gain5.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain5.gain.linearRampToValueAtTime(0.05, ctx.currentTime + startTime + attackTime);
  gain5.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.25);
  
  gain6.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain6.gain.linearRampToValueAtTime(0.03, ctx.currentTime + startTime + attackTime);
  gain6.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.2);
  
  gain7.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain7.gain.linearRampToValueAtTime(0.02, ctx.currentTime + startTime + attackTime);
  gain7.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration * 0.15);
  
  masterGain.gain.setValueAtTime(0.6, ctx.currentTime + startTime);
  
  fundamental.connect(gainNode);
  harmonic2.connect(gain2);
  harmonic3.connect(gain3);
  harmonic4.connect(gain4);
  harmonic5.connect(gain5);
  harmonic6.connect(gain6);
  harmonic7.connect(gain7);
  
  gainNode.connect(filter);
  gain2.connect(filter);
  gain3.connect(filter);
  gain4.connect(filter);
  gain5.connect(filter);
  gain6.connect(filter);
  gain7.connect(filter);
  
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);
  
  const startMoment = ctx.currentTime + startTime;
  fundamental.start(startMoment);
  harmonic2.start(startMoment);
  harmonic3.start(startMoment);
  harmonic4.start(startMoment);
  harmonic5.start(startMoment);
  harmonic6.start(startMoment);
  harmonic7.start(startMoment);
  
  const stopMoment = ctx.currentTime + startTime + duration;
  fundamental.stop(stopMoment);
  harmonic2.stop(stopMoment);
  harmonic3.stop(stopMoment);
  harmonic4.stop(stopMoment);
  harmonic5.stop(stopMoment);
  harmonic6.stop(stopMoment);
  harmonic7.stop(stopMoment);
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
// app.js - Logique principale (PARTIE 2/2) - À AJOUTER À LA SUITE

// app.js - Logique principale (PARTIE 2/2) - À AJOUTER À LA SUITE

function initializeUI() {
  const rootNotesDiv = document.getElementById('rootNotes');
  const orderedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  orderedNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = note;
    btn.onclick = () => selectRootNote(note);
    rootNotesDiv.appendChild(btn);
  });

  const alterationsDiv = document.getElementById('alterations');
  ALTERATIONS.forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = alt;
    btn.dataset.value = alt;
    btn.onclick = () => selectAlteration(alt);
    alterationsDiv.appendChild(btn);
  });

  const qualitiesDiv = document.getElementById('qualities');
  
  // Groupes de synonymes avec tirets
  const qualityGroups = [
    [{ label: '-', value: 'm' }, { label: 'min', value: 'm' }],
    [{ label: '7', value: '7' }],
    [{ label: 'M7', value: 'maj7' }, { label: 'maj7', value: 'maj7' }],
    [{ label: '°', value: 'dim' }, { label: 'dim', value: 'dim' }],
    [{ label: 'aug', value: 'aug' }],
    [{ label: 'ø7', value: 'ø7' }],
    [{ label: 'dim7', value: 'dim7' }],
    [{ label: 'sus2', value: 'sus2' }],
    [{ label: 'sus4', value: 'sus4' }]
  ];
  
  qualityGroups.forEach((group, groupIndex) => {
    group.forEach((quality, index) => {
      const btn = document.createElement('button');
      btn.className = 'mini-key';
      btn.textContent = quality.label;
      btn.dataset.value = quality.value;
      btn.onclick = () => selectQuality(quality.value);
      qualitiesDiv.appendChild(btn);
      
      // Ajouter un tiret entre les synonymes
      if (index < group.length - 1) {
        const link = document.createElement('span');
        link.className = 'synonym-link';
        link.textContent = '—';
        qualitiesDiv.appendChild(link);
      }
    });
    
    // Ajouter un espace entre les groupes (sauf après le dernier)
    if (groupIndex < qualityGroups.length - 1) {
      const spacer = document.createElement('span');
      spacer.style.width = '8px';
      qualitiesDiv.appendChild(spacer);
    }
  });

  const simpleExtDiv = document.getElementById('simpleExtensions');
  SIMPLE_EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectSimpleExtension(ext);
    simpleExtDiv.appendChild(btn);
  });

  const alteredExtDiv = document.getElementById('alteredExtensions');
  ALTERED_EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectAlteredExtension(ext);
    alteredExtDiv.appendChild(btn);
  });

  document.getElementById('resetNotes').onclick = resetNotes;
  document.getElementById('micToggle').onclick = toggleMicrophone;
  document.getElementById('toggleChordVisibility').onclick = toggleChordVisibility;
  document.getElementById('playChordBtn').onclick = window.playChord;

  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.onclick = () => {
      selectNoteCount(parseInt(btn.dataset.count));
      startQuizMode();
    };
  });
}

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
  
  document.querySelectorAll('#alterations .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === selectedAlteration);
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
  let chordName = fullRoot + selectedQuality + selectedSimpleExtension + selectedAlteredExtension;
  
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
      document.querySelectorAll('#alterations .mini-key.active').forEach(btn => {
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

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  const successIndicator = document.getElementById('successIndicator');
  
  if (quizMode && quizChord) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
      if (successIndicator) successIndicator.style.display = 'none';
    } else {
      const quizChordNotes = quizChord.notes;
      const playedBaseNotes = playedNotes.map(n => n.replace(/[0-9]/g, ''));
      const useFlats = lastSelectedChordName && lastSelectedChordName.includes('b');
      
      let allCorrect = true;
      
      const notesHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          let noteFr;
          
          if (useFlats) {
            const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const idx = sharpNotes.indexOf(noteName);
            if (idx !== -1) {
              noteFr = NOTE_FR_SHARP[flatNotes[idx]] || noteName;
            } else {
              noteFr = NOTE_FR_SHARP[noteName] || noteName;
            }
          } else {
            noteFr = NOTE_FR_SHARP[noteName] || noteName;
          }
          
          const isCorrect = quizChordNotes.includes(noteName);
          const colorClass = isCorrect ? 'correct' : 'incorrect';
          
          if (!isCorrect) {
            allCorrect = false;
          }
          
          return `<span class="note-badge ${colorClass}">${noteFr}</span>`;
        })
        .join(' ');
      
      playedNotesDiv.innerHTML = notesHTML;
      
      const allNotesFound = quizChordNotes.every(note => playedBaseNotes.includes(note));
      const perfectMatch = allNotesFound && allCorrect && playedBaseNotes.length === quizChordNotes.length;
      
      if (successIndicator) {
        successIndicator.style.display = perfectMatch ? 'inline' : 'none';
      }
    }
  } else {
    if (successIndicator) successIndicator.style.display = 'none';
    
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      const notesHTML = playedNotes
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
      chordNotesList.innerHTML = '<span class="empty-state">???</span>';
    } else {
      const notesDisplay = chord.notesFr.map(noteFr => {
        return `<span class="chord-note">${noteFr}</span>`;
      }).join(' ');
      
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
  
  document.querySelectorAll('#alterations .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === selectedAlteration);
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
  let chordName = fullRoot + selectedQuality + selectedSimpleExtension + selectedAlteredExtension;
  
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
      document.querySelectorAll('#alterations .mini-key.active').forEach(btn => {
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

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  const successIndicator = document.getElementById('successIndicator');
  
  if (quizMode && quizChord) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
      if (successIndicator) successIndicator.style.display = 'none';
    } else {
      const quizChordNotes = quizChord.notes;
      const playedBaseNotes = playedNotes.map(n => n.replace(/[0-9]/g, ''));
      const useFlats = lastSelectedChordName && lastSelectedChordName.includes('b');
      
      let allCorrect = true;
      
      const notesHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          let noteFr;
          
          if (useFlats) {
            const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
            const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const idx = sharpNotes.indexOf(noteName);
            if (idx !== -1) {
              noteFr = NOTE_FR_SHARP[flatNotes[idx]] || noteName;
            } else {
              noteFr = NOTE_FR_SHARP[noteName] || noteName;
            }
          } else {
            noteFr = NOTE_FR_SHARP[noteName] || noteName;
          }
          
          const isCorrect = quizChordNotes.includes(noteName);
          const colorClass = isCorrect ? 'correct' : 'incorrect';
          
          if (!isCorrect) {
            allCorrect = false;
          }
          
          return `<span class="note-badge ${colorClass}">${noteFr}</span>`;
        })
        .join(' ');
      
      playedNotesDiv.innerHTML = notesHTML;
      
      const allNotesFound = quizChordNotes.every(note => playedBaseNotes.includes(note));
      const perfectMatch = allNotesFound && allCorrect && playedBaseNotes.length === quizChordNotes.length;
      
      if (successIndicator) {
        successIndicator.style.display = perfectMatch ? 'inline' : 'none';
      }
    }
  } else {
    if (successIndicator) successIndicator.style.display = 'none';
    
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      const notesHTML = playedNotes
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
      chordNotesList.innerHTML = '<span class="empty-state">???</span>';
    } else {
      const notesDisplay = chord.notesFr.map(noteFr => {
        return `<span class="chord-note">${noteFr}</span>`;
      }).join(' ');
      
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