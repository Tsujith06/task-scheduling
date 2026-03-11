import { useState, useEffect, useCallback } from "react";
import { Avatar } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getTasks, createTask, updateTask, deleteTask, getUsers } from "../api";

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
    log: "M12 20V10M18 20V4M6 20v-4",
    epic: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
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

const CATEGORIES = ["Designing", "Development", "Testing", "Documentation"];
const PRIORITIES = ["Highest", "High", "Medium", "Low"];

const INIT = [
    { id: 1, title: "Design the Login page UI", cat: "Designing", epic: "User Authentication", priority: "Highest", assignee: "Arjun Kumar", status: "To-Do", flagged: false, desc: "Create high-fidelity mockups for login screen." },
    { id: 2, title: "Build registration flow screens", cat: "Designing", epic: "User Authentication", priority: "Highest", assignee: "Priya Singh", status: "To-Do", flagged: true, desc: "Include OTP and email verification screens." },
    { id: 3, title: "Set up project folder structure", cat: "Development", epic: "Backend Setup", priority: "High", assignee: "Rohit Das", status: "To-Do", flagged: false, desc: "Scaffold FastAPI project with routers and models." },
    { id: 4, title: "Write SRS document outline", cat: "Documentation", epic: "Project Docs", priority: "Medium", assignee: "Sneha M", status: "To-Do", flagged: false, desc: "" },
    { id: 5, title: "Implement Real-time data sync", cat: "Development", epic: "System Modules", priority: "Highest", assignee: "Arjun Kumar", status: "To-Do", flagged: false, desc: "Use WebSockets for live status updates." },
    { id: 6, title: "Work on dashboard layout", cat: "Designing", epic: "User Authentication", priority: "Highest", assignee: "Priya Singh", status: "In Progress", flagged: false, desc: "Build responsive dashboard with sidebar." },
    { id: 7, title: "Configure API Gateway", cat: "Development", epic: "System Modules", priority: "Highest", assignee: "Rohit Das", status: "In Progress", flagged: true, desc: "Setup routing and load balancing for microservices." },
    { id: 8, title: "Requirements analysis", cat: "Documentation", epic: "Project Docs", priority: "Medium", assignee: "Sneha M", status: "Completed", flagged: false, desc: "Full SRS document approved by mentor." },
    { id: 9, title: "Project proposal submitted", cat: "Documentation", epic: "Project Docs", priority: "High", assignee: "Arjun Kumar", status: "Completed", flagged: false, desc: "Mentor approved on 10 Feb 2025." },
];

const COL_CFG = {
    "To-Do": { color: "#6015C1", bg: "bg-slate-50 border-slate-200" },
    "In Progress": { color: "#f59e0b", bg: "bg-amber-50/40 border-amber-100" },
    "Completed": { color: "#10b981", bg: "bg-emerald-50/40 border-emerald-100" },
};

