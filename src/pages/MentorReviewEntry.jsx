import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getPhases, getAllProjects, updateAttendance } from "../api";

export const MentorReviewEntry = () => {
    const [phases, setPhases] = useState([]);
    const [teams, setTeams] = useState([]);
    const [activePhase, setActivePhase] = useState(null);
    const [evalTeam, setEvalTeam] = useState(null); // team object for modal
    const [marks, setMarks] = useState({ lit: 0, comp: 0 });
    const [feedback, setFeedback] = useState("");

    const fetchAll = async () => {
        try {
            const [pRes, tRes] = await Promise.all([getPhases(), getAllProjects()]);
            setPhases(pRes.data);
            setTeams(tRes.data);
            if (pRes.data.length > 0) setActivePhase(pRes.data[0]);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleToggleAttendance = async (projectId, sid, currentStatus, name, memberId) => {
        const nextStatus = currentStatus === "Present" ? "Absent" : "Present";
        try {
            await updateAttendance(projectId, sid, nextStatus, name, memberId);
            await fetchAll();
        } catch (err) { console.error(err); }
    };

    const total = Object.values(marks).reduce((a, b) => Number(a) + Number(b), 0);

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Evaluation Protocol 📑</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Mark Submission</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <select
                            className="bg-fuchsia-50 text-[#6015C1] text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-xl border border-fuchsia-100 outline-none cursor-pointer"
                            onChange={e => setActivePhase(phases.find(p => p._id === e.target.value))}
                        >
                            {phases.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                        </select>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Weightage: {activePhase?.weightage}%</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Project name</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">S.no</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Name</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Roll no</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Dept</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Category</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Attendance</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((t) => (
                                <optgroup key={t._id} label={t.teamName}>
                                    {t.members?.map((m, idx) => (
                                        <tr key={`${t._id}-${idx}`} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/20 transition-colors">
                                            {idx === 0 && (
                                                <td rowSpan={t.members.length} className="px-6 py-4 border-r border-gray-100 align-middle text-center w-64 bg-white/50">
                                                    <p className="text-[11px] font-semibold text-blue-600 uppercase leading-tight tracking-tight">
                                                        {t.id} - {t.teamName || t.name}
                                                    </p>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">S{idx + 1}</td>
                                            <td className="px-6 py-4 border-r border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={m.name} size={24} />
                                                    <span className="text-[13px] font-semibold text-slate-900">{m.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">{m.sid || "7376231CS145"}</td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">{m.dept || "CSE"}</td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-[13px] font-semibold text-slate-500">Internal</td>
                                            <td className="px-6 py-4 border-r border-gray-100 text-center">
                                                <button
                                                    onClick={() => handleToggleAttendance(t._id || t.id, m.sid, m.status, m.name, m._id)}
                                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${m.status === 'Absent' ? "bg-rose-50 text-rose-500 border border-rose-100" : m.status === 'Late' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}
                                                >
                                                    {m.status || "Present"}
                                                </button>
                                            </td>
                                            {idx === 0 && (
                                                <td rowSpan={t.members.length} className="px-6 py-4 align-middle text-center bg-white/30">
                                                    <button
                                                        onClick={() => setEvalTeam(t)}
                                                        className="px-4 py-2 rounded-xl border-2 border-blue-100 text-blue-500 text-[11px] font-semibold uppercase tracking-widest hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                                                    >
                                                        Enter Mark
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

            {/* Evaluation Modal */}
            {evalTeam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEvalTeam(null)} />
                    <Card className="relative z-10 w-full max-w-4xl p-10 bg-white border-none shadow-2xl rounded-[40px] max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <SectionTitle sub={`Phase: ${activePhase?.title}`}>Team Assessment</SectionTitle>
                                <div className="mt-2 flex items-center gap-3">
                                    <Avatar name={evalTeam.teamName} size={32} />
                                    <span className="text-xl font-semibold text-slate-900">{evalTeam.teamName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden border border-gray-100 rounded-2xl mb-10">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-gray-100">S.no</th>
                                        <th className="px-6 py-4 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-gray-100">Evaluation Parameters</th>
                                        <th className="px-6 py-4 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-gray-100">Total Mark</th>
                                        <th className="px-6 py-4 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-gray-100">Enter mark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { id: 'lit', label: 'Literature Survey', max: 5 },
                                        { id: 'comp', label: 'Choice of Components / Modules / Equipment for System Development (Preparing the equipment / component list - An Exhaustive list of possible Modern Tools / Components / Equipment that may be used to implement the project is provided, together with a brief comparative study on specification of system being developed / analyzed)', max: 5 },
                                    ].map((m, i) => (
                                        <tr key={m.id} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/20 transition-colors">
                                            <td className="px-6 py-4 text-[13px] font-semibold text-slate-500 w-20">{i + 1}</td>
                                            <td className="px-6 py-4 text-[13px] font-medium text-slate-600 leading-relaxed pr-10">{m.label}</td>
                                            <td className="px-6 py-4 text-center text-[13px] font-semibold text-slate-900 w-32">{m.max}</td>
                                            <td className="px-6 py-4 w-40">
                                                <input
                                                    type="number"
                                                    max={m.max}
                                                    value={marks[m.id] || 0}
                                                    onChange={e => setMarks({ ...marks, [m.id]: e.target.value })}
                                                    className="w-full h-10 bg-white border-2 border-blue-100 rounded-xl text-center text-[13px] font-semibold text-slate-900 outline-none focus:border-blue-400 transition-all"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-50/80">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-center text-[11px] font-semibold text-slate-900 uppercase tracking-[0.2em]">Total Marks</td>
                                        <td className="px-6 py-4 text-center text-[13px] font-semibold text-slate-900">10</td>
                                        <td className="px-6 py-4 text-center text-[13px] font-semibold text-blue-600 border-l border-gray-100">{total}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] block px-1">Professional Feedback / Context</label>
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder="Provide context on evaluation..."
                                className="w-full h-24 p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:bg-white transition-all resize-none"
                            />
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-50 flex gap-4">
                            <Button onClick={() => setEvalTeam(null)} className="flex-1 h-12 rounded-xl bg-white border border-slate-200 text-slate-400 font-semibold uppercase tracking-widest hover:bg-slate-50 text-[11px]">Close</Button>
                            <Button className="flex-[3] h-12 rounded-xl bg-blue-600 text-white font-semibold uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-[11px]">
                                <Ico path={I.check} size={16} /> Publish Final Marks
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
};
