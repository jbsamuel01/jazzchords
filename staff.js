// staff.js v2.1 - Dessin de la portée musicale
// Correction v2.1 : ajout des bécarres pour les notes naturelles quand nécessaire

function drawMusicalStaff(notes, rootNote = '') {
  const svg = document.getElementById('musicalStaff');
  if (!svg) return;
  
  // Vider le SVG
  svg.innerHTML = '';
  
  if (!notes || notes.length === 0) {
    return;
  }
  
  // Paramètres de la portée
  const staffY = 40;
  const lineSpacing = 10;
  const staffWidth = 160;
  
  // Dessiner les 5 lignes de la portée
  for (let i = 0; i < 5; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '10');
    line.setAttribute('y1', staffY + i * lineSpacing);
    line.setAttribute('x2', staffWidth);
    line.setAttribute('y2', staffY + i * lineSpacing);
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '1.5');
    svg.appendChild(line);
  }
  
  // Dessiner la clé de sol (centrée sur la 2ème ligne = Sol)
  drawTrebleClef(svg, 15, staffY + lineSpacing);
  
  // Déterminer l'armure basée sur la note fondamentale
  const keySignature = getKeySignature(rootNote);
  
  // Dessiner l'armure
  drawKeySignature(svg, 45, staffY, lineSpacing, keySignature);
  
  // Position X pour les notes (après l'armure)
  const noteX = 90;
  
  // Trier les notes de la plus haute à la plus basse
  const sortedNotes = [...notes].sort((a, b) => {
    const octaveA = parseInt(a.match(/[0-9]/)?.[0] || '4');
    const octaveB = parseInt(b.match(/[0-9]/)?.[0] || '4');
    const noteA = a.replace(/[0-9]/g, '');
    const noteB = b.replace(/[0-9]/g, '');
    
    if (octaveA !== octaveB) return octaveB - octaveA;
    
    const noteOrder = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
    return noteOrder.indexOf(noteB) - noteOrder.indexOf(noteA);
  });
  
  // Calculer toutes les positions Y
  const notePositions = sortedNotes.map(note => {
    const noteName = note.replace(/[0-9]/g, '');
    const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
    return {
      note: noteName,
      octave: octave,
      y: getNoteYPosition(noteName, octave, staffY, lineSpacing)
    };
  });
  
  // Dessiner toutes les notes verticalement (accord)
  notePositions.forEach(pos => {
    // Dessiner les lignes supplémentaires si nécessaire
    drawLedgerLines(svg, noteX, pos.y, staffY, lineSpacing);
    
    // CORRECTION v2.1 : Gérer les bécarres
    const baseNoteName = pos.note.replace(/#|b/g, '');
    const isNatural = !pos.note.includes('#') && !pos.note.includes('b');
    const hasSharp = pos.note.includes('#');
    const hasFlat = pos.note.includes('b');
    
    // Vérifier si la note naturelle est altérée à l'armure
    const naturalNoteInKey = isNoteLetterInKeySignature(baseNoteName, keySignature);
    
    if (isNatural && naturalNoteInKey) {
      // CORRECTION v2.1 : La note est naturelle mais elle est altérée à l'armure
      // Il faut dessiner un bécarre
      drawNatural(svg, noteX - 10, pos.y);
    } else if (!isInKeySignature(pos.note, keySignature)) {
      // La note a une altération accidentelle (pas à l'armure)
      if (hasSharp) {
        drawSharp(svg, noteX - 10, pos.y);
      } else if (hasFlat) {
        drawFlat(svg, noteX - 10, pos.y);
      }
    }
    
    // Dessiner la tête de note
    drawNoteHead(svg, noteX, pos.y);
  });
}

