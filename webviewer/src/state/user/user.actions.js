import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { API } from 'api';

import { userActions } from './user.slice';
import { useAsync } from 'hooks';

export const useUserActions = () => {
  const dispatch = useDispatch();
  const { isLoading, error, handleAsync } = useAsync();

  const toggleLogoutModal = () => {
    dispatch(userActions.toggleLogoutModal());
  };

  const login = useCallback(
    async body => {
      await handleAsync(async () => {
        await API.auth.login(body);
        dispatch(userActions.login());
      });
    },
    [dispatch, handleAsync]
  );

  const updateUser = useCallback(
    async data => {
      await handleAsync(async () => {
        await API.users.updateUser(data);
        dispatch(userActions.setEntity(data));
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

  const stopAutoLogin = useCallback(
    isAutoLogged => {
      dispatch(userActions.logout(isAutoLogged));
    },
    [dispatch]
  );

  const getCurrentUser = useCallback(async () => {
    try {
      await handleAsync(async () => {
        const user = (await API.users.getCurrentUser()).data;
        const isDemo = user.username === process.env.REACT_APP_AUTOLOGIN;
        dispatch(userActions.login());
        dispatch(userActions.setEntity({ ...user, isDemo }));
      });
    } catch (error) {
      logout(false);
    }
  }, [dispatch, handleAsync, logout]);

  const registerUser = useCallback(
    async data => {
      return await handleAsync(async () => await API.users.registerUser(data));
    },
    [handleAsync]
  );

  const confirmRegistration = useCallback(
    async key => {
      return await handleAsync(async () => await API.users.confirmRegistration(key));
    },
    [handleAsync]
  );

  const changePassword = useCallback(
    async data => {
      return await handleAsync(async () => await API.users.changePassword(data));
    },
    [handleAsync]
  );

  const forgotPassword = useCallback(
    async email => {
      return await handleAsync(async () => await API.users.forgotPassword(email));
    },
    [handleAsync]
  );

  const confirmPassword = useCallback(
    async data => {
      return await handleAsync(async () => await API.users.confirmPassword(data));
    },
    [handleAsync]
  );

  return {
    isLoading,
    error,
    login,
    logout,
    stopAutoLogin,
    toggleLogoutModal,
    getCurrentUser,
    updateUser,
    registerUser,
    confirmRegistration,
    changePassword,
    forgotPassword,
    confirmPassword
  };
};
