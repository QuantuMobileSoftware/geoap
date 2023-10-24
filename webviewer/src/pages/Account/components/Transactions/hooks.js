import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAreasList } from 'state';
import { API } from 'api';
import { areasEvents } from '_events';
import { DEFAULT_ERROR } from '_constants';

export const useTransactionData = () => {
  const areas = useSelector(selectAreasList);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    setIsLoading(true);

    Promise.all([
      API.transactions.getTransactions(),
      API.areas.getAllRequests(),
      API.areas.getAllResults(),
      ...(areas.length ? [Promise.resolve({ data: areas })] : [API.areas.getAreas()])
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
  }, [areas]);

  data.isLoading = isLoading;
  return data;
};
