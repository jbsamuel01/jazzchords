// keyboard.js - Composant clavier
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#'];

function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  
  // Conteneur des touches blanches
  const whiteKeysDiv = document.createElement('div');
  whiteKeysDiv.className = 'white-keys';
  
  // 22 touches blanches (F3 à F6)
  // F3, G3, A3, B3 (octave 3) puis C4-B4, C5-B5, C6-F6
  const startOctave = 3;
  const startNoteIndex = 3; // F = index 3 dans WHITE_KEYS ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const totalKeys = 22;
  
  for (let i = 0; i < totalKeys; i++) {
    const absoluteNoteIndex = startNoteIndex + i;
    const octave = startOctave + Math.floor(absoluteNoteIndex / 7);
    const noteIndex = absoluteNoteIndex % 7;
    const fullNote = WHITE_KEYS[noteIndex] + octave;
    
    const key = document.createElement('button');
    key.className = 'white-key';
    key.dataset.note = fullNote;
    key.onclick = () => window.playNote(fullNote);
    
    whiteKeysDiv.appendChild(key);
  }
  
  keyboard.appendChild(whiteKeysDiv);
  
  // Conteneur des touches noires
  const blackKeysDiv = document.createElement('div');
  blackKeysDiv.className = 'black-keys';
  
  for (let i = 0; i < totalKeys; i++) {
    const absoluteNoteIndex = startNoteIndex + i;
    const octave = startOctave + Math.floor(absoluteNoteIndex / 7);
    const noteIndex = absoluteNoteIndex % 7;
    const blackKey = BLACK_KEYS[noteIndex];
    
    const container = document.createElement('div');
    container.className = 'black-key-container';
    
    if (blackKey) {
      const fullNote = blackKey + octave;
      const key = document.createElement('button');
      key.className = 'black-key';
      key.dataset.note = fullNote;
      key.onclick = () => window.playNote(fullNote);
      container.appendChild(key);
    }
    
    blackKeysDiv.appendChild(container);
  }
  
  keyboard.appendChild(blackKeysDiv);
}

function updateKeyboardHighlight(playedNotes) {
  document.querySelectorAll('.white-key, .black-key').forEach(key => {
    const note = key.dataset.note;
    if (playedNotes.includes(note)) {
      key.classList.add('active');
    } else {
      key.classList.remove('active');
    }
  });
}
