import { Ico, I } from "./Icons";
import { Avatar } from "./SharedComponents";

const NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.home },
    { id: "team", label: "Team & Project", icon: I.team },
    { id: "tasks", label: "Task Board", icon: I.task },
    { id: "files", label: "Documents", icon: I.file },
    { id: "notifications", label: "Notifications", icon: I.bell, badge: 3 },
];

export const Sidebar = ({ page, setPage, onLogout }) => (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white" style={{ minHeight: "100vh" }}>
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-5 border-b border-gray-100">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#6015C1,#8B2AE0)" }}>
                <Ico path={I.star} size={15} cls="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">EduTrack</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
            {NAV.map(n => {
                const active = page === n.id;
                return (
                    <button key={n.id} onClick={() => setPage(n.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left ${active ? "text-fuchsia-600 bg-fuchsia-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"}`}>
                        <Ico path={n.icon} size={16} style={{ color: active ? "#6015C1" : "#9CA3AF" }} />
                        <span className="flex-1">{n.label}</span>
                        {n.badge && (
                            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white bg-fuchsia-500">{n.badge}</span>
                        )}
                    </button>
                );
            })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-2.5">
                <Avatar name="Arjun Kumar" size={32} />
                <div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">Arjun Kumar</p>
                    <p className="text-[10px] text-gray-400">21CS045 · CSE</p>
                </div>
            </div>
            <button onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-xs transition-all">
                <Ico path={I.logout} size={13} />Logout
            </button>
        </div>
    </aside>
);
