// chords.js - Génération de tous les accords
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

const SIMPLE_EXTENSIONS = ['6', '9', '11', '13', '6/9', 'add9'];
const ALTERED_EXTENSIONS = ['b5', '#5', 'b9', '#9', '#11', 'b13', 'alt'];

// Conversion notes vers français
const NOTE_FR = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'E#': 'Mi#', 'Fb': 'Fab', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 
  'G': 'Sol', 'G#': 'Sol#', 'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 
  'B': 'Si', 'B#': 'Si#', 'Cb': 'Dob',
  'Abb': 'Labb', 'Bbb': 'Sibb', 'Cbb': 'Dobb', 'Dbb': 'Rébb', 'Ebb': 'Mibb', 
  'Fbb': 'Fabb', 'Gbb': 'Solbb'
};

const NOTE_FR_SHARP = NOTE_FR;

// Correspondance entre demi-tons et degrés (interval = nombre de demi-tons)
// degree = position dans la gamme (0=I, 1=II, 2=III, 3=IV, 4=V, 5=VI, 6=VII)
const DEGREE_INTERVALS = {
  0: 0,   // I (unisson)
  2: 1,   // II (seconde)
  4: 2,   // III (tierce majeure)
  3: 2,   // III (tierce mineure)
  5: 3,   // IV (quarte)
  7: 4,   // V (quinte juste)
  6: 4,   // V (quinte diminuée)
  8: 4,   // V (quinte augmentée)
  9: 5,   // VI (sixte)
  11: 6,  // VII (septième majeure)
  10: 6,  // VII (septième mineure)
  14: 1,  // IX (neuvième = 2 + octave)
  13: 1,  // IX (neuvième bémol)
  15: 1,  // IX (neuvième dièse)
  17: 3,  // XI (onzième = 4 + octave)
  18: 3,  // XI (onzième dièse)
  21: 5,  // XIII (treizième = 6 + octave)
  20: 5   // XIII (treizième bémol)
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
    '7alt': [0, 4, 8, 10, 13],
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
  // Enlever les altérations pour obtenir la lettre de base
  return rootNote.charAt(0);
}

// Calculer le nom correct de la note selon le degré
function getNoteNameByDegree(rootNote, interval) {
  const naturalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const rootLetter = getRootNoteLetter(rootNote);
  const rootIndex = naturalNotes.indexOf(rootLetter);
  
  // Trouver le degré correspondant à l'intervalle
  const degree = DEGREE_INTERVALS[interval];
  if (degree === undefined) {
    console.warn(`Degré non défini pour l'intervalle ${interval}`);
    return null;
  }
  
  // Calculer la lettre cible
  const targetLetterIndex = (rootIndex + degree) % 7;
  const targetLetter = naturalNotes[targetLetterIndex];
  
  // Calculer le nombre de demi-tons de la fondamentale
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let rootSemitone = sharpNotes.indexOf(rootNote);
  if (rootSemitone === -1) {
    rootSemitone = flatNotes.indexOf(rootNote);
  }
  
  // Note cible en demi-tons
  const targetSemitone = (rootSemitone + interval) % 12;
  
  // Note naturelle cible en demi-tons
  const targetNaturalSemitone = sharpNotes.indexOf(targetLetter);
  
  // Calculer l'altération nécessaire
  let alteration = targetSemitone - targetNaturalSemitone;
  
  // Gérer le passage de B à C (ou inversement)
  if (alteration > 6) alteration -= 12;
  if (alteration < -6) alteration += 12;
  
  // Construire le nom de la note
  let noteName = targetLetter;
  if (alteration === 1) noteName += '#';
  else if (alteration === -1) noteName += 'b';
  else if (alteration === 2) noteName += '##';
  else if (alteration === -2) noteName += 'bb';
  
  return noteName;
}

function getNoteName(rootNote, interval) {
  const noteName = getNoteNameByDegree(rootNote, interval);
  if (!noteName) return null;
  
  // Calculer l'octave
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let rootIndex = sharpNotes.indexOf(rootNote);
  if (rootIndex === -1) {
    rootIndex = flatNotes.indexOf(rootNote);
  }
  
  const totalSemitones = rootIndex + interval;
  const octave = Math.floor(totalSemitones / 12);
  
  // Trouver l'équivalent en notation sharp pour la note de base
  let baseNote = noteName.replace(/[#b]/g, '');
  let baseSemitone = sharpNotes.indexOf(baseNote);
  
  // Ajouter les altérations
  if (noteName.includes('##')) baseSemitone += 2;
  else if (noteName.includes('#')) baseSemitone += 1;
  else if (noteName.includes('bb')) baseSemitone -= 2;
  else if (noteName.includes('b')) baseSemitone -= 1;
  
  baseSemitone = ((baseSemitone % 12) + 12) % 12;
  const baseNoteSharp = sharpNotes[baseSemitone];
  
  return { 
    note: baseNoteSharp, 
    displayNote: noteName, 
    octave: octave 
  };
}

function generateAllChords() {
  const chords = {};
  
  ROOT_NOTES_NATURAL.forEach(rootNote => {
    [''].concat(ALTERATIONS).forEach(alt => {
      const fullRoot = rootNote + alt;
      
      if ((rootNote === 'E' && alt === '#') || 
          (rootNote === 'F' && alt === 'b') ||
          (rootNote === 'B' && alt === '#') ||
          (rootNote === 'C' && alt === 'b')) {
        return;
      }
      
      // Accord majeur
      const majorIntervals = getIntervals('');
      const majorNotes = majorIntervals.map(interval => getNoteName(fullRoot, interval)).filter(n => n !== null);
      
      chords[fullRoot] = {
        notation: fullRoot,
        nomFrancais: `${fullRoot} majeur`,
        notes: majorNotes.map(n => n.note),
        notesFr: majorNotes.map(n => NOTE_FR[n.displayNote] || n.displayNote),
        notesWithOctave: majorNotes
      };
      
      // Toutes les qualités
      const allQualities = [
        'm', 'dim', 'ø7', 'aug', '7', 'maj7', 'm7', 'dim7', 'm7b5',
        '6', 'm6', 'sus2', 'sus4', '7sus4', 'add9', '6/9', 'm6/9',
        '9', 'maj9', 'm9', '11', 'maj11', 'm11', '13', 'maj13', 'm13',
        '7b5', '7#5', '7b9', '7#9', '7#11', '7b13', '7alt',
        '7b5b9', '7#5b9', '7b5#9', '7#5#9',
        '7b9b13', '7#9b13', '7b9#11', '7#9#11',
        'maj7#5', 'maj7#11', 'm9b5'
      ];
      
      allQualities.forEach(quality => {
        const chordName = fullRoot + quality;
        const intervals = getIntervals(quality);
        const notes = intervals.map(interval => getNoteName(fullRoot, interval)).filter(n => n !== null);
        
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