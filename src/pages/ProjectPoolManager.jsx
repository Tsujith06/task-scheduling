import { useState, useEffect } from "react";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { Ico, I } from "../components/Icons";
import { getProjectPool, addProjectPool, updateProjectPool, deleteProjectPool, getProjects, removeMembers, getUsers, addMember, changeProjectTitle } from "../api";

export const ProjectPoolManager = ({ user }) => {
    const [projects, setProjects] = useState([]); // Pool projects
    const [teams, setTeams] = useState([]); // Team projects
    const [tab, setTab] = useState("Pool");
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', domain: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeProjId, setActiveProjId] = useState(null);
    const [searchStudent, setSearchStudent] = useState("");
    const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
    const [activeTeam, setActiveTeam] = useState(null);
    const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);
    const domainOptions = ["AI", "Web Development", "Cyber Security", "IoT", "General"];

    const fetchPool = async () => {
        try {
            const res = await getProjectPool();
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch pool:", err);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await getProjects();
            setTeams(res.data);
            const userRes = await getUsers({ role: 'Student' });
            setAllStudents(userRes.data);
        } catch (err) {
            console.error("Failed to fetch teams:", err);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            if (tab === "Pool") await fetchPool();
            else await fetchTeams();
            setLoading(false);
        };
        load();
    }, [tab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateProjectPool(editingId, formData);
            } else {
                await addProjectPool(formData);
            }
            setIsModalOpen(false);
            setFormData({ title: '', description: '', domain: '' });
            setEditingId(null);
            fetchPool();
        } catch (err) {
            alert("Action failed: " + err.message);
        }
    };

    const handleEdit = (p) => {
        setFormData({ title: p.title, description: p.description, domain: p.domain });
        setEditingId(p._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this pool entry?")) return;
        try {
            await deleteProjectPool(id);
            fetchPool();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleRemoveMember = async (projId, sid) => {
        if (!window.confirm("Remove this student from the team?")) return;
        try {
            await removeMembers(projId, [sid]);
            fetchTeams();
        } catch (err) {
            alert("Removal failed");
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await addMember(activeProjId, userId);
            setIsAddModalOpen(false);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || "Add failed");
        }
    };

    const handleChangeTitle = async (newTitle) => {
        try {
            // Use custom ID if available, otherwise Mongo ID
            const id = activeTeam.id || activeTeam._id;
            await changeProjectTitle(id, newTitle);
            setIsTitleModalOpen(false);
            fetchTeams();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed: " + (err.message || "Unknown error"));
        }
    };


    return (
        <div className="p-7 max-w-7xl mx-auto font-['Poppins']">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between mb-8">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">Project Pool Manager</h2>

                    {/* Moved Tabs Here */}
                    <div className="mt-8 flex gap-2 p-1.5 bg-white border border-slate-100 rounded-[16px] w-fit shadow-sm">
                        {["Pool", "Teams"].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`px-8 py-3 rounded-[12px] text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${tab === t ? "bg-[#6015C1] text-white shadow-lg shadow-[#6015C1]/20 scale-[1.02]" : "text-slate-400 hover:text-[#6015C1] hover:bg-fuchsia-50/50"}`}>
                                {t === 'Pool' ? 'Project Title' : 'Team Detail'}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === "Pool" && (
                    <button
                        onClick={() => { setFormData({ title: '', description: '', domain: '' }); setEditingId(null); setIsModalOpen(true); }}
                        className="h-[44px] px-8 bg-[#6015C1] text-white rounded-[12px] text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-fuchsia-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border-none"
                    >
                        <Ico path={I.plus} size={20} /> Add New Title
                    </button>
                )}
            </div>

            <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[16px]">
                <div className="overflow-x-auto">
                    {tab === "Pool" ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Project Title</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Domain</th>
                                    <th className="px-6 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">Fetching records...</td></tr>
                                ) : projects.length === 0 ? (
                                    <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">No records found</td></tr>
                                ) : projects.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-[#6015C1] transition-colors">{p.title}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Pill color="accent">{p.domain || 'General'}</Pill>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[13px] text-slate-500 line-clamp-1 max-w-xs">{p.description}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(p)} className="p-2.5 rounded-[12px] bg-slate-100 text-slate-600 hover:bg-fuchsia-50 hover:text-[#6015C1] transition-all">
                                                    <Ico path={I.edit} size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="p-2.5 rounded-[12px] bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                                    <Ico path={I.trash} size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="text-center py-5 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16">S.no</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 min-w-[200px]">Project Title</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">S.ID</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Name</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Roll No</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Mail ID</th>
                                    <th className="text-left py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Mentor</th>
                                    <th className="text-center py-5 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {teams.map((proj, pIdx) => (
                                    proj.members.map((m, mIdx) => (
                                        <tr key={`${proj._id}-${m.sid}`} className="hover:bg-slate-50/50 transition-colors group">
                                            {mIdx === 0 && (
                                                <td rowSpan={proj.members.length} className="py-5 px-4 text-center text-xs font-bold text-slate-400 border-r border-slate-100 align-middle bg-slate-50/30">
                                                    {pIdx + 1}
                                                </td>
                                            )}
                                            {mIdx === 0 && (
                                                <td rowSpan={proj.members.length} className="py-5 px-6 border-r border-slate-100 align-middle bg-white group/title">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <p className="text-[14px] font-bold text-slate-900 leading-tight">{proj.name || 'Untitled Project'}</p>
                                                            <p className="text-[9px] font-black text-fuchsia-400 uppercase mt-1 tracking-tighter opacity-60">{proj.id}</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => { setActiveTeam(proj); setIsTitleModalOpen(true); }}
                                                            className="p-1.5 text-slate-300 hover:text-[#6015C1] hover:bg-fuchsia-50 rounded-lg transition-all opacity-0 group-hover/title:opacity-100"
                                                            title="Change Project Title"
                                                        >
                                                            <Ico path={I.edit} size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="py-4 px-6 text-[13px] font-mono font-bold text-[#6015C1] bg-fuchsia-50/30">S{mIdx + 1}</td>
                                            <td className="py-4 px-6">
                                                <p className="text-[14px] font-semibold text-slate-900 group-hover:text-[#6015C1] transition-colors">{m.name}</p>
                                            </td>
                                            <td className="py-4 px-6 text-[13px] font-mono font-semibold text-slate-500">{m.sid || 'N/A'}</td>
                                            <td className="py-4 px-6 text-[13px] font-semibold text-slate-600">{m.dept}</td>
                                            <td className="py-4 px-6 text-[13px] font-semibold text-slate-600">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span>{m.email}</span>
                                                    <button 
                                                        onClick={() => handleRemoveMember(proj.id || proj._id, m.sid)}
                                                        className="p-1 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Remove Member"
                                                    >
                                                        <Ico path={I.trash} size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            {mIdx === 0 && (


                                                <td rowSpan={proj.members.length} className="py-5 px-8 border-l border-slate-100 align-middle bg-slate-50/10">
                                                    {proj.mentor ? (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[14px] font-bold text-slate-900 leading-tight">{proj.mentor.name}</p>
                                                                <Pill color={
                                                                    proj.mentor.status === 'Active' ? 'green' : 
                                                                    proj.mentor.status === 'Inactive' ? 'gray' : 
                                                                    proj.mentor.status === 'On Leave' ? 'amber' : 
                                                                    proj.mentor.status === 'OD' ? 'blue' : 'green'
                                                                }>{proj.mentor.status || 'Active'}</Pill>
                                                            </div>
                                                            <p className="text-[11px] text-[#6015C1] font-mono font-bold uppercase mt-1">{proj.mentor.sid || 'N/A'}</p>
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1.5">{proj.mentor.dept || 'Department'}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[12px] font-semibold text-slate-300 italic">Not Assigned</p>
                                                    )}
                                                </td>
                                            )}
                                            {mIdx === 0 && (
                                                <td rowSpan={proj.members.length} className="py-5 px-6 border-l border-slate-100 align-middle bg-white text-center">
                                                    <button 
                                                        onClick={() => { setActiveProjId(proj.id || proj._id); setIsAddModalOpen(true); }}
                                                        className="inline-flex items-center justify-center w-10 h-10 bg-[#6015C1] text-white rounded-[12px] hover:scale-110 active:scale-95 transition-all shadow-lg shadow-purple-200"
                                                        title="Add Student"
                                                    >
                                                        <Ico path={I.plus} size={20} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Add Student Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <Card className="relative z-10 w-full max-w-md p-8 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200">
                        <SectionTitle sub="Select from registered students">Add Team Member</SectionTitle>
                        
                        <div className="mb-6 relative">
                            <input 
                                type="text"
                                placeholder="Search by name or ID..."
                                className="w-full h-[44px] pl-10 pr-4 bg-white border border-slate-200 rounded-[8px] text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/10 transition-all font-['Poppins']"
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                <Ico path={I.search} size={16} />
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {allStudents
                                .filter(s => 
                                    (s.name.toLowerCase().includes(searchStudent.toLowerCase()) || s.sid?.toLowerCase().includes(searchStudent.toLowerCase())) &&
                                    !teams.some(t => t.members.some(m => m.email === s.email))
                                )
                                .map(student => (
                                    <div key={student._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono font-bold">{student.sid || 'N/A'}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleAddMember(student._id)}
                                            className="px-4 py-1.5 bg-[#6015C1]/10 text-[#6015C1] text-[10px] font-bold uppercase rounded-[8px] hover:bg-[#6015C1] hover:text-white transition-all shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))
                            }
                            {allStudents.filter(s => !teams.some(t => t.members.some(m => m.email === s.email))).length === 0 && (
                                <p className="text-center py-10 text-slate-400 text-xs italic">No available students found</p>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="mt-6 w-full h-[44px] rounded-[12px] text-slate-400 font-semibold text-xs border border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Close
                        </button>
                    </Card>
                </div>
            )}


            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <Card className="relative z-10 w-full max-w-lg p-8 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200 rounded-[16px]">
                        <SectionTitle sub={editingId ? "Update existing entry" : "Enter project details"}>
                            {editingId ? "Edit Project" : "Add Project Pool Entry"}
                        </SectionTitle>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 ml-1 mb-2 block tracking-tight">Project Title</label>
                                <input
                                    className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/10 focus:border-[#6015C1] transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative group/domain">
                                <label className="text-[11px] font-bold text-slate-700 ml-1 mb-2 block tracking-tight">Domain (e.g. AI, Web, IoT)</label>
                                <div className="relative">
                                    <input
                                        className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/10 focus:border-[#6015C1] transition-all pr-10"
                                        value={formData.domain}
                                        onChange={e => {
                                            setFormData({ ...formData, domain: e.target.value });
                                            setIsDomainDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDomainDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsDomainDropdownOpen(false), 200)}
                                        placeholder="Type or select domain..."
                                        required
                                    />
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/domain:text-[#6015C1] transition-colors">
                                        <Ico path={I.chevronDown} size={16} />
                                    </div>

                                    {isDomainDropdownOpen && (
                                        <div className="absolute z-[110] w-full mt-1 bg-white border border-slate-100 rounded-[12px] shadow-2xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                                            {domainOptions
                                                .filter(d => d.toLowerCase().includes(formData.domain?.toLowerCase() || ""))
                                                .map((d, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData({ ...formData, domain: d });
                                                            setIsDomainDropdownOpen(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-fuchsia-50 hover:text-[#6015C1] transition-all border-b border-slate-50 last:border-none uppercase tracking-wider"
                                                    >
                                                        {d}
                                                    </button>
                                                ))
                                            }
                                            {formData.domain && !domainOptions.some(d => d.toLowerCase() === formData.domain.toLowerCase()) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsDomainDropdownOpen(false)}
                                                    className="w-full text-left px-4 py-3 text-[11px] font-bold text-[#6015C1] bg-fuchsia-50/30 hover:bg-fuchsia-50 transition-all border-t border-slate-100 uppercase tracking-widest"
                                                >
                                                    + Use "{formData.domain}"
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 ml-1 mb-2 block tracking-tight">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-[8px] text-sm outline-none focus:ring-2 focus:ring-[#6015C1]/10 focus:border-[#6015C1] transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-[44px] rounded-[12px] text-slate-400 font-semibold text-xs border border-slate-100 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 h-[44px] bg-[#6015C1] text-white rounded-[12px] text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-50">
                                    {editingId ? "Save Changes" : "Create Entry"}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {/* Change Title Modal */}
            {isTitleModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTitleModalOpen(false)} />
                     <Card className="relative z-10 w-full max-w-md p-8 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200 font-['Poppins'] rounded-[16px]">
                        <SectionTitle sub="Select from available pool">Change Project Title</SectionTitle>
                        
                        <div className="max-h-[400px] overflow-y-auto space-y-2 mt-4 pr-1 custom-scrollbar">
                            {projects
                                .filter(p => !teams.some(t => t.name === p.title))
                                .map(p => (
                                    <button 
                                        key={p._id}
                                        onClick={() => handleChangeTitle(p.title)}
                                        className="w-full text-left p-4 rounded-[12px] border border-slate-100 hover:border-[#6015C1] hover:bg-fuchsia-50/30 transition-all group"
                                    >
                                        <p className="text-sm font-bold text-slate-800 mb-1 group-hover:text-[#6015C1]">{p.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.domain || 'General'}</span>
                                        </div>
                                    </button>
                                ))
                            }
                            {projects.filter(p => !teams.some(t => t.name === p.title)).length === 0 && (
                                <p className="text-center py-10 text-slate-400 text-xs italic">No available project titles found</p>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsTitleModalOpen(false)}
                            className="mt-6 w-full h-[44px] rounded-[12px] text-slate-400 font-semibold text-xs border border-slate-100 hover:bg-slate-50 transition-all font-['Poppins']"
                        >
                            Cancel
                        </button>
                    </Card>
                </div>
            )}
        </div>
    );
};
