import { createListenerMiddleware } from "@reduxjs/toolkit";
// import { userLoggedIn, userLoggedOut } from "../features/auth/authSlice";
// import { removeUserFromLS, saveUserInLS } from "../utils/userLocalStorage";

export const listenerMiddleware = createListenerMiddleware();
/*
  These middleware are only for Backend specific architecture.
  Since aws-amplify will store the details in its own way.
*/

// listenerMiddleware.startListening({
//   actionCreator: userLoggedIn,
//   effect: (action, listenerApi) => {
//     console.log("LOCAL -> Storage");
//     saveUserInLS(action.payload);
//   },
// });

// listenerMiddleware.startListening({
//   actionCreator: userLoggedOut,
//   effect: (action, listenerApi) => {
//     console.log("LOCAL -> Storage");
//     removeUserFromLS();
//   },
// });
