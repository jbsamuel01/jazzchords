// app.js v2.1 - Logique principale
// Correction v2.1 : utilisation de noteForKeyboard pour le clavier

let playedNotes = [];
let selectedRootNote = '';
let selectedAlteration = '';
let selectedMinor = false;
let selectedBaseQuality = '';
let selectedQuality = '';
let selectedSimpleExtension = '';
let selectedAlteredExtensions = [];
let randomNoteCount = 4;
let lastSelectedChordName = '';
let quizMode = false;
let quizChord = null;
let chordNotesVisible = true;
let lastResetTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  createKeyboard();
  initializeUI();
});

window.playChord = async function() {
  getAudioContext();
  
  // S'assurer que le piano est initialisé et Tone.js démarré AVANT de jouer
  if (!piano) {
    await initializePiano();
  }
  
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  
  let notesToPlay = [];
  
  if (quizMode && quizChord) {
    notesToPlay = quizChord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
  } else if (lastSelectedChordName) {
    const chord = ALL_CHORDS[lastSelectedChordName];
    if (chord) {
      notesToPlay = chord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
    }
  } else {
    // Détecter l'accord depuis les notes jouées au clavier
    const detectedChord = detectChord(playedNotes);
    if (detectedChord && detectedChord.name !== 'Inconnu' && detectedChord.notesWithOctave) {
      notesToPlay = detectedChord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
    }
  }
  
  if (notesToPlay.length > 0) {
    notesToPlay.forEach((note, index) => {
      playNoteSound(note, 0.6, index * 0.15);
    });
    notesToPlay.forEach((note, index) => {
      playNoteSound(note, 2.5, notesToPlay.length * 0.15 + 0.2 + index * 0.05);
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
  
  // En mode manuel, ne pas effacer automatiquement
  // Effacer seulement si l'utilisateur a manuellement caché les notes
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
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
  
  // En mode manuel, ne pas effacer automatiquement
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
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
  
  // En mode manuel, ne pas effacer automatiquement
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
  buildManualChordLive();
}

function selectBaseQuality(value) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  // Si on clique sur la même valeur, on désélectionne
  if (selectedBaseQuality === value) {
    selectedBaseQuality = '';
  } else {
    selectedBaseQuality = value;
  }
  
  // Désélectionner tous les boutons de base-quality
  document.querySelectorAll('[data-type="base-quality"]').forEach(btn => {
    btn.classList.remove('active', 'error');
  });
  
  // Activer seulement le bouton sélectionné
  if (selectedBaseQuality) {
    document.querySelectorAll(`[data-type="base-quality"][data-value="${selectedBaseQuality}"]`).forEach(btn => {
      btn.classList.add('active');
    });
  }
  
  // Ne pas effacer automatiquement en mode manuel
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
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
  
  // En mode manuel, ne pas effacer automatiquement
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
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
  
  // Mettre à jour tous les boutons d'extensions simples (y compris add2 et add4 dans la ligne 2)
  document.querySelectorAll('[data-type="simple-extension"]').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedSimpleExtension);
    btn.classList.remove('error');
  });
  document.querySelectorAll('#simpleExtensions .mini-key').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === selectedSimpleExtension);
    btn.classList.remove('error');
  });
  
  // En mode manuel, ne pas effacer automatiquement
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
  buildManualChordLive();
}

