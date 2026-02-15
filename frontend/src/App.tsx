import { type JSX, useEffect } from "react";
import { useAppDispatch } from "./redux/hooks";
import { fetchCurrentUser } from "./services/authService";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import OAuthSuccess from "./pages/OAuthSuccess";
import OAuthError from "./pages/OAuthError";
import EmailVerification from "./pages/EmailVerification";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Dashboard/Profile";
import Directory from "./pages/Directory";
import UserModeration from "./components/Admin/UserModeration";
import EventRequests from "./components/Admin/EventRequests";
import AdminRoute from "./components/AdminRoute";
import MyEvents from "./components/Events/MyEvents";
import MyEventRequests from "./components/Events/MyEventRequests";

function App(): JSX.Element {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          {/* Events Routes */}
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/my-event-requests" element={<ProtectedRoute><MyEventRequests /></ProtectedRoute>} />
          {/* Admin Routes - Protected for Admin only */}
          <Route path="/admin/users" element={<AdminRoute><UserModeration /></AdminRoute>} />
          <Route path="/admin/events" element={<AdminRoute><EventRequests /></AdminRoute>} />
        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/oauth-error" element={<OAuthError />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
