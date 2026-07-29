// Test di mergeTrips(): niente da installare, solo `node test-merge.js`.
// Estrae la funzione (e le sue di supporto) dal vero index.html ed esegue i
// casi richiesti, così il test verifica il codice davvero spedito nell'app,
// non una sua reimplementazione.
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
].join('\n\n');

const ctx = {};
vm.createContext(ctx);
vm.runInContext(src, ctx);
const mergeTrips = (mine, theirs) => vm.runInContext('mergeTrips', ctx)(mine, theirs);

let pass = 0, fail = 0;
function test(name, fn){
  try{ fn(); pass++; console.log('OK   ' + name); }
  catch(e){ fail++; console.log('FAIL ' + name + '\n     ' + (e.stack || e.message)); }
}

// ---- fixture di base: un viaggio condiviso appena sincronizzato ----
function baseTrip(){
  return {
    id:'trip1', title:'Scozia', shareId:'code1', cloudAt: 1000, view:{lat:0,lng:0,z:5},
    days:[
      {id:'d1', name:'Edimburgo', mAt:100},
      {id:'d2', name:'Skye', mAt:100},
    ],
    places:[
      {id:'p1', dayId:'d1', name:'Castello', mAt:100},
      {id:'p2', dayId:'d2', name:'Old Man of Storr', mAt:100},
    ],
    expenses:[
      {id:'e1', desc:'Hotel', amount:80, byIds:['pe1'], forIds:['pe1','pe2'], mAt:100},
    ],
    bookings:[
      {id:'b1', type:'stay', title:'B&B Edimburgo', mAt:100},
    ],
    people:[
      {id:'pe1', name:'Io', mAt:100},
      {id:'pe2', name:'Anna', mAt:100},
    ],
    tombs:[],
  };
}
const clone = o => JSON.parse(JSON.stringify(o));

test('1. aggiunte incrociate: lei aggiunge tappe, io aggiungo spese, tutto resta', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  mine.expenses.push({id:'e2', desc:'Benzina', amount:40, byIds:['pe1'], forIds:['pe1','pe2'], mAt:2000});
  mine.expenses.push({id:'e3', desc:'Pranzo', amount:20, byIds:['pe1'], forIds:['pe1','pe2'], mAt:2000});
  theirs.places.push({id:'p3', dayId:'d2', name:'Fairy Pools', mAt:2000});
  theirs.places.push({id:'p4', dayId:'d2', name:'Portree', mAt:2000});
  theirs.places.push({id:'p5', dayId:'d2', name:'Quiraing', mAt:2000});

  const {merged, conflicts} = mergeTrips(mine, theirs);
  assert.strictEqual(conflicts.length, 0, 'nessun conflitto per pure aggiunte');
  assert.strictEqual(merged.places.length, 5, 'tutte le tappe (2 originali + 3 sue)');
  assert.strictEqual(merged.expenses.length, 3, 'tutte le spese (1 originale + 2 mie)');
  ['p1','p2','p3','p4','p5'].forEach(id => assert.ok(merged.places.some(p => p.id === id), 'manca ' + id));
  ['e1','e2','e3'].forEach(id => assert.ok(merged.expenses.some(e => e.id === id), 'manca ' + id));
  const order = merged.places.map(p => p.id);
  assert.ok(order.indexOf('p2') < order.indexOf('p3'), 'p3 deve stare dopo p2, non in testa');
});

test('2. stessa voce modificata da entrambi -> conflitto both-modified', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  mine.places[0].name = 'Castello di Edimburgo (io)';
  mine.places[0].mAt = 2000;
  theirs.places[0].name = 'Castello di Edimburgo (lei)';
  theirs.places[0].mAt = 2500;

  const {merged, conflicts} = mergeTrips(mine, theirs);
  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].kind, 'both-modified');
  assert.strictEqual(conflicts[0].id, 'p1');
  assert.strictEqual(conflicts[0].mine.name, 'Castello di Edimburgo (io)');
  assert.strictEqual(conflicts[0].theirs.name, 'Castello di Edimburgo (lei)');
  const p1 = merged.places.find(p => p.id === 'p1');
  assert.ok(p1.name === 'Castello di Edimburgo (io)' || p1.name === 'Castello di Edimburgo (lei)');
});