function selectAlteredExtension(ext) {
  if (quizMode) exitQuizMode();
  deselectNoteCountButtons();
  
  const index = selectedAlteredExtensions.indexOf(ext);
  if (index > -1) {
    // Déselectionner
    selectedAlteredExtensions.splice(index, 1);
  } else {
    // Vérifier les combinaisons incompatibles
    const incompatible = {
      'b5': ['#5'],
      '#5': ['b5'],
      'b9': ['#9'],
      '#9': ['b9'],
      '#11': ['b13'],
      'b13': ['#11']
    };
    
    // Retirer les altérations incompatibles si on en sélectionne une nouvelle
    if (incompatible[ext]) {
      incompatible[ext].forEach(incomp => {
        const idx = selectedAlteredExtensions.indexOf(incomp);
        if (idx > -1) {
          selectedAlteredExtensions.splice(idx, 1);
        }
      });
    }
    
    // Sélectionner (max 2)
    if (selectedAlteredExtensions.length < 2) {
      selectedAlteredExtensions.push(ext);
    } else {
      // Remplacer la première altération
      selectedAlteredExtensions.shift();
      selectedAlteredExtensions.push(ext);
    }
    
    // Allumer automatiquement la touche 7 si aucune qualité 7 n'est sélectionnée
    // Exception: ne pas allumer 7 si maj7 ou maj7#5 ou maj7b5 est déjà sélectionné
    if (selectedQuality !== '7' && selectedQuality !== 'maj7' && selectedQuality !== 'maj7#5' && selectedQuality !== 'maj7b5') {
      selectedQuality = '7';
      document.querySelectorAll('#qualities .mini-key').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === '7');
        btn.classList.remove('error');
      });
    }
  }
  
  document.querySelectorAll('#alteredExtensions .mini-key').forEach(btn => {
    btn.classList.toggle('active', selectedAlteredExtensions.includes(btn.dataset.value));
    btn.classList.remove('error');
  });
  
  
  // En mode manuel, ne pas effacer automatiquement
  if (!chordNotesVisible && !quizMode) {
    playedNotes = [];
  }
  
  buildManualChordLive();
}

