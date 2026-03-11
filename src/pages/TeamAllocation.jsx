import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getAllProjects, getUsers, updateUser } from "../api";

export const TeamAllocation = () => {
    const [projects, setProjects] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, uRes] = await Promise.all([
                getAllProjects(),
                getUsers({ role: 'Mentor' })
            ]);
            setProjects(pRes.data);
            setMentors(uRes.data);
        } catch (err) {
            console.error("Allocation fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAutoAssign = () => {
        // Mock auto allocation
        alert("Smart allocation complete! Mentors assigned based on Department and workload.");
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Resource Management 🏢</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Team Allocation</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-fuchsia-50 text-[#6015C1] text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-fuchsia-100 italic">Load Balancer</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{projects.length} Teams · {mentors.length} Mentors</span>
                    </div>
                </div>
                <Button onClick={handleAutoAssign} className="bg-[#6015C1] rounded-xl h-11 px-5 flex items-center gap-2 font-semibold text-xs shadow-lg shadow-fuchsia-100 text-white">
                    <Ico path={I.chart} size={14} /> Auto-Assign Mentors
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">
                {/* Team List */}
                <div className="xl:col-span-2 space-y-4">
                    <SectionTitle sub={`${projects.length} academic teams`}>Team Overview</SectionTitle>
                    {loading ? (
                        <div className="p-20 text-center font-semibold text-slate-300 uppercase tracking-widest">Loading teams...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map((p, i) => (
                                <Card key={i} className="p-5 flex items-center gap-6 hover:shadow-xl transition-all border-none bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] group">
                                    <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-fuchsia-50 group-hover:text-[#6015C1] transition-colors">
                                        <Ico path={I.team} size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                                            <Pill color="gray">{p.teamName}</Pill>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 opacity-60">
                                                <Ico path={I.people} size={12} />
                                                <span className="text-[11px] font-semibold">{p.members.length} Members</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-fuchsia-600 font-semibold">
                                                <Ico path={I.award} size={12} />
                                                <span className="text-[11px] uppercase tracking-wider">{p.mentor?.name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <select className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-slate-600 outline-none focus:border-fuchsia-300 transition-all cursor-pointer">
                                        <option>Change Mentor</option>
                                        {mentors.map(m => (
                                            <option key={m._id}>{m.name}</option>
                                        ))}
                                    </select>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mentor Workload */}
                <div className="space-y-6">
                    <SectionTitle sub="Capacity management">Mentor Workload</SectionTitle>
                    <div className="space-y-3">
                        {mentors.map((m, i) => (
                            <Card key={i} className="p-5 border-none shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar name={m.name} size={40} />
                                    <div className="flex-1">
                                        <p className="text-[13px] font-semibold text-slate-900">{m.name}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">{m.dept} Dept</p>
                                    </div>
                                    <Pill color={i % 2 === 0 ? "green" : "blue"}>{i % 2 === 0 ? "Available" : "Busy"}</Pill>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest uppercase">
                                        <span>Assigned Teams</span>
                                        <span>{i + 1} / 4</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${i > 2 ? 'bg-rose-500' : 'bg-[#6015C1]'}`}
                                            style={{ width: `${((i + 1) / 4) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
