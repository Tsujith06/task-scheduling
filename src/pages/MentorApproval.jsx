import { useState, useEffect } from "react";
import { Card, SectionTitle, Pill, Avatar } from "../components/SharedComponents";
import { Ico, I } from "../components/Icons";
import { getProjects, reviewProposal, getPhases } from "../api";

export const MentorApproval = ({ user }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isSelectionActive, setIsSelectionActive] = useState(false);

    const fetchTeams = async () => {
        try {
            const [projRes, phasesRes] = await Promise.all([
                getProjects({ mentorId: user._id }),
                getPhases()
            ]);
            setTeams(projRes.data);
            
            if (phasesRes && phasesRes.data) {
                const psPhase = phasesRes.data.find(p => p.title?.toLowerCase() === 'project selection');
                setIsSelectionActive(psPhase && (psPhase.status === 'Ongoing' || psPhase.status === 'Active'));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [user._id]);

    const handleReview = async (teamId, status) => {
        if (!isSelectionActive) return alert("Project Selection Phase is not active. You cannot review proposals right now.");
        if (status === 'Rejected' && !rejectionReason) {
            alert("Please provide a reason for rejection");
            return;
        }
        try {
            await reviewProposal(teamId, { status, rejectionReason });
            alert(`Project ${status}!`);
            setSelectedTeam(null);
            setRejectionReason("");
            fetchTeams();
        } catch (err) {
            alert("Review failed");
        }
    };

    if (loading) return <div className="p-7 text-center">Loading teams...</div>;

    const pendingTeams = teams.filter(t => t.status === 'PendingApproval');
    const processedTeams = teams.filter(t => t.status !== 'PendingApproval' && t.status !== 'Formation' && t.status !== 'MentorSelection');

    return (
        <div className="p-7 max-w-6xl mx-auto font-['Poppins']">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-[#6015C1]">
                            <Ico path={I.folder} size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase leading-none">Approval Queue</h1>
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-400">Section: Project Reviews</span>
                                <span>•</span>
                                <span>Academic Session 2024-25</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Pill color="accent">{pendingTeams.length} Pending</Pill>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {processedTeams.length} Proccessed Teams
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending List */}
                <div className="space-y-4">
                    <SectionTitle sub={`${pendingTeams.length} teams waiting`}>Pending Review</SectionTitle>
                    {pendingTeams.map(team => (
                        <Card
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            className={`p-5 cursor-pointer transition-all ${selectedTeam?.id === team.id ? 'border-2 border-[#6015C1] shadow-lg' : 'hover:border-slate-200'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-[#6015C1] uppercase tracking-wider mb-1">{team.teamName}</p>
                                    <h3 className="text-sm font-semibold text-slate-800">{team.name || "Untitled Project"}</h3>
                                </div>
                                <Pill color="accent">Review Required</Pill>
                            </div>
                        </Card>
                    ))}
                    {pendingTeams.length === 0 && (
                        <p className="text-sm text-slate-400 italic py-4">No pending proposals at the moment.</p>
                    )}

                    <div className="pt-8">
                        <SectionTitle sub="History of your reviews">Previously Processed</SectionTitle>
                        <div className="space-y-3">
                            {processedTeams.map(team => (
                                <div key={team.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${team.status === 'Approved' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                        <p className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">{team.teamName}</p>
                                    </div>
                                    <Pill color={team.status === 'Approved' ? 'green' : 'red'}>{team.status}</Pill>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details View */}
                <div>
                    {selectedTeam ? (
                        <Card className="p-8 sticky top-7 border-none shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 leading-tight uppercase tracking-tight">{selectedTeam.teamName}</h2>
                                    <p className="text-xs font-bold text-[#6015C1] mt-1">{selectedTeam.name || "Untitled Project"}</p>
                                </div>
                                <Avatar name={selectedTeam.members?.[0]?.name} size={48} />
                            </div>

                            <div className="space-y-6 mb-8">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Abstract</label>
                                    <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                                        {selectedTeam.abstract}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">SRS Document</label>
                                    <a href={selectedTeam.srsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-[#6015C1]/5 rounded-xl border border-[#6015C1]/10 text-[#6015C1] hover:bg-[#6015C1]/10 transition-all">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            📄
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold">View Submission.pdf</p>
                                            <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">External Document</p>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Team Composition</label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTeam.members.map(m => (
                                            <div key={m.sid} className="px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-500">
                                                {m.name} ({m.sid})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <textarea
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/5 transition-all resize-none"
                                    placeholder="Enter feedback or rejection reason..."
                                    rows="3"
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleReview(selectedTeam.id, 'Rejected')}
                                        className="flex-1 h-12 rounded-xl text-rose-500 font-bold text-xs uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all"
                                    >
                                        Reject Proposal
                                    </button>
                                    <button
                                        onClick={() => handleReview(selectedTeam.id, 'Approved')}
                                        className="flex-2 h-12 bg-[#6015C1] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#4a0fb0] transition-all"
                                    >
                                        Approve Project
                                    </button>
                                </div>
                            </div>
                            
                            {!isSelectionActive && (
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest text-center mt-4">
                                    Review actions are locked: Project Selection Phase is not active.
                                </p>
                            )}
                        </Card>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-300">
                            <div className="text-4xl mb-4">🔍</div>
                            <p className="text-sm font-medium">Select a team from the left to review</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
