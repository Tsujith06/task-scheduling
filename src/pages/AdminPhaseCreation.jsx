import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { createPhase, getPhases, deletePhase, updatePhase, startPhase } from "../api";

export const AdminPhaseCreation = ({ user }) => {
    const [phases, setPhases] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        targetGroups: [{ domain: "AI", items: [{ title: "", description: "" }] }],
        status: "Upcoming"
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    const fetchPhases = async () => {
        try {
            setFetchLoading(true);
            const res = await getPhases();
            let normalized = res.data.map(p => {
                let targets = Array.isArray(p.targets) ? p.targets : [];
                // If new targets array is empty, check legacy fields
                if (targets.length === 0 && (p.targetTitle || p.targetDescription)) {
                    targets = [{ title: p.targetTitle || "", description: p.targetDescription || "" }];
                }
                return { ...p, targets };
            });
            setPhases(normalized);
        } catch (err) {
            console.error("Failed to fetch phases:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchPhases();
    }, []);

    const deepClean = (obj) => {
        if (Array.isArray(obj)) return obj.map(deepClean);
        if (obj !== null && typeof obj === 'object') {
            const cleaned = {};
            for (const key in obj) {
                if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
                    cleaned[key] = deepClean(obj[key]);
                }
            }
            return cleaned;
        }
        return obj;
    };

    const addTargetGroup = () => {
        setForm(prev => ({
            ...prev,
            targetGroups: [...(prev.targetGroups || []), { domain: "AI", items: [{ title: "", description: "" }] }]
        }));
    };

    const removeTargetGroup = (gIndex) => {
        setForm(prev => ({
            ...prev,
            targetGroups: (prev.targetGroups || []).filter((_, i) => i !== gIndex)
        }));
    };

    const handleGroupDomainChange = (gIndex, value) => {
        setForm(prev => {
            const groups = [...(prev.targetGroups || [])];
            groups[gIndex] = { ...groups[gIndex], domain: value };
            return { ...prev, targetGroups: groups };
        });
    };

    const addTargetToGroup = (gIndex) => {
        setForm(prev => {
            const groups = [...(prev.targetGroups || [])];
            groups[gIndex] = { 
                ...groups[gIndex], 
                items: [...groups[gIndex].items, { title: "", description: "" }] 
            };
            return { ...prev, targetGroups: groups };
        });
    };

    const removeTargetFromGroup = (gIndex, tIndex) => {
        setForm(prev => {
            const groups = [...(prev.targetGroups || [])];
            groups[gIndex] = { 
                ...groups[gIndex], 
                items: groups[gIndex].items.filter((_, i) => i !== tIndex) 
            };
            return { ...prev, targetGroups: groups };
        });
    };

    const handleTargetChange = (gIndex, tIndex, field, value) => {
        setForm(prev => {
            const groups = [...(prev.targetGroups || [])];
            const items = [...groups[gIndex].items];
            items[tIndex] = { ...items[tIndex], [field]: value };
            groups[gIndex] = { ...groups[gIndex], items };
            return { ...prev, targetGroups: groups };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Flatten target groups into individual targets with domain info
            const flatTargets = (form.targetGroups || []).flatMap(group => 
                group.items.map(item => ({ ...item, domain: group.domain }))
            ).filter(t => t.title?.trim() || t.description?.trim());
            
            // Construct payload with absolute clean data
            const payload = deepClean({
                ...form,
                targets: flatTargets
            });
            delete payload.targetGroups; // Don't send the UI structural groups to backend
            
            if (isEditing) {
                await updatePhase(editId, payload);
            } else {
                await createPhase(payload);
            }
            setSuccess(true);
            resetForm();
            fetchPhases();
            setShowModal(false);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save phase:", err);
            const msg = err.response?.data?.message || err.message || "Error saving phase.";
            alert("Error: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            targetGroups: [{ domain: "AI", items: [{ title: "", description: "" }] }],
            status: "Upcoming"
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEdit = (phase) => {
        // Reconstruct target groups from flat targets
        const domains = [...new Set((phase.targets || []).map(t => t.domain || "AI"))];
        const initialGroups = domains.length > 0 
            ? domains.map(d => ({
                domain: d,
                items: phase.targets.filter(t => (t.domain || "AI") === d).map(t => ({ title: t.title, description: t.description }))
            }))
            : [{ domain: "AI", items: [{ title: "", description: "" }] }];

        setForm({
            title: phase.title || "",
            description: phase.description || "",
            startDate: phase.startDate ? new Date(phase.startDate).toISOString().split('T')[0] : "",
            endDate: phase.endDate ? new Date(phase.endDate).toISOString().split('T')[0] : "",
            status: phase.status || "Upcoming",
            targetGroups: initialGroups
        });
        setIsEditing(true);
        setEditId(phase._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this entire phase and all its reviews?")) return;
        try {
            await deletePhase(id);
            fetchPhases();
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleStartPhase = async (phase) => {
        if (!window.confirm("Start this phase? This will trigger logic depending on phase type.")) return;
        try {
            setLoading(true);
            const res = await startPhase(phase._id);
            fetchPhases();
            alert(`Success: ${res.data.message} (${res.data.count} tasks generated)`);
        } catch (err) {
            console.error("Failed to start phase:", err);
            alert("Error starting phase: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 font-inter">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div className="relative z-10 font-['Poppins']">

                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">Phase & Timeline Setup</h2>
                </div>
                <Button 
                    onClick={() => { resetForm(); setShowModal(true); }} 
                    className="bg-[#6015C1] hover:bg-[#4d109c] text-white rounded-[12px] h-[44px] px-8 flex items-center gap-3 font-bold text-sm shadow-xl shadow-fuchsia-100 transition-all hover:scale-105 active:scale-95 border-none"
                >
                    <Ico path={I.plus} size={20} /> New Phase
                </Button>
            </div>

            {/* Phase List */}
            <div className="grid grid-cols-1 gap-8">
                {fetchLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#6015C1] rounded-full animate-spin mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">Loading academic structure...</p>
                    </div>
                ) : phases.length === 0 ? (
                    <Card className="p-20 text-center border-dashed border-2 border-slate-200 bg-transparent flex flex-col items-center rounded-[40px]">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6 font-bold text-3xl">?</div>
                        <h3 className="text-xl font-bold text-slate-400">No Phases Found</h3>
                        <p className="text-slate-400 text-sm mt-1">Start by defining the first phase of the project cycle.</p>
                    </Card>
                ) : phases.map((p) => (
                    <Card key={p._id} className="overflow-hidden border-none shadow-[0_20px_60px_rgba(0,0,0,0.03)] bg-white rounded-[16px] group transition-all duration-500 hover:shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
                        <div className="p-8 md:p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-black text-slate-900">{p.title}</h2>
                                        <Pill color={p.status === 'Completed' ? 'green' : 'accent'}>{p.status}</Pill>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Ico path={I.clock} size={14} />
                                            <span>{p.startDate ? new Date(p.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} — {p.endDate ? new Date(p.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                        </div>
                                    </div>
                                    {p.description && (
                                        <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-2xl">{p.description}</p>
                                    )}

                                    
                                    {p.targets?.length > 0 && (
                                        <div className="flex flex-col mt-10">
                                            <p className="text-base font-bold text-slate-900 uppercase mb-3">
                                                Phase Target
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {p.targets.map((target, ti) => (
                                                    <div key={ti} className="p-5 bg-white border border-slate-100 rounded-[12px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 py-1 px-3 bg-fuchsia-50 text-[8px] font-black text-[#6015C1] uppercase tracking-widest rounded-bl-xl border-l border-b border-fuchsia-100">
                                                            {target.domain || 'AI'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-5 h-5 rounded-lg bg-fuchsia-50 text-[#6015C1] flex items-center justify-center text-[10px] font-black">{ti + 1}</div>
                                                            <p className="text-slate-900 font-bold text-[13px] tracking-tight">{target.title}</p>
                                                        </div>
                                                        <p className="text-slate-500 text-[11px] font-medium leading-relaxed line-clamp-2">{target.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(p)} className="p-3 rounded-[12px] bg-slate-50 text-slate-400 hover:bg-fuchsia-100 hover:text-[#6015C1] transition-all">
                                            <Ico path={I.edit} size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(p._id)} className="p-3 rounded-[12px] bg-slate-50 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-all">
                                            <Ico path={I.trash} size={18} />
                                        </button>
                                    </div>
                                    {p.status === 'Upcoming' && (
                                        <button 
                                            onClick={() => handleStartPhase(p)}
                                            className="px-4 py-2 mt-4 bg-[#6015C1] text-white rounded-[8px] text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-[#4d109c] transition-all flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-100"
                                        >
                                            <Ico path={I.task || I.task} size={14} /> Start Stage
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="absolute inset-0" onClick={() => setShowModal(false)} />
                    <Card className="relative z-10 w-full max-w-4xl bg-white border-none shadow-2xl rounded-[16px] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{isEditing ? 'Modify Phase' : 'Initialize Phase'}</h1>
                                <p className="text-slate-400 font-medium text-sm">Configure hierarchy of reviews and rubrics.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:shadow-lg transition-all">
                                <Ico path={I.plus} size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                                {/* Phase Title & Description */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3 md:col-span-full">
                                            <label className="text-sm font-medium text-slate-700 ml-1">Phase Name</label>
                                            <input 
                                                required
                                                value={form.title}
                                                onChange={e => setForm({...form, title: e.target.value})}
                                                placeholder="e.g. Second Review Phase (Semester VI)"
                                                readOnly={false}
                                                className={`w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-inter`} 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 ml-1">Start Date</label>
                                            <input 
                                                required
                                                type="date"
                                                value={form.startDate}
                                                onChange={e => setForm({...form, startDate: e.target.value})}
                                                className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-inter" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 ml-1">End Date</label>
                                            <input 
                                                required
                                                type="date"
                                                value={form.endDate}
                                                onChange={e => setForm({...form, endDate: e.target.value})}
                                                className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-inter" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700 ml-1">Phase Overview / Description</label>
                                        <textarea 
                                            rows={5}
                                            value={form.description || ""}
                                            onChange={e => setForm({...form, description: e.target.value})}
                                            placeholder="General description of this phase..."
                                            className="w-full p-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-700 font-normal text-sm transition-all outline-none font-inter resize-none" 
                                        />
                                    </div>
                                </div>

                                {/* Targets Section */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Phase Targets</h3>
                                        <button 
                                            type="button" 
                                            onClick={addTargetGroup}
                                            className="px-6 py-2.5 border-2 border-[#6015C1] text-[#6015C1] rounded-[16px] text-[11px] font-bold uppercase tracking-widest hover:bg-fuchsia-50 transition-all flex items-center gap-2"
                                        >
                                            <Ico path={I.plus} size={14} /> Add Domain Group
                                        </button>
                                    </div>

                                    <div className="space-y-12">
                                        {(form.targetGroups || []).map((group, gi) => (
                                            <div key={`group-${gi}`} className="p-8 bg-slate-50/50 border border-slate-100/50 rounded-[24px] relative space-y-8">
                                                <div className="flex items-center gap-6 border-b border-white pb-6">
                                                    <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-slate-50 shadow-sm">
                                                        <label className="text-[11px] font-black text-[#6015C1] uppercase tracking-[0.15em] whitespace-nowrap px-2">Target Domain</label>
                                                        <div className="relative group/sel min-w-[300px]">
                                                            <select
                                                                value={group.domain}
                                                                onChange={e => handleGroupDomainChange(gi, e.target.value)}
                                                                className="w-full h-[52px] px-6 bg-white border border-slate-100 rounded-[20px] focus:border-[#6015C1] transition-all outline-none font-bold text-slate-900 text-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] appearance-none cursor-pointer pr-12 group-hover/sel:border-purple-200"
                                                            >
                                                                <option value="AI">Artificial Intelligence (AI)</option>
                                                                <option value="Web Development">Web Development</option>
                                                                <option value="Cyber Security">Cyber Security</option>
                                                                <option value="IoT">Internet of Things (IoT)</option>
                                                                <option value="General">General / All</option>
                                                            </select>
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#6015C1]">
                                                                <Ico path={I.chevronDown} size={18} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3 ml-auto">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => addTargetToGroup(gi)}
                                                            className="px-5 py-2.5 bg-white border border-slate-200 text-[#6015C1] rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:border-[#6015C1] hover:bg-white shadow-sm transition-all"
                                                        >
                                                            + Append Target
                                                        </button>
                                                        {form.targetGroups.length > 1 && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeTargetGroup(gi)}
                                                                className="p-2.5 rounded-[12px] bg-rose-50 text-rose-400 hover:text-rose-600 border border-rose-100 transition-all"
                                                            >
                                                                <Ico path={I.trash} size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-6">
                                                    {group.items.map((item, ii) => (
                                                        <div key={`item-${gi}-${ii}`} className="p-6 bg-white border border-slate-100 rounded-[20px] shadow-sm relative group/item border-l-4" style={{ borderColor: group.domain === 'AI' ? '#8B5CF6' : group.domain === 'Web Development' ? '#10B981' : '#6015C1' }}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => group.items.length > 1 && removeTargetFromGroup(gi, ii)}
                                                                disabled={group.items.length <= 1}
                                                                title={group.items.length <= 1 ? "At least one target is required" : "Remove this target"}
                                                                className={`absolute top-4 right-4 p-1.5 rounded-[8px] transition-all ${group.items.length <= 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                                                            >
                                                                <Ico path={I.trash} size={14} />
                                                            </button>
                                                            <div className="space-y-6">
                                                                <div className="space-y-2.5">
                                                                    <label className="text-sm font-medium text-slate-700 ml-1">Target Description</label>
                                                                    <input 
                                                                        required
                                                                        value={item.title}
                                                                        onChange={e => handleTargetChange(gi, ii, "title", e.target.value)}
                                                                        placeholder="e.g. Model Architecture Design"
                                                                        className="w-full h-[44px] px-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-900 font-normal text-sm transition-all outline-none font-inter" 
                                                                    />
                                                                </div>
                                                                <div className="space-y-2.5">
                                                                    <label className="text-sm font-medium text-slate-700 ml-1">Implementation Details</label>
                                                                    <textarea 
                                                                        required
                                                                        rows={3}
                                                                        value={item.description}
                                                                        onChange={e => handleTargetChange(gi, ii, "description", e.target.value)}
                                                                        placeholder="What exactly needs to be accomplished?"
                                                                        className="w-full p-4 bg-white border border-slate-200 rounded-[8px] focus:border-[#6015C1] text-slate-700 font-normal text-sm transition-all outline-none font-inter resize-none" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-10 border-t border-slate-50 bg-slate-50/20">
                                <Button 
                                    disabled={loading}
                                    type="submit" 
                                    className="w-full h-[44px] bg-[#6015C1] text-white rounded-[12px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#6015C1]/20 hover:scale-[1.01] active:scale-95 transition-all text-xs flex items-center justify-center gap-4"
                                >
                                    {loading ? 'Finalizing Setup...' : isEditing ? 'Update Phase & Strategy' : 'Construct Phase Architecture'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
