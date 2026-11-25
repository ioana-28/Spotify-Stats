export const BROAD_GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop/Rap',
  'R&B/Soul',
  'Electronic/Dance',
  'Indie/Alternative',
  'Metal',
  'Punk',
  'Country',
  'Folk/Acoustic',
  'Jazz',
  'Blues',
  'Classical',
  'Latin',
  'Reggae',
  'World',
  'Soundtrack',
  'Other',
] as const;

export type BroadGenre = (typeof BROAD_GENRES)[number];

interface GenreRule {
  genre: BroadGenre;
  keywords: string[];
}

const RULES: GenreRule[] = [
  {
    genre: 'Metal',
    keywords: ['metal', 'metalcore', 'deathcore', 'grindcore', 'sludge', 'doom'],
  },
  {
    genre: 'Punk',
    keywords: ['punk', 'hardcore', 'emo', 'screamo'],
  },
  {
    genre: 'Hip-Hop/Rap',
    keywords: ['hip hop', 'hip-hop', 'rap', 'trap', 'drill', 'grime'],
  },
  {
    genre: 'R&B/Soul',
    keywords: ['r&b', 'rnb', 'soul', 'neo soul', 'funk', 'slow jam', 'quiet storm'],
  },
  {
    genre: 'Electronic/Dance',
    keywords: [
      'electronic',
      'electronica',
      'edm',
      'house',
      'techno',
      'trance',
      'dubstep',
      'drum and bass',
      'drum & bass',
      'dnb',
      'idm',
      'ambient',
      'breakbeat',
      'electro',
      'synthwave',
      'vaporwave',
      'glitch',
      'disco',
      'club',
    ],
  },
  {
    genre: 'Jazz',
    keywords: ['jazz', 'bebop', 'swing'],
  },
  {
    genre: 'Blues',
    keywords: ['blues'],
  },
  {
    genre: 'Classical',
    keywords: [
      'classical',
      'orchestral',
      'orchestra',
      'opera',
      'baroque',
      'symphony',
      'chamber music',
      'choral',
    ],
  },
  {
    genre: 'Country',
    keywords: ['country', 'bluegrass', 'americana'],
  },
  {
    genre: 'Latin',
    keywords: [
      'latin',
      'reggaeton',
      'salsa',
      'bachata',
      'cumbia',
      'merengue',
      'bossa nova',
      'samba',
      'mariachi',
      'tejano',
    ],
  },
  {
    genre: 'Reggae',
    keywords: ['reggae', 'ska', 'dub', 'dancehall'],
  },
  {
    genre: 'Folk/Acoustic',
    keywords: ['folk', 'acoustic', 'singer-songwriter', 'celtic'],
  },
  {
    genre: 'Soundtrack',
    keywords: ['soundtrack', 'score', 'video game', 'anime', 'musical'],
  },
  {
    genre: 'Indie/Alternative',
    keywords: ['indie', 'alternative', 'lo-fi', 'bedroom pop', 'shoegaze', 'dream pop', 'new wave'],
  },
  {
    genre: 'Pop',
    keywords: ['pop'],
  },
  {
    genre: 'Rock',
    keywords: ['rock', 'grunge', 'post-rock', 'psychedelic', 'garage', 'surf'],
  },
  {
    genre: 'World',
    keywords: ['afro', 'world', 'highlife', 'soca', 'calypso'],
  },
];

export const JUNK_TAGS = new Set([
  'seen live',
  'seen live!',
  'favorite',
  'favourite',
  'favorites',
  'favourites',
  'love',
  'loved',
  'awesome',
  'beautiful',
  'female vocalists',
  'male vocalists',
  'spotify',
  'albums i own',
  'vinyl',
  'best',
  'great',
  'music',
]);

const LOCATION_TAGS = new Set([
  'australian', 'canadian', 'british', 'american', 'english', 'swedish',
  'romanian', 'irish', 'scottish', 'welsh', 'german', 'french', 'italian',
  'spanish', 'portuguese', 'dutch', 'belgian', 'norwegian', 'danish',
  'finnish', 'polish', 'russian', 'japanese', 'korean', 'chinese',
  'brazilian', 'mexican', 'argentinian', 'colombian', 'puerto rico', 'texas',
  'california', 'new york', 'london', 'nyc', 'uk', 'usa', 'canada',
  'australia', 'germany', 'france', 'italy', 'spain', 'portugal',
  'netherlands', 'sweden', 'romania',
]);

const GENERIC_PHRASES = [
  'my top songs',
  'top songs',
  'top tracks',
  'my music',
  'favorite songs',
  'favourite songs',
  'all time favorites',
  'all time favourites',
];

export function isJunkTag(
  rawTag: string,
  knownArtistNames?: Set<string>,
): boolean {
  const tag = rawTag.trim().toLowerCase();
  if (!tag) return true;
  if (JUNK_TAGS.has(tag)) return true;
  if (LOCATION_TAGS.has(tag)) return true;
  if (GENERIC_PHRASES.some((phrase) => tag.includes(phrase))) return true;
  if (/^\d{2,4}s?$/.test(tag)) return true;
  if (knownArtistNames?.has(tag)) return true;
  return false;
}

const EXACT_GENRES: Record<string, BroadGenre> = {
  dance: 'Electronic/Dance',
  'dance music': 'Electronic/Dance',
  'dance pop': 'Pop',
  'dance-pop': 'Pop',
};

export function toBroadGenre(rawGenre: string): BroadGenre {
  const value = rawGenre.trim().toLowerCase();
  const exact = EXACT_GENRES[value];
  if (exact) return exact;
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => value.includes(keyword))) {
      return rule.genre;
    }
  }
  return 'Other';
}
