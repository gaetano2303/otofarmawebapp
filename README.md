# Otofarma WebApp

## Struttura del Progetto

```
webapp/
├── index.html                          # Pagina principale
├── assets/                             # Risorse statiche
│   ├── css/
│   │   └── style.css                   # Fogli di stile
│   ├── js/
│   │   └── script.js                   # JavaScript principale
│   └── images/                         # Immagini
│       ├── logo-otofarma.png          # Logo aziendale
│       ├── icons/                      # Icone SVG
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
- Presentazione aziendale
- Accesso rapido alle farmacie convenzionate
- Catalogo prodotti

### 💬 Chat
- Assistente virtuale
- FAQ interattive in modale

### 🔬 Analisi
- Upload immagini orecchie
- Storico diagnosi in modale
- Valutazione automatizzata

### 🎧 Test Udito
- Test dell'udito integrato
- Iframe esterno specializzato

### 📞 Contatti
- Informazioni aziendali
- Azioni rapide (chiamata, WhatsApp, sito)
- Social media
- Mappa interattiva

### 🗺️ Farmacie
- Mappa interattiva con Leaflet
- Geolocalizzazione utente
- Ricerca e filtri
- Lista ordinata per distanza
- Popup informativi con azioni rapide

### 🛍️ Prodotti
- Catalogazione apparecchi acustici
- Sezione accessori
- Schede dettagliate in modale
- Specifiche tecniche

## Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Mappe**: Leaflet.js
- **Icone**: Material Icons
- **Responsive**: CSS Grid e Flexbox
- **Dati**: CSV parsing
- **Geolocalizzazione**: HTML5 Geolocation API

## Note di Sviluppo

- Tutti i percorsi sono relativi alla root del progetto
- Le immagini hanno fallback per errori di caricamento
- Il design è completamente responsive
- Supporto per tutti i browser moderni
