const { readFileSync, writeFileSync } = require('fs');
const path = './src/app/components/CustomerPortal.tsx';
let c = readFileSync(path, 'utf8');
const lines = c.split('\n');
// Line 653 (0-indexed 652): fix Department Store and Cafés
lines[652] = '                  "Department Store": "\u{1F3EC}", "Convenience Store": "\u{1F3EA}", "Caf\u00e9s": "\u2615",';
// Line 655 (0-indexed 654): fix Frozen Goods
lines[654] = '                  "Food Stalls": "\u{1F958}", "Frozen Goods": "\u{1F9CA}", "Other": "\u{1F4E6}",';
writeFileSync(path, lines.join('\n'));
console.log('emoji fixed');
