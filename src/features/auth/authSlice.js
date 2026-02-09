import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle", // "idle" | "pending" | "succeeded" | "failed"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userEmailAdded: (state, action) => {
      // This runs for email verification step.
      state.user = {
        ...state.user,
        email: action.payload,
      };
      state.status = "pending";
    },
    userPasswordTempAdded: (state, action) => {
      // This runs for email verification step.
      state.user = {
        ...state.user,
        password: action.payload,
      };
      state.status = "pending";
    },
    userLoggedIn: (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
    },
    userLoggedOut: (state) => {
      state.user = null;
      state.status = "idle";
    },
    userSignUp: (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
    },
    profileUpdated: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    // userSignUpStep1: (state, action) => {
    //   state.user = action.payload;
    //   state.status = "pending";
    // },
    // userSignUpStep2: (state) => {
    //   state.status = "succeeded";
    // },
  },
});

export const {
  userEmailAdded,
  userPasswordTempAdded,
  userLoggedIn,
  userSignUp,
  // userSignUpStep1,
  // userSignUpStep2,
  userLoggedOut,
  profileUpdated,
} = authSlice.actions; // actions creator
const authReducer = authSlice.reducer;
export default authReducer;
