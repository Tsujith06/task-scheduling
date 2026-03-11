import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill, Bar } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getAllProjects, updateProjectMilestones } from "../api";

export const MentorTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editTeam, setEditTeam] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const res = await getAllProjects();
            setTeams(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTeams(); }, []);

    const handleUpdateMilestones = async () => {
        if (!editTeam) return;
        try {
            setSaving(true);
            await updateProjectMilestones(editTeam.id, editTeam.milestones);
            await fetchTeams();
            setEditTeam(null);
        } catch (e) { alert("Failed to update progress"); }
        finally { setSaving(false); }
    };

    const calculateAvg = (ms) => {
        if (!ms || ms.length === 0) return 0;
        return Math.round(ms.reduce((a, b) => a + b.pct, 0) / ms.length);
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Team Directory 🧭</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Assigned Portfolios</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-slate-50 text-slate-900 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200">{teams.length} Active Teams</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Awaiting Phase 2 Feedback</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Project name</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">S.no</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Name</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Roll no</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Role</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((t) => (
                                <optgroup key={t.id} label={t.name}>
                                    {t.members?.map((m, idx) => (
                                        <tr key={`${t.id}-${idx}`} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/50 transition-colors">
                                            {idx === 0 && (
                                                <td rowSpan={t.members.length} className="px-6 py-4 border-r border-gray-100 align-middle text-center w-64 bg-white">
                                                    <div className="space-y-1">
                                                        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-tight">{t.id} -</p>
                                                        <p className="text-[11px] font-semibold text-blue-600 uppercase leading-tight">{t.name}</p>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">S{idx + 1}</td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-900">{m.name}</td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">{m.sid || "N/A"}</td>
                                            <td className="px-6 py-4 border-r border-gray-100">
                                                <span className={`text-[13px] font-semibold ${m.role === 'Lead' || m.role === 'Leader' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                    {m.role === 'Lead' || m.role === 'Leader' ? 'Leader' : `TM ${idx}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-slate-500">CSE</td>
                                        </tr>
                                    ))}
                                </optgroup>
                            )).map(group => group.props.children)}
                        </tbody>
                    </table>
                </div>
            </Card>

            {editTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditTeam(null)} />
                    <Card className="relative z-10 w-full max-w-2xl p-10 bg-white border-none shadow-2xl rounded-[40px]">
                        <SectionTitle sub="Adjust milestone percentages for internal reporting">Maintain Progress</SectionTitle>
                        <h3 className="text-xl font-semibold text-slate-900 mb-8">{editTeam.teamName}</h3>

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

