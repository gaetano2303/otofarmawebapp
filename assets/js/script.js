function appendMessage(text, cls) {
  const div = document.createElement('div');
  div.className = 'message ' + cls;
  div.textContent = text;
  document.getElementById('chat-area').appendChild(div);
  document.getElementById('chat-area').scrollTop = document.getElementById('chat-area').scrollHeight;
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const chatArea = document.getElementById('chat-area');
  const message = input.value.trim();
  if (!message) return;

  // Mostra il messaggio dell'utente
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = message;
  chatArea.appendChild(userMsg);
  chatArea.scrollTop = chatArea.scrollHeight;
  input.value = '';
  input.disabled = true;

  // Mostra un loader
  const loader = document.createElement('div');
  loader.className = 'chat-msg bot loading';
  loader.textContent = '...';
  chatArea.appendChild(loader);
  chatArea.scrollTop = chatArea.scrollHeight;

  // Invia richiesta al backend
  fetch('https://cors-anywhere.herokuapp.com/https://chatbot-1ai.onrender.com/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  })
    .then(async res => {
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Risposta non valida dal server');
      }
      loader.remove();
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      const botReply = data.reply || 'Nessuna risposta.';
      botMsg.textContent = botReply;
      chatArea.appendChild(botMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
      
      // Avvia l'animazione video-avatar basata sulla lunghezza della risposta
      const responseLength = botReply.length;
      const estimatedDuration = Math.max(2000, Math.min(8000, responseLength * 50)); // 2-8 secondi
      startVideoAvatarSpeaking(estimatedDuration);
    })
    .catch((err) => {
      loader.remove();
      const errorMsg = document.createElement('div');
      errorMsg.className = 'chat-msg bot error';
      errorMsg.textContent = 'Errore di connessione.' + (err && err.message ? ' ' + err.message : '');
      chatArea.appendChild(errorMsg);
      chatArea.scrollTop = chatArea.scrollHeight;
    })
    .finally(() => {
      input.disabled = false;
      input.focus();
    });
}

function createHistoryModal() {
  const modal = document.createElement('div');
  modal.id = 'history-modal';
  modal.className = 'history-modal';
  modal.innerHTML = `
    <div class="history-modal-content">
      <div class="history-modal-header">
        <h3 class="history-modal-title">
          <span class="material-icons">history</span>
          Storico Diagnosi
        </h3>
        <button class="history-close-btn" id="close-history-modal">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="history-modal-body" id="history-modal-body">
        <!-- Contenuto storico viene inserito qui -->
      </div>
      <div class="history-actions">
        <button class="clear-history-btn" id="clear-history-modal-btn">
          <span class="material-icons">delete</span>
          Pulisci storico
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('close-history-modal').onclick = closeHistoryModal;
  modal.onclick = function(e) {
    if (e.target === modal) closeHistoryModal();
  };
  document.getElementById('clear-history-modal-btn').onclick = function() {
    if (confirm('Sei sicuro di voler cancellare tutto lo storico delle diagnosi?')) {
      localStorage.removeItem('diagnosis_history');
      loadHistoryInModal();
    }
  };
  
  // ESC key per chiudere
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeHistoryModal();
    }
  });
}

function openHistoryModal() {
  // Reset scroll all'apertura del modale
  window.scrollTo(0, 0);
  
  let modal = document.getElementById('history-modal');
  if (!modal) {
    createHistoryModal();
    modal = document.getElementById('history-modal');
  }
  
  loadHistoryInModal();
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeHistoryModal() {
  const modal = document.getElementById('history-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Reset scroll alla chiusura del modale
    window.scrollTo(0, 0);
  }
}

function loadHistoryInModal() {
  const body = document.getElementById('history-modal-body');
  const entries = JSON.parse(localStorage.getItem('diagnosis_history') || '[]');
  
  if (entries.length === 0) {
    body.innerHTML = '<div class="history-empty">Nessuna diagnosi salvata</div>';
    return;
  }
  
  body.innerHTML = '';
  entries.forEach((entry, idx) => {
    const preview = entry.text.replace(/\s+/g, ' ').slice(0, 100) + (entry.text.length > 100 ? '…' : '');
    
    const item = document.createElement('div');
    item.className = 'diagnosis-item';
    item.innerHTML = `
      <div class="diagnosis-preview">${preview}</div>
      <div class="diagnosis-date">${entry.date}</div>
    `;
    
    item.onclick = function() {
      showDiagnosisModal(entry.text, entry.date);
    };
    
    body.appendChild(item);
  });
}

// Aggiorna la funzione loadHistory esistente per essere compatibile
function loadHistory() {
  // Questa funzione ora è vuota perché lo storico è gestito dalla modale
  // Manteniamo la funzione per compatibilità con codice esistente
}

function showDiagnosisModal(text, date) {
  // Crea modale semplice
  let modal = document.getElementById('diagnosis-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'diagnosis-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.35)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.innerHTML = `<div id='diagnosis-modal-content' style='background:#fff;padding:2em 1.5em 1.5em 1.5em;border-radius:14px;max-width:95vw;max-height:80vh;overflow:auto;box-shadow:0 4px 24px rgba(0,0,0,0.13);position:relative;'>
      <button id='close-diagnosis-modal' style='position:absolute;top:0.7em;right:1em;font-size:1.5em;background:none;border:none;cursor:pointer;' title='Chiudi'>&times;</button>
      <div style='white-space:pre-line;font-size:1.08em;margin-bottom:0.7em;'>${text}</div>
      <div style='font-size:0.9em;color:#888;'>${date}</div>
    </div>`;
    document.body.appendChild(modal);
    document.getElementById('close-diagnosis-modal').onclick = () => modal.remove();
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
  }
}

function saveResult(text) {
  const entries = JSON.parse(localStorage.getItem('diagnosis_history') || '[]');
  entries.push({ date: new Date().toLocaleString(), text });
  localStorage.setItem('diagnosis_history', JSON.stringify(entries));
  loadHistory();
}

async function submitEarCheck() {
  const left = document.getElementById('left-ear').files[0];
  const right = document.getElementById('right-ear').files[0];
  const resultDiv = document.getElementById('ear-result');
  
  if (!left || !right) {
    resultDiv.className = 'error';
    resultDiv.textContent = "Carica entrambe le foto prima di inviare.";
    return;
  }
  
  const formData = new FormData();
  formData.append('left_ear', left);
  formData.append('right_ear', right);
  
  try {
    resultDiv.className = 'loading';
    resultDiv.textContent = "Analisi in corso...";
    
    const res = await fetch('https://cors-anywhere.herokuapp.com/https://otofarma-ai-diagnosis-nxyj.onrender.com/', {
      method: 'POST',
      body: formData
    });
    const text = await res.text();
    
    // Estrai solo testo comprensibile e mostra anche una grafica semplice
    let resultText = text;
    let resultHtml = '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      resultText = doc.body.innerText.replace(/Torna alla Pagina Iniziale/g, '').trim();
      const matches = resultText.match(/(\d+\.?\d*)\s*%/g);
      if (matches) {
        resultHtml = '<div style="margin:1em 0">';
        matches.forEach(m => {
          const val = parseFloat(m);
          resultHtml += `<div style='margin-bottom:6px;'>${m}<div style='background:#e3eafc;width:100%;height:10px;border-radius:6px;overflow:hidden;'><div style='background:#1976d2;width:${val}%;height:10px;'></div></div></div>`;
        });
        resultHtml += '</div>';
      }
    } catch(e) {}
    
    resultDiv.className = '';
    resultDiv.innerHTML = `<div style='white-space:pre-line;'>${resultText}</div>` + resultHtml;
    saveResult(resultText);
  } catch (err) {
    resultDiv.className = 'error';
    resultDiv.textContent = 'Errore: ' + err;
  }
}

// Gestione anteprima foto caricata per Analisi Orecchie
function setEarPreview(inputId, previewId, iconId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  const icon = document.getElementById(iconId);
  
  input.addEventListener('change', function() {
    if (this.files && this.files[0]) {
      showEarLoader(preview);
      const reader = new FileReader();
      reader.onload = function(e) {
        hideEarLoader(preview);
        icon.style.display = 'none';
        let img = preview.querySelector('.ear-photo');
        if (!img) {
          img = document.createElement('img');
          img.className = 'ear-photo';
          preview.appendChild(img);
        }
        img.src = e.target.result;
        img.style.display = 'block';
      };
      reader.readAsDataURL(this.files[0]);
    } else {
      icon.style.display = '';
      const img = preview.querySelector('.ear-photo');
      if (img) img.remove();
    }
  });
}

function showEarLoader(preview) {
  let loader = preview.querySelector('.ear-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'ear-loader';
    loader.innerHTML = '<span></span>';
    preview.appendChild(loader);
  }
  loader.style.display = 'flex';
}

function hideEarLoader(preview) {
  const loader = preview.querySelector('.ear-loader');
  if (loader) loader.style.display = 'none';
}

// Inizializza anteprima per entrambe le orecchie
setEarPreview('left-ear', 'left-ear-preview', 'left-ear-icon');
setEarPreview('right-ear', 'right-ear-preview', 'right-ear-icon');

// Pulsante invia analisi con nuovo design
const submitEarBtn = document.getElementById('submit-ear-btn');
if (submitEarBtn) {
  submitEarBtn.onclick = async function() {
    const left = document.getElementById('left-ear').files[0];
    const right = document.getElementById('right-ear').files[0];
    const resultDiv = document.getElementById('ear-result');
    
    if (!left || !right) {
      resultDiv.className = 'error';
      resultDiv.textContent = "Carica entrambe le foto prima di inviare.";
      return;
    }
    
    // Mostra solo l'animazione nel bottone
    submitEarBtn.disabled = true;
    const icon = submitEarBtn.querySelector('.material-icons');
    const oldClass = icon.className;
    icon.className = 'material-icons ear-btn-loader';
    
    // Chiama la funzione esistente
    try {
      await submitEarCheck();
    } catch (err) {
      console.error('Errore durante analisi:', err);
      resultDiv.className = 'error';
      resultDiv.textContent = 'Errore durante l\'analisi: ' + err.message;
    } finally {
      submitEarBtn.disabled = false;
      icon.className = oldClass;
    }
  };
}

// Floating button storico - apre modale
const floatingBtn = document.getElementById('open-history-btn');
if (floatingBtn) {
  floatingBtn.onclick = function() {
    openHistoryModal();
  };
}

document.addEventListener('DOMContentLoaded', function() {
  loadHistory();

  // Pulsante per pulire lo storico
  const clearBtn = document.getElementById('clear-history-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('Sei sicuro di voler cancellare tutto lo storico delle diagnosi?')) {
        localStorage.removeItem('diagnosis_history');
        loadHistory();
      }
    });
  }

  // Tab bar logic for mobile browser navigation support
  if (window.location.hash) {
    const tab = window.location.hash.replace('#', '');
    if (tab) switchTab(tab);
  }
  window.addEventListener('hashchange', () => {
    const tab = window.location.hash.replace('#', '');
    if (tab) switchTab(tab);
  });

  // Visually mark file as selected
  document.querySelectorAll('.file-label input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
      this.parentNode.classList.add('file-selected');
    });
  });

  // Floating button storico - apre modale
  const floatingBtn = document.getElementById('open-history-btn');
  if (floatingBtn) {
    floatingBtn.onclick = function() {
      openHistoryModal();
    };
  }

  // Floating button FAQ - apre modale
  const floatingFAQBtn = document.getElementById('open-faq-btn');
  if (floatingFAQBtn) {
    floatingFAQBtn.onclick = function() {
      openFAQModal();
    };
  }

  // Inizializza il sistema video-avatar
  setTimeout(() => {
    initVideoAvatar();
  }, 500); // Leggero delay per assicurarsi che gli elementi DOM siano pronti

  // Supporto per l'invio della chat con il tasto Enter
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
});

// Expose switchTab globally
window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === tabId);
  });
  window.location.hash = tabId;
  
  // Reset scroll position to top
  window.scrollTo(0, 0);
  
  // Gestione speciale per la sezione Home
  const homeSection = document.getElementById('home');
  if (tabId === 'home') {
    homeSection.classList.add('home-centered');
  } else {
    homeSection.classList.remove('home-centered');
  }
  
  // Se stiamo passando alla tab farmacie, nascondi la tab bar
  const tabBar = document.querySelector('.tab-bar');
  if (tabId === 'farmacie') {
    tabBar.style.display = 'none';
  } else {
    tabBar.style.display = 'flex';
  }
};

// Gestione Farmacie Convenzionate
let pharmacies = [];
let map = null;
let markers = [];
let userLocation = null;
let loadedPharmacies = []; // Farmacie già caricate sulla mappa
let visiblePharmacies = []; // Farmacie attualmente visibili

function openPharmacyMap() {
  console.log('Apertura mappa farmacie...');
  switchTab('farmacie');
  window.scrollTo(0, 0); // Reset scroll per sicurezza
  
  // Mostra loader iniziale nella mappa
  const mapContainer = document.getElementById('pharmacy-map');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div style="height: 100%; display: flex; align-items: center; justify-content: center; 
                  flex-direction: column; color: #666; background: #f8f9fa; border-radius: 16px 0 0 16px;">
        <div class="loader-ring" style="margin-bottom: 1em;"></div>
        <p>Rilevamento posizione...</p>
      </div>
    `;
  }
  
  // Reset delle farmacie caricate
  loadedPharmacies = [];
  visiblePharmacies = [];
  
  // Richiedi subito la posizione dell'utente
  requestUserLocationFirst();
}

