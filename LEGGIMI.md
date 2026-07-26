# Waynder — installazione come app

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
**⋮ → Installa Waynder**. Ottieni una finestra propria e l'icona nel menu Start.

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

## 6. Date e meteo

Ogni giorno può avere una data reale (tocca il campo data nell'intestazione,
vista Itinerario). Se la imposti sul **primo** giorno, l'app propone di
calcolare in automatico quelle dei giorni successivi (+1 al giorno): restano
comunque tutte modificabili singolarmente, utile per una sosta di più notti
nello stesso posto.

Se un giorno ha una data entro le prossime due settimane, nell'intestazione
compare anche una piccola icona meteo (☀️/⛅/🌧️ ecc. — dati
[Open-Meteo](https://open-meteo.com), gratuiti, aggiornati poche volte al
giorno) accanto a info e comprimi. Oltre quella finestra non si inventa
nulla: l'icona resta assente. Mostra sempre la condizione **peggiore** della
giornata — se piove anche solo un'ora, segna pioggia — proprio per farla
notare a colpo d'occhio.

Toccandola si apre il meteo completo di quella giornata: temperatura,
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

## 9. Diario di viaggio

L'icona **📔** apre il Diario: qui si segna cosa avete fatto *davvero*, durante
o dopo il viaggio.

Ogni tappa dell'Itinerario ha un pulsante **Segna come fatta**: una volta
toccato, nel Diario compare uno spazio per scrivere com'è andata (diverso
dalla nota di pianificazione) e una piccola galleria dove caricare le foto
di quel momento — fino a 6 per tappa, per non appesantire troppo l'archivio
del viaggio.

Per un ricordo non pianificato in anticipo, si crea prima una tappa come al
solito dall'Itinerario (anche solo un punto generico su un'area, non serve
per forza il luogo preciso) e la si segna subito come fatta.

## 9quinquies. Le Basi (v16)