const DynamicDropdown = ({ label, options, selected, onSelect, onAdd, onDelete, placeholder }) => {
    const [open, setOpen] = useState(false);
    const [newVal, setNewVal] = useState("");

    return (
        <div className="relative mb-4">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
            <div onClick={() => setOpen(!open)} className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-800 border-2 border-slate-100 bg-slate-50 focus:bg-white hover:border-fuchsia-100 transition-all outline-none flex justify-between items-center cursor-pointer group">
                <span className={selected ? "text-slate-800 font-medium" : "text-slate-400"}>{selected || placeholder}</span>
                <div className="flex items-center gap-2">
                    {selected && (
                        <button onClick={(e) => { e.stopPropagation(); onSelect(""); }} className="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <Ic d={P.x} size={14} />
                        </button>
                    )}
                    <div className="w-px h-4 bg-slate-200" />
                    <Ic d={P.dots} size={14} cls="text-slate-400 group-hover:text-fuchsia-500 transition-colors" />
                </div>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
                    <div className="absolute z-[60] mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200 origin-top">
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

const TaskCard = ({ task, onEdit, onDelete, onDragStart }) => (
    <div className={`transition-all duration-200 cursor-grab hover:shadow-lg hover:-translate-y-0.5 active:cursor-grabbing border rounded-2xl p-4 mb-3 bg-white ${task.flagged ? "border-rose-200 shadow-[0_0_10px_rgba(254,202,202,0.5)]" : "border-slate-200/60"}`}
        draggable onDragStart={() => onDragStart(task._id)}>
        <div className="flex justify-between items-center mb-2.5">
            <CategoryTag label={task.cat} />
            <div className="flex gap-1.5 items-center">
                {task.flagged && <Ic d={P.flag} size={14} color="#ef4444" />}
                <button onClick={() => onEdit(task)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Ic d={P.dots} size={15} />
                </button>
            </div>
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug mb-2">{task.title}</p>
        {task.desc && <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">{task.desc}</p>}
        <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <Ic d={P.epic} size={10} color="#6015C1" /> {task.epic}
            </span>
        </div>
        <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-[#6015C1] font-semibold bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-100">
                    <Ic d={P.task} size={10} color="#6015C1" /> T{task._id ? task._id.slice(-4) : '...'}
                </span>
                <PriorityBadge p={task.priority} />
            </div>
            <div className="flex items-center gap-1.5">
                <button onClick={() => onDelete(task._id)} className="p-1 opacity-40 hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50 rounded-md">
                    <Ic d={P.trash} size={13} />
                </button>
                <Avatar name={task.assignee} size={28} />
            </div>
        </div>
    </div>
);

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto w-full transition-opacity duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg transform transition-transform duration-200 scale-100 overflow-visible">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <span className="font-semibold text-lg text-slate-900">{title}</span>
                <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Ic d={P.x} size={18} />
                </button>
            </div>
            <div className="p-6 pb-20">{children}</div>
        </div>
    </div>
);


const Field = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
        {children}
    </div>
);

const inpCls = "w-full px-3.5 py-2.5 rounded-xl text-[13px] text-slate-800 border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100 transition-all outline-none appearance-none font-['Poppins']";

export const TaskBoard = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [dragId, setDragId] = useState(null);
    const [modal, setModal] = useState(null);
    const EMPTY = {
        title: "", cat: "Development", epic: "General", priority: "High", assignee: "",
        status: "To-Do", flagged: false, desc: "",
        assignedBy: user?.name || "", assignmentStatus: "Pending"
    };
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [delId, setDelId] = useState(null);
    const [search, setSearch] = useState("");
    const [filtEpic, setFiltEpic] = useState("All");
    const [filtLbl, setFiltLbl] = useState("All");

    const fetchTasks = useCallback(async () => {
        try {
            const res = await getTasks();
            setTasks(res.data);
        } catch (err) {
            console.error("Failed to fetch tasks:", err);
        }
    }, []);

    const fetchMembers = useCallback(async () => {
        try {
            const res = await getUsers({ role: 'Student' });
            const sNames = res.data.map(s => s.name);
            console.log("FETCHED MEMBERS:", sNames.length);
            setMembers(sNames);

            // Set default if not set
            if (sNames.length > 0) {
                setForm(prev => prev.assignee ? prev : { ...prev, assignee: sNames[0] });
            }
        } catch (err) {
            console.error("Failed to fetch members:", err);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
        fetchMembers();
    }, [fetchTasks, fetchMembers]);

    const [cats, setCats] = useState(CATEGORIES.map(c => ({ value: c, custom: false })));
    const [epics, setEpics] = useState([{ value: "General", custom: false }]);

    useEffect(() => {
        if (tasks.length > 0) {
            const uniqueEpics = Array.from(new Set(tasks.map(t => t.epic).filter(Boolean)));
            if (!uniqueEpics.includes("General")) uniqueEpics.unshift("General");
            setEpics(uniqueEpics.map(e => ({ value: e, custom: false })));
        }
    }, [tasks]);

    const handleAddCat = val => {
        if (!cats.some(c => c.value === val)) {
            setCats([...cats, { value: val, custom: true }]);
        }
        setForm({ ...form, cat: val });
    };
    const handleDelCat = val => {
        setCats(cats.filter(c => c.value !== val));
        if (form.cat === val) setForm(prev => ({ ...prev, cat: "" }));
    };

    const handleAddEpic = val => {
        if (!epics.some(e => e.value === val)) {
            setEpics([...epics, { value: val, custom: true }]);
        }
        setForm({ ...form, epic: val });
    };
    const handleDelEpic = val => {
        setEpics(epics.filter(e => e.value !== val));
        if (form.epic === val) setForm(prev => ({ ...prev, epic: "" }));
    };

    const visible = tasks.filter(t =>
        (search === "" || t.title.toLowerCase().includes(search.toLowerCase())) &&
        (filtEpic === "All" || t.epic === filtEpic) &&
        (filtLbl === "All" || t.priority === filtLbl)
    );
    const colTasks = col => visible.filter(t => t.status === col);

    const handleDrop = async (col) => {
        if (!dragId) return;
        try {
            await updateTask(dragId, { status: col });
            fetchTasks();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
        setDragId(null);
        document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed'));
    };

    const handleDragOver = e => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed');
    };

    const handleDragLeave = e => {
        e.currentTarget.classList.remove('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed');
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        try {
            if (editId !== null) {
                await updateTask(editId, form);
            } else {
                await createTask({ ...form, assignedBy: user.name });
            }
            fetchTasks();
            setModal(null);
            setForm(EMPTY);
            setEditId(null);
        } catch (err) {
            console.error("Failed to save task:", err);
        }
    };
    const openEdit = task => { setForm({ ...task }); setEditId(task._id); setModal("edit"); };
    const openDel = id => { setDelId(id); setModal("delete"); };
    const doDelete = async () => {
        try {
            await deleteTask(delId);
            fetchTasks();
            setModal(null);
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };
    const EPICS = ["All", ...epics.map(e => e.value)];

    return (
        <div className="flex-1 flex flex-col p-7 max-w-7xl mx-auto w-full">
            {/* Sub-header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2">
                        {Array.from(new Set(tasks.map(t => t.assignee))).map((m, i, arr) => (
                            <div key={m} className="relative" style={{ zIndex: arr.length - i }}>
                                <Avatar name={m} size={32} />
                            </div>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-slate-200"></div>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Ic d={P.task} size={12} color="#94A3B8" /> {tasks.length} tasks registered
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => { setForm(EMPTY); setEditId(null); setModal("create"); }}
                        className="bg-[#6015C1] hover:bg-[#4A0D97] rounded-xl h-10 px-5 font-semibold tracking-wide shadow-md shadow-fuchsia-500/20">
                        <Ic d={P.plus} size={14} className="mr-2" /> Create Task
                    </Button>
                </div>
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="relative flex-1 max-w-xs">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Ic d={P.search} size={14} />
                    </div>
                    <input placeholder="Search tasks by title..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-800 focus:bg-white focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all" />
                </div>
                <select value={filtEpic} onChange={e => setFiltEpic(e.target.value)} className="py-2 pl-3.5 pr-8 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 font-medium focus:outline-none focus:border-fuchsia-300 transition-all cursor-pointer">
                    {EPICS.map(e => <option key={e}>{e === "All" ? "All Epics" : e}</option>)}
                </select>
                <select value={filtLbl} onChange={e => setFiltLbl(e.target.value)} className="py-2 pl-3.5 pr-8 bg-slate-50 border border-slate-100 rounded-xl text-[13px] text-slate-700 font-medium focus:outline-none focus:border-fuchsia-300 transition-all cursor-pointer">
                    <option value="All">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                {["To-Do", "In Progress", "Completed"].map(col => {
                    const cfg = COL_CFG[col], ct = colTasks(col);
                    return (
                        <div key={col} className={`drop-zone border-[1.5px] rounded-3xl p-4 transition-colors duration-200 min-h-[500px] flex flex-col ${cfg.bg}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={e => handleDrop(col)}>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[15px] font-semibold text-slate-900">{col}</span>
                                    <span className="min-w-[24px] h-6 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center px-1.5 shadow-sm">{ct.length}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setForm({ ...EMPTY, status: col }); setEditId(null); setModal("create"); }} className="p-1.5 rounded-lg text-slate-400 hover:text-[#6015C1] hover:bg-white transition-colors">
                                        <Ic d={P.plus} size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {ct.map(t => <TaskCard key={t._id} task={t} onEdit={openEdit} onDelete={openDel} onDragStart={setDragId} />)}
                                {ct.length === 0 && <div className="border-2 border-dashed border-slate-200/70 rounded-2xl py-8 px-4 text-center mt-2 bg-white/40"><p className="text-[13px] font-medium text-slate-400">Drag & drop tasks here</p></div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {(modal === "create" || modal === "edit") && (
                <Modal title={modal === "create" ? "Create New Task" : "Edit Task Details"} onClose={() => setModal(null)}>
                    <Field label="Task Title"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter a descriptive title..." className={inpCls} /></Field>
                    <Field label="Description"><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Add specifics about this task..." rows={3} className={`${inpCls} resize-none leading-relaxed`} /></Field>
                    <div className="grid grid-cols-2 gap-4">
                        <DynamicDropdown
                            label="Category"
                            options={cats}
                            selected={form.cat}
                            onSelect={v => setForm({ ...form, cat: v })}
                            onAdd={handleAddCat}
                            onDelete={handleDelCat}
                            placeholder="Select category"
                        />
                        <Field label="Priority"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inpCls}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></Field>
                        <Field label="Assign To">
                            <select
                                value={form.assignee}
                                onChange={e => setForm({ ...form, assignee: e.target.value })}
                                className={inpCls}
                            >
                                <option value="" disabled>Select Assignee</option>
                                {members.map(m => <option key={m} value={m}>{m}</option>)}
                                {members.length === 0 && <option disabled>No students found</option>}
                            </select>
                        </Field>
                        <Field label="Status"><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inpCls}>{["To-Do", "In Progress", "Completed"].map(s => <option key={s}>{s}</option>)}</select></Field>
                    </div>
                    <DynamicDropdown
                        label="Epic / Module"
                        options={epics}
                        selected={form.epic}
                        onSelect={v => setForm({ ...form, epic: v })}
                        onAdd={handleAddEpic}
                        onDelete={handleDelEpic}
                        placeholder="Select or add epic..."
                    />
                    <div className="flex items-center gap-3 mt-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100/50 transition-colors" onClick={() => setForm({ ...form, flagged: !form.flagged })}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${form.flagged ? "bg-rose-500 border-rose-500 text-white" : "border-rose-300 bg-white"}`}>
                            {form.flagged && <Ic d={P.task} size={12} />}
                        </div>
                        <span className="text-[13px] font-semibold text-rose-800">Mark task as urgent or flagged</span>
                    </div>
                    <div className="flex gap-3 mt-7">
                        <Button className="flex-1 h-11 bg-[#6015C1] hover:bg-[#4A0D97] rounded-xl font-semibold tracking-wide shadow-md" onClick={handleSave}>
                            {modal === "create" ? "Add to Board" : "Save Changes"}
                        </Button>
                        <Button className="flex-1 h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl" variant="outline" onClick={() => setModal(null)}>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            )}
            {modal === "delete" && (
                <Modal title="Delete permanently?" onClose={() => setModal(null)}>
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <Ic d={P.trash} size={28} color="#e11d48" />
                        </div>
                        <p className="text-base text-slate-500 mb-8 max-w-[260px] mx-auto leading-relaxed">This task will be erased completely from your board. You can't undelete this.</p>
                        <div className="flex gap-3">
                            <Button className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 rounded-xl font-semibold tracking-wide text-white shadow-md shadow-rose-500/20" onClick={doDelete}>
                                Yes, delete task
                            </Button>
                            <Button className="flex-1 h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl" variant="outline" onClick={() => setModal(null)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
