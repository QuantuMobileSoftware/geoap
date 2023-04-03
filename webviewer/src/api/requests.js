import { areasRequests } from './areas';
import { authRequests } from './auth';
import { usersRequests } from './users';
import { transactionsRequests } from './Transactions';

export const API = {
  areas: areasRequests,
  auth: authRequests,
  users: usersRequests,
  transactions: transactionsRequests
};
