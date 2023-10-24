const root = '/aoi';
const byId = id => `${root}/${id}`;
const requests = id => `${byId(id)}/requests`;
const results = id => `${byId(id)}/results`;
const result = id => `results/${id}`;
const allResults = '/results';
const field = id => `results/${id}/field`;
const request = '/request';
const layers = '/notebook';

export const areasEndpoints = {
  root,
  byId,
  requests,
  results,
  result,
  allResults,
  layers,
  request,
  field
};