Una **Base** è dove si dorme: l'hotel, il B&B, l'appartamento. Ogni giorno ha
una **base di partenza** e una **base di ritorno** (di solito la stessa, a
meno che quel giorno non ci si sposti in un'altra città/alloggio).

Le basi si scelgono toccando le pillole "Parte da" / "Arriva a" che aprono
e chiudono il nastro delle tappe di ogni giorno, ai due estremi. Restano
memorizzate: create quella di Edimburgo il primo giorno, richiamatela con
un tocco per tutti i giorni successivi in cui dormite lì, senza doverla
ricercare da capo ogni volta. "➕ Nuova base…" nel menu che si apre
toccando la pillola avvia la stessa ricerca usata per le tappe (o "tocca
la mappa").

Creare una base genera in automatico anche la prenotazione **Alloggio**
corrispondente in Prenotazioni, già con il nome compilato: basta finirla
con check-in, check-out, costo e codice.

Così le tappe di un giorno restano solo quelle effettive — bar, musei,
sentieri — senza dover ripetere "Edimburgo" come partenza e arrivo di
ogni singola giornata.

## 9septies. Novità di questa versione (v28)

- Le tappe senza giorno si chiamano ora **Brainstorming** (prima "Da
  assegnare"): stesso posto in fondo all'Itinerario, solo un nome più chiaro
  per delle idee ancora da smistare su un giorno.
- Le **Basi** ora entrano davvero nel percorso: il tempo/km di ogni giornata
  parte dalla base (non più dalla prima tappa) e torna alla base di arrivo.
  A piedi o in auto si decide da solo in base alla distanza (sotto 1,5 km
  è a piedi), senza bisogno di configurare nulla.
- Nella vista **solo mappa** sono comparsi due bottoni tondi in alto a
  destra, sopra i controlli di zoom:
  - il primo cicla tra *tutto* / *solo tappe del giorno* / *solo
    Brainstorming* (icona a strati, tappe, lampadina);
  - il secondo isola un giorno alla volta (G1, G2…), con un anello che
    riempendosi mostra a che punto del ciclo sei; un tocco lungo torna
    subito a "tutti i giorni" senza dover ciclare fino in fondo. Isolando
    un giorno, il Brainstorming mostrato si restringe a quello nel raggio
    di 50 km, invece di tutte le idee sparse per il viaggio.
- Corretto lo zoom instabile su telefono: un pizzico sulla mappa non fa più
  "saltare" anche l'intera pagina.

## 9sexies. Novità di questa versione (v16)

- Le tappe nel nastro sono ora card compatte (foto quadrata piccola, nome e
  descrizione troncata): toccandole si apre la scheda intera con foto grande,
  descrizione completa, link e i pulsanti Modifica/Elimina.
- L'intestazione di ogni giorno è più snella: data e nome raggruppati a
  sinistra, meteo/info/altre azioni/comprimi come 4 icone uguali e
  equidistanti a destra.
- Tolta la vista **Calendario**: era ridondante con l'Itinerario, che ormai
  mostra già data, meteo e le stesse azioni di ogni giorno in un colpo
  d'occhio.
- Palette leggermente più chiara e leggibile.

## 9quater. Novità di questa versione (v15)

- Nuova palette sui toni del petrolio, in tema con l'icona.
- Tolto il pulsante "Nomi" (occupava spazio prezioso in alto e faceva andare
  tutto a capo); i nomi sulla mappa restano visibili come prima, si
  nascondono solo automaticamente se sei molto lontano con lo zoom.
- "I tuoi viaggi · Condividi · Unisciti" e "Inquadra tutto · Comprimi ·
  Espandi" ora sono due righe da 3 pulsanti allineati in una griglia.
- Il nome del viaggio in alto è più piccolo, per lasciare spazio al resto.
- "Aggiungi una tappa": il campo di ricerca e il pulsante per toccare la
  mappa stanno ora sulla stessa riga invece che uno sopra l'altro.

## 9ter. Novità di questa versione (v14)

- L'app si chiama **Waynder**: nuovo nome e nuova icona (schermata Home,
  scheda del browser, finestra installata).
- Il pulsante che mostra solo la mappa non è più un tasto a parte che poteva
  finire sopra "＋ Giorno": ora è il sesto tab nella barra, accanto a Tappe/
  Spese/Prenot./Calendario/Diario, e si accende quando la mappa è a schermo
  intero.
- **Esporta** e **Importa** il file del viaggio si trovano ora dentro "I tuoi
  viaggi", non più come icone fisse in fondo su ogni schermata.

## 9bis. Novità di questa versione (v13)

- **Condividi** e **Unisciti con un codice** ora sono due pulsanti sempre
  visibili in alto, non più nascosti dentro "I tuoi viaggi" (che resta solo
  per passare da un viaggio all'altro).
- Le **spese** si possono modificare toccandole, non solo eliminare e
  ricreare da zero.
- Ogni giorno dell'Itinerario mostra ora il nome bene in vista, con data e
  pulsanti "Inquadra / Maps / Elimina" più grandi e leggibili sotto.
- Una nuova tappa si aggiunge di default allo stesso giorno appena usato
  (prima finiva sempre nel Giorno 1).
- Il badge 🏨 nel Calendario ora tiene conto anche delle prenotazioni di
  tipo Alloggio, non solo delle tappe segnate come "Dormire".

## 10. Aggiornare l'app in futuro

Se ti passo una versione nuova di `index.html`, caricala su GitHub al posto di
quella vecchia (**Add file → Upload files**, stesso nome, *Commit*). Cambia
anche `VERSION` in `sw.js` (es. da `v1` a `v2`) e ricarica anche quello: serve a
far riconoscere al browser che c'è del nuovo.

Alla prima apertura successiva comparirà in basso *Nuova versione disponibile*
con il pulsante **Aggiorna**. I tuoi dati non vengono toccati.