function goBackToHome() {
  switchTab('home');
}

// Funzioni di utilità per i contatti
function copyAddress() {
  // Reset scroll all'azione
  window.scrollTo(0, 0);
  
  const address = "Viale Croce Rossa, 102/B - 90144 Palermo (PA)";
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(address).then(() => {
      alert("Indirizzo copiato negli appunti!");
    }).catch(() => {
      // Fallback per browser più vecchi
      copyAddressFallback(address);
    });
  } else {
    copyAddressFallback(address);
  }
}

function copyAddressFallback(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    alert("Indirizzo copiato negli appunti!");
  } catch (err) {
    alert("Impossibile copiare l'indirizzo. Prova manualmente.");
  }
  document.body.removeChild(textArea);
}

function openDirections() {
  // Reset scroll all'azione
  window.scrollTo(0, 0);
  
  const address = "Viale Croce Rossa, 102/B, 90144 Palermo PA";
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  window.open(mapsUrl, '_blank');
}

async function loadPharmacies() {
  try {
    // Prova prima con fetch
    let csvText;
    try {
      const response = await fetch('./data/farmacie.csv');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      csvText = await response.text();
    } catch (fetchError) {
      console.warn('Fetch fallito, uso dati demo:', fetchError);
      // Fallback con dati demo se il fetch fallisce (problema CORS in locale)
      csvText = await getDemoPharmacies();
    }
    
    pharmacies = parseCSV(csvText);
    console.log(`Caricate ${pharmacies.length} farmacie totali`);
    
    // Inizializza mappa
    initializeMap();
    
    // Carica solo le prime 10 farmacie più vicine
    await loadInitialPharmacies();
    
  } catch (error) {
    console.error('Errore nel caricamento farmacie:', error);
    document.getElementById('pharmacy-list').innerHTML = 
      `<div class="loading-pharmacies">
        <span class="material-icons" style="font-size: 3em; color: #ff5252; margin-bottom: 1em;">error</span>
        <p>Errore nel caricamento delle farmacie</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 0.5em;">
          ${error.message || 'Errore sconosciuto'}
        </p>
        <button onclick="loadPharmacies()" style="margin-top: 1em; padding: 8px 16px; background: #42e695; color: white; border: none; border-radius: 20px; cursor: pointer;">
          Riprova
        </button>
      </div>`;
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('File CSV vuoto o malformato');
  }
  
  const headers = lines[0].split(';').map(h => h.trim());
  console.log('Headers CSV:', headers);
  
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    if (values.length < headers.length) {
      console.warn(`Riga ${i} malformata:`, line);
      continue;
    }
    
    const pharmacy = {};
    headers.forEach((header, index) => {
      pharmacy[header] = values[index]?.trim() || '';
    });
    
    // Verifica che abbia coordinate valide
    if (pharmacy.lat && pharmacy.lon && 
        !isNaN(parseFloat(pharmacy.lat)) && 
        !isNaN(parseFloat(pharmacy.lon))) {
      data.push(pharmacy);
    } else {
      console.warn(`Farmacia senza coordinate valide:`, pharmacy.Nome);
    }
  }
  
  console.log(`Parsed ${data.length} farmacie valide da ${lines.length - 1} righe`);
  return data;
}

