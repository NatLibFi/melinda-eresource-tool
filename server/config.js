import {Utils} from '@natlibfi/melinda-commons';

const {readEnvironmentVariable} = Utils;

export const port = readEnvironmentVariable('HTTP_PORT', {defaultValue: 3001});
export const restApiUrl = readEnvironmentVariable('REST_API_URL');
export const sruUrl = readEnvironmentVariable('SRU_URL');