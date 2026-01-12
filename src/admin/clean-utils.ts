const usaStateMap: Record<string, string> = {
  AK: 'Alaska',
  AL: 'Alabama',
  AR: 'Arkansas',
  AZ: 'Arizona',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DC: 'District of Columbia',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  IA: 'Iowa',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  MA: 'Massachusetts',
  MD: 'Maryland',
  ME: 'Maine',
  MI: 'Michigan',
  MN: 'Minnesota',
  MO: 'Missouri',
  MS: 'Mississippi',
  MT: 'Montana',
  NC: 'North Carolina',
  ND: 'North Dakota',
  NE: 'Nebraska',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NV: 'Nevada',
  NY: 'New York',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VA: 'Virginia',
  VT: 'Vermont',
  WA: 'Washington',
  WI: 'Wisconsin',
  WV: 'West Virginia',
  WY: 'Wyoming',
};

const australiaStateMap: Record<string, string> = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  'SA/NT': 'South Australia/Northern Territory',
  TAS: 'Tasmania',
  VIC: 'Victoria',
  WA: 'Western Australia',
};

export function cleanRegion(country: string, state: string) {
  if (cleanCountry(country) === 'USA') {
    return usaStateMap[state] || state;
  }

  if (cleanCountry(country) === 'Australia') {
    return australiaStateMap[state] || state;
  }

  return state;
}


const capitalizeEachWord = (countryName: string) => {
  const result: string[] = countryName.split(' ').map((part) =>
    part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase()
  );
  return result.join(' ');
}

export const cleanCountry = (countryName: string) => {
  switch (countryName.toLowerCase()) {
    case "united states":
      return "USA";
    case "usa":
      return "USA";
    case "suisse":
      return "Switzerland";
    case "russie":
      return "Russia";
    case "allemagne":
      return "Germany";
    default:
      return capitalizeEachWord(countryName);
  }
}