async function loadInitialPharmacies() {
  console.log('Caricamento farmacie iniziali...');
  
  const listContainer = document.getElementById('pharmacy-list');
  listContainer.innerHTML = '';
  
  // Ordina le farmacie per distanza se abbiamo la posizione utente
  let sortedPharmacies = [...pharmacies];
  if (userLocation) {
    console.log('Ordinamento farmacie per distanza dalla posizione utente');
    sortedPharmacies.sort((a, b) => {
      const distA = calculateDistance(
        userLocation.lat, userLocation.lng,
        parseFloat(a.lat), parseFloat(a.lon)
      );
      const distB = calculateDistance(
        userLocation.lat, userLocation.lng,
        parseFloat(b.lat), parseFloat(b.lon)
      );
      return distA - distB;
    });
  }
  
  // Carica solo le prime 10 farmacie più vicine
  const initialCount = 10;
  visiblePharmacies = sortedPharmacies.slice(0, initialCount);
  loadedPharmacies = [...visiblePharmacies];
  
  console.log(`Caricate ${visiblePharmacies.length} farmacie iniziali`);
  
  // Aggiorna lista e mappa
  updatePharmacyList();
  updatePharmacyMarkers();
}

async function loadPharmaciesInBounds(bounds) {
  if (!bounds) return;
  
  const currentlyLoaded = new Set(loadedPharmacies.map(p => `${p.lat},${p.lon}`));
  const newPharmacies = [];
  
  // Trova farmacie nei bounds che non sono già caricate
  pharmacies.forEach(pharmacy => {
    const lat = parseFloat(pharmacy.lat);
    const lon = parseFloat(pharmacy.lon);
    const key = `${pharmacy.lat},${pharmacy.lon}`;
    
    if (!currentlyLoaded.has(key) && 
        lat >= bounds.getSouth() && lat <= bounds.getNorth() &&
        lon >= bounds.getWest() && lon <= bounds.getEast()) {
      newPharmacies.push(pharmacy);
    }
  });
  
  if (newPharmacies.length > 0) {
    console.log(`Caricamento ${newPharmacies.length} nuove farmacie nell'area visibile`);
    
    // Ordina per distanza se abbiamo la posizione utente
    if (userLocation) {
      newPharmacies.sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat, userLocation.lng,
          parseFloat(a.lat), parseFloat(a.lon)
        );
        const distB = calculateDistance(
          userLocation.lat, userLocation.lng,
          parseFloat(b.lat), parseFloat(b.lon)
        );
        return distA - distB;
      });
    }
    
    // Limita a massimo 20 nuove farmacie per volta
    const pharmaciesToAdd = newPharmacies.slice(0, 20);
    loadedPharmacies.push(...pharmaciesToAdd);
    visiblePharmacies.push(...pharmaciesToAdd);
    
    // Aggiorna interfaccia
    updatePharmacyList();
    updatePharmacyMarkers();
  }
}

function updatePharmacyList() {
  const listContainer = document.getElementById('pharmacy-list');
  listContainer.innerHTML = '';
  
  visiblePharmacies.forEach(pharmacy => {
    const item = createPharmacyListItem(pharmacy);
    listContainer.appendChild(item);
  });
  
  // Aggiungi indicatore se ci sono più farmacie da caricare
  if (loadedPharmacies.length < pharmacies.length) {
    const loadMoreIndicator = document.createElement('div');
    loadMoreIndicator.className = 'load-more-indicator';
    loadMoreIndicator.innerHTML = `
      <p style="text-align: center; color: #666; font-size: 0.9em; padding: 1em;">
        <span class="material-icons" style="vertical-align: middle; margin-right: 0.5em;">info</span>
        Sposta la mappa per vedere più farmacie
      </p>
    `;
    listContainer.appendChild(loadMoreIndicator);
  }
}

async function loadPharmaciesIncremental() {
  // Questa funzione è ora sostituita da loadInitialPharmacies
  // Mantenuta per compatibilità
  await loadInitialPharmacies();
}

function createPharmacyListItem(pharmacy) {
  const item = document.createElement('div');
  item.className = 'pharmacy-item';
  item.dataset.lat = pharmacy.lat;
  item.dataset.lon = pharmacy.lon;
  
  let distance = '';
  if (userLocation) {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, 
                                 parseFloat(pharmacy.lat), parseFloat(pharmacy.lon));
    distance = `<div class="pharmacy-distance">${dist.toFixed(1)} km da te</div>`;
  }
  
  item.innerHTML = `
    <div class="pharmacy-name">${pharmacy.Nome}</div>
    <div class="pharmacy-address">${pharmacy.indirizzo}, ${pharmacy.città} (${pharmacy.provincia}) ${pharmacy.cap}</div>
    ${distance}
    <div class="pharmacy-actions">
      ${pharmacy.telefono ? `<a href="tel:${pharmacy.telefono}" class="pharmacy-action-btn call-btn">
        <span class="material-icons">call</span> Chiama
      </a>` : ''}
      ${pharmacy.email ? `<a href="mailto:${pharmacy.email}" class="pharmacy-action-btn email-btn">
        <span class="material-icons">email</span> Email
      </a>` : ''}
      <a href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lon}" 
         target="_blank" class="pharmacy-action-btn directions-btn">
        <span class="material-icons">directions</span> Indicazioni
      </a>
    </div>
  `;
  
  item.onclick = () => selectPharmacy(pharmacy, item);
  
  return item;
}

function initializeMap() {
  const mapContainer = document.getElementById('pharmacy-map');
  
  if (!mapContainer) {
    console.error('Contenitore mappa non trovato');
    return;
  }
  
  // Rimuovi contenuto precedente
  mapContainer.innerHTML = '';
  
  // Determina centro e zoom in base alla presenza della posizione utente
  let center, zoom;
  if (userLocation) {
    center = [userLocation.lat, userLocation.lng];
    zoom = 14; // Zoom molto più vicino sulla posizione utente
    console.log('Mappa centrata sulla posizione utente:', center);
  } else {
    center = [41.9028, 12.4964]; // Centro Italia
    zoom = 6;
    console.log('Mappa centrata sull\'Italia');
  }
  
  // Crea la mappa
  map = L.map('pharmacy-map').setView(center, zoom);
  
  // Aggiungi tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Aggiungi marker della posizione utente per primo (se disponibile)
  if (userLocation) {
    addUserLocationMarker();
  }
  
  // Event listeners per caricamento incrementale
  let moveTimeout;
  map.on('moveend', function() {
    // Debounce per evitare troppe chiamate
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      const bounds = map.getBounds();
      loadPharmaciesInBounds(bounds);
    }, 500);
  });
  
  map.on('zoomend', function() {
    // Carica farmacie quando si fa zoom
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      const bounds = map.getBounds();
      loadPharmaciesInBounds(bounds);
    }, 300);
  });
  
  console.log('Mappa Leaflet inizializzata con caricamento incrementale');
}

