import { configureStore } from "@reduxjs/toolkit";
import useReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    use: useReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
