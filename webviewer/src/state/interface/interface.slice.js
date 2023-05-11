import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_WELCOME_KEY } from '_constants';

const welcomeState = localStorage.getItem(STORAGE_WELCOME_KEY);

const interfaceSlice = createSlice({
  name: 'interface',
  initialState: {
    openContactUs: false,
    showWelcome: !welcomeState
  },
  reducers: {
    setOpenContactUs: (state, action) => {
      state.openContactUs = action.payload;
    },
    hideWelcome: state => {
      state.showWelcome = false;
    }
  }
});

export const contactUsState = state => state.interface.openContactUs;
export const welcomeWindowState = state => state.interface.showWelcome;

export const { reducer: interfaceReducer, actions: interfaceActions } = interfaceSlice;
