import { useState, useEffect, useCallback } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Avatar, Pill, Bar } from "../components/SharedComponents";
import { getTasks, createTask, updateTask, deleteTask } from "../api";
import { Button } from "../components/ui/button";

const Ic = ({ d, size = 16, color = "currentColor", cls = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d={d} />
    </svg>
);

const P = {
    search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    plus: "M12 5v14M5 12h14",
    x: "M18 6L6 18M6 6l12 12",
    dots: "M5 12h.01M12 12h.01M19 12h.01",
    flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
    task: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
    trash: "M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
    epic: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
};

const PriorityBadge = ({ p }) => {
    const cfg = {
        Highest: { cls: "bg-rose-100 text-rose-600", dot: "▲" },
        High: { cls: "bg-amber-100 text-amber-600", dot: "▲" },
        Medium: { cls: "bg-fuchsia-100 text-[#6015C1]", dot: "●" },
        Low: { cls: "bg-emerald-100 text-emerald-600", dot: "▼" },
    };
    const c = cfg[p] || cfg.Medium;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${c.cls}`}>
            {c.dot} {p}
        </span>
    );
};

const CategoryTag = ({ label }) => {
    const colorMap = {
        "Development": "text-sky-600 bg-sky-50",
        "Testing": "text-emerald-600 bg-emerald-50",
        "Documentation": "text-indigo-600 bg-indigo-50",
        "Designing": "text-[#6015C1] bg-fuchsia-50"
    };
    const cls = colorMap[label] || colorMap["Designing"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-transparent ${cls}`}>
            <Ic d={P.epic} size={10} /> {label}
        </span>
    );
};

