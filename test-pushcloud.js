// Test di pushToCloud(): verifica la logica della transazione (fondere invece
// di sovrascrivere) SENZA toccare Firebase vero — Firestore è simulato in
// memoria. Estrae il vero codice da index.html, come test-merge.js.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function extract(re, name){
  const m = html.match(re);
  if(!m) throw new Error('non trovato nel sorgente: ' + name);
  return m[0];
}

const src = [
  extract(/const ENTITY_KEYS = \[[^\]]+\];/, 'ENTITY_KEYS'),
  extract(/function stripStamp\(e\)\{[\s\S]*?\n\}/, 'stripStamp'),
  extract(/function mergeTrips\(mine, theirs\)\{[\s\S]*?\n\}\n/, 'mergeTrips'),
  extract(/function mergeEntity\([\s\S]*?\n\}\n/, 'mergeEntity'),
  extract(/function orderMerged\([\s\S]*?\n\}\n/, 'orderMerged'),
  extract(/function mergeTombs\([\s\S]*?\n\}\n/, 'mergeTombs'),
  extract(/function cleanupCrossRefs\([\s\S]*?\n\}\n/, 'cleanupCrossRefs'),
  extract(/function cloudPayload\(tripState\)\{[\s\S]*?\n\}\n/, 'cloudPayload'),
  extract(/async function pushToCloud\(tripState\)\{[\s\S]*?\n\}\n/, 'pushToCloud'),
].join('\n\n');

let pass = 0, fail = 0;
function test(name, fn){
  return (async () => {
    try{ await fn(); pass++; console.log('OK   ' + name); }
    catch(e){ fail++; console.log('FAIL ' + name + '\n     ' + (e.stack || e.message)); }
  })();
}

// ---- Firestore finto: un solo documento, in memoria, con transazioni vere
// (get+set atomici sullo stesso oggetto, niente rete) ----
function makeFakeCloud(initialDoc){
  let doc = initialDoc; // null = non esiste ancora
  const tx = {
    get: async (ref) => ({
      exists: doc !== null,
      data: () => doc,
    }),
    set: (ref, data) => { doc = data; },
  };
  return {
    collection: () => ({ doc: () => ({}) }),
    runTransaction: async (fn) => fn(tx),
    _getDoc: () => doc,
  };
}

function baseTrip(){
  return {
    id:'trip1', title:'Scozia', shareId:'code1', cloudAt: 1000, view:{lat:0,lng:0,z:5},
    days:[{id:'d1', name:'Edimburgo', mAt:100}],
    places:[{id:'p1', dayId:'d1', name:'Castello', mAt:100}],
    expenses:[], bookings:[],
    people:[{id:'pe1', name:'Io', mAt:100}],
    tombs:[],
  };
}
const clone = o => JSON.parse(JSON.stringify(o));

