import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "../models/user.model";

interface IUserState {
  userData: IUser | null;
}

const initialState: IUserState = {
  userData: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

export const { setUserData } = userSlice.actions;

export default userSlice.reducer;
