// ui.js - Gestion de l'interface utilisateur

function initializeUI() {
  // Notes A-G
  const rootNotesDiv = document.getElementById('rootNotes');
  const orderedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  orderedNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'mini-key mini-key-root';
    btn.textContent = note;
    btn.onclick = () => selectRootNote(note);
    rootNotesDiv.appendChild(btn);
  });

  // Altérations # b (ligne 1)
  const alterationsDiv = document.getElementById('alterations');
  
  [{ label: '♯', value: '#' }, { label: '♭', value: 'b' }].forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key mini-key-alteration';
    btn.textContent = alt.label;
    btn.dataset.value = alt.value;
    btn.dataset.type = 'alteration';
    btn.onclick = () => selectAlteration(alt.value);
    alterationsDiv.appendChild(btn);
  });

  // NOUVELLE LIGNE 2 : Mineur, Diminué, Augmenté, Sus2, Sus4, Add2, Add4 (mutuellement exclusifs)
  const baseQualitiesDiv = document.getElementById('baseQualities');
  
  // Groupe -/m(in) (superposés)
  const minorContainer = document.createElement('div');
  minorContainer.className = 'btn-stack-group';
  [{ label: '-', value: 'm' }, { label: 'm(in)', value: 'm' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key stacked';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'base-quality';
    btn.onclick = () => selectBaseQuality('m');
    minorContainer.appendChild(btn);
  });
  baseQualitiesDiv.appendChild(minorContainer);
  
  // Groupe °/dim (superposés)
  const dimContainer = document.createElement('div');
  dimContainer.className = 'btn-stack-group';
  [{ label: '°', value: 'dim' }, { label: 'dim', value: 'dim' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key stacked';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'base-quality';
    btn.onclick = () => selectBaseQuality('dim');
    dimContainer.appendChild(btn);
  });
  baseQualitiesDiv.appendChild(dimContainer);
  
  // Groupe +/aug (superposés)
  const augContainer = document.createElement('div');
  augContainer.className = 'btn-stack-group';
  [{ label: '+', value: 'aug' }, { label: 'aug', value: 'aug' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key stacked';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'base-quality';
    btn.onclick = () => selectBaseQuality('aug');
    augContainer.appendChild(btn);
  });
  baseQualitiesDiv.appendChild(augContainer);
  
  // Sus2 et Sus4 (boutons simples, plus petits)
  [{ label: 'sus2', value: 'sus2' }, { label: 'sus4', value: 'sus4' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key mini-key-sus';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'base-quality';
    btn.onclick = () => selectBaseQuality(item.value);
    baseQualitiesDiv.appendChild(btn);
  });
  
  // Add2 et Add4 (boutons simples, même taille que sus, mais traités comme extensions)
  [{ label: 'add2', value: 'add2' }, { label: 'add4', value: 'add4' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key mini-key-sus';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'simple-extension';
    btn.onclick = () => selectSimpleExtension(item.value);
    baseQualitiesDiv.appendChild(btn);
  });

  // Qualités (LIGNE 3 maintenant) : 7, -7/m(in)7, °7/dim7, ø7/m7b5, [M7 Δ / maj7], [M7#5/maj7#5 + +M7/+maj7]
  const qualitiesDiv = document.getElementById('qualities');
  
  const qualityGroups = [
    [{ label: '7', value: '7' }],
    [{ label: '-7', value: 'm7' }, { label: 'm(in)7', value: 'm7' }],
    [{ label: '°7', value: 'dim7' }, { label: 'dim7', value: 'dim7' }],
    [{ label: 'ø7', value: 'm7b5' }, { label: 'm7♭5', value: 'm7b5' }]
  ];
  
  qualityGroups.forEach((group) => {
    if (group.length > 1) {
      const container = document.createElement('div');
      container.className = 'btn-stack-group';
      
      group.forEach(quality => {
        const btn = document.createElement('button');
        btn.className = 'mini-key stacked';
        btn.textContent = quality.label;
        btn.dataset.value = quality.value;
        btn.onclick = () => selectQuality(quality.value);
        container.appendChild(btn);
      });
      
      qualitiesDiv.appendChild(container);
    } else {
      const btn = document.createElement('button');
      btn.className = 'mini-key';
      btn.textContent = group[0].label;
      btn.dataset.value = group[0].value;
      btn.onclick = () => selectQuality(group[0].value);
      qualitiesDiv.appendChild(btn);
    }
  });
  
  // Groupe spécial pour M7/Δ/maj7 : M7 et Δ côte à côte en haut, maj7 en dessous
  const maj7Container = document.createElement('div');
  maj7Container.className = 'maj7-container';
  maj7Container.style.display = 'grid';
  maj7Container.style.gridTemplateColumns = '1fr 1fr';
  maj7Container.style.gridTemplateRows = 'auto auto';
  maj7Container.style.border = '1px solid #22c55e';
  maj7Container.style.borderRadius = '4px';
  maj7Container.style.overflow = 'hidden';
  maj7Container.style.background = '#1e2638';
  
  // M7 (en haut à gauche)
  const m7Btn = document.createElement('button');
  m7Btn.className = 'mini-key stacked';
  m7Btn.textContent = 'M7';
  m7Btn.dataset.value = 'maj7';
  m7Btn.style.borderRight = '1px solid #374151';
  m7Btn.style.borderBottom = '1px solid #374151';
  m7Btn.onclick = () => selectQuality('maj7');
  maj7Container.appendChild(m7Btn);
  
  // Δ (en haut à droite)
  const deltaBtn = document.createElement('button');
  deltaBtn.className = 'mini-key stacked delta-btn';
  deltaBtn.textContent = 'Δ';
  deltaBtn.dataset.value = 'maj7';
  deltaBtn.style.borderBottom = '1px solid #374151';
  deltaBtn.onclick = () => selectQuality('maj7');
  maj7Container.appendChild(deltaBtn);
  
  // maj7 (en bas, s'étend sur les 2 colonnes)
  const maj7Btn = document.createElement('button');
  maj7Btn.className = 'mini-key stacked';
  maj7Btn.textContent = 'maj7';
  maj7Btn.dataset.value = 'maj7';
  maj7Btn.style.gridColumn = '1 / 3';
  maj7Btn.onclick = () => selectQuality('maj7');
  maj7Container.appendChild(maj7Btn);
  
  qualitiesDiv.appendChild(maj7Container);
  
  
  // Grand groupe CARRÉ pour M7#5/maj7#5 + +M7/+maj7 (2x2 grid)
  const maj7Sharp5Container = document.createElement('div');
  maj7Sharp5Container.className = 'btn-grid-group';
  maj7Sharp5Container.style.display = 'grid';
  maj7Sharp5Container.style.gridTemplateColumns = '1fr 1fr';
  maj7Sharp5Container.style.gridTemplateRows = '1fr 1fr';
  
  [
    { label: 'M7♯5', value: 'maj7#5' },
    { label: '+M7', value: 'maj7#5' },
    { label: 'maj7♯5', value: 'maj7#5' },
    { label: '+maj7', value: 'maj7#5' }
  ].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key stacked';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.onclick = () => selectQuality(item.value);
    maj7Sharp5Container.appendChild(btn);
  });
  
  qualitiesDiv.appendChild(maj7Sharp5Container);

  // Extensions simples (LIGNE 4)
  const simpleExtDiv = document.getElementById('simpleExtensions');
  SIMPLE_EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectSimpleExtension(ext);
    simpleExtDiv.appendChild(btn);
  });

  // Extensions altérées (LIGNE 5)
  const alteredExtDiv = document.getElementById('alteredExtensions');
  ALTERED_EXTENSIONS.forEach((ext, idx) => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ALTERED_EXTENSIONS_DISPLAY[idx];
    btn.dataset.value = ext;
    btn.onclick = () => selectAlteredExtension(ext);
    alteredExtDiv.appendChild(btn);
  });

  // Boutons de contrôle
  document.getElementById('resetNotes').onclick = resetNotes;
  document.getElementById('micToggle').onclick = toggleMicrophone;
  document.getElementById('toggleChordVisibility').onclick = toggleChordVisibility;
  document.getElementById('playChordBtn').onclick = window.playChord;
  
  // Bouton d'aide
  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelp = document.getElementById('closeHelp');
  
  if (helpBtn && helpModal && closeHelp) {
    helpBtn.onclick = () => {
      helpModal.classList.add('active');
    };
    
    closeHelp.onclick = () => {
      helpModal.classList.remove('active');
    };
    
    helpModal.onclick = (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove('active');
      }
    };
  }

  // Mode quiz
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.onclick = () => {
      selectNoteCount(parseInt(btn.dataset.count));
      startQuizMode();
    };
  });
}