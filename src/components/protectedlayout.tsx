import Navbar from "./navbar";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedLayout = () => {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default ProtectedLayout;
