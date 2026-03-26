import { useState, useEffect } from "react";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { getPhases } from "../api";

export const ReviewManagement = ({ user, setPage, setSelectedReview }) => {
    const [phases, setPhases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getPhases();
            setPhases(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleViewMarks = (rev) => {
        setSelectedReview(rev);
        setPage('review-details');
    };


    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto font-inter">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">{user?.name || "Administrator"}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-[#6015C1] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-xl border border-purple-200">System Governance</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Review & Marks Management</span>
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] rounded-[30px] bg-white">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                    <SectionTitle sub="Currently active and scheduled evaluations">Master Review List</SectionTitle>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest w-20">S.No</th>
                                <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Review Title</th>
                                <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Start Date</th>
                                <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">End Date</th>
                                <th className="text-center py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-center py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="py-20 text-center"><div className="w-6 h-6 border-2 border-[#6015C1]/20 border-t-[#6015C1] rounded-full animate-spin mx-auto pb-4" /></td></tr>
                            ) : phases.flatMap(p => p.reviews || []).length === 0 ? (
                                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews found</td></tr>
                            ) : phases.flatMap(p => p.reviews || []).map((rev, idx) => {
                                const now = new Date();
                                const start = new Date(rev.startDate);
                                const end = new Date(rev.endDate);
                                let status = "Upcoming";
                                let color = "accent";
                                if (now >= start && now <= end) { status = "Ongoing"; color = "blue"; }
                                if (now > end) { status = "Completed"; color = "green"; }
                                
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6 px-8 text-sm font-bold text-slate-400">
                                            {String(idx + 1).padStart(2, '0')}
                                        </td>
                                        <td className="py-6 px-8">
                                            <p className="text-[14px] font-black text-slate-800">{rev.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight group-hover:text-[#6015C1]">Parent Phase: {phases.find(p => p.reviews?.includes(rev))?.title}</p>
                                        </td>
                                        <td className="py-6 px-8 text-[13px] font-medium text-slate-600">
                                            {new Date(rev.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-6 px-8 text-[13px] font-medium text-slate-600">
                                            {new Date(rev.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <Pill color={color}>{status}</Pill>
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <button 
                                                onClick={() => handleViewMarks(rev)}
                                                className="px-5 py-2 rounded-xl bg-slate-50 text-[#6015C1] text-[10px] font-black uppercase tracking-widest border border-[#6015C1]/10 hover:bg-[#6015C1] hover:text-white transition-all shadow-sm active:scale-95"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
