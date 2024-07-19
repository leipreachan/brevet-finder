export type Brevet = {
  objectID: string;
  date: string;
  dateNumber: number;
  name?: string;
  distance: number;
  country: string;
  region: string;
  department: string;
  city: string;
  _geoloc: Array<{ lat: number; lng: number }>;
  map: string[];
  site: string;
  mail: string;
  club: string;
  ascent: number;
  time: number;
  status: string;
};
