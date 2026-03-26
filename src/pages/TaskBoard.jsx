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
    "Mentor Approval": { color: "#8b5cf6", bg: "bg-fuchsia-50/40 border-fuchsia-100" },
    "Completed": { color: "#10b981", bg: "bg-emerald-50/40 border-emerald-100" },
};

const DynamicDropdown = ({ label, options, selected, onSelect, onAdd, onDelete, placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const [newVal, setNewVal] = useState("");

    return (
        <div className="relative mb-4">
            <label className="text-sm font-medium text-slate-700 ml-1 mb-2 block">{label}</label>
            <div onClick={() => !disabled && setOpen(!open)} className={`w-full h-[44px] px-4 border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none flex justify-between items-center cursor-pointer group shadow-sm ${disabled ? "bg-[#F4F5FA] text-slate-400 cursor-not-allowed border-slate-100 pointer-events-none" : "bg-white"}`}>
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

const TaskCard = ({ task, onEdit, onDelete, onApprove, user, onDragStart, onPreview }) => (
    <div className={`transition-all duration-200 cursor-grab active:cursor-grabbing border rounded-[12px] p-4 mb-3 bg-white ${task.flagged ? "border-rose-200 shadow-[0_0_10px_rgba(254,202,202,0.5)]" : "border-slate-200/60"}`}
        draggable onDragStart={() => onDragStart(task._id)}>
        <div className="flex justify-between items-center mb-2.5">
            <CategoryTag label={task.cat} />
            <div className="flex gap-1 items-center">
                {task.flagged && <Ic d={P.flag} size={14} color="#ef4444" />}
                <button onClick={() => onEdit(task)} className="p-1 rounded-lg text-slate-400 hover:text-[#6015C1] hover:bg-fuchsia-50 transition-all" title="Edit Task">
                    <Ic d={P.edit} size={14} />
                </button>
                {(user?.role === 'Admin' || user?.role === 'Mentor' ||
                    (!task.isMentorTask && (user?.role === 'Team Lead' || (user?.role === 'Student' && task.assignedBy === user?.name)))
                ) && (
                        <button onClick={() => onDelete(task._id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all" title="Delete Task">
                            <Ic d={P.trash} size={14} />
                        </button>
                    )}
            </div>
        </div>
        <p className="text-[13px] font-semibold text-slate-900 leading-snug mb-2">{task.title}</p>

        {task.desc && <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">{task.desc}</p>}

        {task.attachmentUrl && (
            <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                        Proof • {new Date(task.submittedAt || task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
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
                            <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">View</span>
                        </div>
                    </div>
                ) : (
                    <a href={task.attachmentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all group/proof">
                        <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shadow-sm">
                            <Ic d={P.task} size={16} color="#10B981" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider truncate">{task.attachmentName || "View Document"}</p>
                        </div>
                        <div className="p-1 px-3 bg-white border border-emerald-200 rounded-lg text-emerald-600 text-[9px] font-bold uppercase tracking-widest group-hover/proof:bg-emerald-600 group-hover/proof:text-white transition-all shadow-sm">
                            Open
                        </div>
                    </a>
                )}
            </div>
        )}

        <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <Ic d={P.epic} size={10} color="#6015C1" /> {task.epic}
            </span>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <PriorityBadge p={task.priority} />
            </div>
            <div className="flex items-center gap-1.5">
                <div className="flex flex-col items-end pr-1">
                    <p className="text-[11px] font-bold text-slate-800 truncate max-w-[80px]">{task.assignee}</p>
                </div>
                <Avatar name={task.assignee} size={28} />
            </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-50/70 flex items-center justify-center gap-1.5">
            {task.deadline && task.status !== 'Completed' && new Date(task.deadline).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0) ? (
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

        {task.status === "Mentor Approval" && (user?.role === "Mentor" || user?.role === "Admin") && (
            <button
                onClick={() => onApprove(task._id)}
                className="w-full mt-4 py-2.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
                Approve Task
            </button>
        )}
    </div>
);

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

const inpCls = "w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-['Poppins'] placeholder:text-slate-300 disabled:bg-[#F4F5FA] disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-100";

export const TaskBoard = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [dragId, setDragId] = useState(null);
    const [dragTask, setDragTask] = useState(null);
    const [modal, setModal] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);
    const EMPTY = {
        title: "", cat: "Development", epic: "General", priority: "High", assignee: "",
        status: "To-Do", flagged: false, desc: "", attachmentUrl: "", attachmentName: "",
        assignedBy: user?.name || "", assignmentStatus: "Accepted",
        startDate: "", endDate: "", deadline: ""
    };
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [delId, setDelId] = useState(null);
    const [search, setSearch] = useState("");
    const [filtEpic, setFiltEpic] = useState("All");
    const [filtLbl, setFiltLbl] = useState("All");

    const fetchProjectAndTasks = useCallback(async () => {
        try {
            const { getTasks, getProject } = await import("../api");

            // 1. Fetch user's project
            const pRes = await getProject();
            const userProject = pRes.data;
            setProject(userProject);

            // 2. Extract member names for filtering
            const teamMemberNames = userProject ? userProject.members.map(m => m.name.toLowerCase().trim()) : [user?.name?.toLowerCase().trim()];
            setMembers(userProject ? userProject.members.map(m => m.name) : [user?.name]);

            // 3. Fetch all tasks and filter by team
            const tRes = await getTasks();
            const filteredTasks = tRes.data.filter(t => {
                const assignee = (t.assignee || "").toLowerCase().trim();
                const assignedBy = (t.assignedBy || "").toLowerCase().trim();
                // Task belongs to team if assignee OR creator is a team member
                return teamMemberNames.includes(assignee) || teamMemberNames.includes(assignedBy);
            });
            setTasks(filteredTasks);
        } catch (err) {
            console.error("Failed to fetch project/tasks:", err);
            // Fallback to basic fetch if project not found
            const res = await getTasks();
            const myTasks = res.data.filter(t =>
                (t.assignee || "").toLowerCase() === (user?.name || "").toLowerCase() ||
                (t.assignedBy || "").toLowerCase() === (user?.name || "").toLowerCase()
            );
            setTasks(myTasks);
        }
    }, [user?.name]);

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
        fetchProjectAndTasks();
        fetchMembers();
    }, [fetchProjectAndTasks, fetchMembers]);

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
        if (!dragId || !dragTask) return;

        const isMentorCreated = dragTask.isMentorTask || (dragTask.assignedBy && !members.map(m => m.toLowerCase().trim()).includes(dragTask.assignedBy.toLowerCase().trim()));
        const isAssignee = dragTask.assignee === user?.name || user?.role === 'Admin' || user?.role === 'Mentor';

        if (isMentorCreated && !isAssignee) {
            alert("Only the assigned student can change the status of this mentor task.");
            setDragId(null);
            setDragTask(null);
            return;
        }

        if (col === 'Completed' || col === 'Mentor Approval') {
            const task = tasks.find(t => t._id === dragId);
            if (task && !task.attachmentUrl) {
                alert(`Attachment proof is required to mark task as ${col.toLowerCase()}.`);
                setDragId(null);
                setDragTask(null);
                openEdit(task);
                return;
            }
        }
        let targetCol = col;
        if (col === 'Completed' && user?.role === 'Student') {
            targetCol = 'Mentor Approval';
        }

        try {
            const updateProps = { status: targetCol };
            if (targetCol === 'Mentor Approval') updateProps.submittedAt = new Date();
            if (targetCol === 'Completed') updateProps.approvedAt = new Date();

            await updateTask(dragId, updateProps);
            fetchProjectAndTasks();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
        setDragId(null);
        setDragTask(null);
        document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed'));
    };

    const handleDragOver = e => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed');
    };

    const handleDragLeave = e => {
        e.currentTarget.classList.remove('bg-fuchsia-50', 'border-[#6015C1]', 'border-dashed');
    };

    const onApprove = async (id) => {
        try {
            await updateTask(id, {
                status: 'Completed',
                approvedAt: new Date()
            });
            fetchProjectAndTasks();
        } catch (err) {
            console.error("Approval failed:", err);
        }
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        if ((form.status === 'Completed' || form.status === 'Mentor Approval') && (!form.attachmentUrl || form.attachmentUrl.trim() === "")) {
            alert("Please provide the attachment proof (Image or Link) to submit this task.");
            return;
        }
        try {
            const payload = {
                ...form,
                assignedBy: user?.name || form.assignedBy || "System",
                isMentorTask: user?.role === 'Mentor' || user?.role === 'Admin'
            };

            // Workflow: Students must go through 'Mentor Approval' for completions
            if (payload.status === 'Completed' && user?.role === 'Student') {
                payload.status = 'Mentor Approval';
            }

            if (editId !== null) {
                if (payload.status === 'Mentor Approval' && !form.submittedAt) payload.submittedAt = new Date();
                if (payload.status === 'Completed' && !form.approvedAt) payload.approvedAt = new Date();
                await updateTask(editId, payload);
            } else {
                if (payload.status === 'Mentor Approval') payload.submittedAt = new Date();
                if (payload.status === 'Completed') payload.approvedAt = new Date();
                await createTask(payload);
            }

            await fetchProjectAndTasks();
            setModal(null);
            setForm(EMPTY);
            setEditId(null);
        } catch (err) {
            console.error("Task Save Error:", err);
            alert("Failed to save task. Please check server connection.");
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
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between mb-4">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-[#6015C1] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 rounded-xl border border-purple-200">Task Management</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Project Task Board</span>
                    </div>
                </div>
            </div>

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
                    {(user?.role === 'Admin' || user?.role === 'Mentor' || user?.role === 'Team Lead') && (
                        <Button onClick={() => { setForm(EMPTY); setEditId(null); setModal("create"); }}
                            className="bg-[#6015C1] hover:bg-[#4A0D97] rounded-xl h-10 px-5 font-semibold tracking-wide">
                            <Ic d={P.plus} size={14} className="mr-2" /> Create Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="relative flex-1 max-w-xs">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Ic d={P.search} size={14} />
                    </div>
                    <input placeholder="Search tasks by title..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full h-[44px] pl-9 pr-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm outline-none transition-all shadow-sm placeholder:text-slate-300" />
                </div>
                <select value={filtEpic} onChange={e => setFiltEpic(e.target.value)} className="h-[44px] pl-3.5 pr-8 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm outline-none transition-all cursor-pointer shadow-sm">
                    {EPICS.map(e => <option key={e}>{e === "All" ? "All Epics" : e}</option>)}
                </select>
                <select value={filtLbl} onChange={e => setFiltLbl(e.target.value)} className="h-[44px] pl-3.5 pr-8 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm outline-none transition-all cursor-pointer shadow-sm">
                    <option value="All">All Priorities</option>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
            </div>

            {/* Kanban columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {["To-Do", "In Progress", "Mentor Approval", "Completed"].map(col => {
                    const cfg = COL_CFG[col], ct = colTasks(col);
                    return (
                        <div key={col} className={`drop-zone border-[1.5px] rounded-3xl p-4 transition-colors duration-200 min-h-[600px] flex flex-col ${cfg.bg}`}
                            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={e => handleDrop(col)}>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cfg.color }} />
                                    <h3 className="font-bold text-slate-800 text-[14px] tracking-tight">{col}</h3>
                                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100/50 px-1.5 py-0.5 rounded-md min-w-[20px] text-center">{ct.length}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => { setForm({ ...EMPTY, status: col }); setEditId(null); setModal("create"); }} className="p-1.5 rounded-lg text-slate-400 hover:text-[#6015C1] hover:bg-white transition-colors">
                                        <Ic d={P.plus} size={15} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {ct.map(t => <TaskCard key={t._id} task={t} onEdit={openEdit} onDelete={openDel} onDragStart={(id) => { setDragId(id); setDragTask(t); }} onApprove={onApprove} user={user} onPreview={setPreviewImg} />)}
                                {ct.length === 0 && <div className="border-2 border-dashed border-slate-200/70 rounded-2xl py-8 px-4 text-center mt-2 bg-white/40"><p className="text-[13px] font-medium text-slate-400">Drag & drop tasks here</p></div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {(modal === "create" || modal === "edit") && (() => {
                const isMentorCreated = form.isMentorTask || (form._id && form.assignedBy && !members.map(m => m.toLowerCase().trim()).includes(form.assignedBy.toLowerCase().trim()));
                const isReadOnly = isMentorCreated && (user?.role === 'Student' || user?.role === 'Team Lead');
                const isAssignee = form.assignee === user?.name || user?.role === 'Admin' || user?.role === 'Mentor';
                const restrictedForNonAssignee = isMentorCreated && !isAssignee;
                return (
                    <Modal title={modal === "create" ? "Create New Task" : "Edit Task Details"} onClose={() => setModal(null)}>
                        <Field label="Task Title"><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Enter a descriptive title..." className={inpCls} disabled={isReadOnly} /></Field>
                        <Field label="Description"><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Add specifics about this task..." rows={3} className={`${inpCls} resize-none leading-relaxed h-auto py-3`} disabled={isReadOnly} /></Field>
                        <div className="grid grid-cols-2 gap-4">
                            <DynamicDropdown
                                label="Category"
                                options={cats}
                                selected={form.cat}
                                onSelect={v => setForm({ ...form, cat: v })}
                                onAdd={handleAddCat}
                                onDelete={handleDelCat}
                                placeholder="Select category"
                                disabled={isReadOnly}
                            />
                            <Field label="Priority"><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inpCls} disabled={isReadOnly}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></Field>
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
                            <Field label="Status">
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inpCls} disabled={(isReadOnly && form.status === 'Completed') || restrictedForNonAssignee}>
                                    {["To-Do", "In Progress", "Mentor Approval", "Completed"].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </Field>
                        </div>

                        {(form.status === 'Completed' || form.status === 'Mentor Approval' || isMentorCreated || form.attachmentUrl) && (
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
                                                    disabled={restrictedForNonAssignee}
                                                />
                                            </div>
                                        )}

                                        <div
                                            className={`relative p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-[#6015C1] transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group/upload min-h-[140px] ${restrictedForNonAssignee ? "opacity-60 pointer-events-none" : ""}`}
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

                                            {form.attachmentUrl && form.attachmentUrl.startsWith('data:image') ? (
                                                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md">
                                                    <img src={form.attachmentUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</span>
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
                            <Field label="Start Date">
                                <input
                                    type="date"
                                    value={form.startDate && !isNaN(new Date(form.startDate)) ? new Date(form.startDate).toISOString().split('T')[0] : ""}
                                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    className={inpCls}
                                    disabled={isReadOnly}
                                />
                            </Field>
                            <Field label="End Date">
                                <input
                                    type="date"
                                    value={form.endDate && !isNaN(new Date(form.endDate)) ? new Date(form.endDate).toISOString().split('T')[0] : ""}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setForm({ ...form, endDate: val, deadline: val });
                                    }}
                                    className={inpCls}
                                    disabled={isReadOnly}
                                />
                            </Field>
                        </div>

                        <DynamicDropdown
                            label="Epic / Module"
                            options={epics}
                            selected={form.epic}
                            onSelect={v => setForm({ ...form, epic: v })}
                            onAdd={handleAddEpic}
                            onDelete={handleDelEpic}
                            placeholder="Select or add epic..."
                            disabled={isReadOnly}
                        />
                        <div className={`flex items-center gap-3 mt-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100/50 transition-colors ${isReadOnly ? "opacity-60 pointer-events-none" : ""}`} onClick={() => setForm({ ...form, flagged: !form.flagged })}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${form.flagged ? "bg-rose-500 border-rose-500 text-white" : "border-rose-300 bg-white"}`}>
                                {form.flagged && <Ic d={P.task} size={12} />}
                            </div>
                            <span className="text-[13px] font-semibold text-rose-800">Mark task as urgent or flagged</span>
                        </div>
                        <div className="flex gap-3 mt-7">
                            <Button className="flex-1 h-11 bg-[#6015C1] hover:bg-[#4A0D97] rounded-xl font-semibold tracking-wide" onClick={handleSave}>
                                {modal === "create" ? "Add to Board" : "Submit"}
                            </Button>
                            <Button className="flex-1 h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl" variant="outline" onClick={() => setModal(null)}>
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                );
            })()}
            {modal === "delete" && (
                <Modal title="Delete permanently?" onClose={() => setModal(null)}>
                    <div className="text-center py-4">
                        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <Ic d={P.trash} size={28} color="#e11d48" />
                        </div>
                        <p className="text-base text-slate-500 mb-8 max-w-[260px] mx-auto leading-relaxed">This task will be erased completely from your board. You can't undelete this.</p>
                        <div className="flex gap-3">
                            <Button className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 rounded-xl font-semibold tracking-wide text-white" onClick={doDelete}>
                                Yes, delete task
                            </Button>
                            <Button className="flex-1 h-11 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl" variant="outline" onClick={() => setModal(null)}>
                                Cancel
                            </Button>
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
}
