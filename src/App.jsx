import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider, useUser } from "./context/UserContext";
import { CommunityProvider } from "./context/CommunityContext";
import { LettersProvider } from "./context/LettersContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { CheckinsProvider } from "./context/CheckinsContext";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import MainFeed from "./pages/MainFeed";
import "./App.css";

// Navbar + Hero (src/components) are an earlier placeholder, unused for now.

function AppContent() {
  const { user, authLoading } = useUser();
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");

  // Firebase resolves the signed-in session asynchronously, so we can't know
  // "feed" vs "landing" until authLoading settles.
  useEffect(() => {
    if (authLoading) return;
    if (user && view !== "feed") {
      setView("feed");
    }
    if (!user && view === "feed") {
      setView("landing");
    }
  }, [user, authLoading, view]);

  if (authLoading) {
    return <div className="app-loading">Loading Human Threads...</div>;
  }

  if (view === "feed") {
    return <MainFeed />;
  }

  if (view === "auth") {
    return (
      <AuthPage
        initialMode={authMode}
        onAuthenticated={() => setView("feed")}
        onBack={() => setView("landing")}
      />
    );
  }

  return (
    <Landing
      onNavigate={(mode) => {
        setAuthMode(mode);
        setView("auth");
      }}
    />
  );
}

function App() {
  return (
    <UserProvider>
      <CommunityProvider>
        <LettersProvider>
          <NotificationsProvider>
            <CheckinsProvider>
              <AppContent />
            </CheckinsProvider>
          </NotificationsProvider>
        </LettersProvider>
      </CommunityProvider>
      <Analytics />
    </UserProvider>
  );
}

export default App;
