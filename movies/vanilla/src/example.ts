import 'dotenv/config';
import { v7 } from 'css-authn';
import { fetchList } from './main.js';

let authenticatedFetch: Awaited<ReturnType<typeof v7.getAuthenticatedFetch>>;

try {
    authenticatedFetch = await v7.getAuthenticatedFetch({
        email: process.env.SOLID_EMAIL,
        password: process.env.SOLID_PASSWORD,
        provider: process.env.SOLID_SERVER,
    });
} catch(e) {
    console.log('Could not connect to your pod');
}
const listUrl = 'https://michielbdejong.solidcommunity.net/movies/';
const interpretation = await fetchList(listUrl, authenticatedFetch);
interpretation.listings.forEach(listing => console.log(listing));
interpretation.watchActions.forEach(watchAction => console.log(watchAction));
