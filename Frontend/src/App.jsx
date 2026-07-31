import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Challenges from "./pages/Challenges";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/challenges"
          element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
