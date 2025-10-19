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
  
  const alterationGroups = [
    [{ label: '#', value: '#' }, { label: 'b', value: 'b' }],
    [{ label: '-', value: 'm' }, { label: 'min', value: 'm' }]
  ];
  
  alterationGroups.forEach((group, groupIndex) => {
    group.forEach((alt, index) => {
      const btn = document.createElement('button');
      btn.className = 'mini-key';
      btn.textContent = alt.label;
      btn.dataset.value = alt.value;
      btn.dataset.type = groupIndex === 0 ? 'alteration' : 'minor';
      btn.onclick = () => {
        if (groupIndex === 0) {
          selectAlteration(alt.value);
        } else {
          selectMinor();
        }
      };
      alterationsDiv.appendChild(btn);
      
      if (index < group.length - 1) {
        const link = document.createElement('span');
        link.className = 'synonym-link';
        link.textContent = '—';
        alterationsDiv.appendChild(link);
      }
    });
    
    if (groupIndex < alterationGroups.length - 1) {
      const spacer = document.createElement('span');
      spacer.style.width = '12px';
      alterationsDiv.appendChild(spacer);
    }
  });

  // Qualités (ligne 2)
  const qualitiesDiv = document.getElementById('qualities');
  
  const qualityGroups = [
    [{ label: '7', value: '7' }],
    [{ label: 'M7', value: 'maj7' }, { label: 'maj7', value: 'maj7' }],
    [{ label: '°', value: 'dim' }, { label: 'dim', value: 'dim' }],
    [{ label: 'aug', value: 'aug' }],
    [{ label: 'm7b5', value: 'm7b5' }, { label: 'ø7', value: 'ø7' }],
    [{ label: 'dim7', value: 'dim7' }],
    [{ label: 'sus2', value: 'sus2' }],
    [{ label: 'sus4', value: 'sus4' }]
  ];
  
  qualityGroups.forEach((group, groupIndex) => {
    group.forEach((quality, index) => {
      const btn = document.createElement('button');
      btn.className = 'mini-key';
      btn.textContent = quality.label;
      btn.dataset.value = quality.value;
      btn.onclick = () => selectQuality(quality.value);
      qualitiesDiv.appendChild(btn);
      
      if (index < group.length - 1) {
        const link = document.createElement('span');
        link.className = 'synonym-link';
        link.textContent = '—';
        qualitiesDiv.appendChild(link);
      }
    });
    
    if (groupIndex < qualityGroups.length - 1) {
      const spacer = document.createElement('span');
      spacer.style.width = '8px';
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