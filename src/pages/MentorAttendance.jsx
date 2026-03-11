import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getAllProjects, updateAttendance } from "../api";

export const MentorAttendance = () => {
    const [teams, setTeams] = useState([]);
    const [activeTeam, setActiveTeam] = useState(null);

    const fetchTeams = async () => {
        try {
            const res = await getAllProjects();
            setTeams(res.data);
            if (res.data.length > 0) {
                // If we already had an activeTeam, find it again to refresh its members
                if (activeTeam) {
                    const updated = res.data.find(t => t._id === activeTeam._id);
                    setActiveTeam(updated || res.data[0]);
                } else {
                    setActiveTeam(res.data[0]);
                }
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleStatusUpdate = async (teamId, sid, status, name, memberId) => {
        try {
            // Use the _id if available, otherwise string id
            await updateAttendance(teamId, sid, status, name, memberId);
            await fetchTeams(); // Refresh to reflect changes
        } catch (err) {
            console.error("Failed to update attendance", err);
        }
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Compliance & Reporting 🏛️</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Review Attendance</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <select
                            className="bg-slate-50 text-slate-900 text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-xl border border-slate-200 outline-none cursor-pointer"
                            value={activeTeam?._id || ""}
                            onChange={e => setActiveTeam(teams.find(t => t._id === e.target.value))}
                        >
                            {teams.map(t => <option key={t._id} value={t._id}>{t.teamName || t.name}</option>)}
                        </select>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">March 2025 · Review 2</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[32px]">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                    <div>
                        <SectionTitle sub="Mark attendance for evaluative viva">Student Roster</SectionTitle>
                    </div>
                    <Button className="bg-[#6015C1] text-white px-8 h-12 rounded-2xl font-semibold uppercase tracking-[0.1em] shadow-lg shadow-fuchsia-100 flex items-center gap-2 hover:bg-[#4A0D97] transition-all">
                        Download Records <Ico path={I.upload} size={14} style={{ transform: 'rotate(180deg)' }} />
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/30">
                                <th className="text-left py-6 px-10 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Student Profile</th>
                                <th className="text-left py-6 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Register No</th>
                                <th className="text-left py-6 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Eligibility</th>
                                <th className="text-center py-6 px-10 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activeTeam?.members.map(s => {
                                console.log("Member data:", s);
                                return (
                                    <tr key={s._id || s.sid} className="hover:bg-slate-50/20 transition-colors group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <Avatar name={s.name} size={48} />
                                                <div>
                                                    <p className="text-[15px] font-semibold text-slate-900">{s.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{activeTeam.teamName || activeTeam.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6 font-mono text-xs font-semibold text-slate-500">{s.sid || '21CS045'}</td>
                                        <td className="py-6 px-6">
                                            <div className="inline-flex items-center bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-widest">
                                                Ready
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex justify-center gap-3">
                                                {['Present', 'Absent', 'Late'].map(status => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusUpdate(activeTeam?._id || activeTeam?.id, s.sid, status, s.name, s._id)}
                                                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-semibold uppercase tracking-widest transition-all ${s.status === status
                                                            ? (status === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                                                                : status === 'Absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100'
                                                                    : 'bg-amber-500 text-white shadow-lg shadow-amber-100')
                                                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
