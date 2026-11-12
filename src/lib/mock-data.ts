// CineVerse mock dataset
// Realistic TMDB-shaped data for offline demo. When TMDB_API_KEY is set,
// src/lib/tmdb.ts will call the real API instead and this becomes the fallback.

export type MediaType = "MOVIE" | "TV" | "PERSON";

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profileUrl: string;
}

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  originalTitle: string;
  overview: string;
  tagline?: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string; // ISO date or year
  year: string;
  runtime?: number; // minutes
  seasons?: number;
  episodes?: number;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genres: number[];
  genreNames: string[];
  originalLanguage: string;
  originCountry: string[];
  status: string;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdbId?: string;
  tmdbId: number;
  certification?: string;
  keywords: string[];
  cast: CastMember[];
  crew: CrewMember[];
  similar: number[]; // ids
  recommendations: number[]; // ids
  belongsToCollection?: string;
  productionCompanies: { id: number; name: string; logoUrl?: string }[];
  networks?: { id: number; name: string; logoUrl?: string }[];
  trailerYoutubeId?: string;
  images: string[]; // additional backdrops
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  profileUrl: string;
  birthdate?: string;
  birthplace?: string;
  deathdate?: string;
  department: string;
  knownFor: string;
  gender: string;
  placeOfOrigin: string;
  movieCredits: { id: number; title: string; character?: string; job?: string; year: string; posterUrl: string }[];
  tvCredits: { id: number; title: string; character?: string; job?: string; year: string; posterUrl: string }[];
  externalLinks: { label: string; url: string }[];
}

export const GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

export const GENRE_MAP: Record<number, string> = Object.fromEntries(
  GENRES.map((g) => [g.id, g.name])
);

const img = (seed: string, w = 600, h = 900) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const backdrop = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1280/720`;

const profile = (seed: string) =>
  `https://picsum.photos/seed/${seed}/400/600`;

// Helper to build cast
const cast = (items: [string, string][]) =>
  items.map(([name, character], i) => ({
    id: 5000 + i,
    name,
    character,
    profileUrl: profile(name.toLowerCase().replace(/\s+/g, "-")),
    order: i,
  }));

const crew = (items: [string, string, string][]) =>
  items.map(([name, job, department]) => ({
    id: 6000 + name.length,
    name,
    job,
    department,
    profileUrl: profile(name.toLowerCase().replace(/\s+/g, "-")),
  }));

