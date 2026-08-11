import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  loggedUser: string | null;
}

const initialState: AuthState = {
  loggedUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedUser: (state, action: PayloadAction<string>) => {
      state.loggedUser = action.payload;
    },
    setLoggedOut: (state) => {
      state.loggedUser = null;
    },
  },
});

export const { setLoggedUser, setLoggedOut } = authSlice.actions;
export default authSlice.reducer;
