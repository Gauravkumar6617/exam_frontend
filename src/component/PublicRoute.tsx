import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactElement } from "react";
import type { RootState } from "../redux/store/store";

const PublicRoute = ({ children }: { children: ReactElement }) => {
  const isAuth = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
