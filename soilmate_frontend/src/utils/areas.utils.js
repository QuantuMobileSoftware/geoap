import { withMergeObjects } from './helpers';

export const createArea = (area = {}) => {
  return { ...area, requests: {}, results: {} };
};

export const normalizeArea = (area = {}) => {
  const [getArea, setArea] = withMergeObjects(createArea(area));

  setArea(
    ['requests', 'results'].reduce((fields, key) => {
      return {
        ...fields,
        [key]: area[key].reduce((entities, entity) => {
          return { ...entities, [entity.id]: entity };
        }, {})
      };
    }, {})
  );

  return getArea();
};

export const normalizeAreas = (areas = []) => {
  return areas.reduce((areas, area) => {
    return { ...areas, [area.id]: normalizeArea(area) };
  }, {});
};
