import { createSelector, createSlice } from '@reduxjs/toolkit';

import { COOKIE_CSRF_TOKEN_VALUE } from '_constants';

import { mergeObjects } from 'utils';

const USER_DEFAULT_STATE = {
  pk: null,
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  isAuthorized: false
};

const USER_INITIAL_STATE = mergeObjects(USER_DEFAULT_STATE, {
  isAuthorized: !!COOKIE_CSRF_TOKEN_VALUE
});

const userSlice = createSlice({
  name: 'user',
  initialState: USER_INITIAL_STATE,
  reducers: {
    login: state => {
      state.isAuthorized = true;
    },

    logout: () => USER_DEFAULT_STATE,

    setEntity: (state, action) => mergeObjects(state, action.payload)
  }
});

export const { reducer: userReducer, actions: userActions } = userSlice;

export const selectUser = state => state.user;

export const selectIsAuthorized = createSelector(
  selectUser,
  ({ isAuthorized }) => isAuthorized
);