const TaskCard = ({ task, onEdit, onDelete, onApprove, onPreview }) => (
    <div className={`transition-all duration-200 border rounded-[12px] p-4 mb-3 bg-white ${task.flagged ? "border-rose-200 shadow-[0_0_10px_rgba(254,202,202,0.5)]" : "border-slate-200/60"}`}>
        <div className="flex justify-between items-center mb-2.5">
            <CategoryTag label={task.cat} />
            <div className="flex gap-1 items-center">
                {task.flagged && <Ic d={P.flag} size={14} color="#ef4444" />}
                <button onClick={() => onEdit(task)} className="p-1 rounded-lg text-slate-400 hover:text-[#6015C1] hover:bg-fuchsia-50 transition-all" title="Edit Task">
                    <Ic d={P.edit} size={14} />
                </button>
                <button onClick={() => onDelete(task._id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Delete Task">
                    <Ic d={P.trash} size={14} />
                </button>
            </div>
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug mb-2">{task.title}</p>
        {task.desc && <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{task.desc}</p>}

        {task.attachmentUrl && (
            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                        Submitted Proof • {new Date(task.submittedAt || task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <div className="flex-1 h-[1px] bg-slate-100" />
                </div>
                {task.attachmentUrl.startsWith('data:image') ? (
                    <div
                        onClick={() => onPreview(task.attachmentUrl)}
                        className="w-full h-32 rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50 group/thumb relative cursor-zoom-in"
                    >
                        <img src={task.attachmentUrl} alt="Proof" className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105" />
                        <div className="absolute inset-0 bg-black/5 group-hover/thumb:bg-transparent transition-colors flex items-center justify-center opacity-0 group-hover/thumb:opacity-100">
                            <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">View Fullscreen</span>
                        </div>
                    </div>
                ) : (
                    <a
                        href={task.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all group/proof"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                            <Ic d={P.task} size={16} color="#10B981" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider truncate">{task.attachmentName || "Attached Proof Document"}</p>
                        </div>
                        <div className="p-1 px-3 bg-white border border-emerald-200 rounded-lg text-emerald-600 text-[9px] font-bold uppercase tracking-widest group-hover/proof:bg-emerald-600 group-hover/proof:text-white transition-all shadow-sm">
                            Open
                        </div>
                    </a>
                )}
            </div>
        )}

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <PriorityBadge p={task.priority} />
            </div>
            <div className="flex items-center gap-1.5">
                <div className="flex flex-col items-end pr-1">
                    <p className="text-[11px] font-bold text-slate-800 truncate max-w-[80px]">{task.assignee}</p>
                </div>
                <Avatar name={task.assignee} size={30} />
            </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-50/70 flex items-center justify-center gap-1.5">
            {task.deadline && task.status !== 'Completed' && new Date(task.deadline).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0) ? (
                <>
                    <Ic d={P.clock} size={11} color="#ef4444" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600 animate-pulse">Overdue</span>
                </>
            ) : (
                <>
                    <Ic d={P.clock} size={11} color="#d97706" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">
                        {new Date(task.deadline || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                </>
            )}
        </div>

        {task.status === 'Mentor Approval' && (
            <button
                onClick={(e) => { e.stopPropagation(); onApprove(task); }}
                className="w-full mt-4 py-2.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
                Approve Task
            </button>
        )}
    </div>
);

const COL_CFG = {
    "To-Do": { color: "#6015C1", bg: "bg-slate-50 border-slate-200" },
    "In Progress": { color: "#f59e0b", bg: "bg-amber-50/40 border-amber-100" },
    "Mentor Approval": { color: "#6015C1", bg: "bg-fuchsia-50/40 border-fuchsia-100" },
    "Completed": { color: "#10b981", bg: "bg-emerald-50/40 border-emerald-100" },
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 w-full transition-opacity duration-200">
        <div className="bg-white rounded-[24px] w-full max-w-lg max-h-[90vh] flex flex-col transform transition-transform duration-200 scale-100 overflow-hidden border border-slate-100">
            <div className="flex-none flex items-center justify-between p-5 border-b border-slate-100">
                <span className="font-semibold text-lg text-slate-900">{title}</span>
                <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Ic d={P.x} size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">{children}</div>
        </div>
    </div>
);

const Field = ({ label, children }) => (
    <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 ml-1 mb-2 block">{label}</label>
        {children}
    </div>
);

const DynamicDropdown = ({ label, options, selected, onSelect, onAdd, onDelete, placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const [newVal, setNewVal] = useState("");

    return (
        <div className="relative mb-4">
            <label className="text-sm font-medium text-slate-700 ml-1 mb-2 block">{label}</label>
            <div onClick={() => !disabled && setOpen(!open)} className={`w-full h-[44px] px-4 border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none flex justify-between items-center cursor-pointer group shadow-sm ${disabled ? "bg-[#F4F5FA] text-slate-400 cursor-not-allowed border-slate-100 pointer-events-none" : "bg-white"}`}>
                <span className={selected ? "text-slate-800 font-semibold" : "text-slate-400 font-medium"}>{selected || placeholder}</span>
                <div className="flex items-center gap-2.5">
                    {selected && (
                        <button onClick={(e) => { e.stopPropagation(); onSelect(""); }} className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <Ic d={P.x} size={14} />
                        </button>
                    )}
                    <div className="w-[1.5px] h-4 bg-slate-200/50 rounded-full" />
                    <Ic d={P.dots} size={14} cls="text-slate-400 group-hover:text-fuchsia-500 transition-colors" />
                </div>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
                    <div className="absolute z-[60] mt-2 w-full bg-white border border-slate-100 rounded-2xl p-2 animate-in fade-in zoom-in duration-200 origin-top">
                        <div className="relative p-1.5 border-b border-slate-50 mb-1">
                            <input value={newVal} onChange={e => setNewVal(e.target.value)}
                                autoFocus
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newVal.trim()) {
                                        e.preventDefault();
                                        onAdd(newVal.trim());
                                        setNewVal("");
                                    }
                                }}
                                placeholder="Add new..." className="w-full bg-slate-50 border-none rounded-lg pl-3 pr-10 py-2 text-xs focus:ring-1 focus:ring-fuchsia-300 outline-none text-slate-700" />
                            <button onClick={(e) => {
                                e.stopPropagation();
                                if (newVal.trim()) { onAdd(newVal.trim()); setNewVal(""); }
                            }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-fuchsia-600 text-white p-1 rounded-md hover:bg-fuchsia-700 transition-colors">
                                <Ic d={P.plus} size={12} />
                            </button>
                        </div>
                        <div className="max-h-44 overflow-y-auto no-scrollbar">
                            {options.map(opt => (
                                <div key={opt.value} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-fuchsia-50 group cursor-pointer transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(opt.value);
                                        setOpen(false);
                                    }}>
                                    <span className={`text-[13px] ${selected === opt.value ? "text-fuchsia-600 font-semibold" : "text-slate-600 font-medium"}`}>{opt.value}</span>
                                    {opt.custom && (
                                        <button onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(opt.value);
                                        }}
                                            className="opacity-40 group-hover:opacity-100 p-1.5 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-all bg-white shadow-sm border border-rose-50">
                                            <Ic d={P.trash} size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const inpCls = "w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-['Poppins'] placeholder:text-slate-300 disabled:bg-[#F4F5FA] disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100";

const CATEGORIES = ["Designing", "Development", "Testing", "Documentation"];
const PRIORITIES = ["Highest", "High", "Medium", "Low"];

export const MentorTeamView = ({ team, goBack, user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImg, setPreviewImg] = useState(null);
    const [modal, setModal] = useState(null);
    const [editId, setEditId] = useState(null);
    const [delId, setDelId] = useState(null);

    const EMPTY = {
        title: "", cat: "Development", epic: "General", priority: "High", assignee: "",
        status: "To-Do", flagged: false, desc: "", attachmentUrl: "", attachmentName: "",
        assignedBy: user?.name || "Mentor", assignmentStatus: "Accepted",
        startDate: "", endDate: "", deadline: ""
    };
    const [form, setForm] = useState(EMPTY);
    const [cats, setCats] = useState(CATEGORIES.map(c => ({ value: c, custom: false })));
    const [epics, setEpics] = useState([{ value: "General", custom: false }]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const res = await getTasks();
            const memberNames = team.members.map(m => m.name.toLowerCase().trim());
            const teamTasks = res.data.filter(t => {
                const assignee = (t.assignee || "").toLowerCase().trim();
                const assignedBy = (t.assignedBy || "").toLowerCase().trim();
                return memberNames.includes(assignee) || memberNames.includes(assignedBy);
            });
            setTasks(teamTasks);
            
            // Populate epics from existing tasks
            const uniqueEpics = Array.from(new Set(teamTasks.map(t => t.epic).filter(Boolean)));
            if (!uniqueEpics.includes("General")) uniqueEpics.unshift("General");
            setEpics(uniqueEpics.map(e => ({ value: e, custom: false })));
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (team) fetchTasks();
    }, [team]);

    const handleSave = async () => {
        if (!form.title.trim()) return;
        try {
            const payload = {
                ...form,
                assignedBy: user?.name || "Mentor",
                isMentorTask: true
            };

            if (editId !== null) {
                await updateTask(editId, payload);
            } else {
                await createTask(payload);
            }

            await fetchTasks();
            setModal(null);
            setForm(EMPTY);
            setEditId(null);
        } catch (err) {
            console.error("Task Save Error:", err);
            alert("Failed to save task.");
        }
    };

    const doDelete = async () => {
        try {
            await deleteTask(delId);
            await fetchTasks();
            setModal(null);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const openEdit = t => { setForm({ ...t }); setEditId(t._id); setModal("create"); };
    const openDel = id => { setDelId(id); setModal("delete"); };

    const handleApproveTask = async (task) => {
        try {
            await updateTask(task._id, {
                status: "Completed",
                approvedAt: new Date()
            });
            fetchTasks();
        } catch (err) {
            console.error("Failed to approve task:", err);
            alert("Failed to approve task");
        }
    };

    const colTasks = col => tasks.filter(t => t.status === col);

    const memberContributions = team.members.map(m => {
        const done = tasks.filter(t => t.assignee === m.name && t.status === "Completed").length;
        const total = tasks.filter(t => t.assignee === m.name).length;
        return { name: m.name, done, total };
    });

    if (loading) return <div className="p-10 text-center text-slate-400 font-semibold animate-pulse">Loading team data...</div>;

    return (
        <div className="space-y-6">
            <button onClick={goBack} className="text-[#6015C1] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity">
                ← Back to Dashboard
            </button>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{team.name}</h2>
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Project ID: {team.id}</p>
                </div>
            </div>

            {/* Contributions Row */}
            <Card className="p-8 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[32px]">
                <SectionTitle sub="Tasks completed per member">Team Contributions</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {memberContributions.map((m, i) => (
                        <div key={i} className="bg-slate-50/50 p-5 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100/50 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar name={m.name} size={42} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[14px] font-bold text-slate-900 truncate">{m.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Member</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[15px] font-black text-[#6015C1] leading-none mb-1">{m.done}</p>
                                    <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">Done</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    <span>Progress</span>
                                    <span className="text-emerald-500">{m.total > 0 ? Math.round((m.done / m.total) * 100) : 0}%</span>
                                </div>
                                <Bar pct={m.total > 0 ? Math.round((m.done / m.total) * 100) : 0} color="#6015C1" h={6} />
                                <p className="text-[9px] text-slate-300 font-bold text-center mt-2">{m.total} tasks total</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Board Row */}
            <Card className="p-8 bg-white border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[32px]">
                <SectionTitle sub="Live execution tracking">Team Task Board</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 items-stretch">
                    {["To-Do", "In Progress", "Mentor Approval", "Completed"].map(col => {
                        const cfg = COL_CFG[col];
                        const ct = colTasks(col);
                        return (
                            <div key={col} className={`border-[1.5px] rounded-[24px] p-4 transition-colors min-h-[500px] flex flex-col ${cfg.bg}`}>
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[15px] font-bold text-slate-800 tracking-tight">{col}</span>
                                        <span className="min-w-[24px] h-6 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-black flex items-center justify-center px-1.5 shadow-sm">{ct.length}</span>
                                    </div>
                                    <button onClick={() => { setForm({ ...EMPTY, status: col, assignee: team.members[0]?.name || "" }); setEditId(null); setModal("create"); }} className="p-1.5 rounded-xl text-slate-400 hover:text-[#6015C1] hover:bg-white transition-all shadow-sm">
                                        <Ic d={P.plus} size={15} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto no-scrollbar pb-2">
                                    {ct.map(t => <TaskCard key={t._id} task={t} onEdit={openEdit} onDelete={openDel} onApprove={handleApproveTask} onPreview={setPreviewImg} />)}
                                    {ct.length === 0 && <div className="border-2 border-dashed border-slate-200/70 rounded-[20px] py-10 px-4 text-center mt-2 bg-white/40 shadow-inner"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Empty Column</p></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Modals */}
            {modal === "create" && (
                <Modal title={editId ? "Edit Task" : "Assign New Task"} onClose={() => setModal(null)}>
                    <Field label="Task Title"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to be done?" className={inpCls} /></Field>
                    <Field label="Description"><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Provide context and requirements..." rows={3} className={`${inpCls} resize-none leading-relaxed`} /></Field>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <DynamicDropdown label="Category" options={cats} selected={form.cat} onSelect={v => setForm({ ...form, cat: v })} onAdd={v => setCats([...cats, { value: v, custom: true }])} onDelete={v => setCats(cats.filter(c => c.value !== v))} placeholder="Select category" />
                        <Field label="Priority"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inpCls}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></Field>
                        <Field label="Assign To">
                            <select value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className={inpCls}>
                                {team.members.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Status"><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inpCls}>{["To-Do", "In Progress", "Mentor Approval", "Completed"].map(s => <option key={s}>{s}</option>)}</select></Field>
                    </div>

                    {(form.status === 'Completed' || form.status === 'Mentor Approval' || form.isMentorTask || form.attachmentUrl) && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <Field label="Attachment Proof (Image / Link)">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <input
                                            value={form.attachmentUrl || ""}
                                            onChange={e => setForm({ ...form, attachmentUrl: e.target.value })}
                                            placeholder="Paste URL or upload image below..."
                                            className={`${inpCls} pr-10 border-[#6015C1]/30 bg-fuchsia-50/20`}
                                        />
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fuchsia-500">
                                            <Ic d={P.task || P.log} size={16} />
                                        </div>
                                    </div>

                                    {form.attachmentUrl && !form.attachmentUrl.startsWith('data:image') && (
                                        <div className="animate-in slide-in-from-top-1 duration-200">
                                            <input
                                                value={form.attachmentName || ""}
                                                onChange={e => setForm({ ...form, attachmentName: e.target.value })}
                                                placeholder="Give this link a name (e.g. Google Drive)"
                                                className={`${inpCls} border-emerald-100 bg-emerald-50/20`}
                                            />
                                        </div>
                                    )}

                                    <div
                                        className="relative p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-[#6015C1] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group/upload min-h-[140px]"
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setForm({ ...form, attachmentUrl: reader.result });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />

                                        {form.attachmentUrl &&  form.attachmentUrl.startsWith('data:image') ? (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                                                <img src={form.attachmentUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest text-[#6015C1]">Change Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/upload:text-[#6015C1] transition-colors mb-3">
                                                    <Ic d={P.plus || P.task} size={20} />
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-500 group-hover/upload:text-[#6015C1] transition-colors">Click to upload screenshot proof</p>
                                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">PNG, JPG, BMP accepted</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">* This is mandatory for verification of completed tasks</p>
                            </Field>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Field label="Start Date"><input type="date" value={form.startDate && !isNaN(new Date(form.startDate)) ? new Date(form.startDate).toISOString().split('T')[0] : ""} onChange={e => setForm({ ...form, startDate: e.target.value })} className={inpCls} /></Field>
                        <Field label="End Date"><input type="date" value={form.endDate && !isNaN(new Date(form.endDate)) ? new Date(form.endDate).toISOString().split('T')[0] : ""} onChange={e => { setForm({ ...form, endDate: e.target.value, deadline: e.target.value }); }} className={inpCls} /></Field>
                    </div>

                    <DynamicDropdown label="Epic / Module" options={epics} selected={form.epic} onSelect={v => setForm({ ...form, epic: v })} onAdd={v => setEpics([...epics, { value: v, custom: true }])} onDelete={v => setEpics(epics.filter(e => e.value !== v))} placeholder="Select Epic" />

                    <div className="flex gap-4 mt-8">
                        <Button className="flex-1 h-12 bg-[#6015C1] hover:bg-[#4A0D97] rounded-2xl font-bold uppercase tracking-widest text-white transition-all active:scale-95" onClick={handleSave}>
                            {editId ? "Save Changes" : "Assign Task"}
                        </Button>
                        <Button className="flex-1 h-12 border-2 border-slate-100 text-slate-400 font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                    </div>
                </Modal>
            )}

            {modal === "delete" && (
                <Modal title="Delete Task?" onClose={() => setModal(null)}>
                    <div className="text-center py-4">
                        <p className="text-slate-500 font-medium mb-8">Are you sure you want to remove this task assignment? This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <Button className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 rounded-2xl font-bold uppercase tracking-widest text-white" onClick={doDelete}>Remove Task</Button>
                            <Button className="flex-1 h-12 border-2 border-slate-100 text-slate-400 font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-50" onClick={() => setModal(null)}>Cancel</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Lightbox Modal */}
            {previewImg && (
                <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300" onClick={() => setPreviewImg(null)}>
                    <button className="absolute top-8 right-8 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all" onClick={() => setPreviewImg(null)}><Ic d={P.x} size={28} /></button>
                    <div className="relative max-w-6xl w-full h-full flex items-center justify-center p-4 lg:p-8 rounded-[40px] overflow-hidden bg-slate-800/20 group" onClick={e => e.stopPropagation()}>
                        <img src={previewImg} alt="Large Preview" className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 delay-75" />
                    </div>
                </div>
            )}
        </div>
    );
};
