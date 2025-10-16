// chords.js - Génération de tous les accords
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ROOT_NOTES_NATURAL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ALTERATIONS = ['#', 'b'];

const CHORD_QUALITIES = [
  { label: 'min', value: 'm' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
  { label: '7', value: '7' },
  { label: 'maj7', value: 'maj7' },
  { label: 'min7', value: 'm7' },
  { label: 'dim7', value: 'dim7' },
  { label: 'ø7', value: 'm7b5' }
];

const EXTENSIONS = [
  '9', '11', '13', 'b9', '#9', '#11', 'b13', 'sus2', 'sus4', '6', 'add9'
];

// Conversion notes vers français
const NOTE_FR = {
  'C': 'Do', 'C#': 'Do#', 'Db': 'Réb', 'D': 'Ré', 'D#': 'Ré#', 'Eb': 'Mib',
  'E': 'Mi', 'F': 'Fa', 'F#': 'Fa#', 'Gb': 'Solb', 'G': 'Sol', 'G#': 'Sol#',
  'Ab': 'Lab', 'A': 'La', 'A#': 'La#', 'Bb': 'Sib', 'B': 'Si'
};

function getIntervals(quality) {
  const intervals = {
    '': [0, 4, 7],
    'm': [0, 3, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
    'dim7': [0, 3, 6, 9],
    'm7b5': [0, 3, 6, 10],
    '6': [0, 4, 7, 9],
    'm6': [0, 3, 7, 9],
    '9': [0, 4, 7, 10, 14],
    'maj9': [0, 4, 7, 11, 14],
    'm9': [0, 3, 7, 10, 14],
    '11': [0, 4, 7, 10, 14, 17],
    'm11': [0, 3, 7, 10, 14, 17],
    '13': [0, 4, 7, 10, 14, 21],
    'm13': [0, 3, 7, 10, 14, 21],
    'sus2': [0, 2, 7],
    'sus4': [0, 5, 7],
    'add9': [0, 4, 7, 14],
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
  const baseNote = sharpNotes[noteIndex]; // Pour le stockage interne
  
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
      
      // Autres qualités
      CHORD_QUALITIES.forEach(quality => {
        const chordName = fullRoot + quality.value;
        const intervals = getIntervals(quality.value);
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${quality.label}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote]),
          notesWithOctave: notes
        };
      });
      
      // Accords 9, 11, 13
      ['9', '11', '13'].forEach(ext => {
        const chordName = fullRoot + ext;
        const intervals = getIntervals(ext);
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${ext}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote]),
          notesWithOctave: notes
        };
      });
      
      // Accords majeur 9, 11, 13
      ['maj9', 'maj11', 'maj13'].forEach(ext => {
        const chordName = fullRoot + ext;
        const baseExt = ext.replace('maj', '');
        const intervals = getIntervals(baseExt === '9' ? 'maj9' : baseExt === '11' ? '11' : '13');
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} majeur ${baseExt}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote]),
          notesWithOctave: notes
        };
      });
      
      // Accords mineur 9, 11, 13
      ['m9', 'm11', 'm13'].forEach(ext => {
        const chordName = fullRoot + ext;
        const intervals = getIntervals(ext);
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} mineur ${ext.replace('m', '')}`,
          notes: notes.map(n => n.note),
          notesFr: notes.map(n => NOTE_FR[n.displayNote]),
          notesWithOctave: notes
        };
      });
      
      // Accords 6
      const sixth = getNoteName(rootIndex, 9, useFlats);
      const majorBase = majorIntervals.slice(0, 3).map(interval => getNoteName(rootIndex, interval, useFlats));
      chords[fullRoot + '6'] = {
        notation: fullRoot + '6',
        nomFrancais: `${fullRoot} 6`,
        notes: [...majorBase.map(n => n.note), sixth.note],
        notesFr: [...majorBase.map(n => NOTE_FR[n.displayNote]), NOTE_FR[sixth.displayNote]],
        notesWithOctave: [...majorBase, sixth]
      };
      
      // Accords mineur 6
      const m6Intervals = [0, 3, 7, 9];
      const m6Notes = m6Intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
      chords[fullRoot + 'm6'] = {
        notation: fullRoot + 'm6',
        nomFrancais: `${fullRoot} mineur 6`,
        notes: m6Notes.map(n => n.note),
        notesFr: m6Notes.map(n => NOTE_FR[n.displayNote]),
        notesWithOctave: m6Notes
      };
      
      // Accords sus
      ['sus2', 'sus4'].forEach(sus => {
        const chordName = fullRoot + sus;
        const intervals = getIntervals(sus);
        const notes = intervals.map(interval => getNoteName(rootIndex, interval, useFlats));
        
        chords[chordName] = {
          notation: chordName,
          nomFrancais: `${fullRoot} ${sus}`,
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