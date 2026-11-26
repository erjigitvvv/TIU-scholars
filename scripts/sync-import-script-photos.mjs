import fs from 'fs';

let code = fs.readFileSync('scripts/import-aniq-fanlar-scholars.mjs', 'utf8');

const mappings = [
  { no: 21, photo: '/uploads/avatars/abduraximov-dilshod.png' },
  { no: 22, photo: '/uploads/avatars/ilxomzoda-azizbek.png' },
  { no: 23, photo: '/uploads/avatars/sadikov-shoxrux.png' },
  { no: 24, photo: '/uploads/avatars/rixsiboyev-nozimbek.png' },
  { no: 25, photo: '/uploads/avatars/xashimova-dilyora.png' },
  { no: 26, photo: '/uploads/avatars/axmedov-dilshod.png' },
  { no: 27, photo: '/uploads/avatars/mirzayeva-malika.png' },
  { no: 28, photo: '/uploads/avatars/arabov-ubaydullo.png' },
  { no: 29, photo: '/uploads/avatars/ergashev-elyor.png' },
  { no: 30, photo: '/uploads/avatars/djurayev-mamur.png' },
  { no: 31, photo: '/uploads/avatars/qurbonov-xurshid.png' },
  { no: 32, photo: '/uploads/avatars/hayotov-abdullo.png' },
  { no: 33, photo: '/uploads/avatars/hamdamov-muzaffar.png' },
  { no: 34, photo: '/uploads/avatars/abdullayev-joshqin.png' },
  { no: 35, photo: '/uploads/avatars/boltayev-habibjon.png' },
  { no: 36, photo: '/uploads/avatars/karimov-jaxongir.png' },
  { no: 37, photo: '/uploads/avatars/keunimjayev-muxamedali.png' },
  { no: 38, photo: '/uploads/avatars/umarov-ulugbek.png' }
];

for (const m of mappings) {
  const regex = new RegExp('(no:\\s*' + m.no + ',[\\s\\S]*?photoUrl:\\s*)null', 'm');
  if (regex.test(code)) {
    code = code.replace(regex, `$1"${m.photo}"`);
    console.log(`Updated in script: no ${m.no} -> ${m.photo}`);
  } else {
    console.warn(`Regex not matched for no ${m.no}`);
  }
}

fs.writeFileSync('scripts/import-aniq-fanlar-scholars.mjs', code, 'utf8');
console.log('import-aniq-fanlar-scholars.mjs updated!');
