import fs from 'fs';

const content = fs.readFileSync('window_dump.xml', 'utf8');
const textMatches = [...content.matchAll(/text="([^"]+)"/g)].map(m => m[1]).filter(Boolean);
const descMatches = [...content.matchAll(/content-desc="([^"]+)"/g)].map(m => m[1]).filter(Boolean);
const resourceMatches = [...content.matchAll(/resource-id="([^"]+)"/g)].map(m => m[1]).filter(Boolean);

console.log('--- TEXTS ---');
console.log(textMatches);
console.log('--- CONTENT DESCRIPTIONS ---');
console.log(descMatches);

