// detector.js v2.4 - Détection des accords
// Correction v2.4 : PRIORITÉ ABSOLUE à la note la plus basse comme fondamentale
// Correction v2.3 : Normalisation enharmonique pour détecter correctement les accords mineurs

// Fonction pour normaliser les notes enharmoniques (A# = Bb = semitone 10)
function noteToSemitone(note) {
  const semitoneMap = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'E#': 5, 'F': 5,
    'F#': 6, 'Gb': 6,
    'G': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11
  };
  return semitoneMap[note] ?? -1;
}

// Fonction pour vérifier si deux notes sont enharmoniquement équivalentes
function areNotesEnharmonic(note1, note2) {
  return noteToSemitone(note1) === noteToSemitone(note2);
}

function detectChord(notes) {
  if (notes.length === 0) return null;

  // Extraction des notes sans octave, en gardant l'information d'octave pour le tri
  const notesWithOctave = notes.map(n => ({
    full: n,
    base: n.replace(/[0-9]/g, ''),
    octave: parseInt(n.match(/[0-9]/)?.[0] || '4')
  }));
  
  // Trier par octave puis par note (la note la plus basse en premier)
  notesWithOctave.sort((a, b) => {
    if (a.octave !== b.octave) return a.octave - b.octave;
    const noteOrder = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    return noteOrder.indexOf(a.base) - noteOrder.indexOf(b.base);
  });
  
  const lowestNote = notesWithOctave[0].base;
  const baseNotes = notesWithOctave.map(n => n.base);
  
  // Convertir les notes jouées en semitones pour comparaison enharmonique
  const playedSemitones = baseNotes.map(n => noteToSemitone(n)).sort((a, b) => a - b);
  
  // Fonction pour mapper les notes théoriques de l'accord aux notes jouées (avec leurs octaves réels)
  function mapChordToPlayedNotes(chord) {
    const mappedNotesWithOctave = chord.notesWithOctave.map(theoreticalNote => {
      // Chercher la note jouée qui correspond à cette note théorique
      // On compare via noteForKeyboard car c'est ce qui est utilisé pour le clavier
      const noteToMatch = theoreticalNote.noteForKeyboard || theoreticalNote.note;
      
      // Trouver la note jouée correspondante en utilisant la comparaison enharmonique
      const playedNote = notesWithOctave.find(pn => areNotesEnharmonic(pn.base, noteToMatch));
      
      if (playedNote) {
        // Calculer l'octave relatif en tenant compte de l'enharmonie
        // Si la note théorique est B# ou E# (qui se jouent comme C ou F),
        // il faut ajuster l'octave car B#4 = C5, E#4 = F5
        let adjustedOctave = playedNote.octave;
        
        // Si displayNote contient un # sur B ou E, c'est un cas enharmonique ascendant
        if ((theoreticalNote.displayNote.startsWith('B') && theoreticalNote.displayNote.includes('#')) ||
            (theoreticalNote.displayNote.startsWith('E') && theoreticalNote.displayNote.includes('#'))) {
          // B#4 se joue comme C5, donc si on joue C5, l'octave théorique est 4
          adjustedOctave = playedNote.octave - 1;
        }
        // Si displayNote contient un b sur C ou F, c'est un cas enharmonique descendant
        else if ((theoreticalNote.displayNote.startsWith('C') && theoreticalNote.displayNote.includes('b')) ||
                 (theoreticalNote.displayNote.startsWith('F') && theoreticalNote.displayNote.includes('b'))) {
          // Cb4 se joue comme B3, donc si on joue B3, l'octave théorique est 4
          adjustedOctave = playedNote.octave + 1;
        }
        
        // Utiliser l'octave réel ajusté de la note jouée (mais relatif à l'octave 4)
        return {
          ...theoreticalNote,
          octave: adjustedOctave - 4  // Convertir en octave relatif
        };
      }
      
      // Si pas trouvé, garder l'octave théorique
      return theoreticalNote;
    });
    
    return {
      ...chord,
      notesWithOctave: mappedNotesWithOctave
    };
  }
  
  // PRIORITÉ ABSOLUE : chercher d'abord les accords dont la fondamentale = note la plus basse
  const matchesWithLowestAsRoot = [];
  const matchesWithoutLowestAsRoot = [];
  
  for (const [name, chord] of Object.entries(ALL_CHORDS)) {
    const chordSemitones = chord.notes.map(n => noteToSemitone(n)).sort((a, b) => a - b);
    const chordNotes = chord.notes;
    
    // Extraire la fondamentale de l'accord
    const rootNote = name.match(/^[A-G][#b]?/)?.[0] || '';
    const hasLowestAsRoot = areNotesEnharmonic(rootNote, lowestNote);
    
    // Vérifier si toutes les notes jouées sont dans l'accord
    const allNotesMatch = baseNotes.every(playedNote => 
      chordNotes.some(chordNote => areNotesEnharmonic(playedNote, chordNote))
    );
    
    if (!allNotesMatch) continue;
    
    // Vérifier si c'est une correspondance exacte (même nombre de notes)
    const isExactMatch = chordSemitones.length === playedSemitones.length && 
                        chordSemitones.every((semitone, idx) => semitone === playedSemitones[idx]);
    
    // Calculer le score : nombre de notes manquantes (plus petit = mieux)
    const missingNotes = chordNotes.length - baseNotes.length;
    
    const matchData = {
      name,
      ...chord,
      rootNote,
      hasLowestAsRoot,
      isExactMatch,
      missingNotes,
      totalNotes: chordNotes.length
    };
    
    if (hasLowestAsRoot) {
      matchesWithLowestAsRoot.push(matchData);
    } else {
      matchesWithoutLowestAsRoot.push(matchData);
    }
  }
  
  // Fonction de tri : exactes d'abord, puis par nombre de notes manquantes, puis par nombre total de notes
  const sortMatches = (a, b) => {
    // 1. Correspondances exactes d'abord
    if (a.isExactMatch !== b.isExactMatch) {
      return a.isExactMatch ? -1 : 1;
    }
    // 2. Moins de notes manquantes = mieux
    if (a.missingNotes !== b.missingNotes) {
      return a.missingNotes - b.missingNotes;
    }
    // 3. Moins de notes au total = mieux (accord plus simple)
    return a.totalNotes - b.totalNotes;
  };
  
  // PRIORITÉ 1 : Accords avec la note la plus basse comme fondamentale
  if (matchesWithLowestAsRoot.length > 0) {
    matchesWithLowestAsRoot.sort(sortMatches);
    return mapChordToPlayedNotes(matchesWithLowestAsRoot[0]);
  }
  
  // PRIORITÉ 2 : Autres accords (seulement si aucun avec la basse comme fondamentale)
  if (matchesWithoutLowestAsRoot.length > 0) {
    matchesWithoutLowestAsRoot.sort(sortMatches);
    return mapChordToPlayedNotes(matchesWithoutLowestAsRoot[0]);
  }
  
  return { 
    name: 'Inconnu', 
    notes: baseNotes, 
    notesFr: baseNotes.map(n => NOTE_FR_SHARP[n] || n),
    nomFrancais: 'Accord non reconnu' 
  };
}
