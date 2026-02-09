import { Outlet } from "react-router";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn, userLoggedOut } from "../features/auth/authSlice";
import { Hub } from "aws-amplify/utils";
import AuthLoader from "../components/AuthLoader";
import { authService } from "../roundtable";

const Layout = () => {
  const dispatch = useDispatch();
  const [userChecked, setUserChecked] = useState();

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedOut": // console.log("user has been signed out successfully.");
        case "tokenRefresh_failure": // console.log("failure while refreshing auth tokens.");
          dispatch(userLoggedOut());
          break;

        default:
          break;
      }
    });

    return () => {
      unsubscribe(); // stop listening on unmount
    };
  }, [dispatch]);

  useEffect(() => {
    // Checking if the user is already logged in (after reopening the browser or refreshing the screen).
    (async () => {
      try {
        const userData = await authService._getUser();
        dispatch(userLoggedIn(userData));
      } catch (error) {
        // user not logged-in
        // authService.userLogout(); // this empty out the async storage if filled with previous data. BUT implement logic to run it only if user is connected to internet and user login actually fails.
      } finally {
        setUserChecked(true);
      }
    })();
  }, [dispatch]);

  if (!userChecked) {
    return (
      <div className="grid h-screen place-items-center bg-bg">
        <AuthLoader size={88} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-bg text-t-primary">
      <Header />
      {/* Below margin-top values are related to navbar height */}
      <main className="flex flex-1 flex-row mt-[57px] sm:mt-[65px]">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
