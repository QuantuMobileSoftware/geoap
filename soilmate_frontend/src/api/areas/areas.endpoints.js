const root = '/aoi';
const byId = id => `${root}/${id}`;
const requests = id => `${byId(id)}/requests`;
const results = id => `${byId(id)}/results`;
const result = id => `results/${id}`;
const request = '/request';
const layers = '/notebook';

export const areasEndpoints = { root, byId, requests, results, result, layers, request };
