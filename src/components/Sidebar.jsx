import { Ico, I } from "./Icons";
import { Avatar } from "./SharedComponents";

const STUDENT_NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.home },
    { id: "team", label: "Team & Project", icon: I.team },
    { id: "tasks", label: "Task Board", icon: I.task },
    { id: "worklog", label: "Worklog", icon: I.clipboard },
    // { id: "reviews", label: "Reviews & Marks", icon: I.star },
];

const ADMIN_NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.home },
    { id: "users", label: "User Manager", icon: I.users },
    { id: "upload", label: "Bulk Import", icon: I.upload },
    { id: "phase-creation", label: "Phase Setup", icon: I.plus },
    // { id: "phases", label: "Reviews & Marks", icon: I.star },
    { id: "pool", label: "Project Pool", icon: I.folder },
];

const MENTOR_NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.home },
    { id: "mentor-monitoring", label: "Worklog Monitor", icon: I.clipboard },
    // { id: "mentor-reviews", label: "Mark Entry", icon: I.star },
    // { id: "mentor-attendance", label: "Attendance", icon: I.check },
    { id: "mentor-approvals", label: "Approval Queue", icon: I.folder },
];

export const Sidebar = ({ role, page, setPage, onLogout }) => {
    const navItems = role === 'Admin' ? ADMIN_NAV : role === 'Mentor' ? MENTOR_NAV : STUDENT_NAV;
    const userName = role === 'Admin' ? 'System Admin' : role === 'Mentor' ? 'Dr. Ramesh V' : 'Arjun Kumar';
    const userSub = role === 'Admin' ? 'IT' : role === 'Mentor' ? 'CSE · Senior Mentor' : '21CS045 · CSE';


    return (
        <aside className="w-56 flex-shrink-0 h-full flex flex-col border-r border-gray-100 bg-white">
            <div className="flex items-center gap-2.5 px-5 pt-6 pb-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-100"
                    style={{ background: "linear-gradient(135deg,#6015C1,#8B2AE0)" }}>
                    <Ico path={I.star} size={15} cls="text-white" />
                </div>
                <span className="font-semibold text-gray-900 text-sm tracking-tight">EduTrack</span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(n => {
                    const active = page === n.id;
                    return (
                        <button key={n.id} onClick={() => setPage(n.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 text-left ${active ? "text-fuchsia-600 bg-fuchsia-50/50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}>
                            <Ico path={n.icon} size={16} style={{ color: active ? "#6015C1" : "#9CA3AF" }} />
                            <span className="flex-1">{n.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100 space-y-3">
                {role !== 'Student' && (
                    <div className="flex items-center gap-2.5 px-1">
                        <Avatar name={userName} size={32} />
                        <div>
                            <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{userSub}</p>
                        </div>
                    </div>
                )}
                <button onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 text-[11px] font-semibold uppercase tracking-widest transition-all">
                    <Ico path={I.logout} size={13} />Logout
                </button>
            </div>
        </aside>
    );
};
