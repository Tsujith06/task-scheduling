import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill, Avatar } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { getTasks, updateTask, getUsers } from "../api";

export const TaskAssignments = ({ user }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [reason, setReason] = useState("");
    const [newDate, setNewDate] = useState("");
    const [allUsers, setAllUsers] = useState([]);

    const fetchTasks = async () => {
        try {
            const res = await getTasks();
            const curName = user?.name?.trim().toLowerCase();
            // Show tasks assigned TO the user or assigned BY the user
            setAssignments(res.data.filter(t =>
                t.assignee?.trim().toLowerCase() === curName ||
                t.assignedBy?.trim().toLowerCase() === curName
            ));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.name) {
            fetchTasks();
            getUsers().then(res => setAllUsers(res.data)).catch(console.error);
        }
    }, [user?.name]);

    const handleAccept = async (id) => {
        try {
            await updateTask(id, { assignmentStatus: 'Accepted', status: 'In Progress' });
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const handleReject = async (id) => {
        try {
            await updateTask(id, { assignmentStatus: 'Rescheduled', rescheduleReason: 'Rejected' });
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    const openReschedule = (task) => {
        setSelectedTask(task);
        setShowModal(true);
    };

    const submitReschedule = async () => {
        if (!reason || !newDate) return;
        try {
            await updateTask(selectedTask._id, {
                assignmentStatus: 'Rescheduled',
                rescheduleReason: reason,
                deadline: newDate
            });
            setShowModal(false);
            setReason("");
            setNewDate("");
            fetchTasks();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="p-10 text-center text-slate-400 font-semibold animate-pulse">Synchronizing assignments...</div>;

    const curName = user?.name?.trim().toLowerCase();
    const inbox = assignments.filter(a => a.assignee?.trim().toLowerCase() === curName && a.assignmentStatus === "Pending");
    const outbox = assignments.filter(a => a.assignedBy?.trim().toLowerCase() === curName && a.assignee?.trim().toLowerCase() !== curName);

    return (
        <div className="p-7 space-y-7 max-w-7xl mx-auto font-['Poppins']">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {/* Pending Requests (Inbox) */}
                <Card className="p-6">
                    <SectionTitle sub="Tasks awaiting your response">Received Requests ({inbox.length})</SectionTitle>
                    <div className="space-y-4">
                        {inbox.length === 0 ? (
                            <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                                <p className="text-sm text-slate-400 font-medium italic">No pending assignments for you.</p>
                            </div>
                        ) : (
                            inbox.map(a => (
                                <div key={a._id} className="p-5 border border-slate-100 rounded-2xl bg-white space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                    <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Avatar name={a.assignedBy} size={20} />
                                        <span className="text-[11px] text-slate-500 font-medium">From: <span className="text-slate-900 font-semibold">{a.assignedBy}</span></span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            {new Date(a.deadline).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2">
                                            <Button onClick={() => openReschedule(a)} variant="outline" size="sm" className="h-8 px-3 rounded-lg text-slate-500 text-xs font-semibold">Reschedule</Button>
                                            <Button onClick={() => handleAccept(a._id)} size="sm" className="h-8 px-4 rounded-lg bg-[#6015C1] text-white text-xs font-semibold">Accept</Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Sent Requests (Outbox) */}
                <Card className="p-6">
                    <SectionTitle sub="Tasks you recently assigned">Sent Requests ({outbox.length})</SectionTitle>
                    <div className="space-y-4">
                        {outbox.length === 0 ? (
                            <div className="py-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                                <p className="text-sm text-slate-400 font-medium italic">You haven't assigned any tasks yet.</p>
                            </div>
                        ) : (
                            outbox.map(a => (
                                <div key={a._id} className="p-4 border border-slate-50 rounded-2xl bg-slate-50/30 flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-sm font-semibold text-slate-800">{a.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <Avatar name={a.assignee} size={18} />
                                            <span className="text-[10px] text-slate-500 font-medium">To: <span className="text-slate-700 font-semibold">{a.assignee}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <Pill color={a.assignmentStatus === "Accepted" ? "green" : a.assignmentStatus === "Rescheduled" ? "amber" : "accent"}>
                                            {a.assignmentStatus}
                                        </Pill>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(a.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>


            {/* Reschedule Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-6">
                    <Card className="w-full max-w-md p-6 bg-white animate-in zoom-in duration-200">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Reschedule Task</h3>
                        <p className="text-sm text-slate-500 mb-6">Provide a reason and new date for "{selectedTask?.title}"</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Proposed New Deadline</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6015C1] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reason for Change</label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="E.g., Overloaded with other tasks, Need more info..."
                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6015C1] focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-slate-300 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => { setShowModal(false); setReason(""); setNewDate(""); }}
                                    variant="ghost"
                                    className="flex-1 h-12 rounded-xl text-slate-500 font-semibold border border-slate-100 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitReschedule}
                                    className="flex-[2] h-12 bg-[#6015C1] hover:bg-[#4A0D97] text-white rounded-xl font-semibold tracking-wide shadow-lg shadow-purple-100"
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