function updatePharmacyMarkers() {
  // Pulisci marker precedenti (escluso marker utente)
  markers.forEach(marker => {
    if (!marker.options.isUserMarker) {
      map.removeLayer(marker);
    }
  });
  markers = markers.filter(marker => marker.options.isUserMarker);
  
  // Crea icona personalizzata per le farmacie (croce verde classica)
  const pharmacyIcon = L.divIcon({
    className: 'custom-pharmacy-marker',
    html: '<div style="width: 28px; height: 28px; background: #00b050; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">+</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
  
  // Aggiungi marker solo per le farmacie visibili
  visiblePharmacies.forEach(pharmacy => {
    const lat = parseFloat(pharmacy.lat);
    const lon = parseFloat(pharmacy.lon);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      const marker = L.marker([lat, lon], { icon: pharmacyIcon })
        .addTo(map)
        .bindPopup(createPharmacyPopup(pharmacy));
      
      // Aggiungi evento click
      marker.on('click', () => {
        selectPharmacyFromMap(pharmacy);
      });
      
      markers.push(marker);
    }
  });
  
  console.log(`Aggiornati ${visiblePharmacies.length} marker farmacie sulla mappa`);
}

function addPharmacyMarkers() {
  // Funzione legacy - ora usa updatePharmacyMarkers
  updatePharmacyMarkers();
}

function addUserLocationMarker() {
  if (!userLocation) return;
  
  // Rimuovi eventuali marker utente precedenti
  markers = markers.filter(marker => {
    if (marker.options && marker.options.isUserMarker) {
      map.removeLayer(marker);
      return false;
    }
    return true;
  });
  
  // Assicurati che le coordinate siano numeri
  const lat = parseFloat(userLocation.lat);
  const lng = parseFloat(userLocation.lng);
  
  console.log('Aggiungendo marker utente a:', lat, lng);
  
  // Usa circleMarker per posizionamento più preciso
  const userMarker = L.circleMarker([lat, lng], {
    radius: 12,
    fillColor: '#ff5722',
    color: 'white',
    weight: 3,
    opacity: 1,
    fillOpacity: 1,
    isUserMarker: true // Flag per identificare il marker utente
  })
    .addTo(map)
    .bindPopup('<strong>📍 La tua posizione</strong>')
    .openPopup();
    
  markers.push(userMarker);
  console.log('Marker utente creato e aggiunto alla mappa');
}

function createPharmacyPopup(pharmacy) {
  let distance = '';
  if (userLocation) {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, 
                                 parseFloat(pharmacy.lat), parseFloat(pharmacy.lon));
    distance = `<div style="color: #42e695; font-weight: 600; margin-top: 8px;">${dist.toFixed(1)} km da te</div>`;
  }
  
  return `
    <div style="min-width: 250px;">
      <h3 style="margin: 0 0 8px 0; color: #333; font-size: 1.1em;">${pharmacy.Nome}</h3>
      <p style="margin: 0 0 8px 0; color: #666; font-size: 0.95em;">
        ${pharmacy.indirizzo}<br>
        ${pharmacy.città} (${pharmacy.provincia}) ${pharmacy.cap}
      </p>
      ${distance}
      <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
        ${pharmacy.telefono ? `
          <a href="tel:${pharmacy.telefono}" 
             style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 15px; 
                    text-decoration: none; font-size: 0.8em; display: flex; align-items: center; gap: 4px;">
            <span class="material-icons" style="font-size: 1em;">call</span> Chiama
          </a>
        ` : ''}
        ${pharmacy.email ? `
          <a href="mailto:${pharmacy.email}" 
             style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 15px; 
                    text-decoration: none; font-size: 0.8em; display: flex; align-items: center; gap: 4px;">
            <span class="material-icons" style="font-size: 1em;">email</span> Email
          </a>
        ` : ''}
        <a href="https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lon}" 
           target="_blank"
           style="background: #ff9800; color: white; padding: 6px 12px; border-radius: 15px; 
                  text-decoration: none; font-size: 0.8em; display: flex; align-items: center; gap: 4px;">
          <span class="material-icons" style="font-size: 1em;">directions</span> Indicazioni
        </a>
      </div>
    </div>
  `;
}

function selectPharmacyFromMap(pharmacy) {
  // Trova l'item corrispondente nella lista e selezionalo
  const items = document.querySelectorAll('.pharmacy-item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.lat === pharmacy.lat && item.dataset.lon === pharmacy.lon) {
      item.classList.add('active');
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function selectPharmacy(pharmacy, item) {
  // Rimuovi selezione precedente
  document.querySelectorAll('.pharmacy-item.active').forEach(el => {
    el.classList.remove('active');
  });
  
  // Aggiungi selezione attuale
  item.classList.add('active');
  
  // Centra la mappa sulla farmacia selezionata
  if (map) {
    const lat = parseFloat(pharmacy.lat);
    const lon = parseFloat(pharmacy.lon);
    map.setView([lat, lon], Math.max(map.getZoom(), 15));
    
    // Trova il marker corrispondente e apri il popup
    markers.forEach(marker => {
      if (!marker.options.isUserMarker) {
        const markerLatLng = marker.getLatLng();
        if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lon) < 0.0001) {
          marker.openPopup();
        }
      }
    });
  }
}

function filterPharmacies() {
  const searchTerm = document.getElementById('pharmacy-search').value.toLowerCase();
  
  if (!searchTerm.trim()) {
    // Se non c'è ricerca, mostra le farmacie caricate normalmente
    updatePharmacyList();
    return;
  }
  
  // Filtra tra tutte le farmacie caricate
  const filteredPharmacies = loadedPharmacies.filter(pharmacy => {
    const searchText = `${pharmacy.Nome} ${pharmacy.città} ${pharmacy.provincia} ${pharmacy.indirizzo}`.toLowerCase();
    return searchText.includes(searchTerm);
  });
  
  // Aggiorna la lista con i risultati filtrati
  const listContainer = document.getElementById('pharmacy-list');
  listContainer.innerHTML = '';
  
  if (filteredPharmacies.length === 0) {
    listContainer.innerHTML = `
      <div class="loading-pharmacies">
        <span class="material-icons" style="font-size: 3em; color: #ff9800; margin-bottom: 1em;">search_off</span>
        <p>Nessuna farmacia trovata</p>
        <p style="font-size: 0.9em; color: #666; margin-top: 0.5em;">
          Prova con un termine di ricerca diverso
        </p>
      </div>
    `;
  } else {
    filteredPharmacies.forEach(pharmacy => {
      const item = createPharmacyListItem(pharmacy);
      listContainer.appendChild(item);
    });
  }
}

function getUserLocation() {
  // Mostra loader nel pulsante
  const locationBtn = document.querySelector('.location-btn');
  if (locationBtn) {
    locationBtn.innerHTML = '<span class="material-icons">refresh</span>';
    locationBtn.disabled = true;
  }
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Posizione utente aggiornata:', userLocation);
        
        // Ricarica la lista con le distanze
        loadPharmaciesIncremental();
        
        // Ordina per distanza
        sortPharmaciesByDistance();
        
        // Aggiorna la mappa con la nuova posizione utente
        if (map) {
          addUserLocationMarker();
          map.setView([userLocation.lat, userLocation.lng], 14);
        }
        
        // Ripristina il pulsante
        if (locationBtn) {
          locationBtn.innerHTML = '<span class="material-icons">my_location</span>';
          locationBtn.disabled = false;
        }
      },
      error => {
        console.error('Errore nel recupero della posizione:', error);
        alert('Impossibile recuperare la tua posizione. Assicurati di aver abilitato la geolocalizzazione.');
        
        // Ripristina il pulsante
        if (locationBtn) {
          locationBtn.innerHTML = '<span class="material-icons">my_location</span>';
          locationBtn.disabled = false;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  } else {
    alert('La geolocalizzazione non è supportata da questo browser.');
    
    // Ripristina il pulsante
    if (locationBtn) {
      locationBtn.innerHTML = '<span class="material-icons">my_location</span>';
      locationBtn.disabled = false;
    }
  }
}