function resetManualSelection() {
  selectedRootNote = '';
  selectedAlteration = '';
  selectedMinor = false;
  selectedBaseQuality = '';
  selectedQuality = '';
  selectedSimpleExtension = '';
  selectedAlteredExtensions = [];
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
  
  // Construire le nom de l'accord avec baseQuality
  let chordName = fullRoot;
  
  // Ajouter baseQuality (m, aug, sus2, sus4)
  if (selectedBaseQuality) {
    chordName += selectedBaseQuality;
  } else if (selectedMinor) {
    chordName += 'm';
  }
  
  // Trier les altérations dans l'ordre conventionnel : b5, #5, b9, #9, #11, b13
  const alterationOrder = ['b5', '#5', 'b9', '#9', '#11', 'b13'];
  const sortedAlterations = [...selectedAlteredExtensions].sort((a, b) => {
    return alterationOrder.indexOf(a) - alterationOrder.indexOf(b);
  });
  
  chordName += selectedQuality + selectedSimpleExtension + sortedAlterations.join('');
  
  const chord = ALL_CHORDS[chordName];
  
  if (chord) {
    lastSelectedChordName = chordName;
    
    // CORRECTION v2.1 : utiliser noteForKeyboard pour le clavier
    if (chordNotesVisible) {
      playedNotes = chord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
    }
    
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
    if (selectedBaseQuality !== '') {
      document.querySelectorAll('[data-type="base-quality"].active').forEach(btn => {
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
    if (selectedAlteredExtensions.length > 0) {
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
    // Exclure D# et A# non-mineurs du quiz
    if (name.startsWith('D#') || name.startsWith('A#')) {
      const isMinor = name.includes('m') || name.includes('dim') || name.includes('ø');
      if (!isMinor) return false;
    }
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
  
  // Effacer les notes jouées quand on masque (utilisateur clique sur l'œil)
  if (!chordNotesVisible) {
    playedNotes = [];
  } else {
    // Quand on affiche à nouveau, restaurer les notes de l'accord si en mode manuel
    if (!quizMode && lastSelectedChordName) {
      const chord = ALL_CHORDS[lastSelectedChordName];
      if (chord) {
        // CORRECTION v2.1 : utiliser noteForKeyboard
        playedNotes = chord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
      }
    }
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
  const now = Date.now();
  const timeSinceLastReset = now - lastResetTime;
  
  // Si moins de 1 seconde depuis le dernier reset, sortir du mode quiz
  if (timeSinceLastReset < 1000 && quizMode) {
    exitQuizMode();
    playedNotes = [];
    lastSelectedChordName = '';
    deselectNoteCountButtons();
    updateDisplay();
    lastResetTime = 0;
    return;
  }
  
  playedNotes = [];
  resetManualSelection();
  document.getElementById('playChordBtn').style.display = 'none';
  updateDisplay();
  lastResetTime = now;
}

function getPlayedNoteFrenchName(playedNote, chord) {
  if (!chord || !chord.notesWithOctave) {
    const noteName = playedNote.replace(/[0-9]/g, '');
    return NOTE_FR_SHARP[noteName] || noteName;
  }
  
  const playedNoteName = playedNote.replace(/[0-9]/g, '');
  
  for (let i = 0; i < chord.notesWithOctave.length; i++) {
    const chordNote = chord.notesWithOctave[i];
    // CORRECTION v2.1 : comparer avec noteForKeyboard
    if ((chordNote.noteForKeyboard || chordNote.note) === playedNoteName) {
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
  
  // Déterminer si les notes ont été jouées manuellement ou générées automatiquement
  const manuallyPlayed = !chordNotesVisible || playedNotes.length === 0 || 
    (currentChord && playedNotes.length > 0 && 
     !playedNotes.every((note, idx) => {
       // CORRECTION v2.1 : utiliser noteForKeyboard
       const expectedNotes = currentChord.notesWithOctave.map(n => (n.noteForKeyboard || n.note) + (4 + (n.noteForKeyboardOctave !== undefined ? n.noteForKeyboardOctave : n.octave)));
       return expectedNotes.includes(note);
     }));
  
  if ((quizMode && quizChord) || (!quizMode && currentChord)) {
    if (playedNotes.length === 0) {
      playedNotesDiv.innerHTML = '<span class="empty-state">Aucune</span>';
    } else {
      // CORRECTION v2.1 : utiliser noteForKeyboard pour la comparaison
      const chordNotes = quizMode 
        ? quizChord.notesWithOctave.map(n => n.noteForKeyboard || n.note)
        : currentChord.notesWithOctave.map(n => n.noteForKeyboard || n.note);
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
      
      // Afficher le pouce seulement si les notes ont été jouées manuellement
      if (perfectMatch && (!chordNotesVisible || quizMode)) {
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
  
  // Afficher le bouton play si un accord est détecté (même depuis le clavier)
  const playBtn = document.getElementById('playChordBtn');
  if (chord && chord.name !== 'Inconnu') {
    playBtn.style.display = 'inline-flex';
  } else if (!quizMode && !lastSelectedChordName) {
    playBtn.style.display = 'none';
  }
  
  displayDetectedChord(chord, chordExists);
}

function displayDetectedChord(chord, chordExists = null) {
  const chordName = document.getElementById('chordName');
  const chordNotesList = document.getElementById('chordNotesList');
  const chordNotesMessage = document.getElementById('chordNotesMessage');
  const toggleBtn = document.getElementById('toggleChordVisibility');
  
  if (!chord) {
    chordName.textContent = '-';
    chordName.style.color = '#22c55e';
    chordNotesList.innerHTML = '<span class="empty-state">-</span>';
    chordNotesMessage.innerHTML = '';
    toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
    toggleBtn.classList.remove('hidden');
    drawMusicalStaff([]);
    return;
  }
  
  if (chordExists === false) {
    chordName.textContent = '✗';
    chordName.style.color = '#ef4444';
    chordNotesList.innerHTML = '<span class="empty-state">Accord introuvable</span>';
    chordNotesMessage.innerHTML = '';
    drawMusicalStaff([]);
  } else {
    chordName.textContent = chord.displayNotation || chord.notation;
    chordName.style.color = '#22c55e';
    
    if (chordNotesVisible === false) {
      chordNotesList.innerHTML = '';
      chordNotesMessage.innerHTML = '<span class="quiz-message">Voir les notes →</span>';
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>`;
      toggleBtn.classList.add('hidden');
      drawMusicalStaff([]);
    } else {
      // Afficher les notes en colonne verticale, de haut en bas (dernière note en haut)
      const notesDisplay = chord.notesFr.slice().reverse().map(noteFr => {
        return `<div class="chord-note-vertical">${noteFr}</div>`;
      }).join('');
      
      chordNotesList.innerHTML = notesDisplay;
      chordNotesMessage.innerHTML = '';
      toggleBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>`;
      toggleBtn.classList.remove('hidden');
      
      // Dessiner la portée musicale avec les VRAIES notes théoriques de l'accord
      if (chord.notesWithOctave) {
        // Utiliser displayNote (ex: B#) et non note (ex: C) pour respecter l'enharmonie
        const notesToDraw = chord.notesWithOctave.map(n => n.displayNote + (4 + n.octave));
        // Passer la notation complète de l'accord pour détecter le mode
        drawMusicalStaff(notesToDraw, chord.notation);
      }
    }
  }
}