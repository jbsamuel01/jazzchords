// staff.js v2.3 - Dessin de la portée musicale
// Corrections v2.2 : 
// Corrections v2.3 :
// - Ajout de Cbm et Gbm dans le mapping des armures
// - Compactage des notes pour voicing serrée (intervalle minimal)
// - Altérations décalées vers la gauche (-20 au lieu de -14)
// - Utilisation des vrais symboles Unicode pour double dièse (𝄪) et double bémol (𝄫)
// - Respect total de l'enharmonie (Cb reste Cb, pas Si)
// - Position des bémols ajustée et taille augmentée
// - Altérations accidentelles éloignées des notes
// - Accord éloigné de l'armure
// - Taille globale réduite
// - Décalage horizontal pour notes proches (secondes)

// Fonction pour convertir une note en semitone (0-11)
function noteToSemitone(noteName) {
  const semitoneMap = {
    'C': 0, 'B#': 0,
    'C#': 1, 'Db': 1,
    'D': 2, 'C##': 2,
    'D#': 3, 'Eb': 3,
    'E': 4, 'Fb': 4,
    'E#': 5, 'F': 5,
    'F#': 6, 'Gb': 6, 'E##': 6,
    'G': 7, 'F##': 7,
    'G#': 8, 'Ab': 8,
    'A': 9,
    'A#': 10, 'Bb': 10,
    'B': 11, 'Cb': 11,
    'Cbb': 10, 'Dbb': 0, 'Ebb': 2, 'Fbb': 3, 'Gbb': 4, 'Abb': 6, 'Bbb': 8
  };
  
  // Extraire la lettre et les altérations
  const baseLetter = noteName.charAt(0);
  const alterations = noteName.substring(1);
  
  // Construire la clé
  const key = baseLetter + alterations;
  
  if (semitoneMap[key] !== undefined) {
    return semitoneMap[key];
  }
  
  // Fallback : calculer manuellement
  const baseValues = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11};
  let semitone = baseValues[baseLetter] || 0;
  
  // Compter les dièses et bémols
  const sharps = (alterations.match(/#/g) || []).length;
  const flats = (alterations.match(/b/g) || []).length;
  
  semitone += sharps - flats;
  
  // Normaliser entre 0-11
  while (semitone < 0) semitone += 12;
  while (semitone >= 12) semitone -= 12;
  
  return semitone;
}

// Fonction pour compacter les notes dans la voicing la plus serrée (< 1 octave)
function compactNotes(notes) {
  if (!notes || notes.length === 0) return notes;
  
  // Extraire les infos de chaque note
  const notesInfo = notes.map((note, index) => {
    const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
    const noteName = note.replace(/[0-9]/g, '');
    const semitone = noteToSemitone(noteName);
    
    return {
      original: note,
      noteName: noteName,
      octave: octave,
      semitone: semitone,
      absolutePitch: octave * 12 + semitone,
      originalIndex: index
    };
  });
  
  // Trouver la note la plus basse (qui sera la basse)
  const lowestNote = notesInfo.reduce((lowest, current) => 
    current.absolutePitch < lowest.absolutePitch ? current : lowest
  );
  
  // Reconstruire les notes dans l'ordre original, mais en ajustant les octaves
  // pour qu'elles soient toutes au-dessus de la basse
  const result = [];
  let bassAbsolutePitch = lowestNote.absolutePitch;
  
  for (let i = 0; i < notesInfo.length; i++) {
    const current = notesInfo[i];
    
    if (current.originalIndex === lowestNote.originalIndex) {
      // C'est la basse, on la garde telle quelle
      result.push(current.original);
    } else {
      // Pour les autres notes, les placer dans l'octave la plus proche au-dessus de la basse
      const currentSemitone = current.semitone;
      
      // Calculer la position cible : dans la même octave que la basse ou l'octave suivante
      let candidatePitch = Math.floor(bassAbsolutePitch / 12) * 12 + currentSemitone;
      
      // Si c'est en dessous de la basse, monter d'une octave
      if (candidatePitch < bassAbsolutePitch) {
        candidatePitch += 12;
      }
      
      const newOctave = Math.floor(candidatePitch / 12);
      result.push(current.noteName + newOctave);
    }
  }
  
  return result;
}

function drawMusicalStaff(notes, chordNotation = '') {
  const svg = document.getElementById('musicalStaff');
  if (!svg) return;
  
  // Vider le SVG
  svg.innerHTML = '';
  
  if (!notes || notes.length === 0) {
    return;
  }
  
  // Compacter les notes dans la voicing la plus serrée
  notes = compactNotes(notes);
  
  // Paramètres de la portée (optimisés pour réduire l'espace inutile)
  const staffY = 25;
  const lineSpacing = 7;
  const staffWidth = 95; // Réduit de 120 à 95 pour éliminer l'espace blanc à droite
  
  // Dessiner les 5 lignes de la portée
  for (let i = 0; i < 5; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '5');
    line.setAttribute('y1', staffY + i * lineSpacing);
    line.setAttribute('x2', staffWidth);
    line.setAttribute('y2', staffY + i * lineSpacing);
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '1.5');
    svg.appendChild(line);
  }
  
  // Dessiner la clé de sol (encore plus petite)
  drawTrebleClef(svg, 8, staffY + lineSpacing);
  
  // Déterminer l'armure basée sur la notation complète de l'accord
  const keySignature = getKeySignature(chordNotation);
  
  // Dessiner l'armure (espacement réduit)
  const armatureStartX = 30;
  drawKeySignature(svg, armatureStartX, staffY, lineSpacing, keySignature);
  
  // Position X pour les notes (après l'armure, bien espacé)
  // Si pas d'altérations, partir d'une position minimum après la clé
  const armatureWidth = Math.max(keySignature.sharps, keySignature.flats) * 5;
  const minPositionAfterClef = 48; // Position minimum après la clé de sol
  const calculatedPosition = armatureStartX + armatureWidth + 26; // Augmenté de 20 à 26 pour plus d'espace
  const noteX = Math.max(minPositionAfterClef, calculatedPosition);
  
  // Trier les notes de la plus haute à la plus basse
  const sortedNotes = [...notes].sort((a, b) => {
    const octaveA = parseInt(a.match(/[0-9]/)?.[0] || '4');
    const octaveB = parseInt(b.match(/[0-9]/)?.[0] || '4');
    const noteA = a.replace(/[0-9]/g, '');
    const noteB = b.replace(/[0-9]/g, '');
    
    // Calculer les pitchs absolus pour un tri correct
    const pitchA = octaveA * 12 + noteToSemitone(noteA);
    const pitchB = octaveB * 12 + noteToSemitone(noteB);
    
    return pitchB - pitchA; // Plus haute en premier
  });
  
  // Calculer toutes les positions Y
  const notePositions = sortedNotes.map(note => {
    const noteName = note.replace(/[0-9]/g, '');
    const octave = parseInt(note.match(/[0-9]/)?.[0] || '4');
    return {
      note: noteName,
      fullNote: note,
      octave: octave,
      y: getNoteYPosition(noteName, octave, staffY, lineSpacing)
    };
  });
  
  // Détecter les notes proches (secondes) pour décalage horizontal
  const noteShifts = [];
  for (let i = 0; i < notePositions.length; i++) {
    let shift = 0;
    if (i > 0) {
      const prevY = notePositions[i - 1].y;
      const currentY = notePositions[i].y;
      const distance = Math.abs(prevY - currentY);
      
      // Si les notes sont à une seconde (distance = lineSpacing/2)
      if (distance <= lineSpacing * 0.6) {
        shift = -8; // Décaler la note du bas vers la gauche
      }
    }
    noteShifts.push(shift);
  }
  
  // Dessiner toutes les notes verticalement (accord)
  notePositions.forEach((pos, idx) => {
    const xPos = noteX + noteShifts[idx];
    
    // Dessiner les lignes supplémentaires si nécessaire (avec décalage si besoin)
    drawLedgerLines(svg, noteX, pos.y, staffY, lineSpacing, noteShifts[idx]);
    
    // Gérer les altérations accidentelles (simples et doubles)
    const baseNoteName = pos.note.replace(/#|b/g, '');
    const isNatural = !pos.note.includes('#') && !pos.note.includes('b');
    const hasDoubleSharp = pos.note.includes('##');
    const hasDoubleFlat = pos.note.includes('bb');
    const hasSharp = pos.note.includes('#') && !hasDoubleSharp;
    const hasFlat = pos.note.includes('b') && !hasDoubleFlat;
    
    // Vérifier si la note naturelle est altérée à l'armure
    const naturalNoteInKey = isNoteLetterInKeySignature(baseNoteName, keySignature);
    
    if (isNatural && naturalNoteInKey) {
      // La note est naturelle mais elle est altérée à l'armure
      // Il faut dessiner un bécarre
      drawNatural(svg, xPos - 15, pos.y);
    } else if (!isInKeySignature(pos.note, keySignature)) {
      // La note a une altération accidentelle (pas à l'armure)
      if (hasDoubleSharp) {
        // Dessiner le symbole double dièse
        drawDoubleSharp(svg, xPos - 15, pos.y);
      } else if (hasDoubleFlat) {
        // Dessiner le symbole double bémol
        drawDoubleFlat(svg, xPos - 15, pos.y);
      } else if (hasSharp) {
        drawSharp(svg, xPos - 15, pos.y);
      } else if (hasFlat) {
        drawFlat(svg, xPos - 15, pos.y);
      }
    }
    
    // Dessiner la tête de note
    drawNoteHead(svg, xPos, pos.y);
  });
}

