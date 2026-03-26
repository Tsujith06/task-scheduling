import { useState, useEffect } from "react";
import { Card, SectionTitle, Pill, Avatar } from "../components/SharedComponents";
import { getAllProjects, getReviews } from "../api";

export const ReviewDetailsView = ({ review, setPage, user }) => {
    const [projects, setProjects] = useState([]);
    const [allReviewData, setAllReviewData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pRes, rRes] = await Promise.all([
                    getAllProjects(),
                    getReviews()
                ]);
                setProjects(pRes.data);
                setAllReviewData(rRes.data);
            } catch (err) {
                console.error("Error fetching detail data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentReviewMarks = allReviewData.find(r => r.phase === review?.title) || {};
    const scores = currentReviewMarks.scores || {};

    // Analytics calculations
    const allMembers = projects.flatMap(p => p.members || []);
    const totalStudents = allMembers.length;
    const presentCount = allMembers.filter(m => m.status !== 'Absent').length;
    const absentCount = allMembers.filter(m => m.status === 'Absent').length;
    const completedCount = allMembers.filter(m => scores[m.name] !== undefined && scores[m.name] !== '').length;
    const pendingCount = totalStudents - completedCount;

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto font-inter">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button 
                        onClick={() => setPage('phases')}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#6015C1] transition-colors mb-4 group"
                    >
                        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Back to Reviews</span>
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                        {review?.title || "Review Details"} 
                        <span className="ml-4 text-slate-300 font-medium normal-case text-xl">Assessment Matrix</span>
                    </h2>
                </div>
                {review && (
                    <div className="flex gap-4">
                        <Card className="px-6 py-3 flex flex-col items-center justify-center border-slate-100 bg-white/50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Marks</span>
                            <span className="text-xl font-black text-[#6015C1]">{review.maxMarks}</span>
                        </Card>
                    </div>
                )}
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Present Card */}
                <Card className="p-6 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white rounded-[24px]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 flex-shrink-0 shadow-sm border border-emerald-100/50">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{presentCount}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Present</p>
                            <p className="text-[10px] font-extrabold text-emerald-500 mt-2">{presentCount} present</p>
                        </div>
                    </div>
                </Card>

                {/* Absent Card */}
                <Card className="p-6 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white rounded-[24px]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0 shadow-sm border border-rose-100/50">
                            <span className="text-2xl font-bold">+</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{absentCount}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Absent</p>
                            <p className="text-[10px] font-extrabold text-rose-500 mt-2">{absentCount} absent</p>
                        </div>
                    </div>
                </Card>

                {/* Pending Card */}
                <Card className="p-6 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white rounded-[24px]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 flex items-center justify-center text-[#6015C1] flex-shrink-0 shadow-sm border border-fuchsia-100/50">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{pendingCount}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Pending by Mentor</p>
                            <p className="text-[10px] font-extrabold text-[#6015C1] mt-2">{pendingCount} pending</p>
                        </div>
                    </div>
                </Card>

                {/* Completed Card */}
                <Card className="p-6 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] bg-white rounded-[24px]">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-sm border border-amber-100/50">
                            <span className="text-2xl font-bold">⋮</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{completedCount}</h3>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Completed Review</p>
                            <p className="text-[10px] font-extrabold text-amber-500 mt-2">{completedCount} completed</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] rounded-[40px] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-slate-100">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-20 border border-slate-100">S.No</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Project Title</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Mentor</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">S.ID</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Name</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Roll No</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Department</th>
                                <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Mail ID</th>
                                <th className="text-center py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-100">Mark</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="10" className="py-32 text-center border border-slate-100">
                                    <div className="w-10 h-10 border-4 border-[#6015C1]/10 border-t-[#6015C1] rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading assessment matrix...</p>
                                </td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan="10" className="py-32 text-center border border-slate-100">
                                    <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">No evaluation data available</p>
                                </td></tr>
                            ) : projects.map((proj, pIdx) => (
                                proj.members?.map((m, mIdx) => (
                                    <tr key={`${proj._id}-${mIdx}`} className="hover:bg-slate-50/30 transition-colors group">
                                        {mIdx === 0 && (
                                            <>
                                                <td rowSpan={proj.members.length} className="py-8 px-8 text-[12px] font-black text-slate-300 border border-slate-100 align-top">
                                                    {String(pIdx + 1).padStart(2, '0')}
                                                </td>
                                                <td rowSpan={proj.members.length} className="py-8 px-8 border border-slate-100 align-top min-w-[200px] bg-white text-slate-800">
                                                    <p className="text-[14px] font-black leading-tight group-hover:text-[#6015C1] transition-colors">{proj.name || "Untitled Project"}</p>
                                                    <p className="text-[10px] text-[#6015C1] font-black uppercase mt-2 opacity-60">{proj.id}</p>
                                                </td>
                                                <td rowSpan={proj.members.length} className="py-8 px-8 border border-slate-100 align-top bg-white">
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-[13px] font-black text-slate-800">{proj.mentor?.name || "Dr. Ramesh V"}</p>
                                                        <p className="text-[10px] text-[#6015C1] font-black uppercase opacity-60 tracking-wider mt-1">{proj.mentor?._id || "MID-10029"}</p>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                        <td className="py-6 px-8 text-[12px] font-bold text-[#6015C1] border border-slate-100">S{mIdx + 1}</td>
                                        <td className="py-6 px-8 text-[13px] font-black text-slate-800 border border-slate-100">{m.name}</td>
                                        <td className="py-6 px-8 text-[12px] font-bold text-slate-500 border border-slate-100">{m.sid}</td>
                                        <td className="py-6 px-8 text-[12px] font-bold text-slate-500 uppercase border border-slate-100">{m.dept || "CSE"}</td>
                                        <td className="py-6 px-8 text-[12px] font-medium text-slate-400 border border-slate-100">{m.email}</td>
                                        
                                        <td className="py-6 px-8 text-center font-black text-slate-900 bg-slate-50/10 border border-slate-100">
                                            {scores[m.name] || "—"}
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
