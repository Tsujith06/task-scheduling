import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { TeamProject } from "./pages/TeamProject";
import { Placeholder } from "./pages/Placeholder";
import { TaskBoard } from "./pages/TaskBoard";
import { TaskAssignments } from "./pages/TaskAssignments";
import { Worklog } from "./pages/Worklog";
import { ReviewsMarks } from "./pages/ReviewsMarks";

import { AdminDashboard } from "./pages/AdminDashboard";
import { UserManagement } from "./pages/UserManagement";
import { BulkUpload } from "./pages/BulkUpload";

import { ReviewManagement } from "./pages/ReviewManagement";
import { AdminReports } from "./pages/AdminReports";
import { ProjectPoolManager } from "./pages/ProjectPoolManager";
import { AdminSettings } from "./pages/AdminSettings";

import { MentorDashboard } from "./pages/MentorDashboard";
import { MentorTaskMonitoring } from "./pages/MentorTaskMonitoring";
import { MentorReviewEntry } from "./pages/MentorReviewEntry";
import { MentorAttendance } from "./pages/MentorAttendance";
import { MentorLeaves } from "./pages/MentorLeaves";
import { MentorApproval } from "./pages/MentorApproval";
import { getTasks } from "./api";

export default function App() {


  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("zentask_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState(() => {
    let defaultPage = localStorage.getItem("zentask_current_page");
    const savedUser = localStorage.getItem("zentask_user");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;

    if (parsedUser?.role === 'Admin' && (!defaultPage || defaultPage === 'dashboard')) {
      return "users";
    }

    return defaultPage || "dashboard";
  });
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      localStorage.setItem("zentask_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("zentask_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("zentask_current_page", page);
  }, [page]);

  useEffect(() => {
    if (user && user.role === 'Student') {
      const fetchNotifs = async () => {
        try {
          const res = await getTasks();
          const curName = user.name?.trim().toLowerCase();
          const pending = res.data.filter(t =>
            t.assignee?.trim().toLowerCase() === curName &&
            t.assignmentStatus === 'Pending'
          );
          setNotifCount(pending.length);
        } catch (err) { console.error("Poll error:", err); }
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const STUDENT_PAGES = {
    dashboard: <Dashboard user={user} />,
    team: <TeamProject user={user} />,
    tasks: <TaskBoard user={user} />,
    assignments: <TaskAssignments user={user} />,
    worklog: <Worklog user={user} />,
    reviews: <ReviewsMarks user={user} />,
  };

  const ADMIN_PAGES = {
    users: <UserManagement user={user} />,
    upload: <BulkUpload user={user} />,
    phases: <ReviewManagement user={user} />,
    reports: <AdminReports user={user} />,
    pool: <ProjectPoolManager user={user} />,
    settings: <AdminSettings user={user} />,
    tasks: <TaskBoard user={user} />,
    reviews: <ReviewsMarks user={user} />,
  };

  const MENTOR_PAGES = {
    dashboard: <MentorDashboard user={user} />,
    "mentor-monitoring": <MentorTaskMonitoring user={user} />,
    "mentor-reviews": <MentorReviewEntry user={user} />,
    "mentor-attendance": <MentorAttendance user={user} />,
    "mentor-approvals": <MentorApproval user={user} />,
    leaves: <MentorLeaves user={user} />,
  };

  if (!user) return <LoginPage onLogin={(userData) => {
    setUser(userData);
    setPage(userData.role === 'Admin' ? 'users' : "dashboard");
  }} />;

  const pages = user.role === 'Admin' ? ADMIN_PAGES : user.role === 'Mentor' ? MENTOR_PAGES : STUDENT_PAGES;


  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar role={user.role} page={page} setPage={setPage} onLogout={() => {
        setUser(null);
        localStorage.removeItem("zentask_current_page");
      }} />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <TopBar page={page} user={user} notifCount={notifCount} setPage={setPage} />
        <main className="flex-1 overflow-y-auto w-full bg-slate-50/30 no-scrollbar">
          {pages[page] || pages.dashboard}
        </main>
      </div>
    </div>
  );
}
