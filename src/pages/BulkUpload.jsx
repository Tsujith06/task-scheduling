import { useState } from "react";
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";

export const BulkUpload = () => {
    const [tab, setTab] = useState("Student");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleUpload = () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);
        // Mocking upload logic
        setTimeout(() => {
            setUploading(false);
            setStatus({ success: tab === "Student" ? 50 : 12, failed: 1, errors: ["Row 4: Missing email field"] });
        }, 1200);
    };

    const TABS = ["Student", "Faculty"];

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Data Orchestration 📊</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight">Bulk Import</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                        <span className="bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-800">Master Upload</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">Processing records for {tab}s</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-2 p-1 bg-gray-100 rounded-xl w-fit">
                {TABS.map(t => (
                    <button key={t} onClick={() => { setTab(t); setFile(null); setStatus(null); }}
                        className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                        {t} Upload
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                <Card className="lg:col-span-2 p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white hover:border-fuchsia-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-blue-500 opacity-20"></div>

                    <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${tab === 'Student' ? 'bg-fuchsia-50 text-[#6015C1]' : 'bg-blue-50 text-blue-600'}`}>
                        <Ico path={tab === 'Student' ? I.people : I.award} size={32} />
                    </div>

                    <label className="cursor-pointer text-center group">
                        <span className="text-xl font-semibold text-slate-900 block mb-1">Drop {tab} list here</span>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block">Compatible with .xlsx, .csv bundles</span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".csv, .xlsx" />
                    </label>

                    {file && (
                        <div className="mt-8 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl animate-in zoom-in-95 duration-300">
                            <Ico path={I.check} size={14} cls="text-emerald-400" />
                            <span className="text-[11px] font-semibold tracking-tight">{file.name}</span>
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <Ico path={I.plus} size={14} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                    )}

                    <div className="mt-10 flex gap-4 w-full max-w-sm">
                        <Button
                            onClick={handleUpload}
                            loading={uploading}
                            disabled={!file}
                            className={`flex-1 h-14 rounded-2xl font-semibold uppercase tracking-widest text-white shadow-2xl transition-all ${tab === 'Student' ? 'bg-[#6015C1] shadow-fuchsia-100' : 'bg-blue-600 shadow-blue-100'}`}>
                            {uploading ? 'Analyzing Data...' : `Upload ${tab} Records`}
                        </Button>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-7">
                        <SectionTitle sub="Mandatory schema">Download Template</SectionTitle>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 mt-2">
                            Please ensure your file matches our system schema to prevent validation errors during the batch process.
                        </p>
                        <button className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all text-left group ${tab === 'Student' ? 'bg-fuchsia-50/50 border-fuchsia-100 hover:bg-white hover:shadow-xl hover:shadow-fuchsia-50' : 'bg-blue-50/50 border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-50'}`}>
                            <div className={`p-3 rounded-2xl bg-white border shadow-sm ${tab === 'Student' ? 'text-fuchsia-500 border-fuchsia-50' : 'text-blue-500 border-blue-50'}`}>
                                <Ico path={I.file} size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-semibold text-slate-900">{tab} Template</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">Secure Download · XLSX</p>
                            </div>
                            <Ico path={I.arrow} size={14} cls="text-slate-300 group-hover:translate-x-1 transition-all" />
                        </button>
                    </Card>

                    <Card className="p-7 bg-slate-900 text-white border-none relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                            <Ico path={I.lock} size={120} />
                        </div>
                        <SectionTitle light sub="">Batch Protocol</SectionTitle>
                        <ul className="mt-5 space-y-4 relative z-10">
                            {[
                                "Automerge existing records via Unique ID.",
                                "Email validation is strictly enforced.",
                                "Department codes must match system keys."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-[11px] font-medium leading-tight">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${tab === 'Student' ? 'bg-fuchsia-400' : 'bg-blue-400'}`} />
                                    <span className="opacity-70">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            {status && (
                <Card className="p-8 border-none shadow-[0_30px_60px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom-6 duration-700 rounded-[40px]">
                    <div className="flex justify-between items-center mb-8">
                        <SectionTitle sub="Import summary report">Process Complete</SectionTitle>
                        <Pill color="green">Verified</Pill>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Total Processed</p>
                            <p className="text-3xl font-semibold text-slate-900">{status.success + status.failed}</p>
                        </div>
                        <div className="p-6 rounded-[32px] bg-emerald-50 border border-emerald-100">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-2">Success Rate</p>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-semibold text-emerald-700">{status.success}</p>
                                <p className="text-xs font-semibold text-emerald-500 mb-1.5">{tab}s Registered</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[32px] bg-rose-50 border border-rose-100">
                            <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-widest mb-2">Failed Entries</p>
                            <p className="text-3xl font-semibold text-rose-700">{status.failed}</p>
                        </div>
                    </div>

                    {status.errors?.length > 0 && (
                        <div className="mt-8 p-6 rounded-[32px] bg-rose-50/30 border border-rose-100">
                            <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-[0.2em] mb-4">Error Diagnostics Log</p>
                            <div className="space-y-3">
                                {status.errors.map((e, idx) => (
                                    <div key={idx} className="flex gap-3 items-center">
                                        <div className="w-1 h-1 rounded-full bg-rose-400" />
                                        <p className="text-[13px] text-rose-600 font-semibold">{e}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