function sortPharmaciesByDistance() {
  if (!userLocation) return;
  
  const listContainer = document.getElementById('pharmacy-list');
  const items = Array.from(listContainer.querySelectorAll('.pharmacy-item'));
  
  items.sort((a, b) => {
    const distA = calculateDistance(
      userLocation.lat, userLocation.lng,
      parseFloat(a.dataset.lat), parseFloat(a.dataset.lon)
    );
    const distB = calculateDistance(
      userLocation.lat, userLocation.lng,
      parseFloat(b.dataset.lat), parseFloat(b.dataset.lon)
    );
    return distA - distB;
  });
  
  listContainer.innerHTML = '';
  items.forEach(item => listContainer.appendChild(item));
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raggio della Terra in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Dati demo per testing in caso di problemi CORS
async function getDemoPharmacies() {
  return `Nome;indirizzo;città;provincia;cap;lat;lon;telefono;email
Nazionale Di De Sio Cesari Giovanni e C. snc;Via Salvator Rosa, 344;NAPOLI;NA;80136;40.853871;14.248429;0815640899;farmacia_nazionale@libero.it
Franzoso Annabella;Via San Pancrazio, 15;TORRE SANTA SUSANNA;BR;72028;40.465138;17.743686;0831746014;franzosoannabella@hotmail.com
Messore Pasquale;Via Provinciale, 36;AUSONIA;FR;03040;41.3544611;13.7487479;0776952008;farmacia.messore@libero.it
Del Monaco Lorenzo;Piazza la Corte,12;ANDRIA;BT;76123;41.225362;16.295912;0883597154;farmacia.delmonaco@gmail.com
Iodice s.a.s. del Dr. Iodice Andrea;Via S.Marco ,14;CASTEL DI SASSO;CE;81040;41.202563;14.276378;0823878170;farmaciaiodiceandrea@gmail.com
De Meo Antonio;Viale Ofanto ,222;FOGGIA;FG;71100;41.4521957;15.5513012;0881633991;info@farmaciademeo.it
Di Bona Vincenzo;Via Campo Sportivo, 32;CASALVIERI;FR;03034;41.63270886028453;13.716811713274968;0776639029;dibonavincenzo@gmail.com
Comunale di Cervaro Dott.ssa Iucci Stefania;Via Isola Tocca;CERVARO DI FROSINONE;FR;03044;41.468589;13.887429;077634300;FARMCOMUNALECERVARO@LIBERO.IT
Picaro;Corso Vittorio Emanuele,21;PONTECORVO;FR;03037;41.45736823829764;13.666042261368293;0776760216;farmacia.picaro@virgilio.it
San Francesco;Via Roma, 45;ROMA;RM;00100;41.9028;12.4964;0612345678;sanfrancesco@farmacia.it
Centro Storico;Piazza Navona, 12;ROMA;RM;00186;41.8994;12.4731;0687654321;centrostorico@farmacia.it
Moderna;Corso Buenos Aires, 234;MILANO;MI;20124;45.4773;9.1815;0223456789;moderna@farmacia.it
Garibaldi;Via Garibaldi, 67;TORINO;TO;10122;45.0732;7.6857;0119876543;garibaldi@farmacia.it
Santa Lucia;Via Santa Lucia, 89;FIRENZE;FI;50122;43.7696;11.2558;0556543210;santalucia@farmacia.it
Del Porto;Via del Porto, 156;GENOVA;GE;16124;44.4056;8.9463;0101234567;delporto@farmacia.it`;
}

function requestUserLocationFirst() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Posizione utente rilevata all\'apertura:', userLocation);
        console.log('Accuratezza:', position.coords.accuracy, 'metri');
        console.log('Timestamp:', new Date(position.timestamp).toLocaleString());
        
        // Aggiorna il loader per mostrare che stiamo caricando le farmacie
        const mapContainer = document.getElementById('pharmacy-map');
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; 
                        flex-direction: column; color: #666; background: #f8f9fa; border-radius: 16px 0 0 16px;">
              <div class="loader-ring" style="margin-bottom: 1em;"></div>
              <p>Caricamento farmacie vicine...</p>
            </div>
          `;
        }
        
        // Ora carica le farmacie con la posizione già disponibile
        if (pharmacies.length === 0) {
          loadPharmacies();
        } else {
          console.log('Farmacie già caricate, reinizializzo interfaccia');
          loadPharmaciesIncremental();
          setTimeout(() => {
            initializeMap();
          }, 100);
        }
      },
      error => {
        console.error('Errore nel recupero della posizione:', error);
        
        // Mostra messaggio di errore ma continua comunque
        const mapContainer = document.getElementById('pharmacy-map');
        if (mapContainer) {
          mapContainer.innerHTML = `
            <div style="height: 100%; display: flex; align-items: center; justify-content: center; 
                        flex-direction: column; color: #666; background: #f8f9fa; border-radius: 16px 0 0 16px;">
              <span class="material-icons" style="font-size: 3em; color: #ff9800; margin-bottom: 1em;">location_off</span>
              <p style="text-align: center; margin-bottom: 1em;">Posizione non disponibile</p>
              <p style="font-size: 0.9em; text-align: center; color: #999; margin-bottom: 1.5em;">
                Caricamento farmacie senza geolocalizzazione...
              </p>
            </div>
          `;
        }
        
        // Carica le farmacie anche senza posizione dopo un breve delay
        setTimeout(() => {
          if (pharmacies.length === 0) {
            loadPharmacies();
          } else {
            loadPharmaciesIncremental();
            setTimeout(() => {
              initializeMap();
            }, 100);
          }
        }, 1500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  } else {
    console.warn('Geolocalizzazione non supportata');
    
    // Mostra messaggio e continua senza geolocalizzazione
    const mapContainer = document.getElementById('pharmacy-map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; 
                    flex-direction: column; color: #666; background: #f8f9fa; border-radius: 16px 0 0 16px;">
          <span class="material-icons" style="font-size: 3em; color: #ff9800; margin-bottom: 1em;">location_disabled</span>
          <p style="text-align: center; margin-bottom: 1em;">Geolocalizzazione non supportata</p>
          <p style="font-size: 0.9em; text-align: center; color: #999; margin-bottom: 1.5em;">
            Caricamento tutte le farmacie...
          </p>
        </div>
      `;
    }
    
    // Carica le farmacie dopo un breve delay
    setTimeout(() => {
      if (pharmacies.length === 0) {
        loadPharmacies();
      } else {
        loadPharmaciesIncremental();
        setTimeout(() => {
          initializeMap();
        }, 100);
      }
    }, 1500);
  }
}