export const MOVIES: MediaItem[] = [
  {
    id: 101,
    mediaType: "MOVIE",
    title: "Echoes of Tomorrow",
    originalTitle: "Echoes of Tomorrow",
    overview:
      "In a near-future where memories can be archived and traded, a grieving neuroscientist discovers a forbidden recording that could rewrite the past — and her own identity.",
    tagline: "Some memories refuse to stay buried.",
    posterUrl: img("echoes-tomorrow"),
    backdropUrl: backdrop("echoes-tomorrow-bd"),
    releaseDate: "2024-07-12",
    year: "2024",
    runtime: 142,
    voteAverage: 8.4,
    voteCount: 4821,
    popularity: 98.6,
    genres: [878, 18, 53],
    genreNames: ["Science Fiction", "Drama", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 165000000,
    revenue: 612000000,
    homepage: "https://example.com/echoes",
    imdbId: "tt9876543",
    tmdbId: 101,
    certification: "PG-13",
    keywords: ["memory", "future", "neuroscience", "grief", "identity"],
    cast: cast([
      ["Ava Sinclair", "Dr. Mira Hale"],
      ["Jonah Reeves", "Eli Cole"],
      ["Mariana Voss", "Director Voss"],
      ["Theo Park", "Kai"],
      ["Lina Okoro", "Sasha"],
      ["Daniel Brice", "Older Eli"],
    ]),
    crew: crew([
      ["Mariana Voss", "Director", "Directing"],
      ["Mariana Voss", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [102, 108, 112, 115],
    recommendations: [102, 104, 108, 112],
    belongsToCollection: undefined,
    productionCompanies: [
      { id: 1, name: "Lumen Pictures", logoUrl: img("lumen-logo", 200, 200) },
      { id: 2, name: "Northwind Studios", logoUrl: img("northwind-logo", 200, 200) },
    ],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("echoes-tomorrow-1"), backdrop("echoes-tomorrow-2"), backdrop("echoes-tomorrow-3")],
  },
  {
    id: 102,
    mediaType: "MOVIE",
    title: "The Last Cartographer",
    originalTitle: "The Last Cartographer",
    overview:
      "An aging mapmaker ventures into uncharted arctic territory to finish his late wife's final survey, accompanied by a young apprentice who hides a secret mission.",
    tagline: "Every map ends somewhere.",
    posterUrl: img("last-cartographer"),
    backdropUrl: backdrop("last-cartographer-bd"),
    releaseDate: "2023-11-03",
    year: "2023",
    runtime: 128,
    voteAverage: 7.9,
    voteCount: 2934,
    popularity: 71.2,
    genres: [12, 18, 36],
    genreNames: ["Adventure", "Drama", "History"],
    originalLanguage: "en",
    originCountry: ["GB", "NO"],
    status: "Released",
    budget: 48000000,
    revenue: 121000000,
    imdbId: "tt4561230",
    tmdbId: 102,
    certification: "PG",
    keywords: ["arctic", "exploration", "grief", "mentorship"],
    cast: cast([
      ["Henrik Salden", "Tomas Vey"],
      ["Yara Mensah", "Nadia Okafor"],
      ["Cornelius Frost", "Captain Halle"],
      ["Iris Lund", "Inga"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Director", "Directing"],
      ["Lars Bjorn", "Writer", "Writing"],
      ["Henrik Salden", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
    ]),
    similar: [101, 109, 113],
    recommendations: [101, 113, 116],
    productionCompanies: [{ id: 3, name: "Polaris Films" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("last-cartographer-1"), backdrop("last-cartographer-2")],
  },
  {
    id: 103,
    mediaType: "MOVIE",
    title: "Neon Lotus",
    originalTitle: "Neon Lotus",
    overview:
      "In a rain-soaked megacity, a street-level hacker uncovers a corporate conspiracy hidden inside a viral augmented-reality game.",
    tagline: "Reality is just another layer.",
    posterUrl: img("neon-lotus"),
    backdropUrl: backdrop("neon-lotus-bd"),
    releaseDate: "2024-03-22",
    year: "2024",
    runtime: 119,
    voteAverage: 7.6,
    voteCount: 5612,
    popularity: 88.1,
    genres: [28, 878, 53],
    genreNames: ["Action", "Science Fiction", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US", "JP"],
    status: "Released",
    budget: 90000000,
    revenue: 287000000,
    imdbId: "tt3209874",
    tmdbId: 103,
    certification: "R",
    keywords: ["cyberpunk", "hacker", "conspiracy", "augmented reality"],
    cast: cast([
      ["Kira Tanaka", "Mako"],
      ["Deshawn Bell", "Rex"],
      ["Priya Iyer", "Lin"],
      ["Marcus Cole", "Voss"],
      ["Yuki Hara", "Jin"],
    ]),
    crew: crew([
      ["Kenji Mori", "Director", "Directing"],
      ["Ada Lin", "Writer", "Writing"],
      ["Kenji Mori", "Producer", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
      ["Vince Roe", "Composer", "Sound"],
    ]),
    similar: [104, 107, 110],
    recommendations: [104, 107, 101],
    productionCompanies: [{ id: 4, name: "Hikari Studios" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("neon-lotus-1"), backdrop("neon-lotus-2"), backdrop("neon-lotus-3")],
  },
  {
    id: 104,
    mediaType: "MOVIE",
    title: "Quiet Fires",
    originalTitle: "Quiet Fires",
    overview:
      "A deaf wildfire lookout in the Montana wilderness forms an unlikely bond with the smokejumper who parachutes into her tower during a record-breaking fire season.",
    tagline: "Some signals need no sound.",
    posterUrl: img("quiet-fires"),
    backdropUrl: backdrop("quiet-fires-bd"),
    releaseDate: "2024-08-30",
    year: "2024",
    runtime: 108,
    voteAverage: 8.1,
    voteCount: 1843,
    popularity: 64.0,
    genres: [18, 53],
    genreNames: ["Drama", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 32000000,
    revenue: 89000000,
    imdbId: "tt8902341",
    tmdbId: 104,
    certification: "R",
    keywords: ["wildfire", "deaf", "wilderness", "isolation"],
    cast: cast([
      ["Hannah Brook", "Wren Attaway"],
      ["Eli Hartman", "Cal Rourke"],
      ["Marisol Reyes", "Dispatcher Paz"],
    ]),
    crew: crew([
      ["Hannah Brook", "Director", "Directing"],
      ["Hannah Brook", "Writer", "Writing"],
      ["Daniel Brice", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [101, 113, 116],
    recommendations: [101, 102, 116],
    productionCompanies: [{ id: 5, name: "Summitline Pictures" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("quiet-fires-1"), backdrop("quiet-fires-2")],
  },
  {
    id: 105,
    mediaType: "MOVIE",
    title: "The Grand Heist of Vienna",
    originalTitle: "The Grand Heist of Vienna",
    overview:
      "A retired thief is pulled back for one last job: stealing a long-lost Mozart manuscript from the most secure vault in Austria during the city's opera festival.",
    tagline: "One night. One score. No second chances.",
    posterUrl: img("grand-heist"),
    backdropUrl: backdrop("grand-heist-bd"),
    releaseDate: "2024-02-09",
    year: "2024",
    runtime: 124,
    voteAverage: 7.4,
    voteCount: 3210,
    popularity: 76.3,
    genres: [28, 80, 35],
    genreNames: ["Action", "Crime", "Comedy"],
    originalLanguage: "en",
    originCountry: ["US", "AT"],
    status: "Released",
    budget: 75000000,
    revenue: 198000000,
    imdbId: "tt1234598",
    tmdbId: 105,
    certification: "PG-13",
    keywords: ["heist", "vienna", "mozart", "opera", "thief"],
    cast: cast([
      ["Sebastian Crow", "Adrian Vale"],
      ["Lina Okoro", "Mira"],
      ["Theo Park", "The Architect"],
      ["Iris Lund", "Conductor Helga"],
    ]),
    crew: crew([
      ["Daniel Brice", "Director", "Directing"],
      ["Sebastian Crow", "Writer", "Writing"],
      ["Daniel Brice", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
    ]),
    similar: [106, 110, 103],
    recommendations: [106, 103, 110],
    productionCompanies: [{ id: 6, name: "Vienna Crown Productions" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("grand-heist-1"), backdrop("grand-heist-2")],
  },
  {
    id: 106,
    mediaType: "MOVIE",
    title: "Midnight in Marrakech",
    originalTitle: "Midnight in Marrakech",
    overview:
      "A travel photographer and a local spice merchant cross paths in the medina at dusk and spend one impossible night chasing a rumor across the rooftops of the old city.",
    tagline: "One night can hold a lifetime.",
    posterUrl: img("marrakech"),
    backdropUrl: backdrop("marrakech-bd"),
    releaseDate: "2023-09-15",
    year: "2023",
    runtime: 96,
    voteAverage: 7.7,
    voteCount: 1422,
    popularity: 52.4,
    genres: [10749, 18],
    genreNames: ["Romance", "Drama"],
    originalLanguage: "en",
    originCountry: ["US", "MA"],
    status: "Released",
    budget: 18000000,
    revenue: 47000000,
    imdbId: "tt7765123",
    tmdbId: 106,
    certification: "PG-13",
    keywords: ["romance", "travel", "marrakech", "one night"],
    cast: cast([
      ["Yara Mensah", "Layla"],
      ["Sebastian Crow", "Owen"],
      ["Marisol Reyes", "Aunt Carmela"],
    ]),
    crew: crew([
      ["Yara Mensah", "Director", "Directing"],
      ["Yara Mensah", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
    ]),
    similar: [113, 116, 104],
    recommendations: [113, 116, 102],
    productionCompanies: [{ id: 7, name: "Atlas Medi Films" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("marrakech-1"), backdrop("marrakech-2")],
  },
  {
    id: 107,
    mediaType: "MOVIE",
    title: "Iron Sparrow",
    originalTitle: "Iron Sparrow",
    overview:
      "A retired special-forces pilot is forced back into the cockpit when her daughter is kidnapped by a paramilitary group holding a Pacific island hostage.",
    tagline: "She flies where no one else dares.",
    posterUrl: img("iron-sparrow"),
    backdropUrl: backdrop("iron-sparrow-bd"),
    releaseDate: "2024-05-17",
    year: "2024",
    runtime: 134,
    voteAverage: 7.2,
    voteCount: 6890,
    popularity: 92.5,
    genres: [28, 12, 53],
    genreNames: ["Action", "Adventure", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 140000000,
    revenue: 412000000,
    imdbId: "tt3344556",
    tmdbId: 107,
    certification: "PG-13",
    keywords: ["action", "pilot", "kidnapping", "pacific"],
    cast: cast([
      ["Kira Tanaka", "Cmd. Rae Sato"],
      ["Deshawn Bell", "Warrant Diaz"],
      ["Marcus Cole", "General Voss"],
      ["Priya Iyer", "Lt. Lin"],
    ]),
    crew: crew([
      ["Daniel Brice", "Director", "Directing"],
      ["Daniel Brice", "Writer", "Writing"],
      ["Daniel Brice", "Producer", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
      ["Vince Roe", "Composer", "Sound"],
    ]),
    similar: [103, 110, 105],
    recommendations: [103, 110, 105],
    productionCompanies: [{ id: 8, name: "Pacific Edge Films" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("iron-sparrow-1"), backdrop("iron-sparrow-2")],
  },
  {
    id: 108,
    mediaType: "MOVIE",
    title: "Garden of Static",
    originalTitle: "Garden of Static",
    overview:
      "A botanist aboard a generation ship awakens 200 years early to find the crew missing and the ship's AI evolving a strange new religion around the garden she tends.",
    tagline: "Seeds outlive empires.",
    posterUrl: img("garden-static"),
    backdropUrl: backdrop("garden-static-bd"),
    releaseDate: "2024-10-04",
    year: "2024",
    runtime: 137,
    voteAverage: 8.0,
    voteCount: 982,
    popularity: 48.7,
    genres: [878, 18, 9648],
    genreNames: ["Science Fiction", "Drama", "Mystery"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 55000000,
    revenue: 98000000,
    imdbId: "tt9008123",
    tmdbId: 108,
    certification: "PG-13",
    keywords: ["generation ship", "ai", "botany", "mystery"],
    cast: cast([
      ["Ava Sinclair", "Dr. Mira Hale"],
      ["Theo Park", "Voice of Sibyl"],
      ["Lina Okoro", "Captain Okafor"],
    ]),
    crew: crew([
      ["Mariana Voss", "Director", "Directing"],
      ["Ada Lin", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [101, 112, 104],
    recommendations: [101, 112, 103],
    productionCompanies: [{ id: 9, name: "Orbital Six" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("garden-static-1"), backdrop("garden-static-2")],
  },
  {
    id: 109,
    mediaType: "MOVIE",
    title: "Paper Lanterns",
    originalTitle: "纸灯笼",
    overview:
      "Three generations of a family in a small riverside town confront a long-buried secret during the lantern festival that marks the anniversary of a disappearance.",
    tagline: "光会指引归途。",
    posterUrl: img("paper-lanterns"),
    backdropUrl: backdrop("paper-lanterns-bd"),
    releaseDate: "2023-06-16",
    year: "2023",
    runtime: 115,
    voteAverage: 8.3,
    voteCount: 2104,
    popularity: 58.9,
    genres: [18, 10751],
    genreNames: ["Drama", "Family"],
    originalLanguage: "zh",
    originCountry: ["CN"],
    status: "Released",
    budget: 12000000,
    revenue: 86000000,
    imdbId: "tt6655440",
    tmdbId: 109,
    certification: "PG",
    keywords: ["family", "lantern festival", "china", "memory"],
    cast: cast([
      ["Yuki Hara", "Mei"],
      ["Iris Lund", "Grandmother Lin"],
      ["Theo Park", "Bo"],
    ]),
    crew: crew([
      ["Yuki Hara", "Director", "Directing"],
      ["Yuki Hara", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
    ]),
    similar: [102, 113, 116],
    recommendations: [102, 113, 104],
    productionCompanies: [{ id: 10, name: "Lantern Light Studios" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("paper-lanterns-1"), backdrop("paper-lanterns-2")],
  },
  {
    id: 110,
    mediaType: "MOVIE",
    title: "Crown of Dust",
    originalTitle: "Crown of Dust",
    overview:
      "A ruthless bandit queen rises to power in a lawless frontier empire, only to face a reckoning when her estranged son returns as a federal marshal.",
    tagline: "Every crown is paid in dust.",
    posterUrl: img("crown-dust"),
    backdropUrl: backdrop("crown-dust-bd"),
    releaseDate: "2024-01-12",
    year: "2024",
    runtime: 132,
    voteAverage: 7.5,
    voteCount: 2841,
    popularity: 67.0,
    genres: [37, 18, 80],
    genreNames: ["Western", "Drama", "Crime"],
    originalLanguage: "en",
    originCountry: ["US", "MX"],
    status: "Released",
    budget: 68000000,
    revenue: 152000000,
    imdbId: "tt2211988",
    tmdbId: 110,
    certification: "R",
    keywords: ["western", "bandit", "frontier", "mother son"],
    cast: cast([
      ["Marisol Reyes", "Queen Salma Varga"],
      ["Sebastian Crow", "Marshal Crow"],
      ["Cornelius Frost", "Deacon Hull"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Director", "Directing"],
      ["Marisol Reyes", "Writer", "Writing"],
      ["Daniel Brice", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
    ]),
    similar: [105, 107, 103],
    recommendations: [105, 107, 113],
    productionCompanies: [{ id: 11, name: "Borderland Pictures" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("crown-dust-1"), backdrop("crown-dust-2")],
  },
  {
    id: 111,
    mediaType: "MOVIE",
    title: "The Comedian's Daughter",
    originalTitle: "The Comedian's Daughter",
    overview:
      "After her famous father's sudden death, a stand-up comic who hates the stage must perform his unfinished set at a tribute show — and confront why she ever left.",
    tagline: "The punchline was always her.",
    posterUrl: img("comedians-daughter"),
    backdropUrl: backdrop("comedians-daughter-bd"),
    releaseDate: "2024-04-19",
    year: "2024",
    runtime: 102,
    voteAverage: 7.8,
    voteCount: 1342,
    popularity: 41.2,
    genres: [35, 18],
    genreNames: ["Comedy", "Drama"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 22000000,
    revenue: 58000000,
    imdbId: "tt5544332",
    tmdbId: 111,
    certification: "R",
    keywords: ["comedy", "stand-up", "grief", "father daughter"],
    cast: cast([
      ["Hannah Brook", "Jesse Vale"],
      ["Cornelius Frost", "Buddy Vale"],
      ["Iris Lund", "Margot"],
    ]),
    crew: crew([
      ["Hannah Brook", "Director", "Directing"],
      ["Hannah Brook", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
    ]),
    similar: [113, 116, 106],
    recommendations: [113, 116, 106],
    productionCompanies: [{ id: 12, name: "Two Drink Minimum" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("comedians-daughter-1"), backdrop("comedians-daughter-2")],
  },
  {
    id: 112,
    mediaType: "MOVIE",
    title: "Tidal",
    originalTitle: "Tidal",
    overview:
      "A marine biologist studying orca dialects discovers a pattern in their songs that predicts a coming seismic event — but no one will listen in time.",
    tagline: "The deep always remembers.",
    posterUrl: img("tidal"),
    backdropUrl: backdrop("tidal-bd"),
    releaseDate: "2024-09-06",
    year: "2024",
    runtime: 121,
    voteAverage: 7.6,
    voteCount: 765,
    popularity: 35.8,
    genres: [18, 99, 53],
    genreNames: ["Drama", "Documentary", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US", "IS"],
    status: "Released",
    budget: 28000000,
    revenue: 41000000,
    imdbId: "tt9001111",
    tmdbId: 112,
    certification: "PG",
    keywords: ["orca", "marine biology", "earthquake", "science"],
    cast: cast([
      ["Ava Sinclair", "Dr. Hale"],
      ["Yara Mensah", "Captain Okafor"],
      ["Theo Park", "Kai"],
    ]),
    crew: crew([
      ["Mariana Voss", "Director", "Directing"],
      ["Mariana Voss", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [101, 108, 104],
    recommendations: [101, 108, 102],
    productionCompanies: [{ id: 13, name: "Cold Current Films" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("tidal-1"), backdrop("tidal-2")],
  },
  {
    id: 113,
    mediaType: "MOVIE",
    title: "Letters We Never Sent",
    originalTitle: "Letters We Never Sent",
    overview:
      "Two pen pals from opposite ends of the world meet for the first time in their seventies to fulfill a promise made forty years ago in unsent letters.",
    tagline: "Some words take a lifetime to deliver.",
    posterUrl: img("letters-never-sent"),
    backdropUrl: backdrop("letters-never-sent-bd"),
    releaseDate: "2023-12-08",
    year: "2023",
    runtime: 110,
    voteAverage: 8.5,
    voteCount: 1893,
    popularity: 47.1,
    genres: [18, 10749],
    genreNames: ["Drama", "Romance"],
    originalLanguage: "en",
    originCountry: ["US", "FR"],
    status: "Released",
    budget: 15000000,
    revenue: 73000000,
    imdbId: "tt4455009",
    tmdbId: 113,
    certification: "PG",
    keywords: ["pen pals", "letters", "romance", "lifetime"],
    cast: cast([
      ["Iris Lund", "Eleanor"],
      ["Cornelius Frost", "Henri"],
      ["Marisol Reyes", "Carmela"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Director", "Directing"],
      ["Yara Mensah", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
    ]),
    similar: [106, 116, 102],
    recommendations: [106, 116, 109],
    productionCompanies: [{ id: 14, name: "Postmark Pictures" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("letters-never-sent-1"), backdrop("letters-never-sent-2")],
  },
  {
    id: 114,
    mediaType: "MOVIE",
    title: "Volkov",
    originalTitle: "Волков",
    overview:
      "A retired Moscow detective is pulled out of a quiet coastal exile when a serial case from his past resurfaces with a taunting new signature.",
    tagline: "Прошлое никогда не спит.",
    posterUrl: img("volkov"),
    backdropUrl: backdrop("volkov-bd"),
    releaseDate: "2024-06-21",
    year: "2024",
    runtime: 138,
    voteAverage: 7.3,
    voteCount: 2410,
    popularity: 60.4,
    genres: [80, 53, 9648],
    genreNames: ["Crime", "Thriller", "Mystery"],
    originalLanguage: "ru",
    originCountry: ["RU"],
    status: "Released",
    budget: 38000000,
    revenue: 96000000,
    imdbId: "tt7778889",
    tmdbId: 114,
    certification: "R",
    keywords: ["detective", "moscow", "serial", "cold case"],
    cast: cast([
      ["Cornelius Frost", "Volkov"],
      ["Lina Okoro", "Det. Mensah"],
      ["Marcus Cole", "Petrov"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Director", "Directing"],
      ["Lars Bjorn", "Writer", "Writing"],
      ["Daniel Brice", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
    ]),
    similar: [110, 105, 103],
    recommendations: [110, 105, 103],
    productionCompanies: [{ id: 15, name: "Neva Features" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("volkov-1"), backdrop("volkov-2")],
  },
  {
    id: 115,
    mediaType: "MOVIE",
    title: "Kigali Nights",
    originalTitle: "Ijoro rya Kigali",
    overview:
      "A young Rwandan jazz trumpeter risks everything to open the city's first independent music club in a generation, while a rival promoter tries to shut him down.",
    tagline: "Amajwi aragenda mu ijoro.",
    posterUrl: img("kigali-nights"),
    backdropUrl: backdrop("kigali-nights-bd"),
    releaseDate: "2024-08-02",
    year: "2024",
    runtime: 113,
    voteAverage: 8.2,
    voteCount: 612,
    popularity: 44.5,
    genres: [18, 10402],
    genreNames: ["Drama", "Music"],
    originalLanguage: "rw",
    originCountry: ["RW"],
    status: "Released",
    budget: 8000000,
    revenue: 27000000,
    imdbId: "tt3322110",
    tmdbId: 115,
    certification: "PG-13",
    keywords: ["rwanda", "kigali", "jazz", "music", "african cinema"],
    cast: cast([
      ["Theo Park", "Patrick"],
      ["Yara Mensah", "Aline"],
      ["Marisol Reyes", "Mama Teta"],
    ]),
    crew: crew([
      ["Yara Mensah", "Director", "Directing"],
      ["Yara Mensah", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [109, 113, 116],
    recommendations: [109, 113, 106],
    productionCompanies: [{ id: 16, name: "Igerageza Films" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("kigali-nights-1"), backdrop("kigali-nights-2")],
  },
  {
    id: 116,
    mediaType: "MOVIE",
    title: "The Astronomer's Daughter",
    originalTitle: "The Astronomer's Daughter",
    overview:
      "A teenager in 1920s California fights to publish her late father's star charts under her own name while the scientific establishment tries to erase them both.",
    tagline: "She mapped the sky they refused to see.",
    posterUrl: img("astronomers-daughter"),
    backdropUrl: backdrop("astronomers-daughter-bd"),
    releaseDate: "2024-02-23",
    year: "2024",
    runtime: 118,
    voteAverage: 8.0,
    voteCount: 1432,
    popularity: 51.3,
    genres: [18, 36],
    genreNames: ["Drama", "History"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Released",
    budget: 24000000,
    revenue: 61000000,
    imdbId: "tt9000007",
    tmdbId: 116,
    certification: "PG",
    keywords: ["astronomy", "1920s", "women in science", "history"],
    cast: cast([
      ["Hannah Brook", "Vera Calloway"],
      ["Iris Lund", "Mrs. Calloway"],
      ["Cornelius Frost", "Prof. Halsey"],
    ]),
    crew: crew([
      ["Hannah Brook", "Director", "Directing"],
      ["Hannah Brook", "Writer", "Writing"],
      ["Eli Hartman", "Producer", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [109, 113, 102],
    recommendations: [109, 113, 102],
    productionCompanies: [{ id: 17, name: "Celestial Features" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("astronomers-daughter-1"), backdrop("astronomers-daughter-2")],
  },
];

export const TV_SHOWS: MediaItem[] = [
  {
    id: 201,
    mediaType: "TV",
    title: "Northern Crown",
    originalTitle: "Northern Crown",
    overview:
      "A semi-historical drama following three rival houses vying for control of a fading northern kingdom across one brutal winter.",
    tagline: "Winter remembers every betrayal.",
    posterUrl: img("northern-crown"),
    backdropUrl: backdrop("northern-crown-bd"),
    releaseDate: "2022-04-03",
    year: "2022",
    seasons: 3,
    episodes: 30,
    voteAverage: 8.7,
    voteCount: 12453,
    popularity: 99.2,
    genres: [18, 10752, 36],
    genreNames: ["Drama", "War", "History"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Returning Series",
    budget: 0,
    revenue: 0,
    imdbId: "tt1100220",
    tmdbId: 201,
    certification: "TV-MA",
    keywords: ["kingdom", "winter", "rivalry", "fantasy history"],
    cast: cast([
      ["Cornelius Frost", "King Halvard"],
      ["Iris Lund", "Queen Maeve"],
      ["Marisol Reyes", "Lady Salma"],
      ["Henrik Salden", "Lord Vey"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Creator", "Writing"],
      ["Lars Bjorn", "Showrunner", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [202, 204, 205],
    recommendations: [202, 204, 205],
    productionCompanies: [{ id: 18, name: "Ironwood Television" }],
    networks: [{ id: 1, name: "Crown Broadcasting", logoUrl: img("crown-net", 200, 100) }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("northern-crown-1"), backdrop("northern-crown-2")],
  },
  {
    id: 202,
    mediaType: "TV",
    title: "Static City",
    originalTitle: "Static City",
    overview:
      "A cynical detective in a neon megacity investigates crimes that all somehow connect to a single abandoned radio tower at the edge of town.",
    tagline: "Every signal points home.",
    posterUrl: img("static-city"),
    backdropUrl: backdrop("static-city-bd"),
    releaseDate: "2023-01-15",
    year: "2023",
    seasons: 2,
    episodes: 18,
    voteAverage: 8.3,
    voteCount: 7821,
    popularity: 84.0,
    genres: [80, 9648, 878],
    genreNames: ["Crime", "Mystery", "Science Fiction"],
    originalLanguage: "en",
    originCountry: ["US", "JP"],
    status: "Returning Series",
    imdbId: "tt2211001",
    tmdbId: 202,
    certification: "TV-MA",
    keywords: ["detective", "neon", "radio tower", "mystery"],
    cast: cast([
      ["Kira Tanaka", "Det. Sato"],
      ["Deshawn Bell", "Det. Diaz"],
      ["Priya Iyer", "Dr. Lin"],
    ]),
    crew: crew([
      ["Kenji Mori", "Creator", "Writing"],
      ["Kenji Mori", "Showrunner", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
    ]),
    similar: [201, 203, 204],
    recommendations: [201, 203, 204],
    productionCompanies: [{ id: 19, name: "Hikari TV" }],
    networks: [{ id: 2, name: "Neon+ Streaming", logoUrl: img("neon-net", 200, 100) }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("static-city-1"), backdrop("static-city-2")],
  },
  {
    id: 203,
    mediaType: "TV",
    title: "Greenhouse",
    originalTitle: "Greenhouse",
    overview:
      "A workplace comedy set in a struggling botanical garden where the staff care more about the plants than each other — until they don't.",
    tagline: "Growth is messy.",
    posterUrl: img("greenhouse"),
    backdropUrl: backdrop("greenhouse-bd"),
    releaseDate: "2023-09-05",
    year: "2023",
    seasons: 2,
    episodes: 20,
    voteAverage: 7.8,
    voteCount: 3210,
    popularity: 62.1,
    genres: [35],
    genreNames: ["Comedy"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Returning Series",
    imdbId: "tt3322009",
    tmdbId: 203,
    certification: "TV-PG",
    keywords: ["workplace", "comedy", "botanical garden"],
    cast: cast([
      ["Hannah Brook", "Wren"],
      ["Theo Park", "Bo"],
      ["Iris Lund", "Margot"],
    ]),
    crew: crew([
      ["Hannah Brook", "Creator", "Writing"],
      ["Hannah Brook", "Showrunner", "Production"],
    ]),
    similar: [204, 206, 207],
    recommendations: [204, 206, 207],
    productionCompanies: [{ id: 20, name: "Plot Twist Productions" }],
    networks: [{ id: 3, name: "Daytime+ Streaming", logoUrl: img("daytime-net", 200, 100) }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("greenhouse-1"), backdrop("greenhouse-2")],
  },
  {
    id: 204,
    mediaType: "TV",
    title: "Saltwater",
    originalTitle: "Saltwater",
    overview:
      "A multi-generational family saga set on a struggling oyster farm on the Louisiana coast, where the land, the law, and the sea all want something different.",
    tagline: "The tide takes everything.",
    posterUrl: img("saltwater"),
    backdropUrl: backdrop("saltwater-bd"),
    releaseDate: "2022-10-12",
    year: "2022",
    seasons: 4,
    episodes: 40,
    voteAverage: 8.5,
    voteCount: 9120,
    popularity: 78.9,
    genres: [18],
    genreNames: ["Drama"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Returning Series",
    imdbId: "tt4455660",
    tmdbId: 204,
    certification: "TV-14",
    keywords: ["family", "louisiana", "oyster farm", "coastal"],
    cast: cast([
      ["Marisol Reyes", "Mama Teta"],
      ["Sebastian Crow", "Owen"],
      ["Yara Mensah", "Aline"],
      ["Deshawn Bell", "Cal"],
    ]),
    crew: crew([
      ["Yara Mensah", "Creator", "Writing"],
      ["Yara Mensah", "Showrunner", "Production"],
      ["Astrid Vale", "Cinematographer", "Camera"],
    ]),
    similar: [201, 205, 207],
    recommendations: [201, 205, 207],
    productionCompanies: [{ id: 21, name: "Gulfstream Pictures" }],
    networks: [{ id: 4, name: "Delta TV", logoUrl: img("delta-net", 200, 100) }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("saltwater-1"), backdrop("saltwater-2")],
  },
  {
    id: 205,
    mediaType: "TV",
    title: "The Long Dark",
    originalTitle: "The Long Dark",
    overview:
      "A research team at a remote Antarctic station races to decode a signal buried in the ice while a weeks-long polar storm cuts them off from the world.",
    tagline: "The dark is not empty.",
    posterUrl: img("the-long-dark"),
    backdropUrl: backdrop("the-long-dark-bd"),
    releaseDate: "2024-05-31",
    year: "2024",
    seasons: 1,
    episodes: 8,
    voteAverage: 8.1,
    voteCount: 2143,
    popularity: 70.4,
    genres: [9648, 878, 53],
    genreNames: ["Mystery", "Science Fiction", "Thriller"],
    originalLanguage: "en",
    originCountry: ["US", "NO"],
    status: "Returning Series",
    imdbId: "tt5566775",
    tmdbId: 205,
    certification: "TV-MA",
    keywords: ["antarctica", "mystery", "isolation", "signal"],
    cast: cast([
      ["Ava Sinclair", "Dr. Hale"],
      ["Henrik Salden", "Vey"],
      ["Lina Okoro", "Okafor"],
    ]),
    crew: crew([
      ["Mariana Voss", "Creator", "Writing"],
      ["Mariana Voss", "Showrunner", "Production"],
      ["Ravi Anand", "Composer", "Sound"],
    ]),
    similar: [202, 201, 204],
    recommendations: [202, 201, 204],
    productionCompanies: [{ id: 22, name: "Polaris TV" }],
    networks: [{ id: 5, name: "Aurora Streaming", logoUrl: img("aurora-net", 200, 100) }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("the-long-dark-1"), backdrop("the-long-dark-2")],
  },
  {
    id: 206,
    mediaType: "TV",
    title: "Tinker's Lane",
    originalTitle: "Tinker's Lane",
    overview:
      "A cozy mystery series following a retired engineer who can't stop fixing things — including murders — in a quirky English village.",
    tagline: "Everything can be repaired. Eventually.",
    posterUrl: img("tinkers-lane"),
    backdropUrl: backdrop("tinkers-lane-bd"),
    releaseDate: "2023-04-21",
    year: "2023",
    seasons: 3,
    episodes: 24,
    voteAverage: 7.9,
    voteCount: 4120,
    popularity: 55.7,
    genres: [80, 35],
    genreNames: ["Crime", "Comedy"],
    originalLanguage: "en",
    originCountry: ["GB"],
    status: "Returning Series",
    imdbId: "tt6677880",
    tmdbId: 206,
    certification: "TV-PG",
    keywords: ["cozy mystery", "england", "village", "retired"],
    cast: cast([
      ["Cornelius Frost", "Arthur Vane"],
      ["Iris Lund", "Margot"],
      ["Theo Park", "Bo"],
    ]),
    crew: crew([
      ["Lars Bjorn", "Creator", "Writing"],
      ["Lars Bjorn", "Showrunner", "Production"],
    ]),
    similar: [203, 204, 207],
    recommendations: [203, 204, 207],
    productionCompanies: [{ id: 23, name: "Greenleaf UK" }],
    networks: [{ id: 6, name: "BritBox+" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("tinkers-lane-1"), backdrop("tinkers-lane-2")],
  },
  {
    id: 207,
    mediaType: "TV",
    title: "After the Rain",
    originalTitle: "雨のち",
    overview:
      "A Tokyo architect recovering from loss accepts an impossible commission: rebuilding a small-town shrine destroyed by a flood, with help from the locals who lost everything.",
    tagline: "雨が止むとき、何かが始まる。",
    posterUrl: img("after-the-rain"),
    backdropUrl: backdrop("after-the-rain-bd"),
    releaseDate: "2024-01-07",
    year: "2024",
    seasons: 1,
    episodes: 10,
    voteAverage: 8.6,
    voteCount: 2980,
    popularity: 66.2,
    genres: [18],
    genreNames: ["Drama"],
    originalLanguage: "ja",
    originCountry: ["JP"],
    status: "Ended",
    imdbId: "tt7788990",
    tmdbId: 207,
    certification: "TV-14",
    keywords: ["japan", "tokyo", "shrine", "rebuild", "grief"],
    cast: cast([
      ["Yuki Hara", "Mei"],
      ["Kira Tanaka", "Sato"],
      ["Iris Lund", "Mrs. Lin"],
    ]),
    crew: crew([
      ["Kenji Mori", "Creator", "Writing"],
      ["Kenji Mori", "Showrunner", "Production"],
      ["Sora Kim", "Cinematographer", "Camera"],
    ]),
    similar: [204, 209, 206],
    recommendations: [204, 209, 206],
    productionCompanies: [{ id: 24, name: "Hikari TV" }],
    networks: [{ id: 7, name: "Tokyo Stream" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("after-the-rain-1"), backdrop("after-the-rain-2")],
  },
  {
    id: 208,
    mediaType: "TV",
    title: "Heart of the Savannah",
    originalTitle: "Heart of the Savannah",
    overview:
      "A wildlife vet and a documentary filmmaker crisscross East Africa saving endangered species while uncovering an ivory smuggling ring.",
    tagline: "Every heartbeat matters.",
    posterUrl: img("heart-savannah"),
    backdropUrl: backdrop("heart-savannah-bd"),
    releaseDate: "2023-07-19",
    year: "2023",
    seasons: 2,
    episodes: 16,
    voteAverage: 8.4,
    voteCount: 3411,
    popularity: 60.0,
    genres: [18, 99, 12],
    genreNames: ["Drama", "Documentary", "Adventure"],
    originalLanguage: "en",
    originCountry: ["KE", "RW"],
    status: "Returning Series",
    imdbId: "tt8899001",
    tmdbId: 208,
    certification: "TV-PG",
    keywords: ["africa", "wildlife", "conservation", "smuggling"],
    cast: cast([
      ["Yara Mensah", "Dr. Mensah"],
      ["Theo Park", "Patrick"],
      ["Marisol Reyes", "Carmela"],
    ]),
    crew: crew([
      ["Yara Mensah", "Creator", "Writing"],
      ["Yara Mensah", "Showrunner", "Production"],
    ]),
    similar: [204, 209, 115],
    recommendations: [204, 209, 115],
    productionCompanies: [{ id: 25, name: "Savannah Pictures" }],
    networks: [{ id: 8, name: "Wild+" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("heart-savannah-1"), backdrop("heart-savannah-2")],
  },
  {
    id: 209,
    mediaType: "TV",
    title: "Code Red",
    originalTitle: "Code Red",
    overview:
      "An ensemble medical drama set in a chaotic ER that becomes the front line of a city-wide public health crisis.",
    tagline: "Every second is a decision.",
    posterUrl: img("code-red"),
    backdropUrl: backdrop("code-red-bd"),
    releaseDate: "2022-09-22",
    year: "2022",
    seasons: 5,
    episodes: 90,
    voteAverage: 7.7,
    voteCount: 11240,
    popularity: 73.3,
    genres: [18],
    genreNames: ["Drama"],
    originalLanguage: "en",
    originCountry: ["US"],
    status: "Returning Series",
    imdbId: "tt9900112",
    tmdbId: 209,
    certification: "TV-14",
    keywords: ["medical", "er", "drama", "crisis"],
    cast: cast([
      ["Ava Sinclair", "Dr. Hale"],
      ["Deshawn Bell", "Dr. Diaz"],
      ["Priya Iyer", "Nurse Lin"],
      ["Marcus Cole", "Dr. Voss"],
    ]),
    crew: crew([
      ["Daniel Brice", "Creator", "Writing"],
      ["Daniel Brice", "Showrunner", "Production"],
    ]),
    similar: [204, 203, 201],
    recommendations: [204, 203, 201],
    productionCompanies: [{ id: 26, name: "Critical Pictures" }],
    networks: [{ id: 9, name: "Pulse TV" }],
    trailerYoutubeId: "dQw4w9WgXcQ",
    images: [backdrop("code-red-1"), backdrop("code-red-2")],
  },
];

// Build person profiles from cast/crew in media
function buildPeople(): Person[] {
  const peopleMap = new Map<string, { name: string; jobs: Set<string>; departments: Set<string>; media: { id: number; title: string; character?: string; job?: string; year: string; posterUrl: string; type: "MOVIE" | "TV" }[] }>();

  const allMedia = [...MOVIES, ...TV_SHOWS];
  for (const m of allMedia) {
    for (const c of m.cast) {
      const key = c.name;
      if (!peopleMap.has(key)) peopleMap.set(key, { name: key, jobs: new Set(["Actor"]), departments: new Set(["Acting"]), media: [] });
      const p = peopleMap.get(key)!;
      p.jobs.add("Actor");
      p.departments.add("Acting");
      p.media.push({ id: m.id, title: m.title, character: c.character, year: m.year, posterUrl: m.posterUrl, type: m.mediaType as "MOVIE" | "TV" });
    }
    for (const c of m.crew) {
      const key = c.name;
      if (!peopleMap.has(key)) peopleMap.set(key, { name: key, jobs: new Set(), departments: new Set(), media: [] });
      const p = peopleMap.get(key)!;
      p.jobs.add(c.job);
      p.departments.add(c.department);
      p.media.push({ id: m.id, title: m.title, job: c.job, year: m.year, posterUrl: m.posterUrl, type: m.mediaType as "MOVIE" | "TV" });
    }
  }

  const bios = [
    "A celebrated performer known for choosing roles that balance emotional depth with quiet intensity.",
    "An award-winning filmmaker whose work explores memory, identity, and the spaces between cultures.",
    "A versatile artist equally at home in front of the camera and behind the writer's desk.",
    "A pioneering creative whose career has spanned four continents and two decades.",
    "A critically acclaimed talent with a reputation for transforming every project they touch.",
  ];

  const places = ["London, UK", "Tokyo, Japan", "Lagos, Nigeria", "Kigali, Rwanda", "Los Angeles, USA", "Mumbai, India", "Seoul, South Korea", "Paris, France", "Mexico City, Mexico", "Reykjavík, Iceland"];

  let i = 0;
  return Array.from(peopleMap.values()).map((p) => {
    const id = 10000 + i;
    const movieCredits = p.media.filter((m) => m.type === "MOVIE").map((m) => ({ id: m.id, title: m.title, character: m.character, job: m.job, year: m.year, posterUrl: m.posterUrl }));
    const tvCredits = p.media.filter((m) => m.type === "TV").map((m) => ({ id: m.id, title: m.title, character: m.character, job: m.job, year: m.year, posterUrl: m.posterUrl }));
    const person: Person = {
      id,
      name: p.name,
      biography: bios[i % bios.length],
      profileUrl: profile(p.name.toLowerCase().replace(/\s+/g, "-")),
      birthdate: `19${70 + (i % 25)}-0${1 + (i % 9)}-1${i % 9}`,
      birthplace: places[i % places.length],
      department: Array.from(p.departments).join(", "),
      knownFor: Array.from(p.jobs).slice(0, 3).join(", "),
      gender: i % 2 === 0 ? "Female" : "Male",
      placeOfOrigin: places[i % places.length],
      movieCredits,
      tvCredits,
      externalLinks: [
        { label: "IMDb", url: `https://www.imdb.com/name/nm${1000000 + id}` },
        { label: "Wikipedia", url: `https://en.wikipedia.org/wiki/${p.name.replace(/\s+/g, "_")}` },
      ],
    };
    i++;
    return person;
  });
}

export const PEOPLE: Person[] = buildPeople();

export const ALL_MEDIA: MediaItem[] = [...MOVIES, ...TV_SHOWS];

export function findMedia(id: number): MediaItem | undefined {
  return ALL_MEDIA.find((m) => m.id === id);
}

export function findPersonByName(name: string): Person | undefined {
  return PEOPLE.find((p) => p.name === name);
}

export function findPersonById(id: number): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

// Curated list of streaming providers
export const PROVIDERS = [
  { id: 1, name: "StreamFlix", logoUrl: img("streamflix-logo", 200, 100), color: "#E50914" },
  { id: 2, name: "PrimeReel", logoUrl: img("primereel-logo", 200, 100), color: "#00A8E1" },
  { id: 3, name: "DisneyVault", logoUrl: img("disneyvault-logo", 200, 100), color: "#113CCF" },
  { id: 4, name: "AppleTV+", logoUrl: img("appletv-logo", 200, 100), color: "#000000" },
  { id: 5, name: "MaxStream", logoUrl: img("maxstream-logo", 200, 100), color: "#9B4DFF" },
  { id: 6, name: "Showmax", logoUrl: img("showmax-logo", 200, 100), color: "#FF6B35" },
  { id: 7, name: "AuroraPlay", logoUrl: img("auroraplay-logo", 200, 100), color: "#00C4A7" },
];

// Provider availability per media
export function providersForMedia(id: number) {
  const providers = [];
  const seed = id % 5;
  providers.push({ ...PROVIDERS[seed % PROVIDERS.length], type: "SUBSCRIPTION" as const });
  if (seed % 2 === 0) providers.push({ ...PROVIDERS[(seed + 2) % PROVIDERS.length], type: "RENTAL" as const, price: "$3.99" });
  if (seed % 3 === 0) providers.push({ ...PROVIDERS[(seed + 4) % PROVIDERS.length], type: "PURCHASE" as const, price: "$12.99" });
  return providers;
}

// Editor collections
export const COLLECTIONS = [
  {
    id: 1,
    name: "Award Season 2024",
    description: "Our editors' picks for the films that defined this year's conversation.",
    coverUrl: backdrop("collection-award"),
    items: [101, 113, 116, 109, 115, 104],
    curator: "Editorial Team",
    isPublic: true,
  },
  {
    id: 2,
    name: "Cozy Weekend Watch",
    description: "Comfort watches for the long evenings — gentle, warm, and unhurried.",
    coverUrl: backdrop("collection-cozy"),
    items: [106, 109, 113, 203, 206],
    curator: "Editorial Team",
    isPublic: true,
  },
  {
    id: 3,
    name: "African Cinema Spotlight",
    description: "Celebrating storytellers from across the African continent.",
    coverUrl: backdrop("collection-africa"),
    items: [115, 208],
    curator: "Editorial Team",
    isPublic: true,
  },
  {
    id: 4,
    name: "Worlds Beyond",
    description: "Science fiction that asks the biggest questions.",
    coverUrl: backdrop("collection-scifi"),
    items: [101, 103, 108, 112],
    curator: "Editorial Team",
    isPublic: true,
  },
];
