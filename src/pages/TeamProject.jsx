import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Pill, Avatar, Bar, Card, SectionTitle } from "../components/SharedComponents";
import {
    getProject, getUsers, createInvitation, getProjectPool,
    getSettings, createTeam, selectMentor, submitProposal, getTeamInvitations
} from "../api";

export const TeamProject = ({ user }) => {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [invitations, setInvitations] = useState([]);

    // UI States
    const [newTeamName, setNewTeamName] = useState("");
    const [pool, setPool] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [proposal, setProposal] = useState({ title: '', abstract: '', srsUrl: 'https://docs.google.com/upload/mock' });

    // Modals
    const [inviteModal, setInviteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projRes, setRes] = await Promise.all([
                getProject(user._id), // Fetch by user ID (handles team lead reference too)
                getSettings()
            ]);
            setProject(projRes.data);
            setSettings(setRes.data);

            if (projRes.data) {
                const invRes = await getTeamInvitations(projRes.data.id || projRes.data._id);
                setInvitations(invRes.data);
                if (projRes.data.mentor?.id) {
                    setSelectedMentor({
                        _id: projRes.data.mentor.id,
                        name: projRes.data.mentor.name,
                        dept: projRes.data.mentor.dept
                    });
                }
            }

            // Always fetch mentors and pool for combined form stages
            const [mentorsRes, poolRes] = await Promise.all([
                getUsers({ role: 'Mentor', availableMentors: 'true' }),
                getProjectPool()
            ]);
            setMentors(mentorsRes.data);
            setPool(poolRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user._id]);

    // Stage 1: Create Team
    const handleCreateTeam = async () => {
        if (!newTeamName) return;
        try {
            const res = await createTeam({
                teamName: newTeamName,
                teamLeadId: user._id,
                leadName: user.name,
                leadSid: user.sid
            });
            setProject(res.data);
        } catch (err) { alert(err.response?.data?.message || "Creation failed"); }
    };

    // Stage 2: Selection
    const handleSelectMentor = async () => {
        if (!selectedMentor) return;
        try {
            await selectMentor(project.id, {
                mentorId: selectedMentor._id,
                mentorName: selectedMentor.name,
                mentorDept: selectedMentor.dept
            });
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Selection failed"); }
    };

    // Stage 3: Submit Proposal
    const handleSubmitProposal = async () => {
        if (!selectedMentor) return alert("Please select a faculty mentor first!");
        if (!proposal.name) return alert("Please select a project title!");
        if (!proposal.abstract) return alert("Please provide a project abstract!");

        try {
            // 1. Confirm Mentor
            await selectMentor(project.id, {
                mentorId: selectedMentor._id || selectedMentor.id,
                mentorName: selectedMentor.name,
                mentorDept: selectedMentor.dept
            });

            // 2. Submit Proposal
            await submitProposal(project.id, proposal);
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Submission failed"); }
    };

    const [inviteLoading, setInviteLoading] = useState(false);

    const handleSendInvitation = async (invitedUser) => {
        try {
            setInviteLoading(true);
            await createInvitation({
                teamId: project.id,
                invitedUserId: invitedUser._id,
                inviterId: user._id,
                message: `Hey ${invitedUser.name}, join our team ${project.teamName}!`
            });
            alert("Invitation sent!");
            setInviteModal(false);
            setSearch("");
            fetchData();
        } catch (err) { alert(err.response?.data?.message || "Failed"); }
        finally { setInviteLoading(false); }
    };

    const handleDirectInvite = async () => {
        if (!search) return;
        setInviteLoading(true);
        try {
            const res = await getUsers({ search, role: 'Student' });
            // Exact email match
            const found = res.data.find(u => u.email.toLowerCase() === search.toLowerCase());
            if (found) {
                // Check if already in team members
                if (project.members.some(m => m.sid === found.sid)) {
                    alert("User already in team");
                } else if (found.hasTeam) {
                    alert("This student is already a member of another team.");
                } else {
                    await handleSendInvitation(found);
                }
            } else {
                alert("No student found with this email ID!");
            }
        } catch (err) { alert("Search failed"); }
        finally { setInviteLoading(false); }
    };

    useEffect(() => {
        if (search.length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const res = await getUsers({ search, role: 'Student' });
                    // Don't filter out hasTeam users, we want to show their status
                    setSearchResults(res.data);
                } catch (err) { console.error(err); }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else { setSearchResults([]); }
    }, [search, project?.members]);

    const [subTab, setSubTab] = useState("team");

    const renderContent = () => {
        if (loading) return <div className="p-10 text-center font-['Inter'] text-slate-400">Syncing with server...</div>;

        // --- NO TEAM UI ---
        if (!project) {
            return (
                <div className="max-w-2xl mx-auto font-['Poppins'] h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* 1. Illustration at Top */}
                    <div className="mb-8 animate-in fade-in zoom-in duration-700">
                        <img
                            src="/team_creation.png"
                            alt="Team Illustration"
                            className="w-full max-w-[300px] mx-auto drop-shadow-sm"
                        />
                    </div>

                    {/* 2. Heading (Centered) */}
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase mb-2">Formation Stage</h1>

                    {/* 3. Description (Below Heading) */}
                    <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">Create the team to begin your journey with peers and mentors</p>

                    {/* 4. Action Area (Input & Button) */}
                    <div className="w-full max-w-sm space-y-4 px-6">
                        <input
                            placeholder="Enter Team Name..."
                            className="w-full h-14 px-6 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#6015C1]/10 focus:border-[#6015C1]/30 transition-all text-center font-bold text-slate-700 shadow-sm"
                            value={newTeamName}
                            onChange={e => setNewTeamName(e.target.value)}
                        />

                        <button
                            onClick={handleCreateTeam}
                            className="w-full h-14 bg-[#6015C1] text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-purple-100 hover:bg-[#4a0fb0] active:scale-[0.98] transition-all"
                        >
                            Create Team
                        </button>
                    </div>
                </div>
            );
        }

        // --- SHARED WRAPPER FOR ALL STAGES ---
        const isLead = project.teamLead?.toString() === user._id?.toString();

        return (
            <div className="p-7 max-w-6xl mx-auto space-y-6 font-['Poppins']">
                {/* Header & Tabs Standardized */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                    <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-[#6015C1]">
                                <Ico path={I.team || I.user} size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase leading-none">
                                    {project.teamName || "Project Team"}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-400">ID: {project.id}</span>
                                    <span>•</span>
                                    <span>Faculty Mentorship Program</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Pill color={project.status === 'Approved' ? 'green' : 'orange'}>{project.status}</Pill>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {project.members.length} Members Active
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner min-w-[280px]">
                        <button
                            onClick={() => setSubTab('team')}
                            className={`flex-1 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2 ${subTab === 'team' ? 'bg-white text-[#6015C1] shadow-sm border border-slate-100 ring-4 ring-black/[0.02]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Ico path={I.user} size={14} /> Team
                        </button>
                        <button
                            onClick={() => setSubTab('project')}
                            className={`flex-1 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] rounded-xl transition-all flex items-center justify-center gap-2 ${subTab === 'project' ? 'bg-white text-[#6015C1] shadow-sm border border-slate-100 ring-4 ring-black/[0.02]' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Ico path={I.chart} size={14} /> Project
                        </button>
                    </div>
                </div>

                {/* Sub-Tab: TEAM */}
                {subTab === 'team' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Manage Team</h2>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">Manage your team members and their account permissions here.</p>
                            </div>
                            {isLead && project.status === 'Formation' && (
                                <button
                                    onClick={() => setInviteModal(true)}
                                    className="h-10 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center gap-2 hover:scale-[1.02] transition-all"
                                >
                                    <Ico path={I.plus} size={14} /> Invite Member
                                </button>
                            )}
                        </div>

                        <Card className="border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">S.No</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll No</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dept</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Permission</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            ...project.members.map(m => ({ ...m, displayStatus: 'Accepted' })),
                                            ...invitations.filter(i => i.status === 'Pending').map(i => ({
                                                name: i.invitedUserName,
                                                email: i.invitedUserEmail,
                                                sid: i.invitedUserSid,
                                                dept: i.invitedUserDept,
                                                role: 'Member',
                                                displayStatus: 'Pending'
                                            }))
                                        ].map((m, idx) => (
                                            <tr key={m.sid + idx} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-5 text-xs font-bold text-slate-800">{idx + 1}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={m.name} size={32} />
                                                        <span className={`text-[13px] font-bold ${m.displayStatus === 'Pending' ? 'text-slate-400 italic' : 'text-slate-700'}`}>{m.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[12px] font-bold text-slate-600">{m.email || '—'}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter">{m.sid}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[11px] font-bold text-slate-500">{m.dept || 'CS'}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    {m.displayStatus === 'Pending' ? (
                                                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Pending</span>
                                                    ) : (
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${m.role === 'Team Lead' ? 'text-[#6015C1] bg-purple-50' : 'text-emerald-500 bg-emerald-50'} px-3 py-1 rounded-full`}>
                                                            {m.role || 'Member'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    {isLead && m.role !== 'Team Lead' && (
                                                        <button className="p-2 text-rose-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                            <Ico path={I.trash || I.close} size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Sub-Tab: PROJECT */}
                {subTab === 'project' && (
                    <div>
                        {/* 1. Project: FORMATION (Landing Page Style) */}
                        {project.status === 'Formation' && (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="mb-8">
                                    <img
                                        src="/project_selection_illustration_1773164128784.png"
                                        alt="Project Selection"
                                        className="w-full max-w-[320px] mx-auto drop-shadow-2xl"
                                    />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase mb-2">Project Selection</h1>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                                    Finalize your team members in the Management tab to unlock mentor selection and proposal submission.
                                </p>

                                {isLead ? (
                                    <div className="space-y-4">
                                        <button
                                            disabled={project.members.length < 2}
                                            onClick={async () => {
                                                try {
                                                    await selectMentor(project.id, { status: 'MentorSelection' });
                                                    fetchData();
                                                } catch (e) { alert("Failed to move to next stage"); }
                                            }}
                                            className="h-14 px-10 bg-[#6015C1] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-purple-200 hover:bg-[#4a0fb0] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Begin Project Submission
                                        </button>
                                        {project.members.length < 2 && (
                                            <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">
                                                Need at least 2 members to proceed
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="px-6 py-3 bg-slate-100 rounded-full">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Waiting for Team Lead to initiate selection
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2 & 3. Combined stage: MENTOR SELECTION & PROPOSAL SUBMISSION */}
                        {(project.status === 'MentorSelection' || project.status === 'ProposalSubmission' || project.status === 'Rejected') && (
                            <div className="max-w-3xl mx-auto">
                                <Card className="p-8 space-y-8 shadow-sm border-none bg-white rounded-[32px]">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Project Proposal Form</h2>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">Select a mentor and provide your project details below.</p>
                                    </div>

                                    {project.status === 'Rejected' && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
                                            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-rose-500 shrink-0">
                                                <Ico path={I.close} size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Rejection Reason</p>
                                                <p className="text-xs text-rose-800 mt-1 font-medium italic">{project.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        {/* Mentor Selection Searchable Dropdown Inside Form */}
                                        <div className="space-y-3 relative">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Project Mentor</label>

                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#6015C1] transition-colors">
                                                    <Ico path={I.user} size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search mentor by name or department..."
                                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/20 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                                                    value={search}
                                                    onChange={(e) => {
                                                        setSearch(e.target.value);
                                                        if (!e.target.value) setSearchResults([]);
                                                    }}
                                                    onFocus={() => {
                                                        // Show all available mentors on focus if no search
                                                        if (!search) setSearchResults(mentors);
                                                    }}
                                                />
                                                {selectedMentor && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border border-emerald-100">
                                                        <Ico path={I.check} size={10} /> Selected: {selectedMentor.name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && (
                                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[280px] overflow-y-auto no-scrollbar py-2">
                                                    <div className="px-5 py-2 border-b border-slate-50 mb-1">
                                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Available Staff</span>
                                                    </div>
                                                    {searchResults.filter(m =>
                                                        m.name.toLowerCase().includes(search.toLowerCase()) ||
                                                        m.dept.toLowerCase().includes(search.toLowerCase())
                                                    ).map(m => (
                                                        <div
                                                            key={m._id}
                                                            onClick={() => {
                                                                setSelectedMentor(m);
                                                                setSearch("");
                                                                setSearchResults([]);
                                                            }}
                                                            className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Avatar name={m.name} size={30} />
                                                                <div>
                                                                    <p className="text-[13px] font-bold text-slate-700 group-hover:text-[#6015C1] transition-colors">{m.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{m.dept} Department</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-[11px] font-bold text-slate-300 group-hover:text-[#6015C1]/40">Select</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-6 pt-4 border-t border-slate-50">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Proposed Project Title</label>
                                                <select
                                                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none font-bold text-slate-700"
                                                    value={proposal.name}
                                                    onChange={e => setProposal({ ...proposal, name: e.target.value })}
                                                >
                                                    <option value="">Choose from Project Pool...</option>
                                                    {pool.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Project Abstract</label>
                                                <textarea
                                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#6015C1]/10 focus:border-[#6015C1]/30 transition-all min-h-[160px] font-medium text-slate-600 leading-relaxed"
                                                    placeholder="Describe your solution, methodology, and expected outcomes..."
                                                    value={proposal.abstract}
                                                    onChange={e => setProposal({ ...proposal, abstract: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SRS Documentation Link</label>
                                                <input
                                                    className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none font-bold text-slate-700"
                                                    placeholder="Link to GDrive, OneDrive, or Notion..."
                                                    value={proposal.srsUrl}
                                                    onChange={e => setProposal({ ...proposal, srsUrl: e.target.value })}
                                                />
                                            </div>
                                            <button
                                                onClick={handleSubmitProposal}
                                                className="w-full h-14 bg-[#6015C1] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-purple-100 hover:bg-[#4a0fb0] transition-all"
                                            >
                                                Submit Final Proposal
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* 4. Project: PENDING APPROVAL */}
                        {project.status === 'PendingApproval' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center mb-8 relative">
                                    <Ico path={I.clock} size={40} />
                                </div>
                                <h1 className="text-2xl font-bold text-slate-800">Awaiting Proposal Approval</h1>
                                <p className="text-sm text-slate-400 max-w-md mx-auto mt-3 font-medium leading-relaxed">Your project proposal has been submitted to <b>{project.mentor?.name}</b>. You will be notified once they review your submission.</p>

                                <Card className="mt-12 max-w-lg w-full p-8 bg-slate-50/50 border-none shadow-inner rounded-[32px]">
                                    <div className="flex flex-col items-center">
                                        <Pill color="accent">Submission Overview</Pill>
                                        <h3 className="text-sm font-bold text-slate-700 mt-6">{project.name}</h3>
                                        <p className="text-xs text-slate-500 mt-4 italic line-clamp-3 leading-loose px-4">"{project.abstract}"</p>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* 5. Project: APPROVED (Active Dashboard) */}
                        {project.status === 'Approved' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <Card className="p-10 border-none shadow-sm relative overflow-hidden bg-white">
                                        <div className="mb-10">
                                            <Pill color="accent">Project Information</Pill>
                                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight mt-6 uppercase">{project.name}</h2>
                                            <div className="w-12 h-1 bg-[#6015C1] rounded-full mt-4" />
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-4">Abstract & Scope</label>
                                                <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-50 relative">
                                                    <div className="absolute -top-3 left-6 px-3 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400">DETAIL VIEW</div>
                                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                                        "{project.abstract}"
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-6">
                                                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-4">Official Submission</label>
                                                <a href={project.srsUrl} target="_blank" className="inline-flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group">
                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Ico path={I.external || I.link} size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-widest leading-none">SRS Documentation</p>
                                                        <p className="text-[9px] text-white/40 mt-1 uppercase font-bold">View PDF Submission</p>
                                                    </div>
                                                </a>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <div className="space-y-8">
                                    <Card className="p-8 border-none shadow-sm bg-white overflow-hidden">
                                        <div className="mb-8">
                                            <SectionTitle sub="Assigned Academic Head">Project Mentor</SectionTitle>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <Avatar name={project.mentor?.name} size={56} />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-none">{project.mentor?.name}</p>
                                                <p className="text-[10px] text-[#6015C1] font-bold uppercase tracking-widest mt-2">{project.mentor?.dept || 'Faculty Mentor'}</p>
                                            </div>
                                        </div>


                                    </Card>

                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/30">
            {renderContent()}

            {/* Invitation Modal */}
            {inviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !inviteLoading && setInviteModal(false)} />
                    <Card className="relative z-10 w-full max-w-md p-10 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200 rounded-[32px]">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-[#6015C1]">
                                <Ico path={I.email || I.user} size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Invite Member</h2>
                            <p className="text-sm text-slate-400 mt-2">Enter the student's institutional mail ID to send an invitation.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Student Mail ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. arjun.kumar@gmail.com"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#6015C1]/10 focus:border-[#6015C1]/30 transition-all font-bold text-slate-700 shadow-inner"
                                />
                            </div>

                            <button
                                onClick={handleDirectInvite}
                                disabled={inviteLoading || !search}
                                className={`w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg transition-all ${inviteLoading || !search ? 'bg-slate-100 text-slate-300' : 'bg-[#6015C1] text-white shadow-purple-100 hover:scale-[1.02] active:scale-[0.98]'}`}
                            >
                                {inviteLoading ? 'Sending...' : 'Send Invitation'}
                            </button>

                            {/* Suggestions (Subtle) */}
                            {searchResults.length > 0 && (
                                <div className="pt-4 border-t border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Found students</p>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                                        {searchResults.map(u => (
                                            <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <Avatar name={u.name} size={24} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-bold text-slate-600 line-clamp-1">{u.name}</span>
                                                        <p className="text-[9px] text-slate-400 font-medium">{u.email}</p>
                                                    </div>
                                                </div>
                                                {u.hasTeam ? (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded-md">In Team</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSendInvitation(u)}
                                                        className="px-3 py-1 bg-[#6015C1]/10 text-[#6015C1] text-[10px] font-extrabold uppercase rounded-md hover:bg-[#6015C1] hover:text-white transition-all"
                                                    >
                                                        Invite
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setInviteModal(false)}
                            className="w-full mt-6 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-slate-600 transition-all"
                        >
                            Cancel
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};

