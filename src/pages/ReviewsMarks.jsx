import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Bar, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getReviews } from "../api";

export const ReviewsMarks = ({ user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getReviews();
                setReviews(res.data);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const teamMembers = ["Arjun Kumar", "Priya Singh", "Rohit Das", "Sneha M"];

    // Calculate total marks (of completed reviews)
    const completed = reviews.filter(r => r.status === "Completed");
    let totalMarks = 0;
    completed.forEach(r => {
        Object.values(r.scores).forEach(s => {
            if (typeof s === 'number') totalMarks += s;
        });
    });
    // Scale it to be per-person average for summary or just show team total? 
    // Let's do team total scaled to /200 correctly as per UI.
    const avgTotal = completed.length > 0 ? Math.round(totalMarks / (teamMembers.length * completed.length)) : 0;

    const summary = [
        { label: "Reviews Done", value: completed.length.toString(), unit: "/ 3", icon: I.check, color: "#10B981" },
        { label: "Overall Performance", value: avgTotal.toString(), unit: "/ 100", icon: I.star, color: "#6015C1" },
        { label: "Current Grade", value: avgTotal > 80 ? "A" : (avgTotal > 70 ? "B" : "C"), unit: "", icon: I.award, color: "#F59E0B" },
    ];

    return (
        <div className="p-7 space-y-7 max-w-7xl mx-auto">
            {/* Header / Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.map((s, i) => (
                    <Card key={i} className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow border border-[#e3e3e3]">
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

            <div className="space-y-7">
                {/* Review Phases */}
                <Card className="p-6 border border-[#e3e3e3]">
                    <SectionTitle sub="Team evaluation timeline and individual marks">Team Review Phases</SectionTitle>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest min-w-[150px]">Phase</th>
                                    {teamMembers.map(m => (
                                        <th key={m} className="text-center py-3 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">{m.split(' ')[0]}</th>
                                    ))}
                                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest min-w-[300px]">Mentor Remarks</th>
                                    <th className="text-left py-3 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {reviews.map(r => (
                                    <tr key={r._id || r.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <p className="text-[13px] font-semibold text-slate-900">{r.phase}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{r.date}</p>
                                        </td>
                                        {teamMembers.map(m => (
                                            <td key={m} className="py-4 px-2 text-center text-[13px] font-semibold text-[#6015C1]">
                                                {r.scores[m]}
                                            </td>
                                        ))}
                                        <td className="py-4 px-4">
                                            <p className="text-[12px] text-slate-600 italic leading-relaxed">"{r.remarks}"</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Pill color={r.status === "Completed" ? "green" : "accent"}>{r.status}</Pill>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