function makeCtx({ deviceId, cloudDoc, localState }){
  const calls = { dbSet: [], handleIncomingShared: [] };
  const ctx = {
    ENTITY_KEYS: undefined, // popolato dal src
    DEVICE_ID: deviceId,
    fbReady: true,
    navigator: { onLine: true },
    firebase: { firestore: { FieldValue: { serverTimestamp: () => 'SERVER_TS' } } },
    fbDb: makeFakeCloud(cloudDoc),
    fbStorage: {},
    tripKey: id => 'rotta:trip:' + id,
    dbSet: async (k, v) => { calls.dbSet.push([k, v]); },
    cloudizeAttachments: async () => {},
    localizeAttachments: async (incoming) => { incoming.__localized = true; },
    handleIncomingShared: async (incoming) => { calls.handleIncomingShared.push(incoming); },
    state: localState,
    console,
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  return {ctx, calls};
}

(async () => {

await test('primo push: il documento non esiste, si scrive senza fondere', async () => {
  const mine = clone(baseTrip());
  const {ctx, calls} = makeCtx({deviceId:'A', cloudDoc:null, localState: clone(mine)});
  await ctx.pushToCloud(mine);
  // pushToCloud non ritorna nulla di utile: verifico lo stato del "cloud" finto
  const doc = ctx.fbDb._getDoc();
  assert.ok(doc, 'il documento deve essere stato scritto');
  assert.strictEqual(doc.deviceId, 'A');
  assert.strictEqual(doc.places.length, 1);
  assert.strictEqual(calls.handleIncomingShared.length, 0, 'nessuna fusione al primo push');
});

await test('ripush dello stesso dispositivo: sovrascrive senza fondere (nessuno scritto nel frattempo)', async () => {
  const mine = clone(baseTrip());
  mine.places.push({id:'p2', dayId:'d1', name:'Nuova tappa', mAt: 5000});
  const oldCloudDoc = {...clone(baseTrip()), deviceId:'A', updatedAt:'x'};
  const {ctx, calls} = makeCtx({deviceId:'A', cloudDoc: oldCloudDoc, localState: clone(mine)});
  await ctx.pushToCloud(mine);
  const doc = ctx.fbDb._getDoc();
  assert.strictEqual(doc.places.length, 2, 'la mia versione più recente vince, senza bisogno di fondere');
  assert.strictEqual(calls.handleIncomingShared.length, 0, 'nessuna riconciliazione locale: non ha scritto nessun altro');
});

await test('scrittura concorrente da un altro dispositivo: la transazione fonde, e la fusione torna anche in locale', async () => {
  const base = baseTrip();
  const mine = clone(base);
  mine.expenses.push({id:'e1', desc:'Benzina', amount:10, byIds:['pe1'], forIds:['pe1'], mAt: 5000});

  const theirsDoc = {...clone(base), deviceId:'B', updatedAt:'x'};
  theirsDoc.places.push({id:'p2', dayId:'d1', name:'Tappa di lei', mAt: 6000});

  const localState = clone(mine); // lo stato "vivo" dell'app, uguale a mine in questo test
  const {ctx, calls} = makeCtx({deviceId:'A', cloudDoc: theirsDoc, localState});
  await ctx.pushToCloud(mine);

  const doc = ctx.fbDb._getDoc();
  assert.strictEqual(doc.deviceId, 'A', 'il documento risultante porta comunque il mio deviceId');
  assert.ok(doc.places.some(p => p.id === 'p2'), 'la tappa di chi ha scritto per primo non deve sparire');
  assert.ok(doc.expenses.some(e => e.id === 'e1'), 'la mia spesa non deve sparire');

  assert.strictEqual(calls.handleIncomingShared.length, 1, 'la fusione va riconciliata anche in locale');
  const incoming = calls.handleIncomingShared[0];
  assert.ok(incoming.places.some(p => p.id === 'p2'), 'la riconciliazione locale porta anche la tappa di lei');
  assert.ok(incoming.__localized, 'prima di riconciliare va passata da localizeAttachments');
});

await test('scrittura concorrente ma il chiamante ha già cambiato viaggio: niente riconciliazione a sproposito', async () => {
  const base = baseTrip();
  const mine = clone(base);
  const theirsDoc = {...clone(base), deviceId:'B', updatedAt:'x'};
  theirsDoc.places.push({id:'p2', dayId:'d1', name:'Tappa di lei', mAt: 6000});

  const localState = clone(base);
  localState.id = 'un-altro-viaggio'; // nel frattempo l'utente ha aperto un altro viaggio
  const {ctx, calls} = makeCtx({deviceId:'A', cloudDoc: theirsDoc, localState});
  await ctx.pushToCloud(mine);

  assert.strictEqual(calls.handleIncomingShared.length, 0, 'non deve toccare lo stato di un viaggio diverso da quello che ha spinto');
});

console.log('\n' + pass + ' passati, ' + fail + ' falliti');
process.exit(fail ? 1 : 0);

})();
