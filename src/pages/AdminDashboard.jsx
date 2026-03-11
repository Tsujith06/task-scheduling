import { useState } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";

// Helper for Circular Progress
const CircularStat = ({ val, label, sub, color, bg, icon }) => {
    const radius = 34;
    const circ = 2 * Math.PI * radius;
    const pct = (val / 300) * 100; // Normalized for demo
    const offset = circ - (pct / 100) * circ;

    return (
        <Card className="p-6 flex items-center justify-between group overflow-hidden relative">
            <div className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Ico path={icon} size={20} style={{ color }} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">{sub}</p>
                </div>
            </div>

            <div className="relative flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
                    <circle cx="40" cy="40" r={radius} stroke={color} strokeWidth="6" fill="transparent"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute text-[13px] font-semibold text-slate-800">{val}</span>
            </div>
        </Card>
    );
};

export const AdminDashboard = () => {
    const reviewStats = [
        { label: "Approved", val: 250, sub: "250 approved", color: "#10B981", bg: "bg-emerald-50", icon: I.check },
        { label: "Rejected", val: 150, sub: "150 rejected", color: "#F43F5E", bg: "bg-rose-50", icon: I.plus }, // Using plus as cross
        { label: "Not Registered", val: 300, sub: "300 not registered", color: "#8B5CF6", bg: "bg-fuchsia-50", icon: I.people },
        { label: "Pending", val: 200, sub: "200 pending", color: "#F59E0B", bg: "bg-amber-50", icon: I.dots },
    ];

    const chartData = [
        { label: "Approved", val: 1600 },
        { label: "rejected", val: 850 },
        { label: "pending", val: 900 },
        { label: "not registered", val: 410 },
        { label: "challenge", val: 800 },
        { label: "Optional", val: 450 },
        { label: "Present", val: 1300 },
        { label: "Absent", val: 700 }
    ];

    const calendarGrid = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Header section (Review Details) */}
            <div className="space-y-4">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4">Review Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {reviewStats.map((s, i) => (
                        <CircularStat key={i} {...s} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status of Reviews Chart */}
                <Card className="lg:col-span-2 p-8">
                    <div className="flex justify-between items-center mb-10">
                        <SectionTitle sub="">Status of Reviews</SectionTitle>
                        <select className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-fuchsia-100 appearance-none pr-10 relative">
                            <option>Approval Review</option>
                        </select>
                    </div>

                    <div className="h-[300px] flex items-end justify-between gap-2 px-4 relative mt-12 pb-8">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12">
                            {[2000, 1600, 1200, 800, 400, 0].map(y => (
                                <div key={y} className="flex items-center gap-4">
                                    <span className="text-[10px] font-semibold text-slate-300 w-8 text-right">{y}</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        {chartData.map((d, i) => (
                            <div key={i} className="relative flex flex-col items-center flex-1 group z-10">
                                <span className="absolute -top-10 text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{d.val}</span>
                                <div className="w-full max-w-[40px] bg-blue-500 rounded-t-lg transition-all duration-1000 ease-out hover:bg-blue-600 hover:scale-x-105 origin-bottom relative"
                                    style={{ height: `${(d.val / 2000) * 260}px` }}>
                                    <div className="absolute inset-0 flex items-center justify-center rotate-[-90deg]">
                                        <span className="text-[10px] font-semibold text-white/40 drop-shadow-sm">{d.val}</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 mt-4 uppercase rotate-[-25deg] origin-top whitespace-nowrap">{d.label}</span>
                            </div>
                        ))}

                        <div className="absolute -left-12 bottom-1/2 -rotate-90 text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
                            no of students
                        </div>
                    </div>
                </Card>

                {/* Sidebar controls */}
                <div className="space-y-6">
                    <Card className="p-8 space-y-7">
                        {/* Semester Select */}
                        <div className="relative">
                            <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-gray-700 outline-none appearance-none">
                                <option>Semester 5</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Ico path={I.arrow} size={14} style={{ transform: 'rotate(90deg)' }} />
                            </div>
                        </div>

                        {/* Mock Calendar */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <p className="text-[14px] font-semibold text-slate-900">March 2020</p>
                                <div className="flex gap-2">
                                    <button className="p-1 text-slate-400 hover:text-slate-800 transition-colors"><Ico path={I.arrow} size={14} style={{ transform: 'rotate(180deg)' }} /></button>
                                    <button className="p-1 text-slate-400 hover:text-slate-800 transition-colors"><Ico path={I.arrow} size={14} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                                    <span key={d} className="text-[10px] font-semibold text-slate-300 uppercase py-2">{d}</span>
                                ))}
                                {Array.from({ length: 4 }).map((_, i) => <span key={`empty-${i}`} />)}
                                {calendarGrid.map(d => (
                                    <button key={d} className={`text-[12px] font-semibold py-2.5 rounded-xl transition-all ${d === 13 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-110' : 'text-slate-600 hover:bg-slate-50'}`}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Secondary Filter */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[12px] font-semibold text-gray-700 outline-none appearance-none">
                                    <option>Approval Review</option>
                                </select>
                            </div>
                            <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                                <Ico path={I.edit} size={16} />
                            </button>
                        </div>

                        {/* Date Range info */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Ico path={I.clock} size={20} /></div>
                                <div>
                                    <p className="text-[9px] font-semibold text-blue-400 tracking-widest uppercase mb-0.5">From Date</p>
                                    <p className="text-[12px] font-semibold text-slate-800">13 MAR 2024</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 border-l border-slate-100 pl-3">
                                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 opacity-60"><Ico path={I.clock} size={20} /></div>
                                <div>
                                    <p className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase mb-0.5 opacity-60">To Date</p>
                                    <p className="text-[12px] font-semibold text-slate-800 opacity-60">14 MAR 2024</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

