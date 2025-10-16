// detector.js - Détection des accords
function detectChord(notes) {
  if (notes.length === 0) return null;

  // Extraction des notes sans octave
  const baseNotes = notes.map(n => n.replace(/[0-9]/g, '')).sort();
  
  // Recherche exacte
  for (const [name, chord] of Object.entries(ALL_CHORDS)) {
    const chordNotes = [...chord.notes].sort();
    if (chordNotes.length === baseNotes.length && 
        chordNotes.every((note, idx) => note === baseNotes[idx])) {
      return { name, ...chord };
    }
  }
  
  // Recherche partielle avec préférence pour les accords générés (bémols ou dièses)
  const matches = [];
  for (const [name, chord] of Object.entries(ALL_CHORDS)) {
    const chordNotes = chord.notes;
    if (baseNotes.every(note => chordNotes.includes(note))) {
      matches.push({ name, ...chord, matchScore: chordNotes.length });
    }
  }
  
  if (matches.length > 0) {
    matches.sort((a, b) => a.matchScore - b.matchScore);
    return matches[0];
  }
  
  return { 
    name: 'Inconnu', 
    notes: baseNotes, 
    notesFr: baseNotes.map(n => NOTE_FR_SHARP[n] || n),
    nomFrancais: 'Accord non reconnu' 
  };
}

function displayDetectedChord(chord, chordExists = null) {
  const container = document.getElementById('detectedChord');
  
  if (!chord) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  
  if (chordExists === false) {
    container.className = 'detected-chord error';
    container.innerHTML = `
      <div class="chord-display-inline">
        <h2>Accord introuvable</h2>
        <span class="error-message">Cette combinaison n'existe pas</span>
      </div>
    `;
  } else {
    container.className = 'detected-chord';
    const notesFr = chord.notesFr.join(' · ');
    container.innerHTML = `
      <div class="chord-display-inline">
        <h2>${chord.notation} :</h2>
        <span class="chord-notes-inline">${notesFr}</span>
        <button class="play-chord-btn-inline" onclick="playChord()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Écouter
        </button>
      </div>
    `;
  }
}