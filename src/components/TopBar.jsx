import { useState, useEffect } from "react";
import { Ico, I } from "./Icons";
import { Avatar, Pill } from "./SharedComponents";
import { getMyInvitations, respondToInvitation } from "../api";

export const TopBar = ({ page, user, notifCount, setPage }) => {
    const [invitations, setInvitations] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    const fetchInvites = async () => {
        if (!user?._id) return;
        try {
            const res = await getMyInvitations(user._id);
            setInvitations(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchInvites();
        const interval = setInterval(fetchInvites, 30000);
        return () => clearInterval(interval);
    }, [user?._id]);

    const handleInviteAction = async (id, status) => {
        try {
            await respondToInvitation(id, status);
            fetchInvites();
            if (status === 'Accepted') {
                window.location.reload(); // Refresh to update team context
            }
        } catch (err) { alert("Failed to respond to invitation"); }
    };

    const titles = {
        dashboard: "Dashboard Overview",
        team: "Team Collaboration",
        tasks: "Project Task Board",
        assignments: "Task Management Portal",
        worklog: "Worklog & Progress",
        reviews: "Academic Reviews",
        'review-details': "Review Assessment Details",
    };

    const totalNotifs = notifCount + invitations.length;

    return (
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-7 flex-shrink-0 font-['Poppins']">
            <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{titles[page] || "EduTrack Portal"}</h1>
            </div>
            <div className="flex items-center gap-5">
                {/* Notification Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifs(!showNotifs)}
                        className={`relative p-2.5 rounded-xl transition-all group ${showNotifs ? "bg-purple-100 text-[#6015C1]" : "bg-slate-50 text-slate-400 hover:text-[#6015C1] hover:bg-purple-50"}`}
                    >
                        <Ico path={I.bell} size={20} />
                        {totalNotifs > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                {totalNotifs}
                            </span>
                        )}
                    </button>

                    {showNotifs && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-5 mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Notifications</span>
                                {totalNotifs > 0 && <span className="text-[10px] bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-bold">{totalNotifs} New</span>}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {notifCount > 0 && (
                                    <div
                                        onClick={() => { setPage("assignments"); setShowNotifs(false); }}
                                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Ico path={I.alert} size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-semibold text-slate-800">New Task Assignments</p>
                                                <p className="text-[10px] text-slate-400">You have {notifCount} pending tasks to review.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {invitations.map(invite => (
                                    <div key={invite._id} className="px-5 py-4 border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                        <div className="flex gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-fuchsia-50 flex items-center justify-center text-fuchsia-500">
                                                <Ico path={I.user} size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[12px] font-semibold text-slate-800">Team Invitation</p>
                                                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                                                    <span className="font-bold text-fuchsia-600">{invite.inviterName}</span> invited you to join <span className="font-bold">{invite.teamName}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleInviteAction(invite._id, 'Accepted')}
                                                className="flex-1 py-1.5 bg-[#6015C1] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-fuchsia-100 hover:bg-[#4A0D97] transition-all"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleInviteAction(invite._id, 'Rejected')}
                                                className="flex-1 py-1.5 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-200 transition-all"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {totalNotifs === 0 && (
                                    <div className="py-10 text-center">
                                        <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-semibold text-slate-900 leading-none">{user?.name || "Guest"}</p>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-wider">{user?.role}</p>
                    </div>
                    <Avatar name={user?.name} size={34} />
                </div>
            </div>
        </header>
    );
};
