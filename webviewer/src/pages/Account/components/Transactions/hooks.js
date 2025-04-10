import { useEffect, useState } from 'react';
import { API } from 'api';
import { areasEvents } from '_events';
import { DEFAULT_ERROR } from '_constants';

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
        const requestsObject = requests.data.reduce(reduceCb, {});
        const areasObject = areas.data.reduce(reduceCb, {});

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
