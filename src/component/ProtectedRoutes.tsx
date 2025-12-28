// component/ProtectedRoutes.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { ReactElement } from "react";
import type { RootState } from "../redux/store/store";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const isAuth = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
