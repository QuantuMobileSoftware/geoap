import { areasRequests } from './areas';
import { authRequests } from './auth';
import { usersRequests } from './users';
import { transactionsRequests } from './Transactions';
import { fileRequests } from './files';

export const API = {
  areas: areasRequests,
  auth: authRequests,
  users: usersRequests,
  transactions: transactionsRequests,
  files: fileRequests
};
