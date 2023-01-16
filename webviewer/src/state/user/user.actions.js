import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from 'api';

import { userActions } from './user.slice';
import { useAsync } from 'hooks';

export const useUserActions = () => {
  const dispatch = useDispatch();
  const { isLoading, error, handleAsync } = useAsync();

  const login = useCallback(
    async body => {
      await handleAsync(async () => {
        await API.auth.login(body);
        dispatch(userActions.login());
      });
    },
    [dispatch, handleAsync]
  );

  const setApiKey = useCallback(
    async data => {
      await handleAsync(async () => {
        await API.users.setApiKey(data);
        dispatch(userActions.setApiKey(data.planet_api_key));
      });
    },
    [dispatch, handleAsync]
  );

  const logout = useCallback(
    isAutoLogged => {
      handleAsync(async () => {
        await API.auth.logout();
        dispatch(userActions.logout(isAutoLogged));
      });
    },
    [dispatch, handleAsync]
  );

  const getCurrentUser = useCallback(async () => {
    try {
      await handleAsync(async () => {
        const user = (await API.users.getCurrentUser()).data;
        dispatch(userActions.setEntity(user));
      });
    } catch (error) {
      logout(false);
    }
  }, [dispatch, handleAsync, logout]);

  return { isLoading, error, login, logout, getCurrentUser, setApiKey };
};
