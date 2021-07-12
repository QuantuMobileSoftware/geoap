import { configureStore } from '@reduxjs/toolkit';

import { areasReducer } from './areas';
import { userReducer } from './user';
import { mapReducer } from './map';

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    user: userReducer,
    map: mapReducer
  }
});
