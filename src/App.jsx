import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { TeamProject } from "./pages/TeamProject";
import { Placeholder } from "./pages/Placeholder";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");

  const PAGE = {
    dashboard: <Dashboard />,
    team: <TeamProject />,
    tasks: <Placeholder title="Task Board" />,
    files: <Placeholder title="Documents" />,
    notifications: <Placeholder title="Notifications" />,
  };

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar page={page} setPage={setPage} onLogout={() => setLoggedIn(false)} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar page={page} />
        <main className="flex-1 overflow-y-auto w-full">
          {PAGE[page]}
        </main>
      </div>
    </div>
  );
}
