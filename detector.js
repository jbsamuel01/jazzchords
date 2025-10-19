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
  
  // Recherche partielle
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