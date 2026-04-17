import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminPage from "./AdminPage";

/**
 * App
 * ───
 * Single-page orchestrator for the SaaralCareAI admin portal.
 *
 * View flow:
 *   "login"     → AdminLogin
 *   "dashboard" → AdminDashboard
 *   "adminPage" → AdminPage  (Simulate Rain)
 *
 * Auth state is persisted in sessionStorage so a page refresh keeps
 * the user on the dashboard instead of bouncing them back to login.
 */
export default function App() {
  const [view, setView] = useState(() => {
    // Restore session on refresh
    return sessionStorage.getItem("admin_authed") === "true"
      ? "dashboard"
      : "login";
  });

  // Keep view in sync if sessionStorage is cleared externally
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === "admin_authed" && !e.newValue) {
        setView("login");
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Handlers passed as props ──────────────────────────────────────

  /** Called by AdminLogin after successful auth */
  function handleLoginSuccess() {
    setView("dashboard");
  }

  /** Called by AdminDashboard → "Simulate Rain" button */
  function handleNavigateToAdminPage() {
    setView("adminPage");
  }

  /** Called by AdminDashboard → "Sign Out" button */
  function handleLogout() {
    setView("login");
  }

  /** Called by AdminPage → back arrow */
  function handleNavigateToDashboard() {
    setView("dashboard");
  }

  /** Called by AdminPage → "Sign out" */
  function handleAdminPageSignOut() {
    setView("login");
  }

  // ── Render ────────────────────────────────────────────────────────

  if (view === "login") {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (view === "dashboard") {
    return (
      <AdminDashboard
        onNavigateToAdminPage={handleNavigateToAdminPage}
        onLogout={handleLogout}
      />
    );
  }

  if (view === "adminPage") {
    return (
      <AdminPage
        onNavigateToDashboard={handleNavigateToDashboard}
        onSignOut={handleAdminPageSignOut}
      />
    );
  }

  // Fallback — should never hit
  return null;
}
