import { Brevet } from '../types';
import { checkOk } from './fetch-utils';

const COUNTIES = [
  "avon",
  "bath and north east somerset",
  "bedfordshire",
  "bedford",
  "berkshire",
  "blackburn with darwen",
  "blackpool",
  "bournemouth, christchurch and poole",
  "bournemouth",
  "brighton and hove",
  "bristol",
  "buckinghamshire",
  "cambridgeshire",
  "cambridgeshire and isle of ely",
  "central bedfordshire",
  "cheshire",
  "cheshire east",
  "cheshire west and chester",
  "cleveland",
  "cornwall",
  "cumberland",
  "cumbria",
  "darlington",
  "derbyshire",
  "derby",
  "devon",
  "dorset",
  "durham (county durham)",
  "east suffolk",
  "e suffolk",
  "east sussex",
  "e sussex",
  "essex",
  "gloucestershire",
  "greater london",
  "greater manchester",
  "hampshire",
  "halton",
  "hartlepool",
  "hereford and worcester",
  "herefordshire",
  "hertfordshire",
  "humberside",
  "huntingdon and peterborough",
  "huntingdonshire",
  "isle of ely",
  "isle of wight",
  "kent",
  "kingston upon hull",
  "lancashire",
  "leicestershire",
  "leicester",
  "lincolnshire",
  "london",
  "city of london",
  "luton",
  "medway",
  "merseyside",
  "middlesbrough",
  "middlesex",
  "milton keynes",
  "norfolk",
  "northamptonshire",
  "north east lincolnshire",
  "north humberside",
  "north lincolnshire",
  "north northamptonshire",
  "north somerset",
  "northumberland",
  "north yorkshire",
  "nottinghamshire",
  "nottingham",
  "oxfordshire",
  "soke of peterborough",
  "peterborough",
  "plymouth",
  "poole",
  "portsmouth",
  "redcar and cleveland",
  "rutland",
  "shropshire",
  "somerset",
  "southampton",
  "southend-on-sea",
  "south humberside",
  "south gloucestershire",
  "south yorkshire",
  "staffordshire",
  "stockton-on-tees",
  "stoke-on-trent",
  "suffolk",
  "surrey",
  "sussex",
  "swindon",
  "telford and wrekin",
  "thurrock",
  "torbay",
  "tyne and wear",
  "warrington",
  "warwickshire",
  "west midlands",
  "w midlands",
  "westmorland",
  "westmorland and furness",
  "west northamptonshire",
  "west suffolk",
  "w suffolk",
  "west sussex",
  "w sussex",
  "west yorkshire",
  "w yorkshire",
  "wiltshire",
  "worcestershire",
  "yorkshire",
  "east riding",
  "north riding",
  "west riding",
  "york"];

type Raw = {
  StartCondition: string;
  StartAddressDescription: string;
  Category: string;
  EventDateFormatted: string;
  AwardDistance: number;
  ActualDistance: number;
  Title: string;
  OrganiserFullName: string;
  IsCancelled: boolean;
  StartLatitude: number;
  StartLongitude: number;
  Body: string;
  Climb?: number;
  Url: string;
};

async function fetchBrevets() {
  const data = await fetch(
    'https://www.audax.uk/umbraco/surface/Events/Search?DurationNights=360&pageSize=300'
  )
    .then(checkOk)
    .then((res) => res.json());

  if (!data.hasOwnProperty('Items') || !Array.isArray(data['Items']))
    throw new Error('Invalid response from audax.uk website');
  return data['Items'];
}

const url = (pathOrUrl?: string) =>
  new URL(`https://www.audax.uk/event-details/calendar/${pathOrUrl ?? ''}`).toString();

function padDate(date: number) {
  if (date < 10) {
    return `0${date}`;
  }
  return date;
}

function cleanCity(cityName: string) {
  let city, region = '';
  if (cityName.includes(',')) {
    [region, city] = cityName.split(',');
  } else {
    city = cityName.trim();
  }

  switch (city.trim().toLowerCase()) {
    case 'nr edinburgh':
    case 'north edinburgh':
      city = 'Edinburgh';
      break;
    case 'nr aberdeen':
    case 'north aberdeen':
      city = 'Aberdeen';
      break;
    case 'greater london':
      city = 'London';
      break;
    case 'north manchester':
      city = 'Manchester';
      break;
    default:
      city = city.trim();
  }

  if (COUNTIES.includes(city.toLowerCase())) {
    region = city;
    city = '';
  }

  return [region.trim(), city];
}

function cleanBrevets(brevets: Raw[]): Brevet[] {
  return brevets
    .filter((brevet) => !brevet.IsCancelled)
    .map((brevet) => {
      const jsDate = new Date(brevet.EventDateFormatted);
      const year = jsDate.getFullYear();
      const month = padDate(jsDate.getMonth() + 1);
      const day = padDate(jsDate.getDate());
      const dateNumber = parseInt([year, month, day].join(''));
      const date = [day, month, year].join('/');
      const city = brevet.StartCondition.trim();
      const [region, cityExtended] = cleanCity((city + ' ' + brevet.StartAddressDescription)
        .replace(' ,', ',')
        .trim());

      const distance = brevet.AwardDistance;
      const country = 'UK';
      const climb = brevet.Climb || 0;

      return {
        objectID: [
          date,
          distance,
          country,
          city.replace(/\W+/g, '_'),
        ].join('__'),
        id: [dateNumber, distance, country, region, city].join(' '),
        name: brevet.Title,
        date,
        dateNumber,
        distance,
        country,
        region,
        city: cityExtended,
        _geoloc:
          brevet.StartLatitude && brevet.StartLongitude
            ? [{ lat: brevet.StartLatitude, lng: brevet.StartLongitude }]
            : [],
        site: url(brevet.Url),
        club: brevet.Body,
        ascent: climb,
        meta: brevet,
        source: 'auk',
      };
    });
}

export async function getData() {
  return cleanBrevets(await fetchBrevets());
}
