import { Brevet } from '../types';
import { dateToNum } from '../date';
import { fetchXlsx } from './xlsx';

type Raw = {
  __rowNum__: string;
  DATA: string;
  'TIPO BREVETTO': string;
  DISTANZA: string;
  'MASTER AUDAX': string;
  EXTREME: string;
  MANIFESTAZIONE: string;
  ORGANIZZATORE: string;
  REGIONE: string;
  COMUNE: string;
  'PROV.': string;
};

const country = 'Italy';

const XLSX_URL = new URL(
  'https://www.audaxitalia.it/brevetti_richieste_esporta_calendario.php'
);

async function fetchViaXlsx(): Promise<Raw[]> {
  return fetchXlsx(XLSX_URL);
}

function cleanBrevets(brevets: Raw[]): Brevet[] {
  return brevets
    .filter((brevet) => !isNaN(parseInt(brevet.DATA)))
    .map((brevet) => {
      const distance = parseInt(brevet.DISTANZA) || undefined;
      const date = brevet.DATA;
      const dateAsDate = new Date(
        Date.parse(date.split('/').reverse().join('-'))
      );
      const dateNumber = dateToNum(dateAsDate);
      const region = brevet.REGIONE;
      const city = brevet.COMUNE

      return {
        objectID: [date, distance, country, region, city].join('__').replace(/\W+/g, '_'),
        date,
        dateNumber,
        distance,
        name: brevet.MANIFESTAZIONE,
        country: country,
        region,
        city,
        site: 'https://www.audaxitalia.it/index.php?pg=manifestazioni',
        club: brevet.ORGANIZZATORE,
        meta: brevet,
        source: 'italy',
      };
    });
}

export async function getData() {
  return cleanBrevets(await fetchViaXlsx());
}
