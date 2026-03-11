import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Pill, Avatar, Bar, Card, SectionTitle } from "../components/SharedComponents";
import { getTasks, getProject, getUsers, getPhases } from "../api";

export const Dashboard = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [taskRes, projRes, userRes, phasesRes] = await Promise.all([
                    getTasks(),
                    getProject('ALPHA-001'),
                    getUsers({ role: 'Student' }),
                    getPhases()
                ]);

                setTasks(taskRes.data);
                setProject(projRes.data);
                setPhases(phasesRes.data);

                // Map contributions
                const students = userRes.data.map(s => ({
                    name: s.name,
                    done: taskRes.data.filter(t => t.assignee === s.name && t.status === "Completed").length,
                    total: taskRes.data.filter(t => t.assignee === s.name).length,
                    you: s.email === user?.email
                }));
                setMembers(students);

            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.email]);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const progress = tasks.filter(t => t.status === "In Progress").length;
    const pending = tasks.filter(t => t.status === "To-Do").length;

    const stats = [
        { label: "Total Tasks", value: total.toString(), icon: I.chart, color: "#6015C1", bg: "#EEF2FF" },
        { label: "Completed", value: completed.toString(), icon: I.check, color: "#10B981", bg: "#ECFDF5", sub: `${total > 0 ? Math.round((completed / total) * 100) : 0}% done` },
        { label: "In Progress", value: progress.toString(), icon: I.clock, color: "#F59E0B", bg: "#FFFBEB" },
        { label: "Pending", value: pending.toString(), icon: I.alert, color: "#EF4444", bg: "#FEF2F2" },
    ];



    if (loading) return <div className="p-10 text-center text-slate-400 font-semibold animate-pulse">Loading synchronized data...</div>;

    return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-[#6015C1] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-xl border border-purple-200">Team Alpha</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Project Mentor: Dr. Ramesh V</span>
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
                                {s.sub && <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>{s.sub}</p>}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                <Card className="p-6 xl:col-span-3">
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
                        {phases.length === 0 && (
                            <p className="text-[12px] text-slate-400 font-medium">No upcoming reviews</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6 xl:col-span-2">
                    <SectionTitle sub="Tasks completed per member">Contributions</SectionTitle>
                    <div className="space-y-4">
                        {members.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar name={m.name} size={30} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs font-medium text-gray-700 truncate">
                                            {m.name} {m.you && <Pill color="accent">You</Pill>}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{m.done}/{m.total}</span>
                                    </div>
                                    <Bar pct={Math.round(m.done / m.total * 100)} color={m.you ? "#6015C1" : "#10B981"} h={5} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>


        </div>
    );
};
