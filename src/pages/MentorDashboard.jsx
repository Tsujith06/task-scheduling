import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill, Bar } from "../components/SharedComponents";
import { getProjects, getPhases, updateProjectMilestones } from "../api";
import { Button } from "../components/ui/button";
import { MentorTeamView } from "./MentorTeamView";

export const MentorDashboard = ({ user }) => {
    const [teams, setTeams] = useState([]);
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTeam, setEditTeam] = useState(null);
    const [saving, setSaving] = useState(false);
    const [viewTeamId, setViewTeamId] = useState(null);

    const fetchAllData = async () => {
        try {
            const [tRes, pRes] = await Promise.all([getProjects({ mentorId: user._id }), getPhases()]);
            setTeams(tRes.data);
            setPhases(pRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

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

    const stats = [
        { label: "Assigned Teams", value: teams.length.toString(), icon: I.team, color: "#6015C1", bg: "#EEF2FF" },
        { label: "Awaiting Review", value: "2", icon: I.clock, color: "#F59E0B", bg: "#FFFBEB" },
        { label: "Completion Avg", value: "68%", icon: I.chart, color: "#10B981", bg: "#ECFDF5" },
        { label: "Pending Marks", value: "1", icon: I.star, color: "#EF4444", bg: "#FEF2F2" },
    ];

    if (viewTeamId) {
        const selectedTeam = teams.find(t => t.id === viewTeamId);
        return (
            <div className="p-7 max-w-7xl mx-auto">
                <MentorTeamView team={selectedTeam} goBack={() => setViewTeamId(null)} />
            </div>
        );
    }

    return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Good Morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">{user.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-slate-50 text-slate-900 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200">Faculty Mentor</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{user.dept || "Academic"} Department · ID: {user.sid || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <Card key={i} className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                                <Ico path={s.icon} size={16} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900 leading-none">{s.value}</p>
                                <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                {/* Upcoming Reviews */}
                <div className="xl:col-span-2 order-1 xl:order-2 space-y-5">
                    <Card className="p-6 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <SectionTitle sub="Evaluation timeline">Upcoming Reviews</SectionTitle>
                        <div className="space-y-4 mt-6">
                            {phases.slice(0, 4).map((p, i) => (
                                <div key={i} className="flex gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
                                    <div className="flex-shrink-0 flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                        <div className="text-center">
                                            <p className="text-[7px] font-bold text-slate-300 uppercase leading-none mb-1">From</p>
                                            <p className="text-[12px] font-black text-slate-900 leading-none">{new Date(p.startDate || Date.now()).getDate()}</p>
                                            <p className="text-[8px] font-bold text-[#6015C1] uppercase mt-1">{new Date(p.startDate || Date.now()).toLocaleString('default', { month: 'short' })}</p>
                                        </div>
                                        <div className="w-[1px] h-8 bg-slate-100 mt-2" />
                                        <div className="text-center">
                                            <p className="text-[7px] font-bold text-slate-300 uppercase leading-none mb-1">To</p>
                                            <p className="text-[12px] font-black text-slate-900 leading-none">{new Date(p.endDate || p.startDate || Date.now()).getDate()}</p>
                                            <p className="text-[8px] font-bold text-[#6015C1] uppercase mt-1">{new Date(p.endDate || p.startDate || Date.now()).toLocaleString('default', { month: 'short' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 self-center">
                                        <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#6015C1] transition-colors truncate">{p.title}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">{p.venue || "Academic Bloc"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Assigned Portfolios Table */}
                <Card className="xl:col-span-3 order-2 xl:order-1 overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <SectionTitle sub="Team directory & member roles">Assigned Portfolios</SectionTitle>
                        <span className="bg-slate-50 text-slate-900 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200">{teams.length} Active</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Project</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Name</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Role</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((t) => (
                                    <optgroup key={t.id} label={t.name}>
                                        {t.members?.map((m, idx) => (
                                            <tr key={`${t.id}-${idx}`} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/50 transition-colors">
                                                {idx === 0 && (
                                                    <td rowSpan={t.members.length} className="px-6 py-4 border-r border-gray-50 align-middle bg-white group-hover:bg-slate-50/50 transition-colors">
                                                        <div className="space-y-0.5 cursor-pointer" onClick={() => setEditTeam(t)}>
                                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{t.id}</p>
                                                            <p className="text-[11px] font-semibold text-slate-900 uppercase leading-tight hover:text-blue-600 transition-colors">{t.name}</p>
                                                        </div>
                                                        <div className="mt-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setViewTeamId(t.id); }}
                                                                className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest bg-fuchsia-50 text-[#6015C1] rounded-lg border border-fuchsia-100 hover:bg-[#6015C1] hover:text-white hover:border-[#6015C1] transition-all w-full flex items-center justify-center gap-1.5 shadow-sm"
                                                            >
                                                                <Ico path={I.chart} size={12} /> View Activity
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-3 border-r border-gray-50 text-[12px] font-medium text-slate-600">{m.name}</td>
                                                <td className="px-6 py-3 border-r border-gray-50">
                                                    <span className={`text-[11px] font-semibold ${m.role === 'Lead' || m.role === 'Leader' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                        {m.role === 'Lead' || m.role === 'Leader' ? 'Lead' : `Member`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-[11px] font-medium text-slate-400">CSE</td>
                                            </tr>
                                        ))}
                                    </optgroup>
                                )).map(group => group.props.children)}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Milestone Update Modal */}
            {editTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditTeam(null)} />
                    <Card className="relative z-10 w-full max-w-2xl p-10 bg-white border-none shadow-2xl rounded-[40px]">
                        <SectionTitle sub="Adjust milestone percentages for internal reporting">Maintain Progress</SectionTitle>
                        <h3 className="text-xl font-semibold text-slate-900 mb-8">{editTeam.name}</h3>

                        <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {editTeam.milestones?.map((m, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-widest">{m.label}</label>
                                        <span className="text-sm font-semibold text-[#6015C1]">{m.pct}%</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={m.pct}
                                            onChange={(e) => {
                                                const newMs = [...editTeam.milestones];
                                                newMs[idx].pct = parseInt(e.target.value);
                                                newMs[idx].status = newMs[idx].pct === 100 ? "Done" : newMs[idx].pct > 0 ? "Active" : "Pending";
                                                setEditTeam({ ...editTeam, milestones: newMs });
                                            }}
                                            className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#6015C1]"
                                        />
                                        <div className="w-16">
                                            <input
                                                type="number"
                                                value={m.pct}
                                                onChange={(e) => {
                                                    const newMs = [...editTeam.milestones];
                                                    newMs[idx].pct = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                                    newMs[idx].status = newMs[idx].pct === 100 ? "Done" : newMs[idx].pct > 0 ? "Active" : "Pending";
                                                    setEditTeam({ ...editTeam, milestones: newMs });
                                                }}
                                                className="w-full h-10 bg-slate-50 border border-slate-100 rounded-xl text-center font-semibold text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-10 flex gap-4">
                            <Button onClick={() => setEditTeam(null)} variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-400 font-semibold uppercase tracking-widest">Discard</Button>
                            <Button onClick={handleUpdateMilestones} disabled={saving} className="flex-[2] h-14 rounded-2xl bg-[#6015C1] text-white font-semibold uppercase tracking-widest shadow-xl shadow-fuchsia-100 flex items-center justify-center gap-2">
                                {saving ? "Syncing..." : "Update Progress"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
