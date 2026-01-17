import algoliasearch from 'algoliasearch';
import { addGeoloc } from './geocode';
import * as acp from './export-acp';
import * as map from './export-map';
import * as lrm from './export-lrm';
import * as usa from './export-usa';
import * as auk from './export-auk';
import * as ireland from './export-ireland';
import * as italy from './export-italy';
import * as belgium from './export-belgium';
import * as netherlands from './export-netherlands';
import * as brevets_ru from './export-ru';
import { Brevet } from '../types';

const organizations = {
  acp: acp.getData,
  supabase: map.getData,
  lrm: lrm.getData,
  usa: usa.getData,
  auk: auk.getData,
  ireland: ireland.getData,
  italy: italy.getData,
  belgium: belgium.getData,
  netherlands: netherlands.getData,
  brevets_ru: brevets_ru.getData
};

const flags = {
  acp: true,
  supabase: true, // also ACP
  lrm: true,
  usa: true,
  auk: true,
  ireland: true,
  italy: true,
  belgium: true,
  netherlands: true,
  brevets_ru: true,
  geocode: true,
  filter: true,
};

const { ALGOLIA_APP = '', ALGOLIA_WRITE = '', READ_INDEX = '' } = process.env;
if (!ALGOLIA_APP && flags.filter) {
  throw new Error('Missing ALGOLIA_APP env variable');
}
if (!ALGOLIA_WRITE && flags.filter) {
  throw new Error('Missing ALGOLIA_WRITE env variable');
}

const searchClient = algoliasearch(ALGOLIA_APP, ALGOLIA_WRITE);
const allObjectIds = new Set<string>();
if (flags.filter) {
  await searchClient.initIndex(READ_INDEX).browseObjects({
    attributesToRetrieve: ['objectID'],
    batch: (objects) => {
      objects.forEach((object) => {
        allObjectIds.add(object.objectID);
      });
    },
  });
}

const fetchData = async (key: string) => {
  console.log(`Fetching ${key} brevets...`);
  return organizations[key as keyof typeof organizations]()
    .then((result) => {
      console.log(`Got ${result.length} ${key} brevets`);
      return result;
    })
    .catch((err) => {
      console.log(`Error while fetching ${key}\n`, err);
      const emptyResult: Brevet[] = [];
      return emptyResult;
    }
    );
}

const dataPromise = Object.keys(flags)
  .filter((key) => organizations.hasOwnProperty(key) && flags[key as keyof typeof flags] === true)
  .map(async (key) => fetchData(key));

const dataRaw = (await Promise.all(dataPromise)).flat();

const dataMap: Map<string, Brevet> = new Map();
const supabaseMap: Map<string, Brevet> = new Map();
for (const item of dataRaw) {
  if (item.source == 'supabase') {
    supabaseMap.set(item.objectID, item);
  } else {
    dataMap.set(item.objectID, item);
  }
}

// add name from supabase to other audaxes, if index is the the same
for (const [index, item] of supabaseMap) {
  if (dataMap.has(index)) {
    const supabaseName = supabaseMap.get(index)?.name;
    const current = dataMap.get(index);
    if (supabaseName && current) {
      current.name = supabaseName;
      dataMap.set(index, current);
    }
  } else {
    dataMap.set(index, item);
  }
}

const data = Array.from(dataMap.values());

await Bun.write('brevets_unfiltered.json', JSON.stringify(data, null, 2));

const newObjects = flags.filter
  ? data.filter((brevet) => !allObjectIds.has(brevet.objectID))
  : data;
const existingObjects = flags.filter
  ? data.filter((brevet) => allObjectIds.has(brevet.objectID))
  : data;

const withGeoLoc = flags.geocode ? await addGeoloc(newObjects) : newObjects;
const withoutGeoLoc = existingObjects.filter((brevet) =>
  allObjectIds.has(brevet.objectID)
);

const objects = [...withGeoLoc, ...withoutGeoLoc];

await Bun.write('brevets.json', JSON.stringify(objects, null, 2));

console.log(`\nExported ${objects.length} brevets`);
