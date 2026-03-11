import { useState, useEffect } from "react";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { Ico, I } from "../components/Icons";
import { getProjectPool, addProjectPool, updateProjectPool, deleteProjectPool } from "../api";

export const ProjectPoolManager = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', domain: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchPool = async () => {
        try {
            const res = await getProjectPool();
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch pool:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPool();
    }, []);

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
        if (!window.confirm("Delete this project from the pool?")) return;
        try {
            await deleteProjectPool(id);
            fetchPool();
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div className="p-7 max-w-6xl mx-auto font-['Poppins']">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Project Pool</h1>
                    <p className="text-sm text-slate-400">Manage available project titles for students</p>
                </div>
                <button
                    onClick={() => { setFormData({ title: '', description: '', domain: '' }); setEditingId(null); setIsModalOpen(true); }}
                    className="h-11 px-6 bg-[#6015C1] text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-100 hover:bg-[#4a0fb0] transition-all flex items-center gap-2"
                >
                    <Ico path={I.plus} size={16} /> Add New Project
                </button>
            </div>

            <Card className="overflow-hidden border-none shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project Title</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Domain</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {projects.map((p) => (
                                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Pill color="accent">{p.domain || 'General'}</Pill>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-[13px] text-slate-500 line-clamp-1 max-w-xs">{p.description}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-[#6015C1] transition-all">
                                                <Ico path={I.edit} size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-rose-500 transition-all">
                                                <Ico path={I.trash} size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                        No projects in the pool. Start by adding one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <Card className="relative z-10 w-full max-w-lg p-8 bg-white border-none shadow-2xl animate-in zoom-in-95 duration-200">
                        <SectionTitle sub={editingId ? "Update existing entry" : "Enter project details"}>
                            {editingId ? "Edit Project" : "Add Project Pool Entry"}
                        </SectionTitle>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Project Title</label>
                                <input
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Domain (e.g. AI, Web, IoT)</label>
                                <input
                                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                                    value={formData.domain}
                                    onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 rounded-xl text-slate-400 font-semibold text-xs border border-slate-100 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 h-11 bg-[#6015C1] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-50">
                                    {editingId ? "Save Changes" : "Create Entry"}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
