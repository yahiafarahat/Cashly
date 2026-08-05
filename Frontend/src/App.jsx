import "./App.css";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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
import BudgetGroups from "./pages/BudgetGroups";
import AssistantWidget from "./components/AssistantWidget";
import Welcome from "./pages/Welcome";

const ASSISTANT_HIDDEN_PATHS = ["/", "/login", "/signup"];

function AppShell() {
  const location = useLocation();
  const showAssistant = !ASSISTANT_HIDDEN_PATHS.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
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
          element={<Dashboard />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/challenges"
          element={<Challenges />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route path="/groups" element={<BudgetGroups />} />
      </Routes>

      {showAssistant && <AssistantWidget />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
