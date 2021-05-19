import { configureStore } from '@reduxjs/toolkit';

import { areasReducer } from './areas';
import { userReducer } from './user';

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    user: userReducer
  }
});
