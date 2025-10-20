// chords.js - Génération de tous les accords
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ROOT_NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALTERATIONS = ['#', 'b'];
const MINOR_MARKERS = ['-', 'm']; // Pour ligne 1

// Qualités de base (ligne 2 - sans min qui est remonté ligne 1)
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

// Extensions (incluant 6/9 et add9)
const SIMPLE_EXTENSIONS = ['6', '9', '11', '13', '6/9', 'add9'];

// Altérations d'extensions ET de quintes
const ALTERED_EXTENSIONS = ['b5', '#5', 'b9', '#9', '#11', 'b13', 'alt'];

// Conversion notes vers français
const NOTE_FR = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 'G': 'Sol', 'G#': 'Sol#',
  'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 'B': 'Si'
};

// Alias pour detector.js et app.js
const NOTE_FR_SHARP = NOTE_FR;

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

function getNoteName(rootIndex, interval, useFlats) {
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  const totalSemitones = rootIndex + interval;
  const noteIndex = totalSemitones % 12;
  const octave = Math.floor(totalSemitones / 12);
  
  const noteName = useFlats ? flatNotes[noteIndex] : sharpNotes[noteIndex];
  const baseNote = sharpNotes[noteIndex];
  
  return { note: baseNote, displayNote: noteName, octave: octave };
}

function getRootIndex(rootNote) {
  const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let index = sharpNotes.indexOf(rootNote);
  if (index === -1) {
    index = flatNotes.indexOf(rootNote);
  }
  return index;
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
      
      const rootIndex = getRootIndex(fullRoot);
      if (rootIndex === -1) return;
      
      const useFlats = alt === 'b';
      
      // Accord majeur
      const majorIntervals = getIntervals('');
      const majorNotes = majorIntervals.map(interval => getNoteName(rootIndex, interval, useFlats));
      
      chords[fullRoot] = {
        notation: fullRoot,
        nomFrancais: `${fullRoot} majeur`,
        notes: majorNotes.map(n => n.note),
        notesFr: majorNotes.map(n => NOTE_FR[n.displayNote]),
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
        
        // Forcer les bémols si l'accord contient des altérations descendantes ou est mineur diminué
        const shouldUseFlats = useFlats || 
                               quality.includes('b') || 
                               quality.includes('dim') || 
                               quality.includes('ø') ||
                               quality === 'm' ||
                               quality === 'm7' ||
                               quality === 'm9' ||
                               quality === 'm11' ||
                               quality === 'm13' ||
                               quality === 'm6';
        
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, shouldUseFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${quality}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote]),
          notesWithOctave: notes
        };
      });
    });
  });
  
  return chords;
}

const ALL_CHORDS = generateAllChords();