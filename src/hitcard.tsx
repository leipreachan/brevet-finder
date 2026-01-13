import { Brevet } from './types';

export function HitCard({ hit }: { hit: Brevet }) {
  const maps = hit.map?.filter((item) => item);
  return (
    <div
      data-objectid={hit.objectID}
      style={{ position: 'relative', width: '100%', verticalAlign: 'top' }}
    >
      <a href={`?objectID=${hit.objectID}`} style={{ float: 'right' }}>
        share
      </a>
      <h2>{hit.date}</h2>
      <p>{hit.distance} km</p>
      {Boolean(hit.name) && <h3>{hit.name}</h3>}
      <p>
        {[hit.city, hit.department, hit.region, hit.country]
          .filter(Boolean)
          .join(', ')}
      </p>
      {Boolean(hit.ascent) && <p>{hit.ascent} m</p>}
      {Boolean(hit.site) && (
        <a
          href={hit.site}
          target="_blank"
        >
          {hit.site}
        </a>
      )}
      <p><a href={'mailto:' + hit.mail}>{hit.mail}</a></p>
      <p>{hit.club} {hit?.meta?.Contact ? '(' + hit?.meta?.Contact + ')' : ''}</p>
      <ul>
        {maps?.map((map: string) => (
          <li key={map}>
            <a href={map.startsWith('http') ? map : undefined} target="_blank">
              {map}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