// FAQ Modal Management
function createFAQModal() {
  const modal = document.createElement('div');
  modal.id = 'faq-modal';
  modal.className = 'faq-modal';
  
  const faqData = [
    {
      question: "Come funziona il chatbot di Otofarma?",
      answer: "Il nostro chatbot è un assistente virtuale che può rispondere alle tue domande sui prodotti Otofarma, fornire informazioni sui nostri servizi e guidarti nell'uso dell'app. Puoi scrivere le tue domande o utilizzare il riconoscimento vocale."
    },
    {
      question: "Che tipo di analisi dell'orecchio posso fare?",
      answer: "L'app permette di caricare foto dell'orecchio destro e sinistro per ottenere una valutazione preliminare. Il nostro sistema AI analizza le immagini e fornisce indicazioni generali. Ricorda che questa non sostituisce una visita medica professionale."
    },
    {
      question: "Come funziona il test dell'udito?",
      answer: "Il test dell'udito ti reindirizza a una piattaforma specializzata dove puoi effettuare uno screening audiologico. Assicurati di essere in un ambiente silenzioso e di utilizzare delle cuffie per risultati più accurati."
    },
    {
      question: "Qual è la differenza tra le serie ENDO, CIC e RETRO MICRO?",
      answer: "Serie ENDO: recupera perdite fino a 80 dB, completamente intrauricolare, ottima occlusione. Serie CIC: recupera fino a 75 dB, invisibile dall'esterno, dimensioni ridotte. Serie RETRO MICRO: recupera fino a 80 dB, retroauricolare, non subisce alterazioni da cerume."
    },
    {
      question: "Quanto durano le batterie degli apparecchi acustici?",
      answer: "Serie ENDO e RETRO MICRO (batteria 312): 180-240 ore di funzionamento, circa 10 giorni. Serie CIC (batteria 10A): 84-140 ore di funzionamento, circa 6 giorni."
    },
    {
      question: "Posso condividere i risultati delle analisi?",
      answer: "Sì, tutti i risultati delle analisi dell'orecchio possono essere condivisi tramite le funzioni di condivisione del dispositivo. Puoi anche consultare lo storico delle diagnosi precedenti."
    },
    {
      question: "Come posso contattare Otofarma?",
      answer: "Puoi trovarci in Via Ripuaria, 50k-50l, 50m, Giugliano in Campania (NA). Telefono: 081 18543072. Siamo anche su WhatsApp, Instagram, Facebook, YouTube e LinkedIn. Visita la sezione Contatti per tutti i dettagli."
    },
    {
      question: "L'app sostituisce una visita medica?",
      answer: "No, l'app è uno strumento di supporto e le analisi fornite sono indicative. Per diagnosi accurate e trattamenti specifici, è sempre necessario consultare un audiologo o un medico specialista."
    }
  ];
  
  let faqItemsHTML = '';
  faqData.forEach((faq, index) => {
    faqItemsHTML += `
      <div class="faq-item">
        <button class="faq-question" onclick="toggleFAQ(${index})">
          <span>${faq.question}</span>
          <span class="material-icons faq-icon">expand_more</span>
        </button>
        <div class="faq-answer" id="faq-answer-${index}">
          <div class="faq-answer-content">${faq.answer}</div>
        </div>
      </div>
    `;
  });
  
  modal.innerHTML = `
    <div class="faq-modal-content">
      <div class="faq-modal-header">
        <h3 class="faq-modal-title">
          <span class="material-icons">help</span>
          Domande Frequenti
        </h3>
        <button class="faq-close-btn" id="close-faq-modal">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="faq-modal-body">
        ${faqItemsHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Event listeners
  document.getElementById('close-faq-modal').onclick = closeFAQModal;
  modal.onclick = function(e) {
    if (e.target === modal) closeFAQModal();
  };
  
  // ESC key per chiudere
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeFAQModal();
    }
  });
}

function openFAQModal() {
  // Reset scroll all'apertura del modale
  window.scrollTo(0, 0);
  
  let modal = document.getElementById('faq-modal');
  if (!modal) {
    createFAQModal();
    modal = document.getElementById('faq-modal');
  }
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeFAQModal() {
  const modal = document.getElementById('faq-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Reset scroll alla chiusura del modale
    window.scrollTo(0, 0);
  }
}

function toggleFAQ(index) {
  const answer = document.getElementById(`faq-answer-${index}`);
  const question = answer.previousElementSibling;
  const icon = question.querySelector('.faq-icon');
  
  // Chiudi tutte le altre FAQ
  document.querySelectorAll('.faq-answer.show').forEach(item => {
    if (item !== answer) {
      item.classList.remove('show');
      item.previousElementSibling.classList.remove('active');
    }
  });
  
  // Toggle della FAQ corrente
  answer.classList.toggle('show');
  question.classList.toggle('active');
}

// Gestione Sezione Prodotti
const products = [
  {
    nome: "Serie ENDO",
    categoria: "apparecchi",
    descrizione: `Dispositivo medico CE 0051

La serie ENDO è progettata per recuperare una perdita uditiva fino a 80 dB.

Se il soggetto possiede una perdita maggiore di 80 dB l'amplificazione del dispositivo acustico non sarà sufficiente a recuperare la perdita uditiva.

La specificità della protesi della serie ENDO è quella di essere adeguatamente lunga e larga per occludere al massimo il canale uditivo e, quindi, migliorare la resa complessiva della protesi in termini di recupero in db.

Inoltre, lo spazio disponibile all'interno del guscio di una protesi serie ENDO, permette un distanziamento del ricevitore e del microfono utile a prevenire l'effetto Larsen. Dopo circa 180 ore, e per un massimo di 240 ore di funzionamento, i dispositivi acustici della serie ENDO smettono di funzionare poiché la pila inserita si è esaurita.

Per farla ritornare al suo normale funzionamento inserire una nuova pila e buttare quella esaurita negli appositi raccoglitori per lo smaltimento.

La serie ENDO è stata progettata avendo come specifica una lunga durata; per questo è stato previsto l'utilizzo della pila 312.`,
    immagine: "assets/images/products/prodotto_endo.png",
    specs: {
      "Tipo di Connessione": "Intrauricolare",
      "Tipo Batteria": "312",
      "Durata Massima Batteria": "10 giorni"
    }
  },
  {
    nome: "Serie CIC",
    categoria: "apparecchi",
    descrizione: `Dispositivo medico CE 0051

La serie CIC è progettata per recuperare una perdita uditiva fino a 75 dB.

Se il soggetto possiede una perdita maggiore di 75 dB l'amplificazione del dispositivo acustico non sarà sufficiente a recuperare la perdita uditiva.

La specificità della protesi della serie CIC è quella di essere completamente all'interno del canale uditivo, non visibile dall'esterno se non lateralmente, e, quindi, atta a soddisfare particolari esigenze di natura estetica.

Viste le dimensioni ridottissime e la minore occlusione rispetto alla ENDO, non permette l'utilizzo della CIC per ipoacusie elevate.

Dopo circa 84 ore, e per un massimo di 140 ore di funzionamento, i dispositivi acustici della serie CIC smettono di funzionare poiché la pila inserita si è esaurita. Per farla ritornare al suo normale funzionamento inserire una nuova pila e buttare quella esaurita negli appositi raccoglitori per lo smaltimento. La serie CIC è stata progettata avendo come specifica le ridotte dimensioni; per questo è stato previsto l'utilizzo della pila 10 a scapito della durata.`,
    immagine: "assets/images/products/prodotto_cic.png",
    specs: {
      "Tipo di Connessione": "Intrauricolare",
      "Tipo Batteria": "10 A",
      "Durata Massima Batteria": "6 giorni"
    }
  },
  {
    nome: "Serie Retro Micro",
    categoria: "apparecchi",
    descrizione: `Dispositivo medico CE 0051

La serie RETRO MICRO è progettata per recuperare una perdita uditiva fino a 80 dB.

Se il soggetto possiede una perdita maggiore di 80 dB l'amplificazione del dispositivo acustico non sarà sufficiente a recuperare la perdita uditiva.

La specificità della protesi della serie RETRO MICRO è quella di non soddisfare specifiche estetiche di non visibilità come per la CIC e la ENDO e di non subire le alterazioni dovute al contatto con il cerume prodotto all'interno del canale uditivo. Inoltre, lo spazio disponibile all'interno del guscio di una protesi serie RETRO MICRO, permette un distanziamento del ricevitore e del microfono utile a prevenire l'effetto Larsen.

Dopo circa 180 ore, e per un massimo di 240 ore di funzionamento, i dispositivi acustici della serie RETRO MICRO smettono di funzionare poiché la pila inserita si è esaurita. Per farla ritornare al suo normale funzionamento inserire una nuova pila e buttare quella esaurita negli appositi raccoglitori per lo smaltimento. La serie RETRO MICRO è stata progettata avendo come specifica una lunga durata; per questo è stato previsto l'utilizzo della pila 312.`,
    immagine: "assets/images/products/prodotto_retro.png",
    specs: {
      "Tipo di Connessione": "Retrouricolare",
      "Tipo Batteria": "312 A",
      "Durata Massima Batteria": "10 giorni"
    }
  },
  {
    nome: "Remote Control",
    categoria: "accessori",
    descrizione: "I clienti possono regolare il volume in modo discreto e cambiare programma a piacimento.",
    immagine: "assets/images/products/accessorio_remote.png",
    specs: {}
  },
  {
    nome: "TV Connector",
    categoria: "accessori",
    descrizione: "I clienti possono guardare i loro spettacoli e film preferiti con audio stereo di alta qualità connettendo gli apparecchi acustici alla TV o ad altri dispositivi multimediali in modalità wireless.",
    immagine: "assets/images/products/accessorio_tv.png",
    specs: {}
  },
  {
    nome: "Caricabatterie",
    categoria: "accessori",
    descrizione: "Utilizzate questo caricabatterie per caricare gli apparecchi acustici.",
    immagine: "assets/images/products/accessorio_charger.png",
    specs: {}
  },
  {
    nome: "Power Bank",
    categoria: "accessori",
    descrizione: "Utilizzate questo power bank per avere a disposizione un'ulteriore ricarica per i prodotti ricaricabili, senza dover collegare la base di ricarica a una presa elettrica.",
    immagine: "assets/images/products/accessorio_powerbank.png",
    specs: {}
  },
  {
    nome: "App Remote Plus",
    categoria: "accessori",
    descrizione: `L'app Remote Plus mette la personalizzazione facile a portata di mano del tuo cliente.
Supporto, opzioni e comandi aggiuntivi per un'esperienza più personalizzata.

AFFIDABILITA'
Con l'app Remote Plus, i nostri clienti sono più preparati ad affrontare tutte le situazioni che conoscono e anche quelle impreviste

REGOLAZIONE DA REMOTO
La regolazione da remoto consente di eseguire sintonizzazioni professionali a distanza

GARANZIA
Tutto questo garantisce ai vostri clienti flessibilità e convenienza, sia a casa che in viaggio`,
    immagine: "assets/images/products/accessorio_app.png",
    specs: {}
  }
];

