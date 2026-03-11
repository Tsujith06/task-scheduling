import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { getWorklogs, updateWorklog } from "../api";
import { Button } from "../components/ui/button";

export const MentorTaskMonitoring = () => {
    const [worklogs, setWorklogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewLog, setReviewLog] = useState(null); // { log, type: 'Approved' | 'Declined' }
    const [tempRemark, setTempRemark] = useState("");

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await getWorklogs();
            setWorklogs(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, []);

    const handleSubmitReview = async () => {
        if (!reviewLog) return;
        try {
            await updateWorklog(reviewLog.log._id, {
                status: reviewLog.type,
                remarks: tempRemark
            });
            setReviewLog(null);
            setTempRemark("");
            fetchLogs();
        } catch (err) { alert("Failed to update worklog"); }
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Live Execution Monitor 📡</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Worklog Approvals</h2>
                    <p className="text-slate-500 text-[11px] font-semibold mt-2 uppercase tracking-wider">Review and validate student weekly progress</p>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-slate-50/50">
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Student</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Week / Date</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Task Details</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em] border-r border-gray-100">Status</th>
                                <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.15em]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {worklogs.map((log) => (
                                <tr key={log._id} className="border-b border-gray-50 last:border-b-0 group hover:bg-slate-50/20 transition-colors">
                                    <td className="px-6 py-4 border-r border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Avatar name={log.userName} size={32} />
                                            <div>
                                                <p className="text-[13px] font-semibold text-slate-900 leading-tight">{log.userName}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">21CS045</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-gray-100">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-semibold text-[#6015C1] uppercase tracking-tighter">{log.week}</p>
                                            <p className="text-[12px] font-medium text-slate-500">{new Date(log.date).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-r border-gray-100 w-64 lg:w-96">
                                        <p className="text-[13px] font-semibold text-slate-900 mb-1">{log.task}</p>
                                        <p className="text-[11px] text-slate-500 italic line-clamp-2">"{log.description}"</p>
                                        {log.remarks && (
                                            <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Mentor Remarks</p>
                                                <p className="text-[10px] text-slate-600 font-medium italic">"{log.remarks}"</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-r border-gray-100">
                                        <Pill color={log.status === 'Approved' ? 'green' : log.status === 'Declined' ? 'red' : 'amber'}>
                                            {log.status || 'Pending'}
                                        </Pill>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => {
                                                    setReviewLog({ log, type: 'Approved' });
                                                    setTempRemark(log.remarks || "");
                                                }}
                                                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-semibold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-emerald-100"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReviewLog({ log, type: 'Declined' });
                                                    setTempRemark(log.remarks || "");
                                                }}
                                                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-semibold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {reviewLog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setReviewLog(null)} />
                    <Card className="relative z-10 w-full max-w-md p-8 bg-white border-none shadow-2xl rounded-[32px]">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${reviewLog.type === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                <Ico path={reviewLog.type === 'Approved' ? I.check : (I.close || I.x)} size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 uppercase tracking-tight">
                                {reviewLog.type === 'Approved' ? 'Approve' : 'Reject'} Submission
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-2">{reviewLog.log.userName} • {reviewLog.log.week}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Add Remarks / Feedback</label>
                            <textarea
                                className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-fuchsia-200 outline-none transition-all resize-none"
                                placeholder={`Why is this being ${reviewLog.type === 'Approved' ? 'approved' : 'rejected'}?`}
                                value={tempRemark}
                                onChange={(e) => setTempRemark(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button
                                onClick={() => setReviewLog(null)}
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl text-slate-400 font-semibold uppercase tracking-widest text-[11px]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitReview}
                                className={`flex-[2] h-12 rounded-xl text-white font-semibold uppercase tracking-widest text-[11px] shadow-lg ${reviewLog.type === 'Approved' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}
                            >
                                Confirm {reviewLog.type === 'Approved' ? 'Approval' : 'Rejection'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

