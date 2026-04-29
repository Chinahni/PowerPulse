import { Navigate, Routes, Route } from "react-router-dom";
import SignUp from "./pages/signup";
import Login from "./pages/login";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import AreaFeed from "./pages/areafeed";
import AreaDetail from "./pages/areadetail";
import Insights from "./pages/insights";
import FollowingPage from "./pages/following";
import NotfoundPage from "./pages/notfoundPage";
import ProtectedLayout from "./components/protectedlayout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* PUBLIC ROUTES */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />

      {/* PROTECTED APP */}
      <Route element={<ProtectedLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/areafeed" element={<AreaFeed />} />
        <Route path="/areas/:id" element={<AreaDetail />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/following" element={<FollowingPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotfoundPage />} />
    </Routes>
  );
};

export default App;
