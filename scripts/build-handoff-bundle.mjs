import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { lintQuestion } from '../pipeline/lib/content-lints.mjs';

const ROOT = 'pipeline/authored';
const PICKS_PER_TOPIC = {
  modeling: 5,
  'configuring-processes': 5,
  'decisions-business-rules': 4,
  forms: 3,
  connectors: 3,
  'extensions-integrations': 5,
  'managing-development': 3,
  'dev-environment': 2,
};
const docsByTopic = {};
const exemplars = {};
for (const topic of readdirSync(ROOT)) {
  const dir = join(ROOT, topic);
  if (!statSync(dir).isDirectory()) continue;
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const cleans = [];
  for (const f of files) {
    const q = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    const findings = lintQuestion(q);
    if (findings.length === 0) cleans.push({ f, q });
    for (const d of q.docs || []) {
      if (d && d.url) {
        docsByTopic[topic] = docsByTopic[topic] || new Map();
        if (!docsByTopic[topic].has(d.url)) docsByTopic[topic].set(d.url, d.title || '');
      }
    }
  }
  exemplars[topic] = cleans.slice(0, PICKS_PER_TOPIC[topic] || 3).map((x) => x.f);
}
const out = {};
for (const [t, m] of Object.entries(docsByTopic)) {
  out[t] = [...m.entries()].sort().map(([url, title]) => ({ title, url }));
}
writeFileSync('pipeline/handoff/docs-map.json', JSON.stringify(out, null, 2) + '\n');
console.log('docs-map topics:', Object.keys(out).map((t) => t + ':' + out[t].length).join(', '));
mkdirSync('pipeline/handoff/exemplars', { recursive: true });
let n = 0;
for (const [topic, files] of Object.entries(exemplars)) {
  mkdirSync(join('pipeline/handoff/exemplars', topic), { recursive: true });
  for (const f of files) {
    copyFileSync(join(ROOT, topic, f), join('pipeline/handoff/exemplars', topic, f));
    n++;
  }
}
console.log('Exemplars copied:', n);
