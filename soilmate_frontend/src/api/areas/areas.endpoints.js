const root = '/aoi';
const byId = id => `${root}/${id}`;
const requests = id => `${byId(id)}/requests`;
const results = id => `${byId(id)}/results`;

export const areasEndpoints = { root, byId, requests, results };
