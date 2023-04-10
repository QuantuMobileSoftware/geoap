import { createSlice } from '@reduxjs/toolkit';

const interfaceSlice = createSlice({
  name: 'interface',
  initialState: {
    openContactUs: false
  },
  reducers: {
    setOpenContactUs: (state, action) => {
      state.openContactUs = action.payload;
    }
  }
});

export const contactUsState = state => state.interface.openContactUs;

export const { reducer: interfaceReducer, actions: interfaceActions } = interfaceSlice;
