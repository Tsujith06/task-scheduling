import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill, Avatar } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getPhases, createPhase, deletePhase, updatePhase, getAllProjects, getReviews } from "../api";

export const ReviewManagement = () => {
    const [phases, setPhases] = useState([]);
    const [teams, setTeams] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState("Phases");
    const [form, setForm] = useState({ title: "", startDate: "", endDate: "", maxMarks: 100, weightage: 25, status: "Upcoming", rubricFile: "" });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, tRes, rRes] = await Promise.all([
                getPhases(), getAllProjects(), getReviews()
            ]);
            setPhases(pRes.data);
            setTeams(tRes.data);
            setReviews(rRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        try {
            await createPhase(form);
            fetchData();
            setShowModal(false);
            setForm({ title: "", startDate: "", endDate: "", maxMarks: 100, weightage: 25, status: "Upcoming", rubricFile: "" });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Calendar & Events 📅</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Review Phases</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-fuchsia-50 text-[#6015C1] text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-fuchsia-100 italic">Academic Planner</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{phases.length} Phases Scheduled</span>
                    </div>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-[#6015C1] rounded-xl h-11 px-5 flex items-center gap-2 font-semibold text-xs shadow-lg shadow-fuchsia-100 text-white">
                    <Ico path={I.plus} size={14} /> Create Phase
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
                {["Phases", "Team Marks"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${tab === t ? "bg-[#6015C1] text-white shadow-lg shadow-[#6015C1]/20 scale-[1.02]" : "text-slate-400 hover:text-[#6015C1] hover:bg-fuchsia-50"}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === "Phases" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-300 font-semibold uppercase tracking-widest">Loading calendar...</div>
                    ) : phases.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-300 font-semibold uppercase tracking-widest">No phases scheduled</div>
                    ) : phases.map((p, i) => (
                        <Card key={i} className="group overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                            <div className="h-2 w-full" style={{ background: p.status === 'Completed' ? '#10B981' : p.status === 'Ongoing' ? '#6015C1' : '#E2E8F0' }} />
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:text-[#6015C1] transition-colors">
                                        <Ico path={I.clock} size={20} />
                                    </div>
                                    <Pill color={p.status === 'Completed' ? 'green' : p.status === 'Ongoing' ? 'accent' : 'gray'}>{p.status}</Pill>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">{p.title}</h3>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase">
                                        <span>Timeline</span>
                                        <span className="text-slate-900">{new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase">
                                        <span>Max Marks</span>
                                        <span className="text-slate-900">{p.maxMarks}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 uppercase">
                                        <span>Weightage</span>
                                        <span className="text-fuchsia-600">{p.weightage}%</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[32px] bg-white">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <SectionTitle sub="System wide evaluation metrics">Team Marks & Progress</SectionTitle>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Project / Team</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mentor</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Review Scores</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">Fetching scores...</td></tr>
                                ) : teams.length === 0 ? (
                                    <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">No active teams found</td></tr>
                                ) : teams.map(t => (
                                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 px-8">
                                            <p className="text-[14px] font-semibold text-slate-900 leading-tight">{t.name}</p>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-1">{t.id}</p>
                                        </td>
                                        <td className="py-5 px-6">
                                            <p className="text-[13px] font-semibold text-slate-600">{t.mentor?.name || 'Unassigned'}</p>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex gap-2">
                                                {/* Displaying mock review scores for each phase */}
                                                {[1, 2, 3].map(phaseNum => {
                                                    // In reality, match phaseId with project marks. For now, mock based on team id length for dynamic feel
                                                    const score = t.id.length * 5 + phaseNum * 5 + Math.floor(Math.random() * 10);
                                                    return (
                                                        <div key={phaseNum} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-fuchsia-50 border border-fuchsia-100 group-hover:bg-[#6015C1] group-hover:text-white transition-all text-[#6015C1]">
                                                            <span className="text-[8px] font-bold uppercase opacity-70 mb-0.5">R{phaseNum}</span>
                                                            <span className="text-sm font-black leading-none">{score > 100 ? 100 : score}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <Pill color={t.status === 'Completed' ? 'green' : 'accent'}>{t.status || 'Active'}</Pill>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <Card className="relative z-10 w-full max-w-xl p-10 bg-white border-none shadow-2xl rounded-[40px]">
                        <SectionTitle sub="Configure evaluation metrics">Add Review Phase</SectionTitle>
                        <div className="grid grid-cols-2 gap-5 mt-8">
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Phase Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Phase 1 - Prototype" className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Start Date</label>
                                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">End Date</label>
                                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Upload Excel Rubric Sheet</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setForm({ ...form, rubricFile: e.target.files[0]?.name })} className="w-full h-14 pl-12 pr-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-[13px] font-semibold text-emerald-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all cursor-pointer shadow-sm" />
                                </div>
                                <p className="text-[10px] text-slate-400 pl-1 mt-1 font-medium">Supports .xlsx, .xls, and .csv formats mapping criteria to maximum marks.</p>
                            </div>
                        </div>
                        <div className="pt-8 flex gap-4">
                            <Button onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-slate-400 font-semibold uppercase tracking-widest">Cancel</Button>
                            <Button onClick={handleSave} className="flex-[2] h-12 bg-[#6015C1] text-white rounded-xl font-semibold uppercase tracking-widest shadow-lg shadow-fuchsia-100">Schedule Review</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
