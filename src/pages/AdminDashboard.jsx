import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { getUsers, getTasks, getProjects, getPhases } from "../api";

const StatCard = ({ val, label, sub, color, bg, icon, onClick }) => (
    <Card
        className={`p-5 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: bg }}>
                <Ico path={icon} size={19} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-slate-900 leading-none">{val}</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5">{label}</p>
                {sub && <p className="text-[10px] font-bold mt-1.5" style={{ color }}>{sub}</p>}
            </div>
        </div>
    </Card>
);

const QuickActionBtn = ({ label, icon, color, bg, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 p-4 rounded-[14px] border border-slate-100 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 w-full text-left group"
    >
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
            <Ico path={icon} size={16} style={{ color }} />
        </div>
        <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
        <Ico path={I.arrow} size={14} cls="ml-auto text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
    </button>
);

export const AdminDashboard = ({ setPage, user }) => {
    const [stats, setStats] = useState({ students: 0, mentors: 0, teams: 0, phases: 0 });
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [phases, setPhases] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [studRes, mentRes, projRes, phaseRes, taskRes, leaveRes] = await Promise.allSettled([
                    getUsers({ role: 'Student' }),
                    getUsers({ role: 'Mentor' }),
                    getProjects(),
                    getPhases(),
                    getTasks(),
                ]);

                const students = studRes.status === 'fulfilled' ? studRes.value.data : [];
                const mentors = mentRes.status === 'fulfilled' ? mentRes.value.data : [];
                const projs = projRes.status === 'fulfilled' ? projRes.value.data : [];
                const phs = phaseRes.status === 'fulfilled' ? phaseRes.value.data : [];
                const tsks = taskRes.status === 'fulfilled' ? taskRes.value.data : [];

                setStats({
                    students: students.length,
                    mentors: mentors.length,
                    teams: projs.length,
                    phases: phs.length,
                });
                setProjects(projs);
                setPhases(phs);
                setTasks(tsks);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Task breakdown
    const taskTodo = tasks.filter(t => t.status === 'To Do').length;
    const taskInProgress = tasks.filter(t => t.status === 'In Progress').length;
    const taskCompleted = tasks.filter(t => t.status === 'Completed').length;
    const taskMentorApproval = tasks.filter(t => t.status === 'Mentor Approval').length;
    const totalTasks = tasks.length || 1;

    // Project funnel
    const proposalPending = projects.filter(p => p.proposalStatus === 'Pending').length;
    const proposalApproved = projects.filter(p => p.proposalStatus === 'Approved').length;
    const proposalRejected = projects.filter(p => p.proposalStatus === 'Rejected').length;
    const noProposal = projects.filter(p => !p.proposalStatus || p.proposalStatus === 'Not Submitted').length;

    const activePhases = phases.filter(ph => ph.status === 'Active');
    const upcomingPhases = phases.filter(ph => ph.status === 'Upcoming');

    const taskBars = [
        { label: "To Do", val: taskTodo, color: "#64748b", bg: "#f1f5f9" },
        { label: "In Progress", val: taskInProgress, color: "#6015C1", bg: "#f5f3ff" },
        { label: "Mentor Approval", val: taskMentorApproval, color: "#F59E0B", bg: "#fffbeb" },
        { label: "Completed", val: taskCompleted, color: "#10B981", bg: "#ecfdf5" },
    ];
    const maxBar = Math.max(...taskBars.map(b => b.val), 1);

    const now = new Date();

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="py-4 flex items-center justify-between">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">Admin Dashboard</h2>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-[10px] font-bold text-[#6015C1] mt-1 uppercase tracking-wider">System Overview</p>
                </div>
            </div>

            {/* Row 1 — 4 Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard val={loading ? '—' : stats.students} label="Total Students" sub="Registered accounts" color="#6015C1" bg="#F5F3FF" icon={I.people} onClick={() => setPage('users')} />
                <StatCard val={loading ? '—' : stats.mentors} label="Total Mentors" sub="Active faculty" color="#3B82F6" bg="#EFF6FF" icon={I.award} onClick={() => setPage('users')} />
                <StatCard val={loading ? '—' : stats.teams} label="Active Teams" sub="Project groups" color="#10B981" bg="#ECFDF5" icon={I.chart} onClick={() => setPage('pool')} />
                <StatCard val={loading ? '—' : stats.phases} label="Total Phases" sub={`${activePhases.length} active`} color="#F59E0B" bg="#FFFBEB" icon={I.task} onClick={() => setPage('phase-creation')} />
            </div>

            {/* Row 2 — Task Breakdown + Proposal Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Status Chart — 2 cols */}
                <Card className="lg:col-span-2 p-7">
                    <div className="flex justify-between items-center mb-6">
                        <SectionTitle sub={`${tasks.length} tasks across all teams`}>Task Status Breakdown</SectionTitle>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Live</span>
                    </div>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {taskBars.map((b, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[13px] font-semibold text-slate-600">{b.label}</span>
                                        <span className="text-[13px] font-bold" style={{ color: b.color }}>{b.val} tasks</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${(b.val / maxBar) * 100}%`, backgroundColor: b.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 pt-5 border-t border-slate-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {taskBars.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{b.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Proposal Status — 1 col */}
                <Card className="p-7">
                    <SectionTitle sub={`${projects.length} total teams registered`}>Proposal Status</SectionTitle>
                    {loading ? (
                        <div className="space-y-3 mt-4">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-slate-50 rounded-xl animate-pulse" />)}</div>
                    ) : (
                        <div className="mt-5 space-y-3">
                            {[
                                { label: "Approved", val: proposalApproved, color: "#10B981", bg: "#ECFDF5" },
                                { label: "Pending Review", val: proposalPending, color: "#F59E0B", bg: "#FFFBEB" },
                                { label: "Rejected", val: proposalRejected, color: "#F43F5E", bg: "#FFF1F2" },
                                { label: "Not Submitted", val: noProposal, color: "#64748b", bg: "#F8FAFC" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-[12px]" style={{ background: item.bg }}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[13px] font-semibold text-slate-700">{item.label}</span>
                                    </div>
                                    <span className="text-[14px] font-bold" style={{ color: item.color }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 3 — Phase Timeline + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Phase Timeline — 2 cols */}
                <Card className="lg:col-span-2 p-7">
                    <div className="flex justify-between items-center mb-5">
                        <SectionTitle sub={`${upcomingPhases.length} upcoming · ${activePhases.length} active`}>Phase Timeline</SectionTitle>
                        {phases.length > 0 && (
                            <button onClick={() => setPage('phase-creation')} className="text-[11px] font-bold uppercase tracking-widest text-[#6015C1] bg-fuchsia-50 px-4 py-2 rounded-[10px] hover:bg-fuchsia-100 transition-all">
                                Manage All →
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)
                        ) : phases.length === 0 ? (
                            <p className="text-[13px] text-slate-400 font-medium py-6 text-center">No phases created yet</p>
                        ) : phases.map((p, i) => {
                            const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-[12px] bg-slate-50 border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-slate-800 truncate">{p.title}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[13px] font-semibold text-slate-500">{fmt(p.startDate)}</span>
                                            <span className="text-[13px] text-slate-300 font-bold">→</span>
                                            <span className="text-[13px] font-semibold text-slate-500">{fmt(p.endDate)}</span>
                                        </div>
                                    </div>
                                    <Pill color={p.status === 'Active' ? 'green' : p.status === 'Completed' ? 'gray' : 'accent'}>{p.status}</Pill>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Quick Actions — 1 col */}
                <Card className="p-7">
                    <SectionTitle sub="Jump to key modules">Quick Actions</SectionTitle>
                    <div className="mt-4 space-y-2">
                        <QuickActionBtn label="Manage Users" icon={I.people} color="#6015C1" bg="#F5F3FF" onClick={() => setPage('users')} />
                        <QuickActionBtn label="Bulk Upload Data" icon={I.upload} color="#3B82F6" bg="#EFF6FF" onClick={() => setPage('upload')} />
                        <QuickActionBtn label="Phase & Timeline" icon={I.task} color="#F59E0B" bg="#FFFBEB" onClick={() => setPage('phase-creation')} />
                        <QuickActionBtn label="Project Pool" icon={I.chart} color="#10B981" bg="#ECFDF5" onClick={() => setPage('pool')} />
                        <QuickActionBtn label="Reports & Approvals" icon={I.file} color="#F43F5E" bg="#FFF1F2" onClick={() => setPage('reports')} />
                    </div>
                </Card>
            </div>
        </div>
    );
};
