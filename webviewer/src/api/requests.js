import { areasRequests } from './areas';
import { authRequests } from './auth';
import { usersRequests } from './users';
import { transactionsRequests } from './Transactions';
import { fileRequests } from './files';
import { uploadRequests } from './upload';

export const API = {
  areas: areasRequests,
  auth: authRequests,
  users: usersRequests,
  transactions: transactionsRequests,
  files: fileRequests,
  upload: uploadRequests
};
