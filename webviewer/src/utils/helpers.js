import Wkt from 'wicket';
import { isArray, isEmpty, isFunction, mergeWith, round } from 'lodash-es';
import defaultLogoSvg from 'assets/images/logo.svg';
import agrieosLogoPng from 'assets/images/agrieos-logo.png';
import soilmateLogoSvg from 'assets/images/soilmate-logo.svg';

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
  const result = wkt.toJson();
  result.coordinates[0] = result.coordinates[0].map(point => [point[1], point[0]]);
  return result;
};

export const getShapePositionsString = layer => {
  try {
    const wkt = new Wkt.Wkt();
    let json = layer.toGeoJSON?.();
    json = json ?? layer;
    const geometry = json.geometry ? json.geometry : json.features[0].geometry;

    return wkt.fromObject(geometry).write();
  } catch (err) {
    console.error('Parse error', err);
  }
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

export const getTransactionDate = date => {
  const formatConfig = { month: 'long', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', formatConfig).format(new Date(date));
};

export const getSquareKilometers = meters => {
  const quantityMetersInKm = 1000000;
  const kilometers = meters / quantityMetersInKm;
  const roundPrecision = kilometers < 1 ? 2 : 0;
  return round(kilometers, roundPrecision);
};

const DOMAIN_DICT = {
  'agrieos.in': {
    name: 'Agrieos',
    logo: agrieosLogoPng
  },
  'portal.soilmate.ai': {
    name: 'SoilMate',
    logo: soilmateLogoSvg
  },
  default: {
    name: 'GeoAP',
    logo: defaultLogoSvg
  }
};

export const getDomainData = () => {
  const hostName = window.location.hostname;
  return DOMAIN_DICT[hostName] ?? DOMAIN_DICT.default;
};

export const isStringsMatch = ({ mainString, substring }) => {
  const escapedQuery = substring.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
  return mainString.match(new RegExp(escapedQuery, 'gi'));
};
