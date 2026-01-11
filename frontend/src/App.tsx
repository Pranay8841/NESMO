import { type JSX } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Membership from "./pages/Membership";
import OAuthSuccess from "./pages/OAuthSuccess";
import OAuthError from "./pages/OAuthError";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/membership" element={<Membership />} />
        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/oauth-error" element={<OAuthError />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
