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
sincronizzano da soli, a meno di attivare la condivisione (punto 6). Per
allineare manualmente: **↓** su uno, **↑** sull'altro.

Fai comunque un **↓** ogni tanto. Se disinstalli l'app o cancelli i dati di
navigazione del browser, IndexedDB viene svuotato senza chiedere conferma.

## 5. Più viaggi

L'icona 🗂 in alto, accanto all'indicatore di salvataggio, apre l'elenco dei
tuoi viaggi. Da lì puoi:

- **aprire** un viaggio già salvato (basta toccarne il nome);
- **eliminarlo** con la ✕ (non si può annullare);
- creare **＋ Nuovo viaggio**: parte vuoto, senza toccare gli altri.

Ogni viaggio resta salvato per conto suo. Importare un file (**↑**) non
sovrascrive mai in silenzio quello che hai aperto: se il file non corrisponde
a un viaggio già presente diventa un nuovo viaggio nell'elenco; se corrisponde
a uno che hai già, l'app chiede conferma prima di sovrascriverlo.

## 6. Date, vista Calendario e meteo

Ogni giorno può avere una data reale (tocca il campo data nell'intestazione,
vista Itinerario). Se la imposti sul **primo** giorno, l'app propone di
calcolare in automatico quelle dei giorni successivi (+1 al giorno): restano
comunque tutte modificabili singolarmente, utile per una sosta di più notti
nello stesso posto.

La nuova vista **📅** mostra un riquadro per giorno con data, numero di tappe,
la tappa principale e un'icona 🏨 (piena se hai già segnato un alloggio quel
giorno, spenta se manca ancora). Toccando un riquadro torni all'Itinerario con
quel giorno evidenziato.

Se un giorno ha una data entro le prossime due settimane, compare anche il
meteo previsto (temperatura e un'icona sole/nuvola/pioggia — dati
[Open-Meteo](https://open-meteo.com), gratuiti, aggiornati poche volte al
giorno). Oltre quella finestra non si inventa nulla: resta un trattino. Il
badge mostra sempre la condizione **peggiore** della giornata — se piove anche
solo un'ora, segna pioggia — proprio per farla notare a colpo d'occhio.
Quando è prevista pioggia **e** il giorno ha già tappe segnate come
"alternativa se piove", il badge lo segnala con un ☂ — un modo rapido per
sapere se serve ancora un piano B.

Toccando il badge si apre il meteo completo di quella giornata: temperatura,
probabilità e quantità di pioggia, vento, alba e tramonto, e l'andamento ora
per ora.

## 7. Condivisione tra due dispositivi

Dalla stessa sheet 🗂 puoi condividere il viaggio aperto con un'altra persona
(es. compagno/a di viaggio):

- **🔗 Condividi questo viaggio** genera un codice: comunicalo (a voce, in
  chat…) a chi deve unirsi.
- Sull'altro dispositivo, **＋ Unisciti con un codice** e incolla quel codice:
  scarica il viaggio condiviso come nuovo viaggio locale.

Da quel momento, ogni volta che uno dei due salva una modifica, sull'altro
dispositivo compare in basso *"Il viaggio è stato aggiornato dall'altro
dispositivo"* con un pulsante **Ricarica**: nessun aggiornamento automatico o
in tempo reale, la scelta di quando prendere l'ultima versione resta sempre
tua. Foto e allegati delle prenotazioni vengono sincronizzati anche loro.

**Il codice di condivisione vale come una password**: chiunque lo conosca può
leggere e modificare quel viaggio. Comunicalo solo alla persona giusta, come
faresti con un link "chiunque abbia il link può modificare".

Questa funzione richiede una configurazione una tantum (un progetto Firebase
gratuito) fatta da chi ha creato l'app: finché non è attiva, i pulsanti di
condivisione avvisano semplicemente che non è ancora disponibile — il resto
dell'app funziona comunque normalmente.

## 8. Uso offline

Al primo avvio con rete l'app si mette in cache da sola. Le mappe si salvano
man mano che le esplori: **prima di partire, apri la zona che ti serve e
scorrila ai livelli di zoom che userai**. Quelle piastrelle resteranno
disponibili senza rete.

La cache tiene circa 1200 piastrelle e poi butta le più vecchie, per non
occupare spazio all'infinito.

Cosa **non** funziona offline, perché richiede per forza un server:
- la ricerca dei luoghi (usa "tocca la mappa" al suo posto)
- il calcolo dei tempi reali su strada (restano le stime, marcate con `~`)
- il meteo per giorno
- l'apertura di un giorno su Google Maps

Tutto il resto — tappe, note, foto, spese, prenotazioni, allegati — funziona
senza rete.

## 9. Aggiornare l'app in futuro

Se ti passo una versione nuova di `index.html`, caricala su GitHub al posto di
quella vecchia (**Add file → Upload files**, stesso nome, *Commit*). Cambia
anche `VERSION` in `sw.js` (es. da `v1` a `v2`) e ricarica anche quello: serve a
far riconoscere al browser che c'è del nuovo.

Alla prima apertura successiva comparirà in basso *Nuova versione disponibile*
con il pulsante **Aggiorna**. I tuoi dati non vengono toccati.
