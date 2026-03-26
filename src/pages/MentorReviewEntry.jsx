import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getPhases, getAllProjects, updateAttendance } from "../api";

export const MentorReviewEntry = () => {
    const [phases, setPhases] = useState([]);
    const [teams, setTeams] = useState([]);
    const [activePhase, setActivePhase] = useState(null);
    const [activeReview, setActiveReview] = useState(null);
    const [evalTeam, setEvalTeam] = useState(null); // team object for modal
    const [marks, setMarks] = useState({}); // Stores rubric index: score
    const [feedback, setFeedback] = useState("");

    const fetchAll = async () => {
        try {
            const [pRes, tRes] = await Promise.all([getPhases(), getAllProjects()]);
            setPhases(pRes.data);
            setTeams(tRes.data);
            if (pRes.data.length > 0) {
                const firstPhase = pRes.data[0];
                setActivePhase(firstPhase);
                if (firstPhase.reviews?.length > 0) {
                    setActiveReview(firstPhase.reviews[0]);
                }
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handlePhaseChange = (id) => {
        const ph = phases.find(p => p._id === id);
        setActivePhase(ph);
        if (ph?.reviews?.length > 0) {
            setActiveReview(ph.reviews[0]);
        } else {
            setActiveReview(null);
        }
    };

    const handleToggleAttendance = async (projectId, sid, currentStatus, name, memberId) => {
        const nextStatus = currentStatus === "Present" ? "Absent" : "Present";
        try {
            await updateAttendance(projectId, sid, nextStatus, name, memberId);
            await fetchAll();
        } catch (err) { console.error(err); }
    };

    const totalCalculated = Object.values(marks).reduce((a, b) => Number(a) + Number(b), 0);

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto font-inter">
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Evaluation Suite 📊</p>
                    <h2 className="text-slate-900 text-3xl font-black tracking-tight">Academic Assessment</h2>
                </div>
                
                <div className="flex gap-4">
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Phase</p>
                        <select
                            className="bg-white text-slate-900 text-[12px] font-bold px-5 py-3 rounded-2xl border border-slate-100 outline-none cursor-pointer shadow-sm min-w-[200px]"
                            value={activePhase?._id || ""}
                            onChange={e => handlePhaseChange(e.target.value)}
                        >
                            {phases.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Review Session</p>
                        <select
                            disabled={!activePhase?.reviews?.length}
                            className="bg-fuchsia-50 text-[#6015C1] text-[12px] font-bold px-5 py-3 rounded-2xl border border-fuchsia-100 outline-none cursor-pointer shadow-sm min-w-[200px]"
                            value={activeReview?.title || ""}
                            onChange={e => setActiveReview(activePhase.reviews.find(r => r.title === e.target.value))}
                        >
                            {!activePhase?.reviews?.length && <option>No Reviews Configured</option>}
                            {activePhase?.reviews?.map((r, i) => <option key={i} value={r.title}>{r.title}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_8px_40px_rgba(0,0,0,0.03)] bg-white rounded-[32px]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-slate-50/30">
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Identity / Team</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Index</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Student name</th>
                                <th className="px-6 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Registration</th>
                                <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-50">Attend.</th>
                                <th className="px-6 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Administer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((t) => (
                                <optgroup key={t._id} label={t.teamName}>
                                    {t.members?.map((m, idx) => (
                                        <tr key={`${t._id}-${idx}`} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/20 transition-colors">
                                            {idx === 0 && (
                                                <td rowSpan={t.members.length} className="px-6 py-6 border-r border-gray-50 align-middle text-center w-64 bg-white">
                                                    <p className="text-[12px] font-black text-blue-600 uppercase tracking-tight">
                                                        {t.id}
                                                    </p>
                                                    <p className="text-[14px] font-bold text-slate-900 mt-1">{t.teamName || t.name}</p>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 border-r border-gray-50 text-[12px] font-bold text-slate-400 text-center">#{idx + 1}</td>
                                            <td className="px-6 py-4 border-r border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={m.name} size={30} />
                                                    <span className="text-[13px] font-bold text-slate-800">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-r border-gray-50 text-[12px] font-bold text-slate-500 uppercase">{m.sid || "21CSXXX"}</td>
                                            <td className="px-6 py-4 border-r border-gray-50 text-center">
                                                <button
                                                    onClick={() => handleToggleAttendance(t._id || t.id, m.sid, m.status, m.name, m._id)}
                                                    className={`w-28 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${m.status === 'Absent' ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"}`}
                                                >
                                                    {m.status || "Present"}
                                                </button>
                                            </td>
                                            {idx === 0 && (
                                                <td rowSpan={t.members.length} className="px-6 py-4 align-middle text-center bg-white/30 w-44">
                                                    <button
                                                        onClick={() => { setEvalTeam(t); setMarks({}); setFeedback(""); }}
                                                        disabled={!activeReview}
                                                        className="px-6 py-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-900 text-[11px] font-black uppercase tracking-widest hover:border-[#6015C1] hover:text-[#6015C1] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                                    >
                                                        Marking Entry
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </optgroup>
                            )).map(group => group.props.children)}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Assessment Modal */}
            {evalTeam && activeReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setEvalTeam(null)} />
                    <Card className="relative z-10 w-full max-w-5xl p-10 bg-white border-none shadow-2xl rounded-[48px] max-h-[92vh] flex flex-col">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Pill color="accent">{activePhase?.title}</Pill>
                                    <Ico path={I.arrow} size={12} style={{ color: '#DDD' }} />
                                    <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">{activeReview?.title}</span>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Evaluating {evalTeam.teamName || evalTeam.name}</h1>
                            </div>
                            <button onClick={() => setEvalTeam(null)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors">
                                <Ico path={I.plus} size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                            <div className="grid grid-cols-1 gap-6">
                                {activeReview.rubrics?.map((rub, ri) => (
                                    <Card key={ri} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-8 group">
                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2 group-hover:text-[#6015C1] transition-colors">{rub.title}</h4>
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{rub.description || "Evaluation criteria specified in rubrics."}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 min-w-[150px]">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Score / {rub.maxMarks}</p>
                                            <input
                                                type="number"
                                                max={rub.maxMarks}
                                                min={0}
                                                value={marks[ri] || ""}
                                                onChange={e => setMarks({ ...marks, [ri]: e.target.value })}
                                                className="w-24 h-16 bg-white border-none shadow-sm rounded-2xl text-center text-2xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-fuchsia-100 transition-all font-inter"
                                            />
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="mt-8 space-y-3">
                                <label className="text-[11px] font-black text-slate-300 uppercase tracking-widest ml-4">Mentor Feedback & Narrative</label>
                                <textarea
                                    value={feedback}
                                    onChange={e => setFeedback(e.target.value)}
                                    placeholder="Briefly describe the team's performance or areas for improvement..."
                                    className="w-full h-32 p-8 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-700 font-medium text-sm outline-none focus:bg-white focus:border-fuchsia-200 transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Performance</span>
                                <div className="flex items-end gap-2 text-3xl font-black text-slate-900">
                                    <span>{totalCalculated}</span>
                                    <span className="text-lg text-slate-200">/ {activeReview?.maxMarks}</span>
                                </div>
                            </div>
                            <Button className="h-16 px-12 rounded-3xl bg-[#6015C1] text-white font-black uppercase tracking-[0.3em] shadow-2xl shadow-fuchsia-100 hover:scale-[1.02] active:scale-95 transition-all text-xs flex items-center justify-center gap-3 border-none">
                                <Ico path={I.check} size={20} /> Publish Assessment
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
