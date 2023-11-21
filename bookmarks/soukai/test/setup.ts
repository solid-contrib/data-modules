import { installJestPlugin } from '@noeldemartin/solid-utils';
import { bootSolidModels } from 'soukai-solid';

installJestPlugin();
beforeEach(() => jest.clearAllMocks());
beforeEach(() => bootSolidModels());

process.on('unhandledRejection', (err) => fail(err));
