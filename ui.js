// ui.js - Gestion de l'interface utilisateur

function initializeUI() {
  // Notes A-G
  const rootNotesDiv = document.getElementById('rootNotes');
  const orderedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  orderedNotes.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = note;
    btn.onclick = () => selectRootNote(note);
    rootNotesDiv.appendChild(btn);
  });

  // Altérations # b (ligne 1)
  const alterationsDiv = document.getElementById('alterations');
  
  [{ label: '#', value: '#' }, { label: 'b', value: 'b' }].forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = alt.label;
    btn.dataset.value = alt.value;
    btn.dataset.type = 'alteration';
    btn.onclick = () => selectAlteration(alt.value);
    alterationsDiv.appendChild(btn);
  });

  // NOUVELLE LIGNE 2 : Mineur, Diminué, Augmenté, Sus2, Sus4 (mutuellement exclusifs)
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
  
  // Sus2 et Sus4 (boutons simples)
  [{ label: 'sus2', value: 'sus2' }, { label: 'sus4', value: 'sus4' }].forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = item.label;
    btn.dataset.value = item.value;
    btn.dataset.type = 'base-quality';
    btn.onclick = () => selectBaseQuality(item.value);
    baseQualitiesDiv.appendChild(btn);
  });

  // Qualités (LIGNE 3 maintenant) : 7, -7/m(in)7, °7/dim7, ø7/m7b5, M7/maj7, [M7#5/maj7#5 + +M7/+maj7]
  const qualitiesDiv = document.getElementById('qualities');
  
  const qualityGroups = [
    [{ label: '7', value: '7' }],
    [{ label: '-7', value: 'm7' }, { label: 'm(in)7', value: 'm7' }],
    [{ label: '°7', value: 'dim7' }, { label: 'dim7', value: 'dim7' }],
    [{ label: 'ø7', value: 'm7b5' }, { label: 'm7b5', value: 'm7b5' }],
    [{ label: 'M7', value: 'maj7' }, { label: 'maj7', value: 'maj7' }]
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
  
  // Grand groupe CARRÉ pour M7#5/maj7#5 + +M7/+maj7 (2x2 grid)
  const maj7Sharp5Container = document.createElement('div');
  maj7Sharp5Container.className = 'btn-grid-group';
  maj7Sharp5Container.style.display = 'grid';
  maj7Sharp5Container.style.gridTemplateColumns = '1fr 1fr';
  maj7Sharp5Container.style.gridTemplateRows = '1fr 1fr';
  
  [
    { label: 'M7#5', value: 'maj7#5' },
    { label: '+M7', value: 'maj7#5' },
    { label: 'maj7#5', value: 'maj7#5' },
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
  ALTERED_EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
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