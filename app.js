// app.js - Logique principale
let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
let selectedMinor = false;
let selectedQuality = '';
let selectedSimpleExtension = '';
let selectedAlteredExtension = '';
let randomNoteCount = 4;
let lastSelectedChordName = '';
let quizMode = false;
let quizChord = null;
let chordNotesVisible = true;

document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  initializeUI();
});

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
    document.getElementById('playChordBtn').style.display = 'none';
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
    
    document.getElementById('playChordBtn').style.display = 'inline-flex';
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
    playBtn.style.display = 'inline-flex';
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
  
  if (!quizMode && !chordNotesVisible) {
    playedNotes = [];
  }
  
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

function resetNotes() {
  playedNotes = [];
  resetManualSelection();
  document.getElementById('playChordBtn').style.display = 'none';
  updateDisplay();
}

function getPlayedNoteFrenchName(playedNote, chord) {
  if (!chord || !chord.notesWithOctave) {
    const noteName = playedNote.replace(/[0-9]/g, '');
    return NOTE_FR_SHARP[noteName] || noteName;
  }
  
  const playedNoteName = playedNote.replace(/[0-9]/g, '');
  
  for (let i = 0; i < chord.notesWithOctave.length; i++) {
    const chordNote = chord.notesWithOctave[i];
    if (chordNote.note === playedNoteName) {
      return chord.notesFr[i];
    }
  }
  
  return NOTE_FR_SHARP[playedNoteName] || playedNoteName;
}

function updateDisplay(chordExists = null, forcedChordName = null) {
  const playedNotesDiv = document.getElementById('playedNotes');
  
  let currentChord = null;
  if (quizMode && quizChord) {
    currentChord = quizChord;
  } else if (lastSelectedChordName) {
    currentChord = ALL_CHORDS[lastSelectedChordName];
  }
  
  if ((quizMode && quizChord) || (!quizMode && currentChord)) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      const chordNotes = quizMode ? quizChord.notes : currentChord.notes;
      const playedBaseNotes = playedNotes.map(n => n.replace(/[0-9]/g, ''));
      
      let allCorrect = true;
      
      const notesHTML = playedNotes
        .map(note => {
          const noteName = note.replace(/[0-9]/g, '');
          const noteFr = getPlayedNoteFrenchName(note, currentChord);
          
          const isCorrect = chordNotes.includes(noteName);
          const colorClass = isCorrect ? 'correct' : 'incorrect';
          
          if (!isCorrect) {
            allCorrect = false;
          }
          
          return `<span class="note-badge ${colorClass}">${noteFr}</span>`;
        })
        .join(' ');
      
      const allNotesFound = chordNotes.every(note => playedBaseNotes.includes(note));
      const perfectMatch = allNotesFound && allCorrect && playedBaseNotes.length === chordNotes.length;
      
      if (quizMode && perfectMatch) {
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
    toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
    toggleBtn.classList.remove('hidden');
    return;
  }
  
  if (chordExists === false) {
    chordName.textContent = '✗';
    chordName.style.color = '#ef4444';
    chordNotesList.innerHTML = '<span class="empty-state">Accord introuvable</span>';
  } else {
    chordName.textContent = chord.notation;
    chordName.style.color = '#22c55e';
    
    if (chordNotesVisible === false) {
      if (quizMode) {
        chordNotesList.innerHTML = '<span class="quiz-message">Voir les notes →</span>';
      } else {
        chordNotesList.innerHTML = '<span class="empty-state">-</span>';
      }
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>`;
      toggleBtn.classList.add('hidden');
    } else {
      const notesDisplay = chord.notesFr.map(noteFr => {
        return `<span class="chord-note">${noteFr}</span>`;
      }).join(' ');
      
      chordNotesList.innerHTML = notesDisplay;
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>`;
      toggleBtn.classList.remove('hidden');
    }
  }
}