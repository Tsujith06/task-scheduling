import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getUsers, createUser, updateUser, deleteUser } from "../api";

export const UserManagement = () => {
    const [tab, setTab] = useState("Student");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: "", email: "", password: "password", sid: "", dept: "", role: "Student", status: "Active"
    });

    const fetchUsers = async (role) => {
        try {
            setLoading(true);
            const res = await getUsers({ role });
            setUsers(res.data);
        } catch (err) {
            console.error("Fetch users failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(tab);
    }, [tab]);

    const handleSave = async () => {
        try {
            if (editMode) {
                await updateUser(form._id, form);
            } else {
                await createUser({ ...form, role: tab });
            }
            fetchUsers(tab);
            setShowModal(false);
            setForm({ name: "", email: "", password: "password", sid: "", dept: "", role: tab, status: "Active" });
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleEdit = (u) => {
        setForm(u);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteUser(id);
            fetchUsers(tab);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.sid?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">User Directory 👥</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Management</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-fuchsia-50 text-[#6015C1] text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-fuchsia-100 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-fuchsia-500" />
                            Admin Console
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">{users.length} Registered Accounts</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative w-64">
                        <Ico path={I.chart} size={15} cls="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            placeholder={`Search ${tab}s...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:border-fuchsia-400 focus:bg-white transition-all"
                        />
                    </div>
                    <Button onClick={() => { setEditMode(false); setForm({ ...form, role: tab }); setShowModal(true); }} className="bg-[#6015C1] rounded-xl h-11 px-5 flex items-center gap-2 font-semibold text-xs shadow-lg shadow-fuchsia-100 text-white">
                        <Ico path={I.plus} size={14} /> Add {tab}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1.5 bg-white border border-slate-100 rounded-2xl w-fit shadow-sm">
                {["Student", "Mentor", "Admin"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${tab === t ? "bg-[#6015C1] text-white shadow-lg shadow-[#6015C1]/20 scale-[1.02]" : "text-slate-400 hover:text-[#6015C1] hover:bg-fuchsia-50"}`}>
                        {t}
                    </button>
                ))}
            </div>

            <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[32px]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="text-left py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Profile</th>
                                <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Department</th>
                                <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Email Address</th>
                                <th className="text-left py-5 px-6 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-center py-5 px-8 text-[10px] font-semibold text-slate-400 uppercase tracking-widest min-w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">Fetching records...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-semibold uppercase tracking-widest text-xs">No records found</td></tr>
                            ) : filtered.map(u => (
                                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-4">
                                            <Avatar name={u.name} size={42} />
                                            <div>
                                                <p className="text-[14px] font-semibold text-slate-900 group-hover:text-[#6015C1] transition-colors">{u.name}</p>
                                                <p className="text-[11px] text-slate-400 font-semibold font-mono uppercase">{u.sid || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <p className="text-[13px] font-semibold text-slate-600">{u.dept || '—'}</p>
                                    </td>
                                    <td className="py-5 px-6">
                                        <p className="text-[13px] font-semibold text-slate-600 truncate max-w-[200px]">{u.email}</p>
                                    </td>
                                    <td className="py-5 px-6">
                                        <Pill color={u.status === 'Active' ? 'green' : 'gray'}>{u.status}</Pill>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className="flex justify-center gap-2 transition-opacity">
                                            <button onClick={() => handleEdit(u)} className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-fuchsia-50 hover:text-[#6015C1] transition-all">
                                                <Ico path={I.edit} size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(u._id)} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                                                <Ico path={I.trash} size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <Card className="relative z-10 w-full max-w-2xl p-10 bg-white border-none shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200 rounded-[40px]">
                        <button onClick={() => setShowModal(false)} className="absolute right-8 top-8 p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                            <Ico path={I.plus} size={20} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                        <SectionTitle sub={`System Account setup`}>{editMode ? 'Update' : 'Register'} {tab}</SectionTitle>

                        <div className="grid grid-cols-2 gap-6 mt-8">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/30 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">{tab === 'Student' ? 'Reg No' : 'Employee ID'}</label>
                                <input value={form.sid} onChange={e => setForm({ ...form, sid: e.target.value })} placeholder={tab === 'Student' ? "e.g. 21CS001" : "e.g. EMP001"} className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/30 transition-all font-mono" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@college.edu" className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/30 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Department</label>
                                <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/30 transition-all appearance-none cursor-pointer">
                                    <option value="">Select Dept</option>
                                    <option>CSE</option>
                                    <option>IT</option>
                                    <option>ECE</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest pl-1">Account Status</label>
                                <select value={form.status || "Active"} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] outline-none focus:ring-4 focus:ring-[#6015C1]/5 focus:border-[#6015C1]/30 transition-all appearance-none cursor-pointer">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-10 flex gap-4">
                            <Button onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-400 font-bold border border-slate-100 uppercase tracking-widest hover:bg-slate-50 hover:text-slate-600 transition-all">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} className="flex-[2] h-14 bg-[#6015C1] hover:bg-[#4A0D97] rounded-2xl font-bold uppercase tracking-[0.1em] shadow-2xl shadow-[#6015C1]/30 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                {editMode ? 'Save Changes' : `Add ${tab}`}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
