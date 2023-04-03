import { axiosInstance } from 'api/instance';
import { transactionsEndpoints } from './Transactions.endpoints';

const getTransactions = () => axiosInstance.get(transactionsEndpoints.root);

export const transactionsRequests = { getTransactions };
