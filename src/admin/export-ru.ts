import { Brevet } from '../types';
import { checkOk } from './fetch-utils';

const DATE_START = '2025-11-01';
const DATE_END = '2026-10-31';

type Raw = {
    id: number;
    clubCode: number;
    title: string;
    type: string;
    dist: number;
    desc: string;
    cover: string;
    dateStart: string;
    placeStart: string;
    dateEnd: string;
    placeEnd: string;
    numberOfCP: string;
    track: string;
    controlPoints: string;
    isSeries: string;
    status: string;
    timezone: string;
    club: {
        name: string;
        forCalendar: boolean;
    }
};

type Club = {
    code: number;
    name: string;
    nameLat: string;
    isActive: string;
    city: string;
}

function fixCityName(cityName: string) {
    switch (cityName) {
        case "BBarnaul":
            return "Barnaul";
        case "Moskva":
            return "Moscow";
        case "Sankt-Peterburg":
            return "Saint Petersburg";
    }

    return cityName;
}

export function transliterateRuToLat(input: string): string {
    if (!input) {
        return input;
    }
    const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d",
        е: "e", ё: "yo", ж: "zh", з: "z", и: "i",
        й: "y", к: "k", л: "l", м: "m", н: "n",
        о: "o", п: "p", р: "r", с: "s", т: "t",
        у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch",
        ш: "sh", щ: "shch", ъ: "", ы: "y",
        "ь": "", э: "e", ю: "yu", я: "ya",
    };

    return input
        .split("")
        .map((char) => {
            const lower = char.toLowerCase();
            const translit = map[lower];
            if (!(lower in map)) return char;

            return char === lower
                ? translit
                : translit.charAt(0).toUpperCase() + translit.slice(1);
        })
        .join("");
}


async function fetchClubs(): Promise<Club[]> {
    const resp = await fetch(
        `https://api.brevets.ru/clubs?list`
    );
    checkOk(resp);
    const data = await resp.json();
    if (data.length <= 0) {
        throw new Error('Invalid response from brevets.ru/clubs website')
    }
    return data;
}

async function fetchBrevets(): Promise<Raw[]> {
    const resp = await fetch(
        `https://api.brevets.ru/calendar?dates=${DATE_START};${DATE_END}`
    );
    checkOk(resp);
    const data = await resp.json();
    if (data.length <= 0)
        throw new Error('Invalid response from brevets.ru/calendar website');
    return data;
}

export function clubsArrayToMap(
    clubs: Club[]
): Map<number, Club> {
    return new Map(
        clubs.map((club) => [
            club.code,
            {
                ...club,
                city: transliterateRuToLat(club.city),
            },
        ])
    );
}

function cleanBrevets(brevets: Raw[], clubs: Club[]): Brevet[] {
    const clubMap = clubsArrayToMap(clubs);
    return brevets
        .map((brevet) => {
            const clubInfo = clubMap.get(brevet.clubCode) || { city: "", name: "", nameLat: "", code: 0, isActive: false };
            const date = brevet.dateStart.slice(0, 10).replaceAll('-', '/');
            const dateNumber = parseInt(brevet.dateStart.slice(0, 10).replaceAll('-', ''));

            const startCity = brevet.placeStart.length > 0 ? brevet.placeStart : clubInfo?.city;
            const city = fixCityName(transliterateRuToLat(startCity));
            const region = "";
            const distance = brevet.dist;
            const country = 'Russia';
            return {
                objectID: [date, distance, country, region, city].join('__').replace(/\W+/g, '_'),
                name: brevet.title,
                date,
                dateNumber,
                distance,
                country,
                region,
                city,
                club: clubInfo.nameLat,
                meta: brevet,
                source: 'brevets_ru',
            };
        })
        .filter((brevet) => brevet.city != 'Simferopol')
}

export async function getData() {
    const [brevets, clubs] = await Promise.all([fetchBrevets(), fetchClubs()]);
    return cleanBrevets(brevets, clubs);
}