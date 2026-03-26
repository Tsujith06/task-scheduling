import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Pill, Avatar, Bar, Card, SectionTitle } from "../components/SharedComponents";
import { getTasks, getProjects, getPhases, getProjectPool } from "../api";

export const Dashboard = ({ user }) => {
    const [myTasks, setMyTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [projectDomain, setProjectDomain] = useState(null);
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [taskRes, projRes, phasesRes, poolRes] = await Promise.allSettled([
                    getTasks(),
                    getProjects(),
                    getPhases(),
                    getProjectPool()
                ]);

                const tasks = taskRes.status === 'fulfilled' ? taskRes.value.data : [];
                const projects = projRes.status === 'fulfilled' ? projRes.value.data : [];
                const phs = phasesRes.status === 'fulfilled' ? phasesRes.value.data : [];
                const pool = poolRes.status === 'fulfilled' ? poolRes.value.data : [];

                const curName = user?.name?.trim().toLowerCase();
                const mine = tasks.filter(t => t.assignee?.trim().toLowerCase() === curName);

                // Find user's project team
                const myProj = projects.find(p =>
                    p.members?.some(m => m.email === user?.email || m.name?.toLowerCase() === curName)
                );
                
                let myDomain = "General";
                if (myProj && myProj.name) {
                    const poolEntry = pool.find(pl => pl.title === myProj.name);
                    if (poolEntry && poolEntry.domain) {
                        myDomain = poolEntry.domain;
                    }
                }

                setAllTasks(tasks);
                setMyTasks(mine);
                setProject(myProj || null);
                setProjectDomain(myDomain);
                setPhases(phs);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.email]);

    const myTotal = myTasks.length;
    const myCompleted = myTasks.filter(t => t.status === "Completed").length;
    const myInProgress = myTasks.filter(t => t.status === "In Progress").length;
    const myTodo = myTasks.filter(t => t.status === "To Do").length;
    const myMentorApproval = myTasks.filter(t => t.status === "Mentor Approval").length;
    const myPct = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;

    // Team-wide task stats
    const teamMembers = project?.members || [];
    const teamMemberStats = teamMembers.map(m => {
        const memberTasks = allTasks.filter(t => t.assignee?.trim().toLowerCase() === m.name?.trim().toLowerCase());
        const done = memberTasks.filter(t => t.status === "Completed").length;
        return { name: m.name, role: m.role, done, total: memberTasks.length, you: m.email === user?.email || m.name?.toLowerCase() === user?.name?.toLowerCase() };
    });

    const now = new Date();

    const statCards = [
        { label: "My Tasks", value: myTotal, icon: I.task, color: "#6015C1", bg: "#F5F3FF" },
        { label: "Completed", value: myCompleted, icon: I.check, color: "#10B981", bg: "#ECFDF5", sub: `${myPct}% done` },
        { label: "In Progress", value: myInProgress, icon: I.clock, color: "#F59E0B", bg: "#FFFBEB" },
        { label: "Pending Approval", value: myMentorApproval, icon: I.alert, color: "#EF4444", bg: "#FEF2F2" },
    ];

    if (loading) return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            <div className="py-4"><div className="h-10 w-48 bg-slate-100 rounded-xl animate-pulse mb-3" /><div className="h-6 w-64 bg-slate-50 rounded-xl animate-pulse" /></div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}</div>
        </div>
    );

    return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="py-4 flex items-center justify-between">
                <div className="font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        {project && (
                            <span className="bg-[#6015C1] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-[12px]">
                                {project.name || "My Team"}
                            </span>
                        )}
                        {project?.mentor && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                                    Mentor: {project.mentor.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {myMentorApproval > 0 && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">⚠ {myMentorApproval} task{myMentorApproval > 1 ? 's' : ''} awaiting approval</p>
                    )}
                </div>
            </div>

            {/* Row 1 — Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                    <Card key={i} className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                                <Ico path={s.icon} size={17} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
                                <p className="text-[11px] text-gray-400 mt-1.5 font-semibold uppercase tracking-wide">{s.label}</p>
                                {s.sub && <p className="text-[10px] font-bold mt-1" style={{ color: s.color }}>{s.sub}</p>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Row 2 — My Progress + Phase Timeline */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* My Task Progress */}
                <Card className="p-6 xl:col-span-1">
                    <SectionTitle sub="Your personal task breakdown">My Progress</SectionTitle>
                    <div className="mt-5 space-y-4">
                        {[
                            { label: "Completed", val: myCompleted, total: myTotal, color: "#10B981" },
                            { label: "In Progress", val: myInProgress, total: myTotal, color: "#6015C1" },
                            { label: "To Do", val: myTodo, total: myTotal, color: "#64748b" },
                            { label: "Mentor Approval", val: myMentorApproval, total: myTotal, color: "#F59E0B" },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[13px] font-semibold text-slate-600">{item.label}</span>
                                    <span className="text-[13px] font-bold" style={{ color: item.color }}>{item.val}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.total > 0 ? (item.val / item.total) * 100 : 0}%`, backgroundColor: item.color }} />
                                </div>
                            </div>
                        ))}
                        <div className="pt-3 mt-3 border-t border-slate-50">
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] font-semibold text-slate-500">Overall Completion</span>
                                <span className="text-[14px] font-black text-[#6015C1]">{myPct}%</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                                <div className="h-full rounded-full bg-[#6015C1] transition-all duration-1000" style={{ width: `${myPct}%` }} />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Phase Timeline */}
                <Card className="p-6 xl:col-span-2">
                    <SectionTitle sub="Evaluation & submission schedule">Phase Timeline</SectionTitle>
                    <div className="mt-5 space-y-3">
                        {phases.length === 0 ? (
                            <p className="text-[13px] text-slate-400 font-medium py-6 text-center">No phases scheduled yet</p>
                        ) : phases.map((p, i) => {
                            const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
                            const isActive = p.status === 'Active';
                            const isUpcoming = p.status === 'Upcoming';
                            return (
                                <div key={i} className={`flex items-start gap-4 p-4 rounded-[14px] border ${isActive ? 'bg-fuchsia-50 border-fuchsia-100' : 'bg-slate-50 border-slate-100'}`}>
                                    {isActive && <div className="w-2 h-2 rounded-full bg-[#6015C1] mt-1.5 flex-shrink-0 animate-pulse" />}
                                    {!isActive && <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[13px] font-bold text-slate-800 truncate">{p.title}</p>
                                            <Pill color={isActive ? 'accent' : isUpcoming ? 'blue' : 'gray'}>{p.status}</Pill>
                                        </div>
                                        <p className="text-[12px] text-slate-400 font-semibold mt-1">{fmt(p.startDate)} → {fmt(p.endDate)}</p>
                                        
                                        {(() => {
                                            // Only display targets matching the student's project domain, or "General" targets if no domain matches completely
                                            let relevantTargets = [];
                                            if (p.targets?.length > 0) {
                                                if (user?.role === 'Student' && projectDomain) {
                                                    relevantTargets = p.targets.filter(t => t.domain === projectDomain || t.domain === 'General');
                                                    // If none specifically map to their domain or general, show nothing instead of everything
                                                } else {
                                                    // Admin/Mentor view: show everything, although dashboard is usually student.
                                                    relevantTargets = p.targets;
                                                }
                                            }

                                            if (relevantTargets.length === 0) return null;

                                            return (
                                                <div className="flex flex-col gap-2.5 mt-4">
                                                    {relevantTargets.map((t, ti) => (
                                                        <div key={ti} className="flex flex-col gap-1 p-3 bg-white border border-slate-100/50 rounded-[10px] shadow-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-white bg-[#6015C1] px-2 py-0.5 rounded-md uppercase tracking-wider">{t.domain || 'General'}</span>
                                                                <span className="text-[12px] font-bold text-slate-800 tracking-tight leading-none">{t.title}</span>
                                                            </div>
                                                            {t.description && (
                                                                <p className="text-[11px] font-medium text-slate-500 leading-snug">{t.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Row 3 — Team Contributions + My Recent Tasks */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Team Contributions */}
                <Card className="p-6 xl:col-span-1">
                    <SectionTitle sub="Tasks completed per member">Team Contributions</SectionTitle>
                    <div className="mt-5 space-y-4">
                        {teamMemberStats.length === 0 ? (
                            <p className="text-[13px] text-slate-400 text-center py-4">No team data available</p>
                        ) : teamMemberStats.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar name={m.name} size={32} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-[13px] font-semibold text-gray-700 truncate flex items-center gap-1.5">
                                            {m.name} {m.you && <Pill color="accent">You</Pill>}
                                        </span>
                                        <span className="text-[12px] text-gray-400 ml-2 flex-shrink-0 font-semibold">{m.done}/{m.total}</span>
                                    </div>
                                    <Bar pct={m.total > 0 ? Math.round((m.done / m.total) * 100) : 0} color={m.you ? "#6015C1" : "#10B981"} h={5} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* My Recent Tasks */}
                <Card className="p-6 xl:col-span-2">
                    <SectionTitle sub="Your latest assigned tasks">My Recent Tasks</SectionTitle>
                    <div className="mt-5 space-y-2">
                        {myTasks.length === 0 ? (
                            <p className="text-[13px] text-slate-400 text-center py-6">No tasks assigned yet</p>
                        ) : myTasks.slice(0, 6).map((t, i) => {
                            const statusColor = t.status === 'Completed' ? '#10B981' : t.status === 'In Progress' ? '#6015C1' : t.status === 'Mentor Approval' ? '#F59E0B' : '#64748b';
                            const statusBg = t.status === 'Completed' ? '#ECFDF5' : t.status === 'In Progress' ? '#F5F3FF' : t.status === 'Mentor Approval' ? '#FFFBEB' : '#F8FAFC';
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-[12px] bg-slate-50 border border-slate-100">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-slate-800 truncate">{t.title}</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">{t.category || 'General'} · Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-[8px] flex-shrink-0" style={{ color: statusColor, background: statusBg }}>{t.status}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
};
