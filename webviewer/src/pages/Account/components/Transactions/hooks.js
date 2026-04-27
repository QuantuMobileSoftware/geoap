import { useEffect, useState } from 'react';
import { API } from 'api';
import { areasEvents } from '_events';
import { DEFAULT_ERROR } from '_constants';

export const PAGE_SIZE = 20;

export const useTransactionData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState(null);
  const [data, setData] = useState({});

  useEffect(() => {
    setIsLoading(true);

    const params = { page };
    if (filter) {
      params.month = filter.month;
      params.year = filter.year;
    }

    Promise.all([
      API.transactions.getTransactions(params),
      API.areas.getAllRequests(),
      API.areas.getAllResults(),
      API.areas.getAreas()
    ])
      .then(([transactions, requests, results, areas]) => {
        const reduceCb = (acc, current) => ({ ...acc, [current.id]: current });
        const requestsObject = requests.data.reduce(reduceCb, {});
        const areasObject = areas.data.reduce(reduceCb, {});

        setTotalCount(transactions.data.count);
        setData({
          transactions: transactions.data.results,
          requests: requestsObject,
          results: results.data,
          areas: areasObject
        });
      })
      .catch(() => areasEvents.toggleErrorModal(DEFAULT_ERROR))
      .finally(() => setIsLoading(false));
  }, [page, filter]);

  const applyFilter = date => {
    const d = date || new Date();
    setFilter({ month: d.getMonth() + 1, year: d.getFullYear() });
    setPage(1);
  };

  const clearFilter = () => {
    setFilter(null);
    setPage(1);
  };

  return {
    isLoading,
    ...data,
    page,
    setPage,
    totalCount,
    filter,
    applyFilter,
    clearFilter
  };
};
