// chords.js v2.3 - Génération de tous les accords
// Correction v2.3 : 
// - Ajout d'une propriété noteForKeyboard pour compatibilité avec le clavier
// - Correction du mapping de degré pour dim7 (Bbb au lieu de A)
// - Correction COMPLÈTE de l'octave pour gérer B# et E# correctement

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ROOT_NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALTERATIONS = ['#', 'b'];
const MINOR_MARKERS = ['-', 'm'];

// Qualités de base
const CHORD_QUALITIES = [
  { label: '7', value: '7' },
  { label: 'M7', value: 'maj7' },
  { label: 'maj7', value: 'maj7' },
  { label: '°', value: 'dim' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
  { label: 'm7b5', value: 'm7b5' },
  { label: 'ø7', value: 'ø7' },
  { label: 'dim7', value: 'dim7' },
  { label: 'sus2', value: 'sus2' },
  { label: 'sus4', value: 'sus4' }
];

const SIMPLE_EXTENSIONS = ['6', '9', '11', '13', '6/9', 'add9', 'add11', 'add13'];
const ALTERED_EXTENSIONS = ['b5', '#5', 'b9', '#9', '#11', 'b13'];

// Conversion notes vers français avec vrais symboles # et ♭
const NOTE_FR = {
  'C': 'Do', 'C#': 'Do♯', 'C##': 'Do𝄪', 'Cb': 'Do♭', 'Cbb': 'Do𝄫',
  'D': 'Ré', 'D#': 'Ré♯', 'D##': 'Ré𝄪', 'Db': 'Ré♭', 'Dbb': 'Ré𝄫',
  'E': 'Mi', 'E#': 'Mi♯', 'E##': 'Mi𝄪', 'Eb': 'Mi♭', 'Ebb': 'Mi𝄫',
  'F': 'Fa', 'F#': 'Fa♯', 'F##': 'Fa𝄪', 'Fb': 'Fa♭', 'Fbb': 'Fa𝄫',
  'G': 'Sol', 'G#': 'Sol♯', 'G##': 'Sol𝄪', 'Gb': 'Sol♭', 'Gbb': 'Sol𝄫',
  'A': 'La', 'A#': 'La♯', 'A##': 'La𝄪', 'Ab': 'La♭', 'Abb': 'La𝄫',
  'B': 'Si', 'B#': 'Si♯', 'B##': 'Si𝄪', 'Bb': 'Si♭', 'Bbb': 'Si𝄫'
};

const NOTE_FR_SHARP = NOTE_FR;

// Correspondance entre demi-tons et degrés
const DEGREE_INTERVALS = {
  0: 0,   // I (unisson)
  2: 1,   // II (seconde)
  4: 2,   // III (tierce majeure)
  3: 2,   // III (tierce mineure)
  5: 3,   // IV (quarte)
  7: 4,   // V (quinte juste)
  6: 4,   // V (quinte diminuée)
  8: 4,   // V (quinte augmentée)
  9: 5,   // VI (sixte) - MAIS pour dim7, c'est le degré VII
  11: 6,  // VII (septième majeure)
  10: 6,  // VII (septième mineure)
  14: 1,  // IX (neuvième = 2 + octave)
  13: 1,  // IX (neuvième bémol)
  15: 1,  // IX (neuvième dièse)
  16: 2,  // add9 mais contexte de tierce
  17: 3,  // XI (onzième = 4 + octave)
  18: 3,  // XI (onzième dièse)
  19: 4,  // add11 contexte
  21: 5,  // XIII (treizième = 6 + octave)
  20: 5   // XIII (treizième bémol)
};

// Mappings spéciaux pour certaines qualités d'accords
// Pour dim7, l'intervalle 9 doit être traité comme degré VII (septième diminuée = Bbb) et non VI (sixte = A)
const SPECIAL_DEGREE_MAPPINGS = {
  'dim7': {
    9: 6  // Pour dim7, l'intervalle 9 est une septième diminuée (degré VII, pas VI)
  }
};

function getIntervals(quality) {
  const intervals = {
    '': [0, 4, 7],
    'm': [0, 3, 7],
    'dim': [0, 3, 6],
    'ø7': [0, 3, 6, 10],
    'aug': [0, 4, 8],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
    'dim7': [0, 3, 6, 9],
    'm7b5': [0, 3, 6, 10],
    '6': [0, 4, 7, 9],
    'm6': [0, 3, 7, 9],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    '7sus4': [0, 5, 7, 10],
    'add9': [0, 4, 7, 14],
    'add11': [0, 4, 7, 17],
    'add13': [0, 4, 7, 21],
    '6/9': [0, 4, 7, 9, 14],
    'm6/9': [0, 3, 7, 9, 14],
    '9': [0, 4, 7, 10, 14],
    'maj9': [0, 4, 7, 11, 14],
    'm9': [0, 3, 7, 10, 14],
    '11': [0, 4, 7, 10, 14, 17],
    'maj11': [0, 4, 7, 11, 14, 17],
    'm11': [0, 3, 7, 10, 14, 17],
    '13': [0, 4, 7, 10, 14, 21],
    'maj13': [0, 4, 7, 11, 14, 21],
    'm13': [0, 3, 7, 10, 14, 21],
    '7b5': [0, 4, 6, 10],
    '7#5': [0, 4, 8, 10],
    '7b9': [0, 4, 7, 10, 13],
    '7#9': [0, 4, 7, 10, 15],
    '7#11': [0, 4, 7, 10, 18],
    '7b13': [0, 4, 7, 10, 20],
    '7b5b9': [0, 4, 6, 10, 13],
    '7#5b9': [0, 4, 8, 10, 13],
    '7b5#9': [0, 4, 6, 10, 15],
    '7#5#9': [0, 4, 8, 10, 15],
    '7b9b13': [0, 4, 7, 10, 13, 20],
    '7#9b13': [0, 4, 7, 10, 15, 20],
    '7b9#11': [0, 4, 7, 10, 13, 18],
    '7#9#11': [0, 4, 7, 10, 15, 18],
    'maj7#5': [0, 4, 8, 11],
    'maj7#11': [0, 4, 7, 11, 18],
    'm9b5': [0, 3, 6, 10, 14],
  };
  return intervals[quality] || [0, 4, 7];
}

// Obtenir le nom de la note naturelle à partir de la fondamentale
function getRootNoteLetter(rootNote) {
  return rootNote.charAt(0);
}

// Calculer le nom correct de la note selon le degré
function getNoteNameByDegree(rootNote, interval, quality = null) {
  const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const rootLetter = getRootNoteLetter(rootNote);
  const rootIndex = naturalNotes.indexOf(rootLetter);
  
  // Utiliser le mapping spécial si disponible pour cette qualité
  let degree = DEGREE_INTERVALS[interval];
  if (quality && SPECIAL_DEGREE_MAPPINGS[quality] && SPECIAL_DEGREE_MAPPINGS[quality][interval] !== undefined) {
    degree = SPECIAL_DEGREE_MAPPINGS[quality][interval];
  }
  
  if (degree === undefined) {
    console.warn(`Degré non défini pour l'intervalle ${interval}`);
    return null;
  }
  
  const targetLetterIndex = (rootIndex + degree) % 7;
  const targetLetter = naturalNotes[targetLetterIndex];
  
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let rootSemitone = sharpNotes.indexOf(rootNote);
  if (rootSemitone === -1) {
    rootSemitone = flatNotes.indexOf(rootNote);
  }
  
  const targetSemitone = (rootSemitone + interval) % 12;
  const targetNaturalSemitone = sharpNotes.indexOf(targetLetter);
  
  let alteration = targetSemitone - targetNaturalSemitone;
  
  if (alteration > 6) alteration -= 12;
  if (alteration < -6) alteration += 12;
  
  let noteName = targetLetter;
  if (alteration === 1) noteName += '#';
  else if (alteration === -1) noteName += 'b';
  else if (alteration === 2) noteName += '##';
  else if (alteration === -2) noteName += 'bb';
  
  return noteName;
}

// Fonction pour calculer la position chromatique réelle (en tenant compte des enharmoniques)
function getChromaticPosition(note, octave) {
  const baseNote = note.replace(/[#b]/g, '');
  const chromaticMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
  let position = chromaticMap[baseNote];
  
  if (note.includes('##')) position += 2;
  else if (note.includes('#')) position += 1;
  else if (note.includes('bb')) position -= 2;
  else if (note.includes('b')) position -= 1;
  
  // Normaliser la position (gérer les dépassements comme B# = C de l'octave suivante)
  if (position >= 12) {
    octave += Math.floor(position / 12);
    position = position % 12;
  } else if (position < 0) {
    const octavesDown = Math.ceil(-position / 12);
    octave -= octavesDown;
    position = (position + octavesDown * 12) % 12;
  }
  
  return octave * 12 + position;
}

// Fonction pour assurer que les notes sont en ordre ascendant SUR LA PORTÉE
// (aucune note ne doit "redescendre" par rapport à la précédente)
// CORRECTION v2.2 : utiliser la position chromatique réelle au lieu de la lettre seule
// CORRECTION v2.3 : recalculer noteForKeyboardOctave après ajustement de l'octave
function ensureAscendingOrder(notesWithOctave) {
  if (!notesWithOctave || notesWithOctave.length === 0) return notesWithOctave;
  
  const result = [notesWithOctave[0]]; // La première note reste inchangée
  
  for (let i = 1; i < notesWithOctave.length; i++) {
    const prevNote = result[i - 1];
    const currentNote = { ...notesWithOctave[i] };
    
    // Calculer les positions chromatiques réelles (en tenant compte des enharmoniques)
    const prevChromatic = getChromaticPosition(prevNote.displayNote, prevNote.octave);
    const currentChromatic = getChromaticPosition(currentNote.displayNote, currentNote.octave);
    
    // Si la note actuelle est <= à la précédente chromatiquement, la remonter
    if (currentChromatic <= prevChromatic) {
      // Remonter d'une octave à la fois jusqu'à ce que la note soit au-dessus
      while (getChromaticPosition(currentNote.displayNote, currentNote.octave) <= prevChromatic) {
        currentNote.octave += 1;
      }
      
      // CORRECTION v2.3 : Recalculer noteForKeyboardOctave après ajustement de l'octave
      const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const baseNote = currentNote.displayNote.replace(/[#b]/g, '');
      const naturalBaseSemitone = sharpNotes.indexOf(baseNote);
      let keyboardOctave = currentNote.octave;
      
      if (currentNote.displayNote.includes('##')) {
        if (naturalBaseSemitone + 2 >= 12) keyboardOctave += 1;
      } else if (currentNote.displayNote.includes('#')) {
        if (naturalBaseSemitone + 1 >= 12) keyboardOctave += 1;
      } else if (currentNote.displayNote.includes('bb')) {
        if (naturalBaseSemitone - 2 < 0) keyboardOctave -= 1;
      } else if (currentNote.displayNote.includes('b')) {
        if (naturalBaseSemitone - 1 < 0) keyboardOctave -= 1;
      }
      
      currentNote.noteForKeyboardOctave = keyboardOctave;
    }
    
    result.push(currentNote);
  }
  
  return result;
}

function getNoteName(rootNote, interval, quality = null) {
  const noteName = getNoteNameByDegree(rootNote, interval, quality);
  if (!noteName) return null;
  
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let rootIndex = sharpNotes.indexOf(rootNote);
  let useFlats = false;
  
  if (rootIndex === -1) {
    rootIndex = flatNotes.indexOf(rootNote);
    useFlats = true;
  }
  
  // CORRECTION v2.3: Calculer l'octave basé sur le degré, pas les demi-tons
  // L'octave ne change que si on dépasse le 7ème degré
  const degree = quality && SPECIAL_DEGREE_MAPPINGS[quality] && SPECIAL_DEGREE_MAPPINGS[quality][interval] !== undefined
    ? SPECIAL_DEGREE_MAPPINGS[quality][interval]
    : DEGREE_INTERVALS[interval];
  
  // Les degrés 0-6 sont dans la même octave que la fondamentale
  // Les degrés 7-13 sont dans l'octave suivante (extensions)
  const octave = Math.floor(interval / 12);  // Utiliser l'intervalle brut pour les extensions
  
  // Calculer la note en notation sharp et flat
  let baseNote = noteName.replace(/[#b]/g, '');
  let baseSemitone = sharpNotes.indexOf(baseNote);
  
  if (noteName.includes('##')) baseSemitone += 2;
  else if (noteName.includes('#')) baseSemitone += 1;
  else if (noteName.includes('bb')) baseSemitone -= 2;
  else if (noteName.includes('b')) baseSemitone -= 1;
  
  baseSemitone = ((baseSemitone % 12) + 12) % 12;
  
  const baseNoteSharp = sharpNotes[baseSemitone];
  const baseNoteFlat = flatNotes[baseSemitone];
  
  // Déterminer quelle notation utiliser (# ou b) en fonction de displayNote
  let finalNote;
  
  // CORRECTION v2.3: Pour les doubles altérations OU quand l'enharmonie change la lettre de base,
  // utiliser displayNote pour la portée car elle doit afficher l'enharmonie exacte
  // (G## pas A, E# pas F, B# pas C, Cb pas B, Fb pas E, Bbb pas A)
  const displayBaseLetter = noteName.charAt(0);
  const finalBaseLetter = baseNoteSharp.charAt(0);
  const enharmonyChangesLetter = displayBaseLetter !== finalBaseLetter;
  
  if (noteName.includes('##') || noteName.includes('bb') || enharmonyChangesLetter) {
    finalNote = noteName;  // Garder la forme théorique pour préserver l'enharmonie
  } else if (noteName.includes('b')) {
    finalNote = baseNoteFlat;
  } else if (noteName.includes('#')) {
    finalNote = baseNoteSharp;
  } else {
    // Note naturelle, utiliser la forme qui correspond au contexte
    finalNote = useFlats ? baseNoteFlat : baseNoteSharp;
  }
  
  // CORRECTION v2.3: Ajuster l'octave pour noteForKeyboard quand l'enharmonie change d'octave
  // Ex: B#4 = C5 sur le clavier, E#4 = F4 (pas de changement d'octave)
  let keyboardOctave = octave;
  const naturalBaseSemitone = sharpNotes.indexOf(baseNote);
  
  // Calculer si l'altération fait passer à l'octave suivante ou précédente
  if (noteName.includes('##')) {
    // Double dièse : si note naturelle + 2 >= 12, on passe à l'octave suivante
    if (naturalBaseSemitone + 2 >= 12) keyboardOctave += 1;
  } else if (noteName.includes('#')) {
    // Dièse simple : si note naturelle + 1 >= 12, on passe à l'octave suivante
    if (naturalBaseSemitone + 1 >= 12) keyboardOctave += 1;
  } else if (noteName.includes('bb')) {
    // Double bémol : si note naturelle - 2 < 0, on descend à l'octave précédente
    if (naturalBaseSemitone - 2 < 0) keyboardOctave -= 1;
  } else if (noteName.includes('b')) {
    // Bémol simple : si note naturelle - 1 < 0, on descend à l'octave précédente
    if (naturalBaseSemitone - 1 < 0) keyboardOctave -= 1;
  }
  
  return { 
    note: finalNote,           // Pour la portée (avec notation théorique exacte)
    noteForKeyboard: baseNoteSharp,  // v2.1 : toujours en sharp pour le clavier
    noteForKeyboardOctave: keyboardOctave,  // v2.3 : octave ajustée pour le clavier
    displayNote: noteName, 
    octave: octave 
  };
}

function generateAllChords() {
  const chords = {};
  
  ROOT_NOTES_NATURAL.forEach(rootNote => {
    [''].concat(ALTERATIONS).forEach(alt => {
      const fullRoot = rootNote + alt;
      
      // Exclure les tonalités non utilisées (enharmoniques redondantes)
      if ((rootNote === 'E' && alt === '#') ||  // Mi# = Fa
          (rootNote === 'F' && alt === 'b') ||  // Fab = Mi
          (rootNote === 'B' && alt === '#')) {  // Si# = Do
        return;
      }
      // Note : D# et A# sont conservés car D#m et A#m sont des tonalités valides
      
      // Vérifier si c'est Cb pour remonter d'une octave
      const isCb = (rootNote === 'C' && alt === 'b');
      
      // Ajouter l'accord majeur (sauf pour D# et A# qui n'existent pas en majeur)
      if (!((rootNote === 'D' && alt === '#') || (rootNote === 'A' && alt === '#'))) {
        const majorIntervals = getIntervals('');
        let majorNotes = majorIntervals.map(interval => {
          const note = getNoteName(fullRoot, interval, '');
          if (note && isCb) {
            return { ...note, octave: note.octave + 1 };
          }
          return note;
        }).filter(n => n !== null);
        
        // Assurer que les notes sont en ordre ascendant
        majorNotes = ensureAscendingOrder(majorNotes);
        
        chords[fullRoot] = {
          notation: fullRoot,
          nomFrancais: `${fullRoot} majeur`,
          notes: majorNotes.map(n => n.note),
          notesFr: majorNotes.map(n => NOTE_FR[n.displayNote] || n.displayNote),
          notesWithOctave: majorNotes
        };
      }
      
      // Toutes les qualités
      const allQualities = [
        'm', 'dim', 'ø7', 'aug', '7', 'maj7', 'm7', 'dim7', 'm7b5',
        '6', 'm6', 'sus2', 'sus4', '7sus4', 'add9', 'add11', 'add13', '6/9', 'm6/9',
        '9', 'maj9', 'm9', '11', 'maj11', 'm11', '13', 'maj13', 'm13',
        '7b5', '7#5', '7b9', '7#9', '7#11', '7b13',
        '7b5b9', '7#5b9', '7b5#9', '7#5#9',
        '7b9b13', '7#9b13', '7b9#11', '7#9#11',
        'maj7#5', 'maj7#11', 'm9b5'
      ];
      
      allQualities.forEach(quality => {
        const chordName = fullRoot + quality;
        const intervals = getIntervals(quality);
        let notes = intervals.map(interval => {
          const note = getNoteName(fullRoot, interval, quality);
          if (note && isCb) {
            return { ...note, octave: note.octave + 1 };
          }
          return note;
        }).filter(n => n !== null);
        
        // Assurer que les notes sont en ordre ascendant
        notes = ensureAscendingOrder(notes);
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${quality}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote] || n.displayNote),
          notesWithOctave: notes
        };
      });
    });
  });
  
  return chords;
}

const ALL_CHORDS = generateAllChords();
