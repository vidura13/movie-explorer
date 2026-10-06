/**
 * Sample dataset used when no TMDb token is configured (see utils/constants.js).
 *
 * These records deliberately mirror TMDb's response schema field-for-field —
 * including nullable fields — so that switching to the live API changes the
 * data source and nothing else. Poster paths and YouTube trailer keys are real
 * and were checked against the TMDb image CDN and YouTube's oEmbed endpoint, so
 * the UI is exercised with genuine images rather than grey boxes.
 *
 * Two records are intentionally imperfect to exercise fallback paths:
 *   - "Toy Story" has no trailer, to cover the disabled-trailer state.
 *   - "Spirited Away" has no poster_path, to cover the placeholder artwork.
 *
 * This file is a development fixture. It is not bundled into the mock service
 * used in production builds — see services/config for the mode switch.
 */

/** TMDb genre ids, used to expand `genre_ids` into full genre objects. */
export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

/**
 * @typedef {object} MockMovie
 * @property {number} id
 * @property {string} title
 * @property {string} overview
 * @property {string} release_date  ISO date, as returned by TMDb
 * @property {number} vote_average
 * @property {number} vote_count
 * @property {number} popularity
 * @property {string|null} poster_path
 * @property {number[]} genre_ids
 * @property {number} runtime        minutes
 * @property {string} tagline
 * @property {string} director
 * @property {Array<{name: string, character: string}>} cast
 * @property {string|null} trailerKey YouTube video id, null when none exists
 */