let currentCategory = 'apparecchi';

function openProductCatalog() {
  switchTab('prodotti');
  window.scrollTo(0, 0); // Reset scroll per sicurezza
  loadProducts();
  setupCategoryButtons();
}

function loadProducts() {
  const grid = document.getElementById('product-grid');
  const filteredProducts = products.filter(p => p.categoria === currentCategory);
  
  grid.innerHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="showProductDetails('${product.nome}')">
      <div class="product-image">
        <img src="${product.immagine}" alt="${product.nome}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltbWFnaW5lIG5vbiBkaXNwb25pYmlsZTwvdGV4dD4KICA8L3N2Zz4K'">
      </div>
      <div class="product-info">
        <div class="product-name">${product.nome}</div>
        <div class="product-description-preview">${product.descrizione.substring(0, 120)}...</div>
        <div class="product-cta">
          Scopri di più <span class="material-icons">arrow_forward</span>
        </div>
      </div>
    </div>
  `).join('');
}

function setupCategoryButtons() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset scroll quando si cambia categoria
      window.scrollTo(0, 0);
      
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      loadProducts();
    });
  });
}

function showProductDetails(productName) {
  // Reset scroll all'apertura del modale prodotto
  window.scrollTo(0, 0);
  
  const product = products.find(p => p.nome === productName);
  if (!product) return;

  document.getElementById('product-modal-title').textContent = 'Dettaglio Prodotto';
  document.getElementById('product-modal-name').textContent = product.nome;
  document.getElementById('product-modal-img').src = product.immagine;
  document.getElementById('product-modal-img').alt = product.nome;
  
  const description = document.getElementById('product-modal-description');
  let content = `<p>${product.descrizione.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  
  if (Object.keys(product.specs).length > 0) {
    content += `
      <div class="product-tech-specs">
        <h4>Informazioni Tecniche</h4>
        ${Object.entries(product.specs).map(([key, value]) => `
          <div class="tech-spec-item">
            <span class="tech-spec-label">${key}</span>
            <span class="tech-spec-value">${value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  description.innerHTML = content;
  
  const modal = document.getElementById('product-modal');
  modal.classList.add('show');
  
  // Chiusura con ESC
  document.addEventListener('keydown', handleProductModalEsc);
  // Chiusura cliccando fuori
  modal.addEventListener('click', handleProductModalClickOutside);
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.remove('show');
  document.removeEventListener('keydown', handleProductModalEsc);
  modal.removeEventListener('click', handleProductModalClickOutside);
  // Reset scroll alla chiusura del modale
  window.scrollTo(0, 0);
}

function handleProductModalEsc(e) {
  if (e.key === 'Escape') {
    closeProductModal();
  }
}

function handleProductModalClickOutside(e) {
  if (e.target === e.currentTarget) {
    closeProductModal();
  }
}

// PWA - Service Worker Registration e Install Prompt
let deferredPrompt;
let installButton;

// Registra il Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registrato con successo:', registration.scope);
      }, function(err) {
        console.log('Service Worker registration failed:', err);
      });
  });
}

// Gestione dell'evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired');
  e.preventDefault();
  deferredPrompt = e;
  showInstallPromotion();
});

// Mostra il prompt di installazione
function showInstallPromotion() {
  // Crea il banner di installazione se non esiste
  if (!document.getElementById('install-banner')) {
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div class="install-content">
        <img src="assets/images/icons/appicon.png" alt="Otofarma" class="install-icon">
        <div class="install-text">
          <h3>Installa Otofarma</h3>
          <p>Aggiungi l'app alla schermata home per un accesso rapido</p>
        </div>
        <div class="install-actions">
          <button class="install-btn" onclick="installApp()">Installa</button>
          <button class="dismiss-btn" onclick="dismissInstallBanner()">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    
    // Mostra il banner con animazione
    setTimeout(() => banner.classList.add('show'), 100);
  }
}

// Installa l'app
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        dismissInstallBanner();
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
}

// Nascondi il banner di installazione
function dismissInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) {
    banner.classList.add('hide');
    setTimeout(() => banner.remove(), 300);
  }
}

// Controlla se l'app è già installata
window.addEventListener('appinstalled', (evt) => {
  console.log('App installata con successo');
  dismissInstallBanner();
});

// Video Avatar System
let stillVideo = null;
let moveVideo = null;
let isVideoAvatarSpeaking = false;

// Initialize video avatar system
function initVideoAvatar() {
  stillVideo = document.getElementById('avatar-still');
  moveVideo = document.getElementById('avatar-move');
  
  if (!stillVideo || !moveVideo) {
    console.log('Video avatar elements not found');
    return;
  }
  
  console.log('Initializing video avatar system...');
  
  // Ensure still video is active by default
  stillVideo.classList.add('active');
  moveVideo.classList.remove('active');
  
  // Handle video loading
  stillVideo.addEventListener('canplay', () => {
    console.log('Still video loaded and ready');
    stillVideo.play().catch(e => console.log('Still video autoplay prevented:', e));
  });
  
  moveVideo.addEventListener('canplay', () => {
    console.log('Move video loaded and ready');
  });
  
  // Handle move video ending - restart if still speaking
  moveVideo.addEventListener('ended', () => {
    console.log('Move video ended');
    if (isVideoAvatarSpeaking) {
      console.log('Still speaking, restarting move video');
      moveVideo.currentTime = 0;
      moveVideo.play().catch(e => console.log('Move video restart failed:', e));
    } else {
      console.log('Finished speaking, returning to still video');
      returnToStillVideo();
    }
  });
  
  // Handle video errors
  stillVideo.addEventListener('error', (e) => {
    console.error('Error loading still video:', e);
  });
  
  moveVideo.addEventListener('error', (e) => {
    console.error('Error loading move video:', e);
  });
  
  console.log('✅ Video avatar system initialized');
}

// Start avatar speaking animation (switch to move video)
function startVideoAvatarSpeaking(duration) {
  if (!stillVideo || !moveVideo || isVideoAvatarSpeaking) {
    return;
  }
  
  console.log('Starting video avatar speaking animation for', duration, 'ms');
  isVideoAvatarSpeaking = true;
  
  // Add speaking class for visual effects
  stillVideo.classList.add('speaking');
  moveVideo.classList.add('speaking');
  
  // Smooth transition to move video
  stillVideo.classList.add('transitioning');
  moveVideo.classList.add('transitioning');
  
  setTimeout(() => {
    stillVideo.classList.remove('active');
    moveVideo.classList.add('active');
    
    moveVideo.currentTime = 0;
    moveVideo.play().then(() => {
      console.log('Move video started playing');
      
      // Ascolta l'evento di fine video per tornare automaticamente al video still
      const handleVideoEnd = () => {
        console.log('Move video ended naturally');
        moveVideo.removeEventListener('ended', handleVideoEnd);
        if (isVideoAvatarSpeaking) {
          returnToStillVideo();
        }
      };
      
      moveVideo.addEventListener('ended', handleVideoEnd);
      
    }).catch(e => {
      console.log('Move video play failed:', e);
      returnToStillVideo();
      return;
    });
    
    stillVideo.classList.remove('transitioning');
    moveVideo.classList.remove('transitioning');
  }, 200);
  
  // Fallback: torna al video still dopo la durata specificata solo se il video non è ancora finito
  setTimeout(() => {
    if (isVideoAvatarSpeaking && !moveVideo.ended) {
      console.log('Duration timeout reached, but video still playing');
      // Se il video sta ancora andando, lascialo finire naturalmente
    } else if (isVideoAvatarSpeaking && moveVideo.ended) {
      console.log('Duration timeout reached and video ended');
      returnToStillVideo();
    }
  }, duration);
}

