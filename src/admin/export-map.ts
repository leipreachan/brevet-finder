import { numToDate } from '../date';
import { Brevet } from '../types';
import { checkOk } from './fetch-utils';
import { cleanCountry } from './clean-utils';

const { SUPABASE = '' } = process.env;
if (!SUPABASE) {
  throw new Error('Missing SUPABASE env variable');
}

type Raw = {
  id: number;
  date_brevet: string;
  distance_brevet: number;
  nom_brm: string;
  latitude: number;
  longitude: number;
  ville_depart: string;
  departement: string;
  region: string;
  nom_organisateur: string;
  mail_organisateur: string;
  club_id: string;
  denivele: string;
  eligible_r1000: boolean;
  lien_itineraire_brm: unknown;
  gpx_file_path?: string;
  acces_homiolagations: boolean;
  pays: string;
  code_acp: string;
  nom_club: string;
  page_web_club: string;
};

async function fetchPage(apikey: string, offset: number): Promise<Raw[]> {
  const fields = "id,date_brevet,distance_brevet,nom_brm,latitude,longitude,ville_depart,departement,region,nom_organisateur,mail_organisateur,club_id,denivele,eligible_r10000,lien_itineraire_brm,acces_homologations,code_acp,nom_club,page_web_club,representant_acp,email_representant_acp,pays"

  const url = new URL(
    `https://ranqsfwmoexghudpvpob.supabase.co/rest/v1/brevets?select=${fields}`
  );
  url.search = new URLSearchParams({
    limit: "1000",
    offset: `${offset}`
  }).toString();

  const brevets = await fetch(
    url,
    {
      headers: {
        apikey,
        Authorization: 'Bearer ' + apikey,
      },
      method: 'GET',
      referrer: 'https://map.audax-club-parisien.com/',
    }
  )
    .then(checkOk)
    .then((res) => res.json());

  if (!Array.isArray(brevets)) throw new Error('Invalid response');

  return brevets;
}

async function fetchBrevets(): Promise<Raw[]> {
  const apikey = SUPABASE;

  let brevets = [];
  let offset = 0;
  while (true) {
    const result = await fetchPage(apikey, offset);
    offset += 1000;
    brevets.push(result);
    if (result.length <= 0) {
      break;
    }
  }

  return brevets.flat();
}

const cleanLoc = (countryName: string, second: string) => {
  if (countryName && second && countryName.toLowerCase() == second.toLowerCase()) {
    return ""
  }
}

function cleanBrevets(brevets: Raw[]): Brevet[] {
  return brevets.map((brevet) => {
    const dateNumber = parseInt(brevet.date_brevet.split('-').reverse().join(''), 10);
    const time = numToDate(dateNumber).getTime() / 1000;

    const country = cleanCountry(brevet.pays ?? "")
    return {
      objectID: 'supabase__' + brevet.id.toString(),
      date: brevet.date_brevet,
      dateNumber,
      name: brevet.nom_brm,
      distance: brevet.distance_brevet,
      country: country,
      region: cleanLoc(country, brevet.region),
      department: cleanLoc(country, brevet.departement),
      city: brevet.ville_depart,
      _geoloc:
        brevet.latitude && brevet.longitude
          ? [{ lat: brevet.latitude, lng: brevet.longitude }]
          : [],
      map: [""],
      site: brevet?.page_web_club ?? "",
      mail: brevet.mail_organisateur,
      club: brevet?.nom_club ?? brevet.club_id ?? "",
      ascent: parseInt(brevet.denivele, 10),
      time,
      status: "",
      meta: brevet,
      source: 'supabase',
    };
  });
}

export async function getData() {
  return cleanBrevets(await fetchBrevets());
}
