import algoliasearch from 'algoliasearch';
import type { Brevet } from '../types';

const {
  ALGOLIA_APP = '',
  ALGOLIA_WRITE = '',
  GITHUB_STEP_SUMMARY = '',
  WRITE_INDEX = '',
} = process.env;
if (!ALGOLIA_APP) {
  throw new Error('Missing ALGOLIA_APP env variable');
}
if (!ALGOLIA_WRITE) {
  throw new Error('Missing ALGOLIA_WRITE env variable');
}

const dataRaw = (await Bun.file('brevets.json').json()) as Brevet[];

const supabase = new Map();
const others = new Map();
for (const item of dataRaw) {
  const id = [item.dateNumber, item.distance, item.country, item.region, item.city]
    .join(' ').replace(/\s+/, ' ');
  if (item.source == 'supabase') {
    supabase.set(id, item);
  } else {
    others.set(id, item);
  }
}

const data = Array.from(others.values());
for (const [id, value] of supabase) {
  if (!others.has(id)) {
    data.push(value);
  }
}


const client = algoliasearch(ALGOLIA_APP, ALGOLIA_WRITE);

await client
  .initIndex(WRITE_INDEX)
  .partialUpdateObjects(data, { createIfNotExists: true });

if (GITHUB_STEP_SUMMARY) {
  Bun.write(GITHUB_STEP_SUMMARY, `Indexed ${data.length} brevets`);
} else {
  console.log(`Indexed ${data.length} brevets`);
}
