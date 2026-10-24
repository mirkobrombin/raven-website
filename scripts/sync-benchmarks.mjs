import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const source = new URL('../../go-vm/docs/benchmarks.json', import.meta.url);
const target = new URL('../src/data/benchmarks.json', import.meta.url);
if (existsSync(source)) {
  const data = JSON.parse(readFileSync(source, 'utf8'));
  const current = JSON.parse(readFileSync(target, 'utf8'));
  data._meta = current._meta;
  data.games = current.games;
  const output = `${JSON.stringify(data, null, 2)}\n`;
  writeFileSync(target, output);
  writeFileSync(new URL('../public/assets/benchmarks/benchmarks.json', import.meta.url), output);
}