function getKeySignature(rootNote) {
  if (!rootNote) return { sharps: 0, flats: 0, notes: [] };
  
  const baseNote = rootNote.replace(/[0-9]/g, '');
  
  // Armures avec dièses (ordre: Fa Do Sol Ré La Mi Si)
  const sharpKeys = {
    'G': { sharps: 1, notes: ['F#'] },
    'D': { sharps: 2, notes: ['F#', 'C#'] },
    'A': { sharps: 3, notes: ['F#', 'C#', 'G#'] },
    'E': { sharps: 4, notes: ['F#', 'C#', 'G#', 'D#'] },
    'B': { sharps: 5, notes: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'F#': { sharps: 6, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'C#': { sharps: 7, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] }
  };
  
  // Armures avec bémols (ordre: Si Mi La Ré Sol Do Fa)
  const flatKeys = {
    'F': { flats: 1, notes: ['Bb'] },
    'Bb': { flats: 2, notes: ['Bb', 'Eb'] },
    'Eb': { flats: 3, notes: ['Bb', 'Eb', 'Ab'] },
    'Ab': { flats: 4, notes: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Db': { flats: 5, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Gb': { flats: 6, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
    'Cb': { flats: 7, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] }
  };
  
  if (sharpKeys[baseNote]) return sharpKeys[baseNote];
  if (flatKeys[baseNote]) return flatKeys[baseNote];
  
  return { sharps: 0, flats: 0, notes: [] };
}

function drawKeySignature(svg, x, staffY, lineSpacing, keySignature) {
  if (keySignature.sharps > 0) {
    // Positions exactes des dièses sur la portée en clé de sol
    // Ordre : FA♯ DO♯ SOL♯ RÉ♯ LA♯ MI♯ SI♯
    // staffY = ligne 5 (haut), staffY + 4*lineSpacing = ligne 1 (bas)
    const sharpPositions = [
      staffY + 0 * lineSpacing,     // FA# sur ligne 5 (Fa5)
      staffY + 1.5 * lineSpacing,   // DO# sur interligne 3 (Do5)
      staffY - 0.5 * lineSpacing,   // SOL# au-dessus ligne 5 (Sol5)
      staffY + 1 * lineSpacing,     // RÉ# sur ligne 4 (Ré5)
      staffY + 2.5 * lineSpacing,   // LA# sur interligne 2 (La4)
      staffY + 0.5 * lineSpacing,   // MI# sur interligne 4 (Mi5)
      staffY + 2 * lineSpacing      // SI# sur ligne 3 (Si4)
    ];
    
    for (let i = 0; i < keySignature.sharps; i++) {
      drawSharp(svg, x + i * 8, sharpPositions[i]);
    }
  } else if (keySignature.flats > 0) {
    // Positions exactes des bémols sur la portée en clé de sol
    // Ordre : SI♭ MI♭ LA♭ RÉ♭ SOL♭ DO♭ FA♭
    const flatPositions = [
      staffY + 2 * lineSpacing,     // SIb sur ligne 3 (Si4)
      staffY + 0.5 * lineSpacing,   // MIb sur interligne 4 (Mi5)
      staffY + 2.5 * lineSpacing,   // LAb sur interligne 2 (La4)
      staffY + 1 * lineSpacing,     // RÉb sur ligne 4 (Ré5)
      staffY + 3 * lineSpacing,     // SOLb sur ligne 2 (Sol4)
      staffY + 1.5 * lineSpacing,   // DOb sur interligne 3 (Do5)
      staffY + 4 * lineSpacing      // FAb sur ligne 1 (Fa4)
    ];
    
    for (let i = 0; i < keySignature.flats; i++) {
      drawFlat(svg, x + i * 8, flatPositions[i]);
    }
  }
}

function isInKeySignature(noteName, keySignature) {
  return keySignature.notes && keySignature.notes.includes(noteName);
}

// NOUVEAU v2.1 : fonction pour vérifier si la lettre de la note est dans l'armure
function isNoteLetterInKeySignature(noteLetter, keySignature) {
  if (!keySignature.notes) return false;
  
  // Vérifier si une version altérée de cette lettre est à l'armure
  for (const keyNote of keySignature.notes) {
    if (keyNote.charAt(0) === noteLetter) {
      return true;
    }
  }
  return false;
}

function getNoteYPosition(noteName, octave, staffY, lineSpacing) {
  // En clé de sol, la 2ème ligne = Sol4
  // staffY = ligne 5 (haut de la portée)
  // staffY + 4*lineSpacing = ligne 1 (bas de la portée)
  // 
  // LIGNES (de bas en haut):
  // Ligne 1 (staffY + 4*lineSpacing) = Mi4
  // Ligne 2 (staffY + 3*lineSpacing) = Sol4
  // Ligne 3 (staffY + 2*lineSpacing) = Si4
  // Ligne 4 (staffY + 1*lineSpacing) = Ré5
  // Ligne 5 (staffY + 0*lineSpacing) = Fa5
  //
  // INTERLIGNES (de bas en haut):
  // Interligne 1 (staffY + 3.5*lineSpacing) = Fa4
  // Interligne 2 (staffY + 2.5*lineSpacing) = La4
  // Interligne 3 (staffY + 1.5*lineSpacing) = Do5
  // Interligne 4 (staffY + 0.5*lineSpacing) = Mi5
  //
  // LIGNES SUPPLEMENTAIRES:
  // En dessous ligne 1:
  //   (staffY + 4.5*lineSpacing) = Ré4
  //   (staffY + 5*lineSpacing)   = Do4 (Do central)
  
  const baseNote = noteName.replace(/#|b/g, '');
  
  // Table de correspondance pour chaque note et octave
  const notePositions = {
    // Octave 3
    'C3': staffY + 9 * lineSpacing,
    'D3': staffY + 8.5 * lineSpacing,
    'E3': staffY + 8 * lineSpacing,
    'F3': staffY + 7.5 * lineSpacing,
    'G3': staffY + 7 * lineSpacing,
    'A3': staffY + 6.5 * lineSpacing,
    'B3': staffY + 6 * lineSpacing,
    
    // Octave 4 (Do central)
    'C4': staffY + 5 * lineSpacing,      // Do central - 1 ligne supplémentaire
    'D4': staffY + 4.5 * lineSpacing,    // Interligne sous la ligne 1
    'E4': staffY + 4 * lineSpacing,      // Ligne 1
    'F4': staffY + 3.5 * lineSpacing,    // Interligne 1
    'G4': staffY + 3 * lineSpacing,      // Ligne 2
    'A4': staffY + 2.5 * lineSpacing,    // Interligne 2
    'B4': staffY + 2 * lineSpacing,      // Ligne 3
    
    // Octave 5
    'C5': staffY + 1.5 * lineSpacing,    // Interligne 3
    'D5': staffY + 1 * lineSpacing,      // Ligne 4
    'E5': staffY + 0.5 * lineSpacing,    // Interligne 4
    'F5': staffY + 0 * lineSpacing,      // Ligne 5
    'G5': staffY - 0.5 * lineSpacing,    // Interligne au-dessus ligne 5
    'A5': staffY - 1 * lineSpacing,      // 1 ligne supplémentaire
    'B5': staffY - 1.5 * lineSpacing,    // Interligne
    
    // Octave 6
    'C6': staffY - 2 * lineSpacing,      // 2 lignes supplémentaires
    'D6': staffY - 2.5 * lineSpacing,
    'E6': staffY - 3 * lineSpacing,
    'F6': staffY - 3.5 * lineSpacing,
    'G6': staffY - 4 * lineSpacing,
    'A6': staffY - 4.5 * lineSpacing,
    'B6': staffY - 5 * lineSpacing,
  };
  
  const key = baseNote + octave;
  const position = notePositions[key];
  
  if (position === undefined) {
    console.warn(`Position non définie pour ${key}`);
    // Par défaut, retourner une position au milieu
    return staffY + 2 * lineSpacing;
  }
  
  return position;
}

function drawLedgerLines(svg, x, y, staffY, lineSpacing) {
  const topStaffLine = staffY;
  const bottomStaffLine = staffY + 4 * lineSpacing;
  
  // Lignes au-dessus de la portée
  if (y < topStaffLine) {
    for (let lineY = topStaffLine - lineSpacing; lineY >= y - lineSpacing/4; lineY -= lineSpacing) {
      const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ledgerLine.setAttribute('x1', x - 8);
      ledgerLine.setAttribute('y1', lineY);
      ledgerLine.setAttribute('x2', x + 8);
      ledgerLine.setAttribute('y2', lineY);
      ledgerLine.setAttribute('stroke', 'black');
      ledgerLine.setAttribute('stroke-width', '1.5');
      svg.appendChild(ledgerLine);
    }
  }
  
  // Lignes sous la portée
  if (y > bottomStaffLine) {
    for (let lineY = bottomStaffLine + lineSpacing; lineY <= y + lineSpacing/4; lineY += lineSpacing) {
      const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ledgerLine.setAttribute('x1', x - 8);
      ledgerLine.setAttribute('y1', lineY);
      ledgerLine.setAttribute('x2', x + 8);
      ledgerLine.setAttribute('y2', lineY);
      ledgerLine.setAttribute('stroke', 'black');
      ledgerLine.setAttribute('stroke-width', '1.5');
      svg.appendChild(ledgerLine);
    }
  }
}

function drawNoteHead(svg, x, y) {
  // Tête de note ronde (blanche pour un accord)
  const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  noteHead.setAttribute('cx', x);
  noteHead.setAttribute('cy', y);
  noteHead.setAttribute('rx', '5');
  noteHead.setAttribute('ry', '4');
  noteHead.setAttribute('fill', 'black');
  noteHead.setAttribute('transform', `rotate(-20 ${x} ${y})`);
  svg.appendChild(noteHead);
}

function drawSharp(svg, x, y) {
  const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sharp.setAttribute('x', x);
  sharp.setAttribute('y', y + 4);
  sharp.setAttribute('font-size', '16');
  sharp.setAttribute('fill', 'black');
  sharp.setAttribute('font-family', 'serif');
  sharp.setAttribute('font-weight', 'bold');
  sharp.textContent = '♯';
  svg.appendChild(sharp);
}

function drawFlat(svg, x, y) {
  const flat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  flat.setAttribute('x', x);
  flat.setAttribute('y', y + 4);
  flat.setAttribute('font-size', '16');
  flat.setAttribute('fill', 'black');
  flat.setAttribute('font-family', 'serif');
  flat.setAttribute('font-weight', 'bold');
  flat.textContent = '♭';
  svg.appendChild(flat);
}

// NOUVEAU v2.1 : Fonction pour dessiner un bécarre
function drawNatural(svg, x, y) {
  const natural = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  natural.setAttribute('x', x);
  natural.setAttribute('y', y + 4);
  natural.setAttribute('font-size', '16');
  natural.setAttribute('fill', 'black');
  natural.setAttribute('font-family', 'serif');
  natural.setAttribute('font-weight', 'bold');
  natural.textContent = '♮';
  svg.appendChild(natural);
}

function drawTrebleClef(svg, x, y) {
  // Clé de sol centrée sur la 2ème ligne (Sol)
  const clef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  clef.setAttribute('x', x);
  clef.setAttribute('y', y + 25);
  clef.setAttribute('font-size', '50');
  clef.setAttribute('fill', 'black');
  clef.setAttribute('font-family', 'serif');
  clef.textContent = '𝄞';
  svg.appendChild(clef);
}