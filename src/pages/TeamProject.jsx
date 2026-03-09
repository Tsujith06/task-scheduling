import { useState } from "react";
import { Ico, I } from "../components/Icons";
import { Pill, Avatar, Bar, Card, SectionTitle } from "../components/SharedComponents";

export const TeamProject = () => {
    const [tab, setTab] = useState("team");

    const TABS = [
        { id: "team", label: "Team" },
        { id: "project", label: "Project Details" },
        { id: "overview", label: "Overview" },
    ];

    const members = [
        { name: "Arjun Kumar", reg: "21CS045", role: "Leader", email: "arjun@college.edu" },
        { name: "Priya Singh", reg: "21CS046", role: "Member", email: "priya@college.edu" },
        { name: "Rohit Das", reg: "21CS047", role: "Member", email: "rohit@college.edu" },
        { name: "Sneha M", reg: "21CS048", role: "Member", email: "sneha@college.edu" },
    ];

    const phases = [
        { name: "Phase 1 — Requirements", deadline: "Feb 10", pct: 100, status: "Completed", color: "#10B981" },
        { name: "Phase 2 — System Design", deadline: "Mar 15", pct: 75, status: "In Progress", color: "#6015C1" },
        { name: "Phase 3 — Development", deadline: "Apr 20", pct: 40, status: "In Progress", color: "#3B82F6" },
        { name: "Phase 4 — Testing", deadline: "May 10", pct: 0, status: "Not Started", color: "#D1D5DB" },
    ];

    const docs = [
        { name: "Project Proposal", file: "proposal_v2.pdf", size: "1.2 MB" },
        { name: "System Design", file: "design_doc.pdf", size: "3.4 MB" },
        { name: "Progress Report", file: "report_mar.docx", size: "890 KB" },
        { name: "Presentation", file: "review2_ppt.pptx", size: "5.1 MB" },
    ];

    return (
        <div className="p-7 max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all duration-200 ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Team */}
            {tab === "team" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <Card className="p-6">
                        <SectionTitle>Team Information</SectionTitle>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Team Name</p>
                                <p className="text-sm font-bold text-gray-800">Team Alpha</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-[13px] text-gray-600 leading-relaxed">Smart attendance via face recognition and ML.</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Leader</p>
                                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-fuchsia-50 border border-fuchsia-100">
                                    <Avatar name="Arjun Kumar" size={26} />
                                    <span className="text-[13px] font-semibold text-gray-800">Arjun Kumar</span>
                                    <Pill color="accent">Leader</Pill>
                                </div>
                            </div>
                            <button className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-xs font-semibold text-gray-400 hover:border-fuchsia-300 hover:text-fuchsia-500 transition-all flex items-center justify-center gap-1.5">
                                <Ico path={I.plus} size={13} />Invite Member
                            </button>
                        </div>
                    </Card>

                    <Card className="p-6 xl:col-span-2">
                        <SectionTitle sub={`${members.length} members`}>Team Members</SectionTitle>
                        <div className="space-y-1.5">
                            {members.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <Avatar name={m.name} size={36} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-gray-800">{m.name}</p>
                                        <p className="text-[11px] text-gray-400 font-mono">{m.reg} · {m.email}</p>
                                    </div>
                                    <Pill color={m.role === "Leader" ? "accent" : "gray"}>{m.role}</Pill>
                                    {m.role !== "Leader" && (
                                        <button className="text-[11px] text-fuchsia-500 font-medium hover:underline flex-shrink-0">Promote</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Project Details */}
            {tab === "project" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <Card className="p-7 xl:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Pill color="green">Approved</Pill>
                                <Pill color="blue">AI / ML</Pill>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Smart Attendance Management System</h2>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                            <p className="text-[13px] text-gray-600 leading-relaxed">
                                An automated system leveraging computer vision and face recognition to streamline
                                attendance in educational institutions, reducing manual effort and improving accuracy.
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Objectives</p>
                            <div className="space-y-2">
                                {["Automate attendance using face detection", "Generate real-time attendance reports", "Integrate with existing LMS", "Support multi-class scheduling"].map((o, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-50">
                                            <Ico path={I.check} size={9} style={{ color: "#10B981" }} />
                                        </div>
                                        <span className="text-[13px] text-gray-600">{o}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Technology Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {["Python", "OpenCV", "TensorFlow", "React", "FastAPI", "PostgreSQL", "AWS S3"].map(t => (
                                    <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">{t}</span>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-6">
                        <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Assigned Mentor</p>
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                                <Avatar name="Dr Ramesh V" size={40} />
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Dr. Ramesh V</p>
                                    <p className="text-xs text-gray-400">Dept. of CSE</p>
                                    <p className="text-xs text-fuchsia-500 mt-0.5">ramesh@college.edu</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Duration", value: "5 months" },
                                { label: "Domain", value: "AI / ML" },
                                { label: "Status", value: "In Progress" },
                                { label: "Year", value: "2024–25" },
                            ].map((d, i) => (
                                <div key={i}>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{d.label}</p>
                                    <p className="text-[13px] font-semibold text-gray-700">{d.value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Overview */}
            {tab === "overview" && (
                <div className="space-y-5">
                    <Card className="p-6">
                        <SectionTitle sub="Phase-wise deadlines">Project Milestones</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {phases.map((p, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-800">{p.name}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Deadline: {p.deadline}</p>
                                        </div>
                                        <Pill color={p.status === "Completed" ? "green" : p.status === "In Progress" ? "accent" : "gray"}>
                                            {p.status}
                                        </Pill>
                                    </div>
                                    <Bar pct={p.pct} color={p.color} h={6} />
                                    <p className="text-right text-[11px] font-bold mt-1.5" style={{ color: p.pct === 0 ? "#D1D5DB" : p.color }}>{p.pct}%</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-5">
                            <SectionTitle sub="Uploaded project files">Documents</SectionTitle>
                            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-fuchsia-600 bg-fuchsia-50 hover:bg-fuchsia-100 transition-colors">
                                <Ico path={I.upload} size={13} />Upload
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {docs.map((d, i) => (
                                <div key={i} className="p-4 rounded-xl border border-gray-100 hover:border-fuchsia-200 hover:shadow-sm transition-all cursor-pointer group">
                                    <div className="w-9 h-9 rounded-xl bg-fuchsia-50 flex items-center justify-center mb-3 group-hover:bg-fuchsia-100 transition-colors">
                                        <Ico path={I.file} size={16} style={{ color: "#7A22E1" }} />
                                    </div>
                                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">{d.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{d.file}</p>
                                    <p className="text-[10px] text-gray-400">{d.size}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
