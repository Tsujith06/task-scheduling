import { Ico, I } from "../components/Icons";
import { Pill, Avatar, Bar, Card, SectionTitle } from "../components/SharedComponents";

export const Dashboard = () => {
    const stats = [
        { label: "Total Tasks", value: "26", icon: I.chart, color: "#6015C1", bg: "#EEF2FF" },
        { label: "Completed", value: "18", icon: I.check, color: "#10B981", bg: "#ECFDF5", sub: "+3 this week" },
        { label: "In Progress", value: "5", icon: I.clock, color: "#F59E0B", bg: "#FFFBEB" },
        { label: "Pending", value: "3", icon: I.alert, color: "#EF4444", bg: "#FEF2F2", sub: "2 overdue" },
    ];

    const members = [
        { name: "Arjun Kumar", done: 6, total: 8, you: true },
        { name: "Priya Singh", done: 5, total: 7 },
        { name: "Rohit Das", done: 4, total: 6 },
        { name: "Sneha M", done: 5, total: 5 },
    ];

    const milestones = [
        { label: "Requirements", pct: 100, color: "#10B981", status: "Done" },
        { label: "System Design", pct: 75, color: "#6015C1", status: "Active" },
        { label: "Development", pct: 40, color: "#3B82F6", status: "Active" },
        { label: "Testing", pct: 0, color: "#E5E7EB", status: "Pending" },
    ];

    const feed = [
        { text: "Mentor commented on System Design doc", time: "2h ago", color: "#6015C1" },
        { text: "Task 'API Integration' marked complete", time: "5h ago", color: "#10B981" },
        { text: "New task 'UI Testing' assigned to you", time: "1d ago", color: "#F59E0B" },
        { text: "Milestone 2 deadline updated to Apr 20", time: "2d ago", color: "#3B82F6" },
    ];

    const notifs = [
        { title: "Review Scheduled", desc: "Apr 15, 10:00 AM", color: "#6015C1" },
        { title: "Deadline Reminder", desc: "Phase 2 — 3 days left", color: "#EF4444" },
        { title: "New Task Assigned", desc: "'Unit Testing' added", color: "#10B981" },
    ];

    return (
        <div className="p-7 space-y-5 max-w-7xl mx-auto">
            {/* Hero banner */}
            <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
                style={{ background: "linear-gradient(135deg,#4A0D97 0%,#6015C1 50%,#7A22E1 100%)" }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 90% 50%,white 0%,transparent 55%)" }} />
                <div className="relative z-10">
                    <p className="text-fuchsia-200 text-xs font-medium mb-0.5">Good morning 👋</p>
                    <h2 className="text-white text-xl font-bold tracking-tight">Arjun Kumar</h2>
                    <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                        <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-lg">Team Alpha</span>
                        <span className="text-fuchsia-200 text-xs">Smart Attendance System · Dr. Ramesh V</span>
                    </div>
                </div>
                <div className="relative z-10 text-right hidden md:block">
                    <p className="text-fuchsia-200 text-[10px] uppercase tracking-widest font-semibold">Overall Progress</p>
                    <p className="text-white text-5xl font-bold mt-1">54%</p>
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
                                <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
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
                    <SectionTitle sub="Phase-wise completion">Milestones</SectionTitle>
                    <div className="space-y-4">
                        {milestones.map((m, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-28 text-xs text-gray-500 font-medium flex-shrink-0">{m.label}</div>
                                <div className="flex-1"><Bar pct={m.pct} color={m.color} /></div>
                                <span className="w-9 text-right text-xs font-bold" style={{ color: m.pct === 0 ? "#D1D5DB" : m.color }}>{m.pct}%</span>
                                <div className="w-16">
                                    <Pill color={m.status === "Done" ? "green" : m.status === "Active" ? "accent" : "gray"}>{m.status}</Pill>
                                </div>
                            </div>
                        ))}
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

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Card className="p-6">
                    <SectionTitle sub="Latest updates">Recent Activity</SectionTitle>
                    <div className="space-y-4">
                        {feed.map((f, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: f.color }} />
                                <div>
                                    <p className="text-[13px] text-gray-700 leading-snug">{f.text}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">{f.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <SectionTitle sub="Alerts & reminders">Notifications</SectionTitle>
                    <div className="space-y-2.5">
                        {notifs.map((n, i) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl"
                                style={{ background: n.color + "0D", border: `1px solid ${n.color}22` }}>
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: n.color }} />
                                <div>
                                    <p className="text-[13px] font-semibold text-gray-800">{n.title}</p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{n.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
