import { axiosInstance } from 'api/instance';
import { transactionsEndpoints } from './Transactions.endpoints';

const getTransactions = params =>
  axiosInstance.get(transactionsEndpoints.root, { params });

export const transactionsRequests = { getTransactions };
