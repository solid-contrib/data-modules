import 'dotenv/config';
import { v7 } from 'css-authn';
import { fetchList } from './main.js';

const authenticatedFetch = await v7.getAuthenticatedFetch({
  email: process.env.SOLID_EMAIL,
  password: process.env.SOLID_PASSWORD,
  provider: process.env.SOLID_SERVER,
});
const listUrl = 'https://michielbdejong.solidcommunity.net/movies/';
await fetchList(listUrl, authenticatedFetch);
