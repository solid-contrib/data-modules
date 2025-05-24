# Solid Data Module for Movies

Data schemas supported:
* Media Kraken as-is in May 2025
* Media Kraken with [correctly typed links](https://github.com/NoelDeMartin/media-kraken/issues/41)

### Usage
Set up a typescript project, install [solid-data-module-tasks](https://www.npmjs.com/package/solid-data-module-tasks) from NPM, and create a `.env` file like this:
```env
SOLID_SERVER=https://solidcommunity.net
SOLID_EMAIL=michielbdejong@users.css.pod
SOLID_PASSWORD=...
```

Edit line 19 of `src/example.ts` to point to your movies folder on your pod.
```sh
pnpm install
pnpm build
pnpm start
```

The output will look something like this:
```javascript
{
  created: 2020-07-17T16:40:29.000Z,
  modified: 2020-08-06T14:09:18.000Z,
  movie: {
    published: 2019-05-30T00:00:00.000Z,
    description: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    image: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    name: 'Parasite',
    sameAs: [
      'https://www.imdb.com/title/tt6751668',
      'https://www.themoviedb.org/movie/496243'
    ]
  }
}
{
  created: 2022-05-17T14:50:44.000Z,
  startTime: 2022-05-17T14:50:44.000Z,
  endTime: 2022-05-17T14:50:44.000Z,
  listingId: 'https://michielbdejong.solidcommunity.net/movies/the-green-mile-1999#it'
}
```