test('3. cancellata da una parte, modificata dall\'altra -> conflitto, tenuta di default', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  mine.places = mine.places.filter(p => p.id !== 'p2');
  mine.tombs.push({id:'p2', at: 2000});
  theirs.places[1].name = 'Old Man of Storr (foto aggiunta)';
  theirs.places[1].mAt = 2500;

  const {merged, conflicts} = mergeTrips(mine, theirs);
  assert.strictEqual(conflicts.length, 1);
  assert.strictEqual(conflicts[0].kind, 'delete-vs-modify');
  assert.strictEqual(conflicts[0].id, 'p2');
  assert.strictEqual(conflicts[0].mine, null);
  assert.ok(merged.places.some(p => p.id === 'p2'), 'di default la voce contesa si tiene, non si perde');
});

test('3b. cancellata da una parte, l\'altra non l\'ha più toccata -> scartata senza conflitto', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  mine.places = mine.places.filter(p => p.id !== 'p2');
  mine.tombs.push({id:'p2', at: 2000});

  const {merged, conflicts} = mergeTrips(mine, theirs);
  assert.strictEqual(conflicts.length, 0, 'nessun conflitto: la cancellazione è successiva a tutto');
  assert.ok(!merged.places.some(p => p.id === 'p2'), 'la cancellazione va rispettata');
});

test('4. giorno cancellato con tappe dentro -> tappe orfane vanno a Brainstorming, non si perdono', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  theirs.days = theirs.days.filter(d => d.id !== 'd2');
  theirs.tombs.push({id:'d2', at: 2000});

  const {merged, conflicts} = mergeTrips(mine, theirs);
  assert.strictEqual(conflicts.length, 0);
  assert.ok(!merged.days.some(d => d.id === 'd2'), 'il giorno cancellato non torna');
  const p2 = merged.places.find(p => p.id === 'p2');
  assert.ok(p2, 'la tappa non deve sparire');
  assert.strictEqual(p2.dayId, null, 'la tappa orfana finisce in Brainstorming (dayId:null)');
});

test('5. persona cancellata con spese che la citano -> riferimenti puliti, spesa orfana rimossa', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  mine.people = mine.people.filter(p => p.id !== 'pe2');
  mine.tombs.push({id:'pe2', at: 2000});

  const {merged} = mergeTrips(mine, theirs);
  assert.ok(!merged.people.some(p => p.id === 'pe2'), 'la persona cancellata non torna');
  const e1 = merged.expenses.find(e => e.id === 'e1');
  if(e1) assert.ok(!e1.forIds.includes('pe2'), 'nessun riferimento a pe2 deve sopravvivere');

  const mine2 = clone(baseTrip());
  const theirs2 = clone(baseTrip());
  mine2.expenses[0].forIds = ['pe2'];
  mine2.expenses[0].mAt = 2000;
  mine2.people = mine2.people.filter(p => p.id !== 'pe2');
  mine2.tombs.push({id:'pe2', at: 3000});
  const {merged: merged2} = mergeTrips(mine2, theirs2);
  assert.ok(!merged2.expenses.some(e => e.id === 'e1'), 'una spesa senza nessuno da una parte va rimossa');
});

test('6. fusione idempotente: fondere due volte di fila dà lo stesso risultato', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  theirs.places.push({id:'p3', dayId:'d2', name:'Fairy Pools', mAt:2000});
  mine.expenses.push({id:'e2', desc:'Benzina', amount:40, byIds:['pe1'], forIds:['pe1','pe2'], mAt:2000});

  const first = mergeTrips(mine, theirs);
  first.merged.cloudAt = Date.now();
  const second = mergeTrips(first.merged, theirs);

  assert.deepStrictEqual(
    second.merged.places.map(p => p.id).sort(),
    first.merged.places.map(p => p.id).sort(),
    'stesse tappe alla seconda fusione'
  );
  assert.deepStrictEqual(
    second.merged.expenses.map(e => e.id).sort(),
    first.merged.expenses.map(e => e.id).sort(),
    'stesse spese alla seconda fusione'
  );
  assert.strictEqual(second.conflicts.length, 0, 'rifondere con la stessa theirs non deve creare nuovi conflitti');
});

test('7. mergeTrips è pura: non tocca mine/theirs originali', () => {
  const mine = clone(baseTrip());
  const theirs = clone(baseTrip());
  theirs.days = theirs.days.filter(d => d.id !== 'd2');
  theirs.tombs.push({id:'d2', at: 2000});
  const mineBefore = clone(mine), theirsBefore = clone(theirs);
  mergeTrips(mine, theirs);
  assert.deepStrictEqual(mine, mineBefore, 'mine non deve cambiare dopo la fusione');
  assert.deepStrictEqual(theirs, theirsBefore, 'theirs non deve cambiare dopo la fusione');
});

console.log('\n' + pass + ' passati, ' + fail + ' falliti');
process.exit(fail ? 1 : 0);
