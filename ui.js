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

  // Altérations # b - min (ligne 1)
  const alterationsDiv = document.getElementById('alterations');
  
  // Groupe # et b (côte à côte, pas superposés)
  [{ label: '#', value: '#' }, { label: 'b', value: 'b' }].forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = alt.label;
    btn.dataset.value = alt.value;
    btn.dataset.type = 'alteration';
    btn.onclick = () => selectAlteration(alt.value);
    alterationsDiv.appendChild(btn);
  });
  
  // Spacer réduit
  const spacer = document.createElement('span');
  spacer.style.width = '8px';
  alterationsDiv.appendChild(spacer);
  
  // Groupe - et min (superposés)
  const minorContainer = document.createElement('div');
  minorContainer.className = 'btn-stack-group';
  
  [{ label: '-', value: 'm' }, { label: 'min', value: 'm' }].forEach(alt => {
    const btn = document.createElement('button');
    btn.className = 'mini-key stacked';
    btn.textContent = alt.label;
    btn.dataset.value = alt.value;
    btn.dataset.type = 'minor';
    btn.onclick = () => selectMinor();
    minorContainer.appendChild(btn);
  });
  alterationsDiv.appendChild(minorContainer);

  // Qualités (ligne 2)
  const qualitiesDiv = document.getElementById('qualities');
  
  const qualityGroups = [
    [{ label: '7', value: '7' }],
    [{ label: 'M7', value: 'maj7' }, { label: 'maj7', value: 'maj7' }],
    [{ label: '°', value: 'dim' }, { label: 'dim', value: 'dim' }],
    [{ label: 'aug', value: 'aug' }],
    [{ label: 'm7b5', value: 'm7b5' }, { label: 'ø7', value: 'm7b5' }], // Même valeur pour s'allumer ensemble
    [{ label: 'dim7', value: 'dim7' }],
    [{ label: 'sus2', value: 'sus2' }],
    [{ label: 'sus4', value: 'sus4' }]
  ];
  
  qualityGroups.forEach((group, groupIndex) => {
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
    
    if (groupIndex < qualityGroups.length - 1) {
      const spacer = document.createElement('span');
      spacer.style.width = '2px';
      qualitiesDiv.appendChild(spacer);
    }
  });

  // Extensions simples (ligne 3)
  const simpleExtDiv = document.getElementById('simpleExtensions');
  SIMPLE_EXTENSIONS.forEach(ext => {
    const btn = document.createElement('button');
    btn.className = 'mini-key';
    btn.textContent = ext;
    btn.onclick = () => selectSimpleExtension(ext);
    simpleExtDiv.appendChild(btn);
  });

  // Extensions altérées (ligne 4)
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

  // Mode quiz
  document.querySelectorAll('.note-count-btn').forEach(btn => {
    btn.onclick = () => {
      selectNoteCount(parseInt(btn.dataset.count));
      startQuizMode();
    };
  });
}