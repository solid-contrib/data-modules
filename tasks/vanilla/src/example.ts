import 'dotenv/config';
import { v7 } from 'css-authn';
import { fetchContainerAndTracker } from 'solid-data-module-tasks';

const authenticatedFetch = await v7.getAuthenticatedFetch({
  email: process.env.SOLID_EMAIL,
  password: process.env.SOLID_PASSWORD,
  provider: process.env.SOLID_SERVER,
});
const containerUrl = 'https://michielbdejong.solidcommunity.net/tasks/';
const output = await fetchContainerAndTracker(containerUrl, authenticatedFetch);
console.log(output);
