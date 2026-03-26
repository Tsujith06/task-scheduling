import { useState, useEffect, useCallback } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Bar, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getWorklogs, createWorklog, deleteWorklog, getProjects, getPhases } from "../api";

export const Worklog = ({ user }) => {
    // Reference Project Deadline (from TeamProject phases)
    const DEADLINE = "2024-05-10"; // May 10, 2024

    const [entries, setEntries] = useState([]);
    const [weeksConfig, setWeeksConfig] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deadlineDate, setDeadlineDate] = useState(DEADLINE);

    const [form, setForm] = useState({
        week: "",
        date: new Date().toISOString().split('T')[0],
        task: "",
        hours: "",
        desc: ""
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const [logsRes, projRes, phaseRes] = await Promise.all([
                getWorklogs(),
                getProjects(),
                getPhases()
            ]);
            
            setEntries(logsRes.data);

            const curName = user?.name?.trim().toLowerCase();
            const myProj = projRes.data.find(p => p.members?.some(m => m.email === user?.email || m.name?.toLowerCase() === curName));
            
            const phases = phaseRes.data || [];
            
            if (myProj) {
                // Determine Approval Date
                const approvalDate = myProj.approvalDate ? new Date(myProj.approvalDate) : (myProj.createdAt ? new Date(myProj.createdAt) : new Date());
                
                // Determine Last Phase Date
                let lastPhaseDate = new Date(); // fallback
                if (phases.length > 0) {
                    const latestPhase = phases.reduce((latest, p) => {
                        return new Date(p.endDate) > new Date(latest.endDate) ? p : latest;
                    }, phases[0]);
                    if (latestPhase.endDate) lastPhaseDate = new Date(latestPhase.endDate);
                }

                setDeadlineDate(lastPhaseDate.toISOString().split('T')[0]);

                // Generate weeks
                const generatedWeeks = [];
                let currentStart = new Date(approvalDate);
                
                // Set to nearest Monday if needed, or simply start from exact date
                currentStart.setHours(0,0,0,0);
                
                let weekNum = 1;
                while (currentStart <= lastPhaseDate) {
                    let currentEnd = new Date(currentStart);
                    currentEnd.setDate(currentEnd.getDate() + 6);
                    
                    const fmtOptions = { month: 'short', day: 'numeric' };
                    generatedWeeks.push({
                        id: `Week ${weekNum}`,
                        label: `Week ${weekNum} (${currentStart.toLocaleDateString('en-US', fmtOptions)} - ${currentEnd.toLocaleDateString('en-US', fmtOptions)})`,
                        startDate: new Date(currentStart),
                        endDate: new Date(currentEnd),
                        weekNum
                    });
                    
                    currentStart.setDate(currentStart.getDate() + 7);
                    weekNum++;
                }
                
                setWeeksConfig(generatedWeeks);
                
                if (generatedWeeks.length > 0) {
                    setForm(prev => ({ ...prev, week: generatedWeeks[0].id }));
                }
            }
        } catch (err) {
            console.error("Failed to fetch worklog configuration:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    
    const loggedWeekIds = new Set(entries.map(e => e.week));
    const currentWeekTarget = weeksConfig.find(w => new Date() >= w.startDate && new Date() <= w.endDate) || weeksConfig[weeksConfig.length - 1];
    
    const summary = [
        { label: "Current Week", value: currentWeekTarget ? currentWeekTarget.weekNum : "00", unit: weeksConfig.length > 0 ? `/ ${weeksConfig.length}` : "", icon: I.clock, color: "#6015C1" },
        { label: "Final Deadline", value: new Date(deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), unit: "", icon: I.alert, color: "#F43F5E" },
        { label: "Weeks Logged", value: entries.length.toString(), icon: I.check, color: "#10B981" },
    ];

    const handleDelete = async (id) => {
        try {
            await deleteWorklog(id);
            fetchLogs();
        } catch (err) {
            console.error("Failed to delete worklog:", err);
        }
    };

    const handleSave = async () => {
        try {
            await createWorklog({
                userId: user?._id || "65ed7f9f9b1e2c3d4e5f6a7b",
                userName: user?.name || "Student Name",
                week: form.week,
                date: form.date,
                task: form.task,
                description: form.desc
            });
            fetchLogs();
            setShowModal(false);
            setForm({ ...form, desc: "", hours: "" });
        } catch (err) {
            console.error("Failed to save worklog:", err);
        }
    };



    return (
        <div className="p-7 space-y-7 max-w-7xl mx-auto pb-20">
            {/* Current Week Log Reminder */}
            <div className="bg-[#6015C1] rounded-3xl p-9 flex items-center justify-between overflow-hidden relative shadow-lg shadow-fuchsia-100">
                <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 text-white">
                    <Ico path={I.clock} size={280} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-[10px] font-semibold uppercase tracking-[0.1em]">Current Action</span>
                            <span className="text-fuchsia-200 font-semibold text-xs uppercase tracking-widest">{currentWeekTarget ? currentWeekTarget.id : "No Active Week"}</span>
                        </div>
                        <h2 className="text-white text-[24px] font-semibold mb-3 tracking-tight">Log Productivity for this Week</h2>
                        <p className="text-fuchsia-100 text-sm font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Finalize your weekly entries before the upcoming deadline.
                        </p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center px-8 py-4 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <p className="text-[10px] font-semibold text-fuchsia-200 uppercase tracking-widest mb-1.5">Deadline Date</p>
                            <p className="text-2xl font-semibold text-white tracking-tight">{currentWeekTarget ? new Date(currentWeekTarget.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}</p>
                        </div>
                        <Button onClick={() => setShowModal(true)} className="bg-white text-[#6015C1] hover:bg-fuchsia-50 h-16 px-10 rounded-2xl font-semibold text-base shadow-2xl shadow-black/20 transition-all hover:scale-[1.03] active:scale-[0.97]">
                            <Ico path={I.plus} size={20} cls="mr-2.5" /> Add Worklog
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summary.map((s, i) => (
                    <Card key={i} className="p-5 flex items-center gap-4 border border-[#e3e3e3]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: s.color + "15", color: s.color }}>
                            <Ico path={s.icon} size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                            <p className="text-xl font-semibold text-slate-900">{s.value}<span className="text-xs font-medium text-slate-400 ml-0.5">{s.unit}</span></p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-7">
                {/* Section 2: History */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <SectionTitle sub="Full trail for mentor review">Historical Worklogs</SectionTitle>

                    </div>
                    <div className="space-y-4">
                        {entries.map(e => (
                            <div key={e.id} className="group p-5 border border-slate-100 rounded-2xl bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold text-[#6015C1] bg-fuchsia-50 px-2 py-0.5 rounded uppercase tracking-widest">{e.week}</span>
                                            <span className="text-slate-200 text-xs text-[10px]">·</span>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{e.date}</span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#6015C1] transition-colors">{e.task || e.title}</h3>
                                        {e.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{e.description}</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                                <Ico path={I.eye} size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(e._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                                <Ico path={I.trash} size={14} />
                                            </button>
                                        </div>
                                        <Pill color={e.status === "Approved" ? "green" : (e.status === "Rejected" || e.status === "Declined") ? "red" : "amber"}>
                                            {e.status}
                                        </Pill>
                                    </div>
                                </div>
                                <p className="text-[13px] text-slate-500 leading-relaxed mb-4">{e.desc}</p>

                                { (e.status === "Rejected" || e.status === "Declined") && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex gap-3">
                                        <Ico path={I.alert} size={14} cls="text-rose-600 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mb-0.5">Rejection Reason</p>
                                            <p className="text-[12px] text-rose-700 font-medium leading-relaxed">{e.remarks || e.rejectReason}</p>
                                        </div>
                                    </div>
                                )}

                                {e.mentorNote && (
                                    <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-3">
                                        <Ico path={I.check} size={14} cls="text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">Mentor Note</p>
                                            <p className="text-[12px] text-emerald-700 font-medium leading-relaxed">{e.mentorNote}</p>
                                        </div>
                                    </div>
                                )}


                            </div>
                        ))}

                        {/* Empty Weeks Visual Guide */}
                        {weeksConfig.filter(w => !loggedWeekIds.has(w.id)).length > 0 && (
                            <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Upcoming Required Logs</p>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 opacity-60">
                                    {weeksConfig.filter(w => !loggedWeekIds.has(w.id)).slice(0, 4).map((w, i) => (
                                        <div key={i} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-1 items-start justify-center">
                                            <span className="text-xs font-semibold text-slate-600 block">{w.id}</span>
                                            <span className="text-[9px] font-semibold text-slate-400 block whitespace-nowrap">{new Date(w.startDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})} - {new Date(w.endDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                                        </div>
                                    ))}
                                    {weeksConfig.filter(w => !loggedWeekIds.has(w.id)).length > 4 && (
                                         <div className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-center opacity-50">
                                            <span className="text-xs font-semibold text-slate-400 block">+{weeksConfig.filter(w => !loggedWeekIds.has(w.id)).length - 4} more</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Modal Popup */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <Card className="relative z-10 w-full max-w-xl p-8 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                            <Ico path={I.plus} size={20} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                        <SectionTitle sub="Mandatory Weekly Update">Add Worklog Entry</SectionTitle>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Week</label>
                                <select value={form.week} onChange={e => setForm({ ...form, week: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#6015C1]/10">
                                    {weeksConfig.map(w => (
                                        <option key={w.id} value={w.id} disabled={loggedWeekIds.has(w.id)}>
                                            {w.label} {loggedWeekIds.has(w.id) ? "(Logged)" : ""}
                                        </option>
                                    ))}
                                    {weeksConfig.length === 0 && <option value="">No timeline available</option>}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Task / Title</label>
                                <input value={form.task} onChange={e => setForm({ ...form, task: e.target.value })} placeholder="Short title for your work" className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#6015C1]/10" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contribution Detail</label>
                                <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Describe specifically what you completed this week..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/10 min-h-[120px] resize-none" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-slate-500 font-semibold border border-slate-100 hover:bg-slate-50">
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="flex-[2] h-12 bg-[#6015C1] hover:bg-[#4A0D97] rounded-xl font-semibold tracking-wide shadow-lg shadow-fuchsia-100">
                                    Save Entry
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
