// keyboard.js - Composant clavier
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#'];

function createKeyboard() {
  const keyboard = document.getElementById('keyboard');
  
  // Conteneur des touches blanches
  const whiteKeysDiv = document.createElement('div');
  whiteKeysDiv.className = 'white-keys';
  
  // 20 touches blanches (C4 à G6)
  for (let i = 0; i < 20; i++) {
    const octave = Math.floor(i / 7);
    const noteIndex = i % 7;
    const fullNote = WHITE_KEYS[noteIndex] + (4 + octave);
    
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
  
  for (let i = 0; i < 20; i++) {
    const octave = Math.floor(i / 7);
    const noteIndex = i % 7;
    const blackKey = BLACK_KEYS[noteIndex];
    
    const container = document.createElement('div');
    container.className = 'black-key-container';
    
    if (blackKey) {
      const fullNote = blackKey + (4 + octave);
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