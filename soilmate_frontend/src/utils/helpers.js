import Wkt from 'wicket';
import { isArray, isEmpty, isFunction, mergeWith } from 'lodash-es';

export const withFunction = (value, args) => {
  return isFunction(value) ? value(args) : value;
};

export const mergeObjects = (initialObject, source, customizer) => {
  let _source = source;

  if (isArray(source)) {
    _source = source.reduce((initialObject, source) => {
      return !source ? initialObject : mergeObjects(initialObject, source);
    }, {});
  }

  if (isFunction(source)) _source = source(initialObject);

  const defaultCustomizer = (value, sourceValue) => {
    if (isArray(value) && !isEmpty(sourceValue)) return sourceValue;
    if (isFunction(value) && sourceValue) return sourceValue;
  };

  return mergeWith({}, initialObject, _source, customizer || defaultCustomizer);
};

export const withMergeObjects = (initialObject, customizer) => [
  () => initialObject,
  (object, params = {}) => {
    const { hard = false } = params;
    return (initialObject = hard
      ? object
      : mergeObjects(initialObject, object, customizer));
  }
];

export const getPolygonPositions = item => {
  if (!item) return;
  const wkt = new Wkt.Wkt();
  const delimeterIndex = item.polygon.indexOf(';');
  const string = item.polygon.slice(delimeterIndex + 1);
  wkt.read(string);

  return wkt.toJson();
};

export const getShapePositionsString = layer => {
  const wkt = new Wkt.Wkt();
  const { geometry } = layer.toGeoJSON();
  geometry.coordinates = geometry.coordinates.map(item =>
    item.map(point => [point[1], point[0]])
  );
  return wkt.fromObject(geometry).write();
};

export const getCentroid = arr => {
  const pts = arr;

  let twicearea = 0;
  let p1, p2, f;
  let x = 0,
    y = 0;
  let nPts = pts.length;

  for (let i = 0, j = nPts - 1; i < nPts; j = i++) {
    p1 = pts[i];
    p2 = pts[j];

    twicearea += p1[0] * p2[1];
    twicearea -= p1[1] * p2[0];

    f = p1[0] * p2[1] - p2[0] * p1[1];

    x += (p1[0] + p2[0]) * f;
    y += (p1[1] + p2[1]) * f;
  }
  f = twicearea * 3;
  return { lat: x / f, lng: y / f };
};

export const getElementBottom = el => {
  if (el) return el.current?.offsetTop + el.current?.offsetHeight + el.current?.scrollTop;
};