function getKeySignature(chordNotation) {
  if (!chordNotation) return { sharps: 0, flats: 0, notes: [] };
  
  // Extraire la note fondamentale
  const baseNote = chordNotation.match(/^[A-G][#b]?/)?.[0] || '';
  if (!baseNote) return { sharps: 0, flats: 0, notes: [] };
  
  // Détecter si c'est une tonalité mineure
  const quality = chordNotation.substring(baseNote.length);
  let isMinor = false;
  
  if (quality) {
    // C'est mineur si on a m, -, dim, ø SANS maj/M7/M
    if (quality.match(/^(-|m(?!aj)|dim|ø)/)) {
      isMinor = true;
    }
  }
  
  // Dictionnaire complet des armures pour TOUTES les tonalités MAJEURES
  const keySignatures = {
    // MAJEURES avec dièses (ordre: Fa Do Sol Ré La Mi Si)
    'G': { sharps: 1, flats: 0, notes: ['F#'] },
    'D': { sharps: 2, flats: 0, notes: ['F#', 'C#'] },
    'A': { sharps: 3, flats: 0, notes: ['F#', 'C#', 'G#'] },
    'E': { sharps: 4, flats: 0, notes: ['F#', 'C#', 'G#', 'D#'] },
    'B': { sharps: 5, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    'F#': { sharps: 6, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#'] },
    'C#': { sharps: 7, flats: 0, notes: ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'] },
    
    // MAJEURES avec bémols (ordre: Si Mi La Ré Sol Do Fa)
    'F': { sharps: 0, flats: 1, notes: ['Bb'] },
    'Bb': { sharps: 0, flats: 2, notes: ['Bb', 'Eb'] },
    'Eb': { sharps: 0, flats: 3, notes: ['Bb', 'Eb', 'Ab'] },
    'Ab': { sharps: 0, flats: 4, notes: ['Bb', 'Eb', 'Ab', 'Db'] },
    'Db': { sharps: 0, flats: 5, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb'] },
    'Gb': { sharps: 0, flats: 6, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] },
    'Cb': { sharps: 0, flats: 7, notes: ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'] },
    
    // MAJEURES sans altération
    'C': { sharps: 0, flats: 0, notes: [] }
  };
  
  // Mapping CORRECT des tonalités mineures vers leur relative majeure
  // Une tonalité mineure a la MÊME armure que sa relative majeure (3 demi-tons au-dessus)
  const minorToRelativeMajor = {
    // Mineures naturelles (sans altération à la fondamentale)
    'A': 'C',    // Am -> C majeur (0 altérations)
    'E': 'G',    // Em -> G majeur (1 #)
    'B': 'D',    // Bm -> D majeur (2 #)
    'D': 'F',    // Dm -> F majeur (1 b)
    'G': 'Bb',   // Gm -> Bb majeur (2 b)
    'C': 'Eb',   // Cm -> Eb majeur (3 b) ← CORRECTION PRINCIPALE
    'F': 'Ab',   // Fm -> Ab majeur (4 b)
    
    // Mineures avec dièse
    'F#': 'A',   // F#m -> A majeur (3 #)
    'C#': 'E',   // C#m -> E majeur (4 #)
    'G#': 'B',   // G#m -> B majeur (5 #)
    'D#': 'F#',  // D#m -> F# majeur (6 #)
    'A#': 'C#',  // A#m -> C# majeur (7 #)
    
    // Mineures avec bémol
    'Db': 'Db',  // Dbm -> Db majeur (5 b) - utilise armure homonyme ✓ AJOUTÉ
    'Bb': 'Db',  // Bbm -> Db majeur (5 b)
    'Eb': 'Gb',  // Ebm -> Gb majeur (6 b)
    'Ab': 'Cb',  // Abm -> Cb majeur (7 b)
    'Cb': 'Cb',  // Cbm -> Cb majeur (7 b) - utilise armure homonyme
    'Gb': 'Cb',  // Gbm -> Cb majeur (7 b) - correction pour afficher l'armure
    
    // Cas rares/enharmoniques
    'E#': 'G#',  // E#m -> G# majeur (rare)
    'B#': 'D#'   // B#m -> D# majeur (très rare)
  };
  
  // Déterminer la tonalité à utiliser pour l'armure
  let keyForArmure = baseNote;
  
  if (isMinor) {
    // Trouver la relative majeure
    const relativeMajor = minorToRelativeMajor[baseNote];
    if (relativeMajor) {
      keyForArmure = relativeMajor;
    } else {
      // Si la tonalité mineure n'est pas reconnue, pas d'armure
      console.warn(`Tonalité mineure non reconnue: ${baseNote}m`);
      return { sharps: 0, flats: 0, notes: [] };
    }
  }
  
  // Retourner l'armure de la tonalité
  const signature = keySignatures[keyForArmure];
  if (signature) {
    return signature;
  }
  
  // Si la tonalité n'est pas trouvée, pas d'armure
  console.warn(`Tonalité non reconnue: ${keyForArmure}`);
  return { sharps: 0, flats: 0, notes: [] };
}

function drawKeySignature(svg, x, staffY, lineSpacing, keySignature) {
  if (keySignature.sharps > 0) {
    // Positions exactes des dièses sur la portée en clé de sol
    const sharpPositions = [
      staffY + 0 * lineSpacing,     // FA#
      staffY + 1.5 * lineSpacing,   // DO#
      staffY - 0.5 * lineSpacing,   // SOL#
      staffY + 1 * lineSpacing,     // RÉ#
      staffY + 2.5 * lineSpacing,   // LA#
      staffY + 0.5 * lineSpacing,   // MI#
      staffY + 2 * lineSpacing      // SI#
    ];
    
    for (let i = 0; i < keySignature.sharps; i++) {
      drawSharp(svg, x + i * 5, sharpPositions[i]);
    }
  } else if (keySignature.flats > 0) {
    // Positions exactes des bémols sur la portée en clé de sol
    const flatPositions = [
      staffY + 2 * lineSpacing,     // SIb
      staffY + 0.5 * lineSpacing,   // MIb
      staffY + 2.5 * lineSpacing,   // LAb
      staffY + 1 * lineSpacing,     // RÉb
      staffY + 3 * lineSpacing,     // SOLb
      staffY + 1.5 * lineSpacing,   // DOb
      staffY + 4 * lineSpacing      // FAb
    ];
    
    for (let i = 0; i < keySignature.flats; i++) {
      drawFlat(svg, x + i * 5, flatPositions[i]);
    }
  }
}

function isInKeySignature(noteName, keySignature) {
  return keySignature.notes && keySignature.notes.includes(noteName);
}

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
  // Extraire la lettre de base (C, D, E, F, G, A, B)
  const baseLetter = noteName.charAt(0);
  
  // Calculer la position pour la lettre de base
  const notePositions = {
    // Octave 3
    'C3': staffY + 9 * lineSpacing,
    'D3': staffY + 8.5 * lineSpacing,
    'E3': staffY + 8 * lineSpacing,
    'F3': staffY + 7.5 * lineSpacing,
    'G3': staffY + 7 * lineSpacing,
    'A3': staffY + 6.5 * lineSpacing,
    'B3': staffY + 6 * lineSpacing,
    
    // Octave 4
    'C4': staffY + 5 * lineSpacing,
    'D4': staffY + 4.5 * lineSpacing,
    'E4': staffY + 4 * lineSpacing,
    'F4': staffY + 3.5 * lineSpacing,
    'G4': staffY + 3 * lineSpacing,
    'A4': staffY + 2.5 * lineSpacing,
    'B4': staffY + 2 * lineSpacing,
    
    // Octave 5
    'C5': staffY + 1.5 * lineSpacing,
    'D5': staffY + 1 * lineSpacing,
    'E5': staffY + 0.5 * lineSpacing,
    'F5': staffY + 0 * lineSpacing,
    'G5': staffY - 0.5 * lineSpacing,
    'A5': staffY - 1 * lineSpacing,
    'B5': staffY - 1.5 * lineSpacing,
    
    // Octave 6
    'C6': staffY - 2 * lineSpacing,
    'D6': staffY - 2.5 * lineSpacing,
    'E6': staffY - 3 * lineSpacing,
    'F6': staffY - 3.5 * lineSpacing,
    'G6': staffY - 4 * lineSpacing,
    'A6': staffY - 4.5 * lineSpacing,
    'B6': staffY - 5 * lineSpacing,
  };
  
  const key = baseLetter + octave;
  const position = notePositions[key];
  
  if (position === undefined) {
    console.warn(`Position non définie pour ${key}`);
    return staffY + 2 * lineSpacing;
  }
  
  return position;
}

function drawLedgerLines(svg, x, y, staffY, lineSpacing, shift = 0) {
  const topStaffLine = staffY;
  const bottomStaffLine = staffY + 4 * lineSpacing;
  
  // Si la note est décalée à gauche, étendre la ligne vers la gauche
  const leftExtension = shift < 0 ? Math.abs(shift) : 0;
  
  // Lignes au-dessus de la portée
  if (y < topStaffLine) {
    for (let lineY = topStaffLine - lineSpacing; lineY >= y - lineSpacing/4; lineY -= lineSpacing) {
      const ledgerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ledgerLine.setAttribute('x1', x - 7 - leftExtension);
      ledgerLine.setAttribute('y1', lineY);
      ledgerLine.setAttribute('x2', x + 7);
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
      ledgerLine.setAttribute('x1', x - 7 - leftExtension);
      ledgerLine.setAttribute('y1', lineY);
      ledgerLine.setAttribute('x2', x + 7);
      ledgerLine.setAttribute('y2', lineY);
      ledgerLine.setAttribute('stroke', 'black');
      ledgerLine.setAttribute('stroke-width', '1.5');
      svg.appendChild(ledgerLine);
    }
  }
}

function drawNoteHead(svg, x, y) {
  // Tête de note ronde (diamètre = une interligne = 7)
  const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  noteHead.setAttribute('cx', x);
  noteHead.setAttribute('cy', y);
  noteHead.setAttribute('rx', '4.5'); // Augmenté de 4.5 à 5.5
  noteHead.setAttribute('ry', '3.5'); // Augmenté de 3.5 à 4.2
  noteHead.setAttribute('fill', 'black');
  noteHead.setAttribute('transform', `rotate(-20 ${x} ${y})`);
  svg.appendChild(noteHead);
}

function drawSharp(svg, x, y) {
  const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sharp.setAttribute('x', x);
  sharp.setAttribute('y', y + 5); // Redescendu de 3 à 5
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
  flat.setAttribute('y', y + 4); // Redescendu de 1 à 4
  flat.setAttribute('font-size', '20');
  flat.setAttribute('fill', 'black');
  flat.setAttribute('font-family', 'serif');
  flat.setAttribute('font-weight', 'bold');
  flat.textContent = '♭';
  svg.appendChild(flat);
}

function drawNatural(svg, x, y) {
  const natural = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  natural.setAttribute('x', x);
  natural.setAttribute('y', y + 5); // Redescendu de 3 à 5
  natural.setAttribute('font-size', '16');
  natural.setAttribute('fill', 'black');
  natural.setAttribute('font-family', 'serif');
  natural.setAttribute('font-weight', 'bold');
  natural.textContent = '♮';
  svg.appendChild(natural);
}

function drawTrebleClef(svg, x, y) {
  // Clé de sol encore plus petite
  const clef = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  clef.setAttribute('x', x);
  clef.setAttribute('y', y + 18);
  clef.setAttribute('font-size', '32'); // Réduit de 38 à 32
  clef.setAttribute('fill', 'black');
  clef.setAttribute('font-family', 'serif');
  clef.textContent = '𝄞';
  svg.appendChild(clef);
}
function drawDoubleSharp(svg, x, y) {
  const doubleSharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  doubleSharp.setAttribute('x', x);
  doubleSharp.setAttribute('y', y + 5);
  doubleSharp.setAttribute('font-size', '18');
  doubleSharp.setAttribute('fill', 'black');
  doubleSharp.setAttribute('font-family', 'serif');
  doubleSharp.setAttribute('font-weight', 'bold');
  doubleSharp.textContent = '𝄪'; // Symbole Unicode pour double dièse U+1D12A
  svg.appendChild(doubleSharp);
}

function drawDoubleFlat(svg, x, y) {
  const doubleFlat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  doubleFlat.setAttribute('x', x);
  doubleFlat.setAttribute('y', y + 4);
  doubleFlat.setAttribute('font-size', '20');
  doubleFlat.setAttribute('fill', 'black');
  doubleFlat.setAttribute('font-family', 'serif');
  doubleFlat.setAttribute('font-weight', 'bold');
  doubleFlat.textContent = '𝄫'; // Symbole Unicode pour double bémol U+1D12B
  svg.appendChild(doubleFlat);
}