// Return to still video
function returnToStillVideo() {
  if (!stillVideo || !moveVideo) return;
  
  console.log('Returning to still video');
  isVideoAvatarSpeaking = false;
  
  // Remove speaking effects
  stillVideo.classList.remove('speaking');
  moveVideo.classList.remove('speaking');
  
  // Smooth transition back to still video
  stillVideo.classList.add('transitioning');
  moveVideo.classList.add('transitioning');
  
  setTimeout(() => {
    moveVideo.classList.remove('active');
    stillVideo.classList.add('active');
    
    // Ensure still video is playing
    stillVideo.play().catch(e => console.log('Still video play failed:', e));
    
    stillVideo.classList.remove('transitioning');
    moveVideo.classList.remove('transitioning');
  }, 200);
}

// Stop avatar speaking
function stopVideoAvatarSpeaking() {
  console.log('Stopping video avatar speaking');
  isVideoAvatarSpeaking = false;
  returnToStillVideo();
}

// Noise Detector System
let noiseAnalyser = null;
let noiseDataArray = null;
let noiseAudioContext = null;
let noiseSource = null;
let noiseStream = null;
let noiseAnimationId = null;

function openNoiseDetector() {
  const modal = document.getElementById('noise-modal');
  modal.classList.add('show');
  
  // Reset dei controlli
  document.getElementById('noise-start-btn').style.display = 'flex';
  document.getElementById('noise-stop-btn').style.display = 'none';
  document.getElementById('noise-value').textContent = '0';
  document.getElementById('noise-status').className = 'noise-status';
  document.getElementById('noise-status').querySelector('.status-text').textContent = 'In attesa...';
}

function closeNoiseDetector() {
  const modal = document.getElementById('noise-modal');
  modal.classList.remove('show');
  
  // Ferma il rilevamento se attivo
  stopNoiseDetection();
}

async function startNoiseDetection() {
  try {
    // Richiedi accesso al microfono con configurazioni ottimizzate
    noiseStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 44100, // Frequenza di campionamento elevata
        channelCount: 1     // Mono per semplicità
      }
    });
    
    // Crea il contesto audio
    noiseAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    noiseSource = noiseAudioContext.createMediaStreamSource(noiseStream);
    noiseAnalyser = noiseAudioContext.createAnalyser();
    
    // Configurazione dell'analizzatore ottimizzata per il rilevamento del volume
    noiseAnalyser.fftSize = 1024; // Riduciamo per performance migliori
    noiseAnalyser.smoothingTimeConstant = 0.1; // Risposta più veloce
    noiseAnalyser.minDecibels = -90;
    noiseAnalyser.maxDecibels = -10;
    
    const bufferLength = noiseAnalyser.fftSize;
    noiseDataArray = new Float32Array(bufferLength);
    
    // Connetti source all'analizzatore
    noiseSource.connect(noiseAnalyser);
    
    // Cambia i controlli
    document.getElementById('noise-start-btn').style.display = 'none';
    document.getElementById('noise-stop-btn').style.display = 'flex';
    
    // Inizia l'analisi
    analyzeNoise();
    
    console.log('Noise detection started');
    
  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Errore nell\'accesso al microfono. Assicurati di aver concesso i permessi.');
  }
}

function stopNoiseDetection() {
  // Ferma l'animazione
  if (noiseAnimationId) {
    cancelAnimationFrame(noiseAnimationId);
    noiseAnimationId = null;
  }
  
  // Chiudi il flusso audio
  if (noiseStream) {
    noiseStream.getTracks().forEach(track => track.stop());
    noiseStream = null;
  }
  
  // Chiudi il contesto audio
  if (noiseAudioContext) {
    noiseAudioContext.close();
    noiseAudioContext = null;
  }
  
  // Reset delle variabili
  noiseAnalyser = null;
  noiseDataArray = null;
  noiseSource = null;
  
  // Reset dei controlli
  document.getElementById('noise-start-btn').style.display = 'flex';
  document.getElementById('noise-stop-btn').style.display = 'none';
  document.getElementById('noise-value').textContent = '0';
  
  const statusElement = document.getElementById('noise-status');
  statusElement.className = 'noise-status';
  statusElement.querySelector('.status-text').textContent = 'In attesa...';
  
  console.log('Noise detection stopped');
}

function analyzeNoise() {
  if (!noiseAnalyser || !noiseDataArray) return;
  
  // Prova prima con getFloatTimeDomainData
  noiseAnalyser.getFloatTimeDomainData(noiseDataArray);
  
  // Verifica se i dati sono validi
  let hasValidData = false;
  for (let i = 0; i < Math.min(100, noiseDataArray.length); i++) {
    if (noiseDataArray[i] !== 0) {
      hasValidData = true;
      break;
    }
  }
  
  let decibels = 30; // Valore di default
  
  if (hasValidData) {
    // Calcola RMS con i dati float
    let sum = 0;
    for (let i = 0; i < noiseDataArray.length; i++) {
      const sample = noiseDataArray[i];
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / noiseDataArray.length);
    
    if (rms > 0) {
      // Calcolo dei decibel ottimizzato per microfoni web
      decibels = 20 * Math.log10(rms) + 94;
      decibels = Math.max(30, Math.min(100, decibels));
    }
  } else {
    // Fallback usando getByteTimeDomainData se Float non funziona
    const byteArray = new Uint8Array(noiseAnalyser.fftSize);
    noiseAnalyser.getByteTimeDomainData(byteArray);
    
    // Calcola il volume medio dai dati byte
    let sum = 0;
    for (let i = 0; i < byteArray.length; i++) {
      const normalized = (byteArray[i] - 128) / 128; // Normalizza -1 to 1
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / byteArray.length);
    
    if (rms > 0) {
      // Converti in decibel con scala appropriata
      decibels = 20 * Math.log10(rms) + 60; // Offset diverso per i dati byte
      decibels = Math.max(30, Math.min(100, decibels));
    }
  }
  
  // Aggiungi una piccola variazione casuale per simulare la sensibilità del microfono
  // quando è effettivamente attivo ma in un ambiente molto silenzioso
  if (decibels <= 35) {
    decibels += Math.random() * 5; // +0-5 dB di variazione naturale
  }
  
  // Aggiorna il display
  updateNoiseDisplay(Math.round(decibels));
  
  // Continua l'analisi
  noiseAnimationId = requestAnimationFrame(analyzeNoise);
}

function updateNoiseDisplay(decibels) {
  const valueElement = document.getElementById('noise-value');
  const statusElement = document.getElementById('noise-status');
  const circleElement = document.querySelector('.noise-level-circle');
  
  // Aggiorna il valore
  valueElement.textContent = decibels;
  
  // Aggiorna lo status e i colori
  let statusClass = '';
  let statusText = '';
  
  if (decibels < 40) {
    statusClass = 'quiet';
    statusText = 'Ambiente silenzioso';
    circleElement.classList.remove('pulse');
  } else if (decibels < 60) {
    statusClass = 'moderate';
    statusText = 'Rumore moderato';
    circleElement.classList.remove('pulse');
  } else if (decibels < 80) {
    statusClass = 'loud';
    statusText = 'Ambiente rumoroso';
    circleElement.classList.add('pulse');
  } else {
    statusClass = 'very-loud';
    statusText = 'Molto rumoroso!';
    circleElement.classList.add('pulse');
  }
  
  statusElement.className = `noise-status ${statusClass}`;
  statusElement.querySelector('.status-text').textContent = statusText;
}