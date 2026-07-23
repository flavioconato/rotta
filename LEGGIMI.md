# Rotta — installazione come app

Cinque file, una cartella. Vanno pubblicati insieme su un indirizzo HTTPS: il
funzionamento offline richiede un service worker, che i browser attivano solo
su HTTPS e mai aprendo il file con doppio clic.

## 1. Pubblicare su GitHub Pages (gratuito, stabile nel tempo)

1. Crea un account su **github.com** se non ce l'hai.
2. In alto a destra **＋ → New repository**. Nome: `rotta`. Scegli **Public**
   (Pages non funziona sui repository privati nel piano gratuito). Crea.
3. Nella pagina del repository vuoto: **uploading an existing file**.
4. Trascina **tutti** i file di questa cartella insieme:
   `index.html`, `manifest.webmanifest`, `sw.js`,
   `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `favicon.png`
5. In fondo, **Commit changes**.
6. **Settings** (in alto) → **Pages** (colonna a sinistra).
   Sotto *Source* scegli **Deploy from a branch**; *Branch*: **main**, cartella
   **/ (root)**. **Save**.
7. Aspetta 1-2 minuti e ricarica quella pagina: comparirà l'indirizzo, del tipo
   `https://TUONOME.github.io/rotta/`

Quell'indirizzo è la tua app. Salvalo.

## 2. Installare su Android

1. Apri l'indirizzo con **Chrome**.
2. Compare il pulsante verde **⤓ Installa** in alto tra i comandi: premilo.
   Se non compare: menu **⋮ → Installa app** (o *Aggiungi a schermata Home*).
3. Trovi l'icona tra le app. Si apre a schermo intero, senza barra del browser.

## 3. Installare su PC

Stesso indirizzo con **Chrome** o **Edge**. Nella barra degli indirizzi appare
un'icona di installazione a destra (un monitor con una freccia), oppure
**⋮ → Installa Rotta**. Ottieni una finestra propria e l'icona nel menu Start.

Su Firefox e Safari desktop l'installazione non è supportata: l'app funziona
lo stesso nella scheda del browser, con salvataggio e offline attivi.

## 4. Come funziona il salvataggio

I dati vanno in **IndexedDB**, un archivio del browser sul dispositivo. Non devi
più ricaricare il JSON a ogni apertura: chiudi l'app e alla riapertura ritrovi
tutto. L'indicatore in alto a destra dice *Salvato* in verde quando è a posto.

Restano validi i pulsanti **↓** e **↑**: servono per il backup e per spostare
un viaggio da un dispositivo all'altro.

**Importante**: i dati sono locali a ciascun dispositivo. Telefono e PC non si
sincronizzano da soli. Per allineare: **↓** su uno, **↑** sull'altro.

Fai comunque un **↓** ogni tanto. Se disinstalli l'app o cancelli i dati di
navigazione del browser, IndexedDB viene svuotato senza chiedere conferma.

## 5. Uso offline

Al primo avvio con rete l'app si mette in cache da sola. Le mappe si salvano
man mano che le esplori: **prima di partire, apri la zona che ti serve e
scorrila ai livelli di zoom che userai**. Quelle piastrelle resteranno
disponibili senza rete.

La cache tiene circa 1200 piastrelle e poi butta le più vecchie, per non
occupare spazio all'infinito.

Cosa **non** funziona offline, perché richiede per forza un server:
- la ricerca dei luoghi (usa "＋ Punto sulla mappa" al suo posto)
- il calcolo dei tempi reali su strada (restano le stime, marcate con `~`)
- l'apertura di un giorno su Google Maps

Tutto il resto — tappe, note, foto, spese, prenotazioni, allegati — funziona
senza rete.

## 6. Aggiornare l'app in futuro

Se ti passo una versione nuova di `index.html`, caricala su GitHub al posto di
quella vecchia (**Add file → Upload files**, stesso nome, *Commit*). Cambia
anche `VERSION` in `sw.js` (es. da `v1` a `v2`) e ricarica anche quello: serve a
far riconoscere al browser che c'è del nuovo.

Alla prima apertura successiva comparirà in basso *Nuova versione disponibile*
con il pulsante **Aggiorna**. I tuoi dati non vengono toccati.
