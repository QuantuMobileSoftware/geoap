const root = '/aoi';
const byId = id => `${root}/${id}`;
const requests = id => `${byId(id)}/requests`;
const results = id => `${byId(id)}/results`;
const result = id => `results/${id}`;
const allResults = '/results';
const field = id => `results/${id}/field`;
const stone = id => `results/${id}/stone/`;
const request = '/request';
const layers = '/notebook';
const stoneLayer = '/google_bucket_folder';

export const areasEndpoints = {
  root,
  byId,
  requests,
  results,
  result,
  allResults,
  layers,
  request,
  field,
  stone,
  stoneLayer
};
