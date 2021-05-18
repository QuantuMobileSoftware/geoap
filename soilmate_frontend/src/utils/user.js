import { pick } from 'lodash';

export const getUserName = user => {
  const name = Object.values(pick(user, ['first_name', 'last_name'])).reduce(
    (name, part) => {
      return (part ? `${name} ${part}` : name).trim();
    }
  );

  return name || user.username;
};
