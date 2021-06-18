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

export const getIndexById = (id, array) => {
  const currentElement = array.find(el => el.id === id);
  return array.indexOf(currentElement);
};
