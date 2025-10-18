// chords.js - Génération complète de tous les accords de jazz
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ROOT_NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALTERATIONS = ['#', 'b'];

// Qualités de base
const CHORD_QUALITIES = [
  { label: 'maj', value: '' },
  { label: 'min', value: 'm' },
  { label: '7', value: '7' },
  { label: 'maj7', value: 'maj7' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
  { label: 'ø7', value: 'm7b5' },
  { label: 'sus2', value: 'sus2' },
  { label: 'sus4', value: 'sus4' }
];

// Extensions simples
const SIMPLE_EXTENSIONS = ['6', '9', '11', '13'];

// Altérations d'extensions
const ALTERED_EXTENSIONS = ['b9', '#9', '#11', 'b13', 'alt'];

// Extensions combinées
const COMBINED_EXTENSIONS = ['6/9', 'add9'];

// Conversion notes vers français
const NOTE_FR = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 'G': 'Sol', 'G#': 'Sol#',
  'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 'B': 'Si'
};

function getIntervals(quality) {
  const intervals = {
    '': [0, 4, 7], // majeur
    'm': [0, 3, 7], // mineur
    'dim': [0, 3, 6], // diminué
    'aug': [0, 4, 8], // augmenté
    '7': [0, 4, 7, 10], // 7e dominante
    'maj7': [0, 4, 7, 11], // 7e majeure
    'm7': [0, 3, 7, 10], // 7e mineure
    'dim7': [0, 3, 6, 9], // 7e diminuée
    'm7b5': [0, 3, 6, 10], // semi-diminué
    'm(maj7)': [0, 3, 7, 11], // mineur-majeur
    '6': [0, 4, 7, 9], // sixte
    'm6': [0, 3, 7, 9], // sixte mineure
    'sus2': [0, 2, 7], // suspendu 2
    'sus4': [0, 5, 7], // suspendu 4
    '7sus4': [0, 5, 7, 10], // 7 suspendu 4
    'add9': [0, 4, 7, 14], // add9
    '6/9': [0, 4, 7, 9, 14], // 6/9
    'm6/9': [0, 3, 7, 9, 14], // 6/9 mineur
    '9': [0, 4, 7, 10, 14], // 9e
    'maj9': [0, 4, 7, 11, 14], // 9e majeure
    'm9': [0, 3, 7, 10, 14], // 9e mineure
    '11': [0, 4, 7, 10, 14, 17], // 11e
    'maj11': [0, 4, 7, 11, 14, 17], // 11e majeure
    'm11': [0, 3, 7, 10, 14, 17], // 11e mineure
    '13': [0, 4, 7, 10, 14, 21], // 13e
    'maj13': [0, 4, 7, 11, 14, 21], // 13e majeure
    'm13': [0, 3, 7, 10, 14, 21], // 13e mineure
    '7b9': [0, 4, 7, 10, 13], // 7b9
    '7#9': [0, 4, 7, 10, 15], // 7#9
    '7#11': [0, 4, 7, 10, 18], // 7#11
    '7b13': [0, 4, 7, 10, 20], // 7b13
    '7alt': [0, 4, 8, 10, 13], // 7 altéré (#5, b9)
    '7b9b13': [0, 4, 7, 10, 13, 20], // 7b9b13
    '7#9b13': [0, 4, 7, 10, 15, 20], // 7#9b13
    '7b9#11': [0, 4, 7, 10, 13, 18], // 7b9#11
    '7#9#11': [0, 4, 7, 10, 15, 18], // 7#9#11
    'maj7#11': [0, 4, 7, 11, 18], // maj7#11
    'm9b5': [0, 3, 6, 10, 14], // 9e semi-diminué
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
  
  // Liste de toutes les combinaisons possibles
  const allQualities = [
    '', 'm', 'dim', 'aug', '7', 'maj7', 'm7', 'dim7', 'm7b5', 'm(maj7)',
    '6', 'm6', 'sus2', 'sus4', '7sus4', 'add9', '6/9', 'm6/9',
    '9', 'maj9', 'm9', '11', 'maj11', 'm11', '13', 'maj13', 'm13',
    '7b9', '7#9', '7#11', '7b13', '7alt', '7b9b13', '7#9b13', '7b9#11', '7#9#11',
    'maj7#11', 'm9b5'
  ];
  
  ROOT_NOTES_NATURAL.forEach(rootNote => {
    [''].concat(ALTERATIONS).forEach(alt => {
      const fullRoot = rootNote + alt;
      
      // Éviter les notes impossibles
      if ((rootNote === 'E' && alt === '#') || 
          (rootNote === 'F' && alt === 'b') ||
          (rootNote === 'B' && alt === '#') ||
          (rootNote === 'C' && alt === 'b')) {
        return;
      }
      
      const rootIndex = getRootIndex(fullRoot);
      if (rootIndex === -1) return;
      
      const useFlats = alt === 'b';
      
      // Générer tous les accords pour cette note
      allQualities.forEach(quality => {
        const chordName = fullRoot + quality;
        const intervals = getIntervals(quality);
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${quality || 'majeur'}`,
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