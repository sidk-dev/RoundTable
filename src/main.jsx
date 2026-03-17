import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import store from "./store/store.js";
import Layout from "./layouts/Layout.jsx";
import ProtectedRoute from "./components/Routes/ProtectedRoute.jsx";
import PublicRoute from "./components/Routes/PublicRoute.jsx";

import FeedPage from "./pages/Feed.jsx";
import Login from "./pages/UnAuth/Login.jsx";
import Signup from "./pages/UnAuth/Signup.jsx";
import ForgotPassword from "./pages/UnAuth/ForgotPassword.jsx";
import ResetPassword from "./pages/UnAuth/ResetPassword.jsx";

import CommunityPage from "./pages/Community/Community.jsx";
import EditCommunityPage from "./pages/Community/EditCommunity.jsx";
import CreateCommunityPage from "./pages/Community/CreateCommunity.jsx";
import CommunitiesPage from "./pages/Community/Communities.jsx";
import PostsPage from "./pages/Post/Posts.jsx";
import CreatePostPage from "./pages/Post/CreatePost.jsx";
import PostPage from "./pages/Post/Post.jsx";
import EditPostPage from "./pages/Post/EditPost.jsx";
import ProfilePage from "./pages/Profile/Profile.jsx";
import EditProfilePage from "./pages/Profile/EditProfile.jsx";
import MyRequestsPage from "./pages/MyRequests.jsx";
import ProfileCommunitiesPage from "./pages/Profile/ProfileCommunities.jsx";
import VerifyEmailPage from "./pages/UnAuth/VerifyEmail.jsx";
import ChangePasswordPage from "./pages/Profile/ChangePassword.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />,
      },
      // Public routes
      {
        element: <PublicRoute />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "signup",
            element: <Signup />,
          },
          {
            path: "verify-email",
            element: <VerifyEmailPage />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ],
      },
      // Protected route
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "feed",
            element: <FeedPage />,
          },
          {
            path: "requests",
            element: <MyRequestsPage />,
          },
          {
            path: "change-password",
            element: <ChangePasswordPage />,
          },

          {
            path: "communities",
            children: [
              {
                index: true,
                element: <CommunitiesPage />,
              },
              {
                path: "create",
                element: <CreateCommunityPage />,
              },
              {
                path: ":id",
                element: <CommunityPage />,
              },
              {
                path: ":id/edit",
                element: <EditCommunityPage />,
              },
            ],
          },
          {
            path: "posts",
            children: [
              {
                index: true,
                element: <PostsPage />,
              },
              {
                path: "create", // "create/?communityName=:name&communityId=:id",
                element: <CreatePostPage />,
              },
              {
                path: ":id",
                element: <PostPage />,
              },
              {
                path: ":id/edit",
                element: <EditPostPage />,
              },
            ],
          },
          {
            path: "profile",
            children: [
              {
                index: true,
                element: <ProfilePage />,
              },
              {
                path: "edit",
                element: <EditProfilePage />,
              },
              {
                path: "communities",
                element: <ProfileCommunitiesPage />,
              },
            ],
          },
          {
            path: "profile/:id",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
