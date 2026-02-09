import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

function PublicRoute() {
  const auth = useSelector((state) => state.auth);

  if (auth.status === "succeeded") {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
