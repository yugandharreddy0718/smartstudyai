import fs from 'fs';

const content = fs.readFileSync('window_dump.xml', 'utf8');
const nodeMatches = [...content.matchAll(/<node[^>]+bounds="([^"]+)"[^>]+(?:text="([^"]*)"|content-desc="([^"]*)")[^>]*>/g)];

nodeMatches.forEach(m => {
  const bounds = m[1];
  const text = m[2] || m[3];
  if (text) {
    console.log(`[${bounds}] : "${text}"`);
  }
});

