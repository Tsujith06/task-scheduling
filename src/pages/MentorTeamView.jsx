import { useState, useEffect, useCallback } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill, Bar } from "../components/SharedComponents";
import { getTasks } from "../api";

const Ic = ({ d, size = 16, color = "currentColor", cls = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d={d} />
    </svg>
);

const P = {
    search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    plus: "M12 5v14M5 12h14",
    x: "M18 6L6 18M6 6l12 12",
    dots: "M5 12h.01M12 12h.01M19 12h.01",
    flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
    task: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
    trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    log: "M12 20V10M18 20V4M6 20v-4",
    epic: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

const PriorityBadge = ({ p }) => {
    const cfg = {
        Highest: { cls: "bg-rose-100 text-rose-600", dot: "▲" },
        High: { cls: "bg-amber-100 text-amber-600", dot: "▲" },
        Medium: { cls: "bg-fuchsia-100 text-[#6015C1]", dot: "●" },
        Low: { cls: "bg-emerald-100 text-emerald-600", dot: "▼" },
    };
    const c = cfg[p] || cfg.Medium;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${c.cls}`}>
            {c.dot} {p}
        </span>
    );
};

const CategoryTag = ({ label }) => {
    const colorMap = {
        "Development": "text-sky-600 bg-sky-50",
        "Testing": "text-emerald-600 bg-emerald-50",
        "Documentation": "text-indigo-600 bg-indigo-50",
        "Designing": "text-[#6015C1] bg-fuchsia-50"
    };
    const cls = colorMap[label] || colorMap["Designing"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-transparent ${cls}`}>
            <Ic d={P.epic} size={10} /> {label}
        </span>
    );
};

const TaskCard = ({ task }) => (
    <div className={`transition-all duration-200 border rounded-2xl p-4 mb-3 bg-white ${task.flagged ? "border-rose-200 shadow-[0_0_10px_rgba(254,202,202,0.5)]" : "border-slate-200/60"}`}>
        <div className="flex justify-between items-center mb-2.5">
            <CategoryTag label={task.cat} />
            <div className="flex gap-1.5 items-center">
                {task.flagged && <Ic d={P.flag} size={14} color="#ef4444" />}
            </div>
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug mb-2">{task.title}</p>
        <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#6015C1] font-semibold bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-100">
                    <Ic d={P.task} size={10} color="#6015C1" /> T{task._id ? task._id.slice(-4) : '...'}
                </span>
                <PriorityBadge p={task.priority} />
            </div>
            <div className="flex items-center gap-1.5">
                <Avatar name={task.assignee} size={28} />
            </div>
        </div>
    </div>
);

const COL_CFG = {
    "To-Do": { color: "#6015C1", bg: "bg-slate-50 border-slate-200" },
    "In Progress": { color: "#f59e0b", bg: "bg-amber-50/40 border-amber-100" },
    "Completed": { color: "#10b981", bg: "bg-emerald-50/40 border-emerald-100" },
};

export const MentorTeamView = ({ team, goBack }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
            const memberNames = team.members.map(m => m.name);
            const teamTasks = res.data.filter(t => memberNames.includes(t.assignee));
            setTasks(teamTasks);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (team) fetchTasks();
    }, [team]);

    const colTasks = col => tasks.filter(t => t.status === col);

    // Calculate Contributions
    const memberContributions = team.members.map(m => {
        const done = tasks.filter(t => t.assignee === m.name && t.status === "Completed").length;
        const total = tasks.filter(t => t.assignee === m.name).length;
        return { name: m.name, done, total };
    });

    if (loading) return <div className="p-10 text-center text-slate-400 font-semibold animate-pulse">Loading team data...</div>;

    return (
        <div className="space-y-6">
            <button onClick={goBack} className="text-[#6015C1] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
                ← Back to Dashboard
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{team.name}</h2>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Project ID: {team.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

                {/* Board */}
                <Card className="xl:col-span-3 p-6 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <SectionTitle sub="Live execution tracking">Team Task Board</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 items-start">
                        {["To-Do", "In Progress", "Completed"].map(col => {
                            const cfg = COL_CFG[col];
                            const ct = colTasks(col);
                            return (
                                <div key={col} className={`border-[1.5px] rounded-3xl p-4 transition-colors min-h-[400px] flex flex-col ${cfg.bg}`}>
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-[15px] font-semibold text-slate-900">{col}</span>
                                            <span className="min-w-[24px] h-6 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center px-1.5 shadow-sm">{ct.length}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto no-scrollbar pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {ct.map(t => <TaskCard key={t._id} task={t} />)}
                                        {ct.length === 0 && <div className="border-2 border-dashed border-slate-200/70 rounded-2xl py-8 px-4 text-center mt-2 bg-white/40"><p className="text-[13px] font-medium text-slate-400">No tasks here</p></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Contributions */}
                <Card className="p-6 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <SectionTitle sub="Tasks completed per member">Contributions</SectionTitle>
                    <div className="space-y-6 mt-6">
                        {memberContributions.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar name={m.name} size={30} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-gray-700 truncate">
                                            {m.name}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0 font-bold">{m.done}/{m.total}</span>
                                    </div>
                                    <Bar pct={m.total > 0 ? Math.round((m.done / m.total) * 100) : 0} color="#10B981" h={5} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

            </div>
        </div>
    );
};
