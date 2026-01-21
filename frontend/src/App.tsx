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
// V1 Release: Commenting out pages not part of first release
// import Events from "./pages/Events";
// import Contact from "./pages/Contact";
// import Membership from "./pages/Membership";
import OAuthSuccess from "./pages/OAuthSuccess";
import OAuthError from "./pages/OAuthError";
import EmailVerification from "./pages/EmailVerification";
import Dashboard from "./components/Dashboard/Dashboard";
import Profile from "./components/Dashboard/Profile";
import Directory from "./pages/Directory";

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
          <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
          {/* V1 Release: Commenting out routes not part of first release */}
          {/* <Route path="/events" element={<Events />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          {/* <Route path="/membership" element={<Membership />} /> */}
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/oauth-error" element={<OAuthError />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
