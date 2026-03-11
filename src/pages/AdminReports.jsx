import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getLeaves, updateLeave, getReviews } from "../api";

export const AdminReports = () => {
    const [tab, setTab] = useState("performance");
    const [leaves, setLeaves] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [lRes, rRes] = await Promise.all([
                getLeaves(),
                getReviews()
            ]);
            setLeaves(lRes.data);
            setReviews(rRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLeaveStatus = async (id, status) => {
        try {
            await updateLeave(id, { status });
            fetchData();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Academic Audit 📈</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Reports & Approvals</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-slate-50 text-slate-900 text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200">Post-Evaluation</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Audit Active</span>
                    </div>
                </div>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                    {["performance", "approvals"].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-widest transition-all ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {tab === "performance" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                    <Card className="p-7">
                        <SectionTitle sub="Class-wide distribution">Team Performance</SectionTitle>
                        <div className="mt-6 space-y-6">
                            {reviews.map((r, i) => (
                                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 font-semibold group-hover:text-[#6015C1] group-hover:border-[#6015C1]/20 transition-all">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[13px] font-semibold text-slate-900 mb-0.5">Team {r.phase.split(' ')[0]} - Phase {r.phase.slice(-1)}</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Avg Marks: {Object.values(r.scores).reduce((a, b) => a + b, 0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-semibold text-slate-900">{((Object.values(r.scores).reduce((a, b) => a + b, 0) / 100) * 100).toFixed(0)}%</p>
                                        <Pill color="green">Top 10%</Pill>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-7">
                        <SectionTitle sub="Activity distribution">System Engagement</SectionTitle>
                        <div className="mt-8 space-y-8">
                            {[
                                { label: "Task Completion Rate", val: 78, color: "#6015C1" },
                                { label: "Log Submission Rate", val: 92, color: "#10B981" },
                                { label: "Review Compliance", val: 64, color: "#F59E0B" },
                                { label: "Attendance Avg", val: 88, color: "#3B82F6" },
                            ].map((s, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                        <span>{s.label}</span>
                                        <span style={{ color: s.color }}>{s.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.val}%`, backgroundColor: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 pt-8 border-t border-slate-50">
                            <Button className="w-full bg-slate-900 h-14 rounded-[20px] font-semibold uppercase tracking-widest text-white flex items-center justify-center gap-3">
                                <Ico path={I.upload} size={16} /> Export Consolidated Report (PDF)
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {tab === "approvals" && (
                <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[32px]">
                    <div className="p-8 border-b border-slate-50">
                        <SectionTitle sub="Leave and reschedule requests">Mentor Approvals</SectionTitle>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-left py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mentor</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Review Date</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Reason</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-center py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-slate-300 font-semibold uppercase tracking-widest text-xs">Fetching requests...</td></tr>
                                ) : leaves.length === 0 ? (
                                    <tr><td colSpan="5" className="py-20 text-center text-slate-300 font-semibold uppercase tracking-widest text-xs">No pending requests</td></tr>
                                ) : leaves.map(l => (
                                    <tr key={l._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <Avatar name={l.mentorName} size={36} />
                                                <p className="text-[13px] font-semibold text-slate-900">{l.mentorName}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-[13px] font-semibold text-slate-600">{new Date(l.reviewDate).toLocaleDateString()}</td>
                                        <td className="py-5 px-6 text-[13px] text-slate-400 italic">"{l.reason}"</td>
                                        <td className="py-5 px-6">
                                            <Pill color={l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'gray'}>{l.status}</Pill>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex justify-center gap-2">
                                                {l.status === 'Pending' ? (
                                                    <>
                                                        <button onClick={() => handleLeaveStatus(l._id, 'Approved')} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-widest hover:bg-emerald-100 transition-all">Approve</button>
                                                        <button onClick={() => handleLeaveStatus(l._id, 'Rejected')} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-100 transition-all">Reject</button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] font-semibold text-slate-300 uppercase italic">Locked</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};
