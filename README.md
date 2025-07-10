# Otofarma WebApp

## Struttura del Progetto

```
webapp/
├── index.html                          # Pagina principale
├── manifest.json                       # Manifest PWA
├── sw.js                              # Service Worker
├── assets/                             # Risorse statiche
│   ├── css/
│   │   └── style.css                   # Fogli di stile
│   ├── js/
│   │   └── script.js                   # JavaScript principale
│   ├── videos/                         # Video avatar
│   │   ├── still.mp4                   # Video statico
│   │   └── move.mp4                    # Video in movimento
│   └── images/                         # Immagini
│       ├── logo-otofarma.png          # Logo aziendale
│       ├── icons/                      # Icone SVG
│       │   ├── appicon.png            # Icona app
│       │   ├── ear-left.svg           # Icona orecchio
│       │   ├── facebook.svg           # Icona Facebook
│       │   ├── instagram.svg          # Icona Instagram
│       │   ├── linkedin.svg           # Icona LinkedIn
│       │   ├── whatsapp.svg           # Icona WhatsApp
│       │   └── youtube.svg            # Icona YouTube
│       └── products/                   # Immagini prodotti
│           ├── prodotto_endo.png      # Apparecchio Serie ENDO
│           ├── prodotto_cic.png       # Apparecchio Serie CIC
│           ├── prodotto_retro.png     # Apparecchio Serie Retro
│           ├── accessorio_remote.png  # Telecomando
│           ├── accessorio_tv.png      # TV Connector
│           ├── accessorio_charger.png # Caricabatterie
│           ├── accessorio_powerbank.png # Power Bank
│           └── accessorio_app.png     # App Remote Plus
└── data/
    └── farmacie.csv                    # Database farmacie convenzionate
```

## Funzionalità

### 🏠 Home
- Presentazione aziendale con logo
- Video avatar interattivo
- Accesso rapido alle funzioni principali:
  - Catalogo prodotti
  - Farmacie convenzionate
  - Rilevatore rumori ambientali

### 💬 Chat
- **Avatar Video Interattivo**: Sistema avanzato con video still/movimento
- **Assistente virtuale AI**: Integrazione con chatbot esterno
- **FAQ interattive**: Modale con domande frequenti espandibili
- **Riconoscimento vocale**: Input tramite microfono

### 🔬 Analisi
- **Upload immagini orecchie**: Caricamento foto orecchio destro/sinistro
- **Analisi AI**: Integrazione con sistema di diagnosi automatizzata
- **Storico diagnosi**: Salvataggio locale e visualizzazione in modale
- **Condivisione risultati**: Export e condivisione delle analisi

### 🎧 Test Udito
- **Test dell'udito integrato**: Iframe esterno specializzato
- **Screening audiologico**: Piattaforma Beyond Hearing

### � Rilevatore Rumori
- **Misurazione decibel in tempo reale**: Accesso al microfono
- **Indicatori visivi**: Cerchio colorato con livelli di rumore
- **Classificazione ambientale**: 
  - 0-40 dB: Silenzioso
  - 40-60 dB: Moderato  
  - 60-80 dB: Rumoroso
  - 80+ dB: Molto rumoroso
- **Animazioni pulse**: Per livelli elevati

### 🗺️ Farmacie
- **Mappa interattiva**: Integrazione Leaflet.js
- **Geolocalizzazione utente**: Marker posizione corrente
- **Caricamento incrementale**: Performance ottimizzate
- **Ricerca e filtri**: Ricerca per nome, città, indirizzo
- **Lista ordinata per distanza**: Calcolo automatico km
- **Popup informativi**: Azioni rapide (chiamata, email, indicazioni)
- **Marker personalizzati**: Icone distintive per farmacie e utente

### 🛍️ Prodotti
- **Catalogazione apparecchi acustici**:
  - Serie ENDO (fino a 80 dB)
  - Serie CIC (fino a 75 dB) 
  - Serie Retro Micro (fino a 80 dB)
- **Sezione accessori**:
  - Remote Control
  - TV Connector
  - Caricabatterie
  - Power Bank
  - App Remote Plus
- **Schede dettagliate in modale**: Specifiche tecniche complete
- **Categorie filtrabili**: Apparecchi vs Accessori

### 📞 Contatti
- **Informazioni aziendali complete**
- **Azioni rapide**: Chiamata, WhatsApp, sito web
- **Social media**: YouTube, Instagram, Facebook, LinkedIn
- **Mappa sede**: Google Maps integrata
- **Copia indirizzo**: Funzionalità clipboard

## Caratteristiche PWA

### 📱 Progressive Web App
- **Service Worker**: Cache offline e performance
- **Manifest**: Installazione come app nativa
- **Banner installazione**: Prompt automatico su dispositivi supportati
- **Icone adaptive**: Support per tutti i dispositivi
- **Tema personalizzato**: Colori aziendali

### 💾 Storage e Performance
- **LocalStorage**: Salvataggio storico diagnosi
- **Cache Strategy**: Risorse statiche e API
- **Lazy Loading**: Caricamento ottimizzato contenuti
- **Responsive Design**: Mobile-first approach

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PWA**: Service Workers, Web App Manifest
- **Mappe**: Leaflet.js
- **Icone**: Material Icons
- **Responsive**: CSS Grid e Flexbox
- **Storage**: LocalStorage, IndexedDB ready
- **Media**: HTML5 Video API, Web Audio API
- **Geolocalizzazione**: HTML5 Geolocation API
- **AI Integration**: External APIs per chat e diagnosi

## Integrazione API

### Chatbot
- **Endpoint**: `https://chatbot-1ai.onrender.com/chat`
- **CORS Proxy**: `https://cors-anywhere.herokuapp.com/`

### Diagnosi AI
- **Endpoint**: `https://otofarma-ai-diagnosis-nxyj.onrender.com/`
- **Upload**: FormData con immagini orecchie

### Test Udito
- **Provider**: Beyond Hearing
- **URL**: `https://hearing-screener.beyondhearing.org/`

## Note di Sviluppo

- Tutti i percorsi sono relativi alla root del progetto
- Le immagini hanno fallback per errori di caricamento
- Il design è completamente responsive con breakpoint a 768px e 480px
- Supporto per tutti i browser moderni con polyfill
- Fallback CSV demo per testing locale senza server
- Sistema video-avatar con transizioni smooth
- Geolocalizzazione con handling errori completo
- Performance ottimizzate per mobile

## Installazione e Setup

1. **Clone del repository**
2. **Serve da server HTTP** (no file:// per CORS)
3. **HTTPS consigliato** per PWA features complete
4. **Permessi richiesti**: Microfono, Geolocalizzazione, Fotocamera
