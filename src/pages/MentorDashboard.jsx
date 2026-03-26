import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill, Bar } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getProjects, getPhases, getTasks, updateProjectMilestones } from "../api";
import { MentorTeamView } from "./MentorTeamView";

export const MentorDashboard = ({ user }) => {
    const [teams, setTeams] = useState([]);
    const [phases, setPhases] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTeam, setEditTeam] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewTeamId, setViewTeamId] = useState(null);

    const fetchAllData = async () => {
        try {
            const [tRes, pRes, taskRes] = await Promise.allSettled([
                getProjects({ mentorId: user._id }),
                getPhases(),
                getTasks(),
            ]);
            const teamsData = tRes.status === 'fulfilled' ? tRes.value.data : [];
            const phasesData = pRes.status === 'fulfilled' ? pRes.value.data : [];
            const tasksData = taskRes.status === 'fulfilled' ? taskRes.value.data : [];

            setTeams(teamsData);
            setPhases(phasesData);
            setAllTasks(tasksData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAllData(); }, []);

    const handleUpdateMilestones = async () => {
        if (!editTeam) return;
        try {
            setSaving(true);
            await updateProjectMilestones(editTeam.id, editTeam.milestones);
            await fetchAllData();
            setEditTeam(null);
        } catch (e) { alert("Failed to update progress"); }
        finally { setSaving(false); }
    };

    // Compute per-team task stats
    const teamStats = teams.map(t => {
        const memberNames = (t.members || []).map(m => m.name?.trim().toLowerCase());
        const teamTasks = allTasks.filter(task => memberNames.includes(task.assignee?.trim().toLowerCase()));
        const completed = teamTasks.filter(tk => tk.status === 'Completed').length;
        const approvalPending = teamTasks.filter(tk => tk.status === 'Mentor Approval').length;
        return { ...t, teamTasks: teamTasks.length, completed, approvalPending, pct: teamTasks.length > 0 ? Math.round((completed / teamTasks.length) * 100) : 0 };
    });

    const totalTeams = teams.length;
    const totalApprovalPending = teamStats.reduce((a, t) => a + t.approvalPending, 0);
    const avgCompletion = teamStats.length > 0 ? Math.round(teamStats.reduce((a, t) => a + t.pct, 0) / teamStats.length) : 0;
    const activePhases = phases.filter(p => p.status === 'Active').length;

    const now = new Date();

    if (viewTeamId) {
        const selectedTeam = teams.find(t => t.id === viewTeamId);
        return <MentorTeamView team={selectedTeam} goBack={() => setViewTeamId(null)} user={user} />;
    }

    return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Good Morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">{user.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-[12px]">Faculty Mentor</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{user.dept || "Academic"} · ID: {user.sid || "N/A"}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {totalApprovalPending > 0 && (
                        <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">⚠ {totalApprovalPending} task{totalApprovalPending > 1 ? 's' : ''} awaiting your approval</p>
                    )}
                </div>
            </div>

            {/* Row 1 — Stat Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: "Assigned Teams", value: loading ? '—' : totalTeams, icon: I.people, color: "#6015C1", bg: "#F5F3FF" },
                    { label: "Awaiting Approval", value: loading ? '—' : totalApprovalPending, icon: I.clock, color: "#F59E0B", bg: "#FFFBEB", sub: totalApprovalPending > 0 ? "Action required" : "All clear" },
                    { label: "Avg Completion", value: loading ? '—' : `${avgCompletion}%`, icon: I.chart, color: "#10B981", bg: "#ECFDF5" },
                    { label: "Active Phases", value: loading ? '—' : activePhases, icon: I.task, color: "#3B82F6", bg: "#EFF6FF" },
                ].map((s, i) => (
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

            {/* Row 2 — Team Progress + Phase Timeline */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Team Completion Summary */}
                <Card className="p-6 xl:col-span-1">
                    <SectionTitle sub="Task completion per team">Team Progress</SectionTitle>
                    <div className="mt-5 space-y-5">
                        {loading ? [1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />) :
                        teamStats.length === 0 ? (
                            <p className="text-[13px] text-slate-400 text-center py-6">No teams assigned yet</p>
                        ) : teamStats.map((t, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[13px] font-semibold text-slate-700 truncate max-w-[160px]">{t.name}</span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {t.approvalPending > 0 && (
                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{t.approvalPending} pending</span>
                                        )}
                                        <span className="text-[13px] font-bold text-[#6015C1]">{t.pct}%</span>
                                    </div>
                                </div>
                                <Bar pct={t.pct} color="#6015C1" h={6} />
                                <p className="text-[10px] text-slate-400 font-semibold mt-1">{t.completed}/{t.teamTasks} tasks done · {t.members?.length || 0} members</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Phase Timeline */}
                <Card className="p-6 xl:col-span-2">
                    <SectionTitle sub="Current evaluation schedule">Phase Timeline</SectionTitle>
                    <div className="mt-5 space-y-3">
                        {phases.length === 0 ? (
                            <p className="text-[13px] text-slate-400 font-medium py-6 text-center">No phases scheduled yet</p>
                        ) : phases.map((p, i) => {
                            const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
                            const isActive = p.status === 'Active';
                            return (
                                <div key={i} className={`flex items-start gap-4 p-4 rounded-[14px] border ${isActive ? 'bg-fuchsia-50 border-fuchsia-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${isActive ? 'bg-[#6015C1] animate-pulse' : 'bg-slate-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-[13px] font-bold text-slate-800 truncate">{p.title}</p>
                                            <Pill color={isActive ? 'accent' : p.status === 'Upcoming' ? 'blue' : 'gray'}>{p.status}</Pill>
                                        </div>
                                        <p className="text-[12px] text-slate-400 font-semibold mt-1">{fmt(p.startDate)} → {fmt(p.endDate)}</p>
                                        {p.targets?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {p.targets.slice(0, 3).map((t, ti) => (
                                                    <span key={ti} className="text-[10px] font-bold text-[#6015C1] bg-white border border-fuchsia-100 px-2 py-0.5 rounded-md">
                                                        {t.domain || t.title}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Row 3 — Assigned Teams Table */}
            <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <SectionTitle sub="Team directory & member roles">Assigned Portfolios</SectionTitle>
                    <span className="bg-slate-50 text-slate-900 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200">{teams.length} Active</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">S.No</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Project</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">S.Id</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Name</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Roll No</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Dept</th>
                                <th className="px-6 py-4 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="py-16 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Loading team data...</td></tr>
                            ) : teams.length === 0 ? (
                                <tr><td colSpan="8" className="py-16 text-center text-slate-400 text-xs font-semibold uppercase tracking-widest">No teams assigned yet</td></tr>
                            ) : teams.map((t, tIdx) => (
                                t.members?.map((m, idx) => (
                                    <tr key={`${t.id}-${idx}`} className="border-b border-gray-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                                        {idx === 0 && (
                                            <td rowSpan={t.members.length} className="px-6 py-4 border-r border-gray-50 align-middle text-center text-[14px] font-bold text-slate-300 bg-white">
                                                {String(tIdx + 1).padStart(2, '0')}
                                            </td>
                                        )}
                                        {idx === 0 && (
                                            <td rowSpan={t.members.length} className="px-6 py-4 border-r border-gray-50 align-middle bg-white">
                                                <p className="text-[14px] font-semibold text-slate-900 uppercase leading-tight">{t.name}</p>
                                            </td>
                                        )}
                                        <td className="px-6 py-3 border-r border-gray-50 text-[14px] font-bold text-slate-400">S{idx + 1}</td>
                                        <td className="px-6 py-3 border-r border-gray-50 text-[14px] font-medium text-slate-600">{m.name}</td>
                                        <td className="px-6 py-3 border-r border-gray-50 text-[14px] font-medium text-slate-500 font-mono">{m.sid || "N/A"}</td>
                                        <td className="px-6 py-3 border-r border-gray-50">
                                            <span className={`text-[14px] font-semibold ${['Team Lead', 'Lead', 'Leader'].includes(m.role) ? 'text-[#6015C1]' : 'text-emerald-500'}`}>
                                                {m.role || 'Member'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 border-r border-gray-50 text-[14px] font-medium text-slate-400">{m.dept || 'CSE'}</td>
                                        {idx === 0 && (
                                            <td rowSpan={t.members.length} className="px-6 py-4 align-middle text-center bg-white">
                                                <button
                                                    onClick={() => setViewTeamId(t.id)}
                                                    className="px-4 py-2 text-[12px] font-bold uppercase tracking-widest bg-fuchsia-50 text-[#6015C1] rounded-[12px] border border-fuchsia-100 hover:bg-[#6015C1] hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
                                                >
                                                    <Ico path={I.chart} size={14} /> View Activity
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Milestone Update Modal */}
            {editTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditTeam(null)} />
                    <Card className="relative z-10 w-full max-w-2xl p-10 bg-white border-none shadow-2xl rounded-[16px]">
                        <SectionTitle sub="Adjust milestone percentages for internal reporting">Maintain Progress</SectionTitle>
                        <h3 className="text-xl font-semibold text-slate-900 mb-8">{editTeam.name}</h3>
                        <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {editTeam.milestones?.map((m, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-slate-700 ml-1 block">{m.label}</label>
                                        <span className="text-sm font-semibold text-[#6015C1]">{m.pct}%</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <input type="range" min="0" max="100" value={m.pct}
                                            onChange={(e) => {
                                                const newMs = [...editTeam.milestones];
                                                newMs[idx].pct = parseInt(e.target.value);
                                                newMs[idx].status = newMs[idx].pct === 100 ? "Done" : newMs[idx].pct > 0 ? "Active" : "Pending";
                                                setEditTeam({ ...editTeam, milestones: newMs });
                                            }}
                                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6015C1]"
                                        />
                                        <input type="number" value={m.pct}
                                            onChange={(e) => {
                                                const newMs = [...editTeam.milestones];
                                                newMs[idx].pct = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                newMs[idx].status = newMs[idx].pct === 100 ? "Done" : newMs[idx].pct > 0 ? "Active" : "Pending";
                                                setEditTeam({ ...editTeam, milestones: newMs });
                                            }}
                                            className="w-16 h-[44px] bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-center font-normal text-sm outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 flex gap-4">
                            <Button onClick={() => setEditTeam(null)} variant="ghost" className="flex-1 h-[44px] rounded-[12px] text-slate-400 font-semibold uppercase tracking-widest">Discard</Button>
                            <Button onClick={handleUpdateMilestones} disabled={saving} className="flex-[2] h-[44px] rounded-[12px] bg-[#6015C1] text-white font-semibold uppercase tracking-widest shadow-xl shadow-fuchsia-100 flex items-center justify-center gap-2">
                                {saving ? "Syncing..." : "Update Progress"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
