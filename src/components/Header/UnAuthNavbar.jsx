import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate, useLocation } from "react-router";
import Button from "../Button/Button";

export default function UnauthNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {location.pathname === "/login" ? (
        <Button
          onClick={() => navigate("/signup", { replace: true })} // This prevents unwanted loop from login to signup page and vice-versa.
          className="text-sm sm:text-base"
          isBold
        >
          Sign Up
          <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5 my-auto" />
        </Button>
      ) : (
        location.pathname !== "/reset-password" &&
        location.pathname !== "/verify-email" && (
          <Button
            onClick={() => {
              if (location.pathname == "/") {
                navigate("/login"); // This is important if navigating from homepage.
              } else {
                navigate("/login", { replace: true }); // This prevents unwanted loop from signup to login page and vice-versa.
              }
            }}
            className="text-sm sm:text-base"
            isBold
          >
            Log In
            <ArrowRightIcon className="ml-2 w-4 h-4 sm:w-5 sm:h-5 my-auto" />
          </Button>
        )
      )}
    </>
  );
}
