import { configureStore } from '@reduxjs/toolkit';

import { areasReducer } from './areas';
import { userReducer } from './user';
import { mapReducer } from './map';
import { interfaceReducer } from './interface';

export const store = configureStore({
  reducer: {
    areas: areasReducer,
    user: userReducer,
    map: mapReducer,
    interface: interfaceReducer
  }
});