/** @type {MockMovie[]} */
export const MOCK_MOVIES = [
  {
    id: 27205,
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    overview:
      'A thief who steals corporate secrets through dream-sharing technology is given an inverse task: plant an idea in a target’s mind. As the layers of the dream deepen, the line between his work and his own grief begins to blur.',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36_742_918,
    popularity: 98.4,
    poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    genre_ids: [28, 878, 12],
    runtime: 148,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Leonardo DiCaprio', character: 'Dom Cobb' },
      { name: 'Joseph Gordon-Levitt', character: 'Arthur' },
      { name: 'Elliot Page', character: 'Ariadne' },
      { name: 'Tom Hardy', character: 'Eames' },
    ],
    trailerKey: 'YoHD9XEInc0',
  },
  {
    id: 155,
    title: 'The Dark Knight',
    tagline: 'Why so serious?',
    overview:
      'Batman raises the stakes in his war on crime, but a new criminal in face paint forces him, Gordon and Harvey Dent towards the edge of their own principles.',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 33_118_442,
    popularity: 96.1,
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genre_ids: [28, 80, 18],
    runtime: 152,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Christian Bale', character: 'Bruce Wayne' },
      { name: 'Heath Ledger', character: 'The Joker' },
      { name: 'Aaron Eckhart', character: 'Harvey Dent' },
      { name: 'Gary Oldman', character: 'James Gordon' },
    ],
    trailerKey: 'EXeTwQWrcwY',
  },
  {
    id: 157336,
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    overview:
      'With Earth’s crops failing, a former pilot joins a mission through a wormhole in search of a habitable world — and a way back to the daughter he left behind.',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 36_204_115,
    popularity: 94.7,
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    genre_ids: [12, 18, 878],
    runtime: 169,
    director: 'Christopher Nolan',
    cast: [
      { name: 'Matthew McConaughey', character: 'Cooper' },
      { name: 'Anne Hathaway', character: 'Brand' },
      { name: 'Jessica Chastain', character: 'Murph' },
      { name: 'Michael Caine', character: 'Professor Brand' },
    ],
    trailerKey: 'zSWdZVtXT7E',
  },
  {
    id: 550,
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    overview:
      'An insomniac office worker and a soap salesman form an underground fight club that grows into something far larger and far less controllable than either intended.',
    release_date: '1999-10-15',
    vote_average: 8.4,
    vote_count: 30_554_208,
    popularity: 88.2,
    poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    genre_ids: [18, 53],
    runtime: 139,
    director: 'David Fincher',
    cast: [
      { name: 'Edward Norton', character: 'The Narrator' },
      { name: 'Brad Pitt', character: 'Tyler Durden' },
      { name: 'Helena Bonham Carter', character: 'Marla Singer' },
    ],
    trailerKey: 'qtRKdVHc-cE',
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    tagline: 'Just because you are a character doesn’t mean you have character.',
    overview:
      'The lives of two mob hitmen, a boxer, a gangster’s wife and a pair of diner bandits intertwine in four tales of violence and redemption.',
    release_date: '1994-09-10',
    vote_average: 8.5,
    vote_count: 28_913_774,
    popularity: 86.5,
    poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    genre_ids: [80, 18],
    runtime: 154,
    director: 'Quentin Tarantino',
    cast: [
      { name: 'John Travolta', character: 'Vincent Vega' },
      { name: 'Samuel L. Jackson', character: 'Jules Winnfield' },
      { name: 'Uma Thurman', character: 'Mia Wallace' },
    ],
    trailerKey: 's7EdQ4FqbhY',
  },
  {
    id: 496243,
    title: 'Parasite',
    tagline: 'Act like you own the place.',
    overview:
      'A cunning but impoverished family schemes their way into the household of a wealthy one, until a hidden discovery turns their arrangement into something far darker.',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 19_442_310,
    popularity: 84.9,
    poster_path: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    genre_ids: [35, 18, 53],
    runtime: 133,
    director: 'Bong Joon-ho',
    cast: [
      { name: 'Song Kang-ho', character: 'Ki-taek' },
      { name: 'Lee Sun-kyun', character: 'Park Dong-ik' },
      { name: 'Cho Yeo-jeong', character: 'Choi Yeon-gyo' },
    ],
    trailerKey: '5xH0HfJHsaY',
  },
  {
    id: 238,
    title: 'The Godfather',
    tagline: 'An offer you can’t refuse.',
    overview:
      'The ageing patriarch of a New York crime dynasty transfers control to his reluctant youngest son, who discovers exactly what the family business demands of him.',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 21_067_882,
    popularity: 82.3,
    poster_path: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    genre_ids: [18, 80],
    runtime: 175,
    director: 'Francis Ford Coppola',
    cast: [
      { name: 'Marlon Brando', character: 'Don Vito Corleone' },
      { name: 'Al Pacino', character: 'Michael Corleone' },
      { name: 'James Caan', character: 'Sonny Corleone' },
    ],
    trailerKey: 'sY1S34973zA',
  },
  {
    id: 438631,
    title: 'Dune',
    tagline: 'Beyond fear, destiny awaits.',
    overview:
      'The heir of a noble house is thrust into a war for the most valuable resource in the galaxy, on a desert world whose people may hold the key to his future.',
    release_date: '2021-10-22',
    vote_average: 7.8,
    vote_count: 13_119_402,
    popularity: 91.6,
    poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
    genre_ids: [878, 12],
    runtime: 155,
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { name: 'Rebecca Ferguson', character: 'Lady Jessica' },
      { name: 'Oscar Isaac', character: 'Duke Leto Atreides' },
    ],
    trailerKey: 'n9xhJrPXop4',
  },
  {
    id: 634649,
    title: 'Spider-Man: No Way Home',
    tagline: 'The multiverse unleashed.',
    overview:
      'With his identity exposed, Peter Parker asks for magical help to restore his secret — and tears a hole between worlds that brings visitors he never expected.',
    release_date: '2021-12-16',
    vote_average: 7.9,
    vote_count: 21_880_224,
    popularity: 90.2,
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    genre_ids: [28, 12, 878],
    runtime: 148,
    director: 'Jon Watts',
    cast: [
      { name: 'Tom Holland', character: 'Peter Parker' },
      { name: 'Zendaya', character: 'MJ' },
      { name: 'Benedict Cumberbatch', character: 'Doctor Strange' },
    ],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    overview:
      'Wrongly convicted of murder, a quiet banker builds a life inside a state prison — and a friendship that sustains him across two decades of quiet resistance.',
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 27_551_903,
    popularity: 80.8,
    poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    genre_ids: [18, 80],
    runtime: 142,
    director: 'Frank Darabont',
    cast: [
      { name: 'Tim Robbins', character: 'Andy Dufresne' },
      { name: 'Morgan Freeman', character: 'Ellis Boyd "Red" Redding' },
      { name: 'Bob Gunton', character: 'Warden Norton' },
    ],
    trailerKey: '6hB3S9bIaco',
  },
  {
    id: 244786,
    title: 'Whiplash',
    tagline: 'The road to greatness can take you to the edge.',
    overview:
      'A promising young drummer enrols at a cut-throat conservatory where a legendary instructor will stop at nothing to push him past his limits.',
    release_date: '2014-10-10',
    vote_average: 8.4,
    vote_count: 15_204_663,
    popularity: 79.4,
    poster_path: '/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    genre_ids: [18, 10402],
    runtime: 106,
    director: 'Damien Chazelle',
    cast: [
      { name: 'Miles Teller', character: 'Andrew Neiman' },
      { name: 'J.K. Simmons', character: 'Terence Fletcher' },
      { name: 'Melissa Benoist', character: 'Nicole' },
    ],
    trailerKey: '7d_jQycdQGo',
  },
  {
    id: 120467,
    title: 'The Grand Budapest Hotel',
    tagline: 'A perfect holiday without leaving home.',
    overview:
      'A legendary concierge and his most trusted lobby boy become entangled in the theft of a priceless painting and the battle for an enormous family fortune.',
    release_date: '2014-03-07',
    vote_average: 8.0,
    vote_count: 13_887_291,
    popularity: 74.9,
    poster_path: '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    genre_ids: [35, 18],
    runtime: 99,
    director: 'Wes Anderson',
    cast: [
      { name: 'Ralph Fiennes', character: 'M. Gustave' },
      { name: 'Tony Revolori', character: 'Zero Moustafa' },
      { name: 'Adrien Brody', character: 'Dmitri' },
    ],
    trailerKey: '1Fg5iWmQjwk',
  },
  {
    id: 76341,
    title: 'Mad Max: Fury Road',
    tagline: 'What a lovely day.',
    overview:
      'In a scorched wasteland, a drifter and a runaway commander flee a warlord’s army across the desert in one long, relentless chase.',
    release_date: '2015-05-15',
    vote_average: 7.6,
    vote_count: 22_558_310,
    popularity: 77.1,
    poster_path: '/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    genre_ids: [28, 12, 878],
    runtime: 120,
    director: 'George Miller',
    cast: [
      { name: 'Tom Hardy', character: 'Max Rockatansky' },
      { name: 'Charlize Theron', character: 'Imperator Furiosa' },
      { name: 'Nicholas Hoult', character: 'Nux' },
    ],
    trailerKey: 'hEJnMQG9ev8',
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    tagline: 'There’s a storm coming.',
    overview:
      'A young blade runner uncovers a secret buried long enough to destabilise what is left of society, and goes looking for a man who vanished thirty years earlier.',
    release_date: '2017-10-06',
    vote_average: 7.6,
    vote_count: 13_402_118,
    popularity: 73.6,
    poster_path: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    genre_ids: [878, 18],
    runtime: 164,
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Ryan Gosling', character: 'K' },
      { name: 'Harrison Ford', character: 'Rick Deckard' },
      { name: 'Ana de Armas', character: 'Joi' },
    ],
    trailerKey: 'gCcx85zbxz4',
  },
  {
    id: 545611,
    title: 'Everything Everywhere All at Once',
    tagline: 'The universe is so much bigger than you realise.',
    overview:
      'An overwhelmed laundromat owner discovers she must connect with parallel versions of herself to stop a threat spreading across the multiverse — and to reach her daughter.',
    release_date: '2022-03-25',
    vote_average: 7.8,
    vote_count: 6_442_550,
    popularity: 71.3,
    poster_path: '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    genre_ids: [28, 12, 878],
    runtime: 139,
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: [
      { name: 'Michelle Yeoh', character: 'Evelyn Wang' },
      { name: 'Ke Huy Quan', character: 'Waymond Wang' },
      { name: 'Stephanie Hsu', character: 'Joy Wang' },
    ],
    trailerKey: 'wxN1T1uxQ2g',
  },
  {
    id: 603,
    title: 'The Matrix',
    tagline: 'Welcome to the real world.',
    overview:
      'A hacker learns that the world he knows is a simulation built to keep humanity docile, and that he may be the one destined to break it open.',
    release_date: '1999-03-31',
    vote_average: 8.2,
    vote_count: 25_221_889,
    popularity: 83.7,
    poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    genre_ids: [28, 878],
    runtime: 136,
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: [
      { name: 'Keanu Reeves', character: 'Neo' },
      { name: 'Laurence Fishburne', character: 'Morpheus' },
      { name: 'Carrie-Anne Moss', character: 'Trinity' },
    ],
    trailerKey: 'vKQi3bBA1y8',
  },
  {
    id: 419430,
    title: 'Get Out',
    tagline: 'Just because you’re invited, doesn’t mean you’re welcome.',
    overview:
      'A young Black man visits his white girlfriend’s family estate for the weekend and slowly realises that the welcome is not what it appears to be.',
    release_date: '2017-02-24',
    vote_average: 7.6,
    vote_count: 14_884_206,
    popularity: 69.8,
    poster_path: '/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
    genre_ids: [27, 53, 9648],
    runtime: 104,
    director: 'Jordan Peele',
    cast: [
      { name: 'Daniel Kaluuya', character: 'Chris Washington' },
      { name: 'Allison Williams', character: 'Rose Armitage' },
      { name: 'Bradley Whitford', character: 'Dean Armitage' },
    ],
    trailerKey: 'DzfpyUB60YY',
  },
  {
    id: 313369,
    title: 'La La Land',
    tagline: 'Here’s to the fools who dream.',
    overview:
      'A jazz pianist and an aspiring actress fall in love in Los Angeles while chasing careers that keep pulling them in different directions.',
    release_date: '2016-12-09',
    vote_average: 7.9,
    vote_count: 16_553_772,
    popularity: 72.4,
    poster_path: '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    genre_ids: [35, 18, 10749],
    runtime: 128,
    director: 'Damien Chazelle',
    cast: [
      { name: 'Ryan Gosling', character: 'Sebastian' },
      { name: 'Emma Stone', character: 'Mia' },
      { name: 'John Legend', character: 'Keith' },
    ],
    trailerKey: '0pdqf4P9MB8',
  },
  {
    id: 348,
    title: 'Alien',
    tagline: 'In space no one can hear you scream.',
    overview:
      'The crew of a commercial towing ship answers a distress signal and brings something aboard that turns their trip home into a hunt.',
    release_date: '1979-05-25',
    vote_average: 8.2,
    vote_count: 14_552_901,
    popularity: 76.3,
    poster_path: '/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
    genre_ids: [27, 878],
    runtime: 117,
    director: 'Ridley Scott',
    cast: [
      { name: 'Sigourney Weaver', character: 'Ripley' },
      { name: 'Tom Skerritt', character: 'Dallas' },
      { name: 'John Hurt', character: 'Kane' },
    ],
    trailerKey: 'LjLamj-b0I8',
  },
  {
    id: 329865,
    title: 'Arrival',
    tagline: 'Why are they here?',
    overview:
      'A linguist is recruited to communicate with visitors whose language does not behave like any on Earth — and whose grammar may change how she experiences time.',
    release_date: '2016-11-10',
    vote_average: 7.6,
    vote_count: 17_882_334,
    popularity: 70.9,
    poster_path: '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    genre_ids: [18, 878, 9648],
    runtime: 116,
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Amy Adams', character: 'Louise Banks' },
      { name: 'Jeremy Renner', character: 'Ian Donnelly' },
      { name: 'Forest Whitaker', character: 'Colonel Weber' },
    ],
    trailerKey: 'tFMo3UJ4B4g',
  },
  {
    id: 475557,
    title: 'Joker',
    tagline: 'Put on a happy face.',
    overview:
      'A failed stand-up comedian in a city that has no use for him drifts from isolation into a violence that the rest of Gotham is ready to celebrate.',
    release_date: '2019-10-04',
    vote_average: 8.2,
    vote_count: 25_663_118,
    popularity: 87.5,
    poster_path: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    genre_ids: [80, 18, 53],
    runtime: 122,
    director: 'Todd Phillips',
    cast: [
      { name: 'Joaquin Phoenix', character: 'Arthur Fleck' },
      { name: 'Robert De Niro', character: 'Murray Franklin' },
      { name: 'Zazie Beetz', character: 'Sophie Dumond' },
    ],
    trailerKey: 'zAGVQLHvwOY',
  },
  {
    id: 546554,
    title: 'Knives Out',
    tagline: 'Hell, any of them could have done it.',
    overview:
      'When a celebrated crime novelist is found dead after his own birthday party, a detective works through a family of suspects who all had reasons to want him gone.',
    release_date: '2019-11-27',
    vote_average: 7.8,
    vote_count: 12_774_490,
    popularity: 68.2,
    poster_path: '/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    genre_ids: [35, 80, 9648],
    runtime: 130,
    director: 'Rian Johnson',
    cast: [
      { name: 'Daniel Craig', character: 'Benoit Blanc' },
      { name: 'Ana de Armas', character: 'Marta Cabrera' },
      { name: 'Chris Evans', character: 'Ransom Drysdale' },
    ],
    trailerKey: 'qGqiHJTsRkQ',
  },
  {
    id: 354912,
    title: 'Coco',
    tagline: 'The celebration of a lifetime.',
    overview:
      'A boy who dreams of playing music is pulled into the Land of the Dead, where he searches for the great-great-grandfather his family refuses to talk about.',
    release_date: '2017-10-27',
    vote_average: 8.2,
    vote_count: 19_002_556,
    popularity: 71.8,
    poster_path: '/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg',
    genre_ids: [16, 10751, 10402],
    runtime: 105,
    director: 'Lee Unkrich',
    cast: [
      { name: 'Anthony Gonzalez', character: 'Miguel' },
      { name: 'Gael García Bernal', character: 'Héctor' },
      { name: 'Benjamin Bratt', character: 'Ernesto de la Cruz' },
    ],
    trailerKey: 'Ga6RYejo6Hk',
  },
  {
    id: 129,
    title: 'Spirited Away',
    tagline: 'The tunnel led Chihiro to a mysterious town.',
    overview:
      'A sullen ten-year-old wanders into a world of spirits where her parents are transformed, and must work in a bathhouse to find a way to free them.',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 16_338_120,
    popularity: 75.6,
    // Deliberately null: exercises the missing-poster placeholder path.
    poster_path: null,
    genre_ids: [16, 10751, 14],
    runtime: 125,
    director: 'Hayao Miyazaki',
    cast: [
      { name: 'Rumi Hiiragi', character: 'Chihiro' },
      { name: 'Miyu Irino', character: 'Haku' },
      { name: 'Mari Natsuki', character: 'Yubaba' },
    ],
    trailerKey: 'ByXuk9QqQkk',
  },
  {
    id: 372058,
    title: 'Your Name.',
    tagline: 'Two strangers, one impossible connection.',
    overview:
      'A Tokyo boy and a country girl begin waking up in each other’s bodies, and the search for the person on the other side becomes a race against something much larger.',
    release_date: '2016-08-26',
    vote_average: 8.5,
    vote_count: 11_229_704,
    popularity: 67.4,
    poster_path: '/q719jXXEzOoYaps6babgKnONONX.jpg',
    genre_ids: [16, 10749, 18],
    runtime: 106,
    director: 'Makoto Shinkai',
    cast: [
      { name: 'Ryunosuke Kamiki', character: 'Taki Tachibana' },
      { name: 'Mone Kamishiraishi', character: 'Mitsuha Miyamizu' },
    ],
    trailerKey: 'xU47nhruN-Q',
  },
  {
    id: 299534,
    title: 'Avengers: Endgame',
    tagline: 'Avenge the fallen.',
    overview:
      'After a devastating snap erases half of all life, the remaining Avengers attempt one last, improbable plan to undo it.',
    release_date: '2019-04-24',
    vote_average: 8.2,
    vote_count: 25_774_001,
    popularity: 89.3,
    poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    genre_ids: [12, 878, 28],
    runtime: 181,
    director: 'Anthony Russo, Joe Russo',
    cast: [
      { name: 'Robert Downey Jr.', character: 'Tony Stark' },
      { name: 'Chris Evans', character: 'Steve Rogers' },
      { name: 'Scarlett Johansson', character: 'Natasha Romanoff' },
    ],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 245891,
    title: 'John Wick',
    tagline: 'Don’t set him off.',
    overview:
      'A retired hitman is dragged back into the underworld he left behind, and the people who took everything from him discover how far he will go to take it back.',
    release_date: '2014-10-24',
    vote_average: 7.4,
    vote_count: 13_118_443,
    popularity: 78.7,
    poster_path: '/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
    genre_ids: [28, 53],
    runtime: 101,
    director: 'Chad Stahelski',
    cast: [
      { name: 'Keanu Reeves', character: 'John Wick' },
      { name: 'Michael Nyqvist', character: 'Viggo Tarasov' },
      { name: 'Willem Dafoe', character: 'Marcus' },
    ],
    trailerKey: 'C0BMx-qxsP4',
  },
  {
    id: 577922,
    title: 'Tenet',
    tagline: 'Time runs out.',
    overview:
      'A nameless operative is handed a single word and a mission that runs backwards: preventing a war in which entropy itself is the weapon.',
    release_date: '2020-08-26',
    vote_average: 7.2,
    vote_count: 13_002_887,
    popularity: 66.1,
    poster_path: '/k68nPLbIST6NP96JmTxmZijEvCA.jpg',
    genre_ids: [28, 53, 878],
    runtime: 150,
    director: 'Christopher Nolan',
    cast: [
      { name: 'John David Washington', character: 'The Protagonist' },
      { name: 'Robert Pattinson', character: 'Neil' },
      { name: 'Elizabeth Debicki', character: 'Kat' },
    ],
    trailerKey: 'L3pk_TBkihU',
  },
  {
    // Deliberately trailer-less: exercises the "no trailer available" state.
    id: 862,
    title: 'Toy Story',
    tagline: 'The toys are back in town.',
    overview:
      'A cowboy doll’s position as a boy’s favourite toy is threatened by a flashy new space ranger, and a rivalry becomes a rescue mission.',
    release_date: '1995-11-22',
    vote_average: 7.9,
    vote_count: 18_663_002,
    popularity: 73.2,
    poster_path: '/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
    genre_ids: [16, 10751, 35],
    runtime: 81,
    director: 'John Lasseter',
    cast: [
      { name: 'Tom Hanks', character: 'Woody' },
      { name: 'Tim Allen', character: 'Buzz Lightyear' },
      { name: 'Don Rickles', character: 'Mr. Potato Head' },
    ],
    trailerKey: null,
  },
];

/** Look up the display name for a TMDb genre id. */
export function genreName(id) {
  return GENRES.find((genre) => genre.id === id)?.name || 'Unknown';
}
