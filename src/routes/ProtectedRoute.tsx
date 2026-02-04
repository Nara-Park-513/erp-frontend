import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isValidToken =
    !!token && token !== "null" && token !== "undefined" && token.trim() !== "";

  useEffect(() => {
    if (!isValidToken) {
      alert("로그인이 필요합니다.");
    }
  }, [isValidToken]);

  if (!isValidToken) {
    // 로그인 후 원래 가려던 곳으로 돌아오게 state로 경로 전달도 가능
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
