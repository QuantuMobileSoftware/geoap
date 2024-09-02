import { useEffect, useState } from 'react';
import { API } from 'api';
import { areasEvents } from '_events';
import { DEFAULT_ERROR } from '_constants';
import { getSquareKilometers, parseWKTToLatLngs } from 'utils';
import L from 'leaflet';

export const useTransactionData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      API.transactions.getTransactions(),
      API.areas.getAllRequests(),
      API.areas.getAllResults(),
      API.areas.getAreas()
    ])
      .then(([transactions, requests, results, areas]) => {
        const reduceCb = (acc, current) => ({ ...acc, [current.id]: current });

        const areasWithSizes = areas.data.map(area => {
          const coordinates = parseWKTToLatLngs(area.polygon);
          const size = L.GeometryUtil.geodesicArea(coordinates);
          const sizeToKm = getSquareKilometers(size);
          return { ...area, size: sizeToKm };
        });
        const requestsObject = requests.data.reduce(reduceCb, {});
        const areasObject = areasWithSizes.reduce(reduceCb, {});

        setData({
          transactions: transactions.data,
          requests: requestsObject,
          results: results.data,
          areas: areasObject
        });
      })
      .catch(() => areasEvents.toggleErrorModal(DEFAULT_ERROR))
      .finally(() => setIsLoading(false));
  }, []);

  data.isLoading = isLoading;
  return data;
};
