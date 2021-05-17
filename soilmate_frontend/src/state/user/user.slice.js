import { createSlice } from '@reduxjs/toolkit';

const USER_DEFAULT_STATE = {
  pk: null,
  username: '',
  email: '',
  first_name: '',
  last_name: ''
};

export const USER_INITIAL_STATE = USER_DEFAULT_STATE;

const userSlice = createSlice({
  name: 'user',
  initialState: USER_INITIAL_STATE,
  reducers: {
    signIn: () => {},
    signOut: () => {}
  }
});

export const { reducer: userReducer, actions: userActions } = userSlice;

export const selectUser = state => state.user;
