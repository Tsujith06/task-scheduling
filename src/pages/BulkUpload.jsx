import { useState } from "react";
import ExcelJS from 'exceljs';
import { Ico, I } from "../components/Icons";
import { Card, SectionTitle, Pill } from "../components/SharedComponents";
import { Button } from "../components/ui/button";
import { bulkUsers, bulkProjectPool } from "../api";

export const BulkUpload = ({ user }) => {
    const [tab, setTab] = useState("Student");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null);

    const handleDownloadTemplate = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template');
        let filename = "";
        let headers = [];
        let sampleRow = [];
        let statusOptions = "";

        if (tab === "Student") {
            headers = ["Name", "Roll Number", "Email", "Department", "Status"];
            sampleRow = ["John Doe", "21CS001", "john@college.edu", "CSE", "Active"];
            statusOptions = '"Active,Inactive,On Leave,OD"';
            filename = "student_template.xlsx";
        } else if (tab === "Faculty") {
            headers = ["Name", "Faculty ID", "Email", "Department", "Status"];
            sampleRow = ["Dr. Smith", "EMP101", "smith@college.edu", "CSE", "Active"];
            statusOptions = '"Active,Inactive,On Leave,OD"';
            filename = "faculty_template.xlsx";
        } else if (tab === "Project Title") {
            headers = ["Title", "Domain", "Description"];
            sampleRow = ["AI Resume Builder", "AI", "Automated resume generation using NLP"];
            statusOptions = "";
            filename = "project_title_template.xlsx";
        }

        // Add headers and style them
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF6015C1' } // Your purple theme
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // Add sample data
        worksheet.addRow(sampleRow);

        // Add Dropdown to Status column if options exist
        if (statusOptions) {
            const statusColIndex = headers.length;
            for (let i = 2; i <= 100; i++) {
                worksheet.getCell(i, statusColIndex).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [statusOptions]
                };
            }
        }

        // Auto-width columns
        worksheet.columns.forEach(column => {
            column.width = 25;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);

        try {
            const workbook = new ExcelJS.Workbook();
            const data = await file.arrayBuffer();
            await workbook.xlsx.load(data);
            const worksheet = workbook.getWorksheet(1);
            
            const rows = [];
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) { // Skip header
                    const rowData = {};
                    // Specifically get columns 1-6 to avoid cellCount issues
                    for(let i = 1; i <= 6; i++) {
                        const cell = row.getCell(i);
                        let val = cell.value;
                        if (val && typeof val === 'object') {
                            val = val.text || val.result || val.richText?.[0]?.text || "";
                        }
                        rowData[i] = val;
                    }
                    rows.push(rowData);
                }
            });

            if (tab === "Student" || tab === "Faculty") {
                const users = rows.map(r => ({
                    name: r[1],
                    sid: r[2],
                    email: r[3],
                    dept: r[4],
                    status: r[5] || 'Active',
                    role: tab === "Student" ? "Student" : "Mentor",
                    password: 'password'
                })).filter(u => u.name && u.email);

                if (users.length === 0) throw new Error("No valid records found. Please ensure Name and Email are filled.");

                try {
                    const res = await bulkUsers(users);
                    setStatus({ success: res.data.count, failed: 0, errors: [] });
                } catch (apiErr) {
                    // Handle duplicate key errors (partial success)
                    const count = apiErr.response?.data?.count || 0;
                    const msg = apiErr.response?.data?.message || apiErr.message;
                    setStatus({ 
                        success: count, 
                        failed: users.length - count, 
                        errors: [msg.includes("duplicate key") ? "Some records already exist and were skipped." : msg] 
                    });
                }
            } else if (tab === "Project Title") {
                const titles = rows.map(r => ({
                    title: r[1],
                    domain: r[2],
                    description: r[3]
                })).filter(t => t.title);

                if (titles.length === 0) throw new Error("No valid titles found.");

                try {
                    const res = await bulkProjectPool(titles);
                    setStatus({ success: res.data.count, failed: 0, errors: [] });
                } catch (apiErr) {
                    const count = apiErr.response?.data?.count || 0;
                    const msg = apiErr.response?.data?.message || apiErr.message;
                    setStatus({ 
                        success: count, 
                        failed: titles.length - count, 
                        errors: [msg.includes("duplicate key") ? "Some titles already exist." : msg] 
                    });
                }
            }
        } catch (err) {
            console.error("Upload Error:", err);
            setStatus({ 
                success: 0, 
                failed: 1, 
                errors: [err.response?.data?.message || err.message || "Upload failed. Please check the file format."] 
            });
        } finally {
            setUploading(false);
        }
    };

    const TABS = ["Student", "Faculty", "Project Title"];

    return (
        <div className="p-7 space-y-6 max-w-7xl mx-auto">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">Bulk Upload</h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-2 p-1 bg-gray-100 rounded-[12px] w-fit">
                {TABS.map(t => (
                    <button key={t} onClick={() => { setTab(t); setFile(null); setStatus(null); }}
                        className={`px-6 py-2.5 rounded-[8px] text-[13px] font-semibold transition-all duration-200 ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                        {t} Upload
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                <Card className="lg:col-span-2 p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white hover:border-fuchsia-300 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-blue-500 opacity-20"></div>

                    <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                        tab === 'Student' ? 'bg-fuchsia-50 text-[#6015C1]' : 
                        tab === 'Faculty' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                    }`}>
                        <Ico path={
                            tab === 'Student' ? I.people : 
                            tab === 'Faculty' ? I.award :
                            I.file
                        } size={32} />
                    </div>

                    <label className="cursor-pointer text-center group">
                        <span className="text-xl font-semibold text-slate-900 block mb-1">Drop {tab} list here</span>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest block">Compatible with .xlsx, .csv bundles</span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".csv, .xlsx" />
                    </label>

                    {file && (
                        <div className="mt-8 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-[12px] animate-in zoom-in-95 duration-300">
                            <Ico path={I.check} size={14} cls="text-emerald-400" />
                            <span className="text-[11px] font-semibold tracking-tight">{file.name}</span>
                            <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded-[8px] transition-colors">
                                <Ico path={I.plus} size={14} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                    )}

                    <div className="mt-10 flex gap-4 w-full max-w-sm">
                        <Button
                            onClick={handleUpload}
                            loading={uploading}
                            disabled={!file}
                            className={`flex-1 h-[44px] rounded-[12px] font-semibold uppercase tracking-widest text-white shadow-2xl transition-all ${
                                tab === 'Student' ? 'bg-[#6015C1] shadow-fuchsia-100' : 
                                tab === 'Faculty' ? 'bg-blue-600 shadow-blue-100' :
                                'bg-amber-500 shadow-amber-100'
                            }`}>
                            {uploading ? 'Analyzing Data...' : `Upload ${tab} Records`}
                        </Button>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-7 mb-6 rounded-[16px]">
                        <SectionTitle sub="Mandatory schema">Download Template</SectionTitle>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-6 mt-2">
                            Please ensure your file matches our system schema to prevent validation errors during the batch process.
                        </p>

                        <button 
                            onClick={handleDownloadTemplate}
                            className={`w-full flex items-center gap-4 p-5 rounded-[16px] border transition-all text-left group ${
                                tab === 'Student' ? 'bg-fuchsia-50/50 border-fuchsia-100 hover:bg-white hover:shadow-xl hover:shadow-fuchsia-50' : 
                                tab === 'Faculty' ? 'bg-blue-50/50 border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-50' :
                                'bg-amber-50/50 border-amber-100 hover:bg-white hover:shadow-xl hover:shadow-amber-50'
                            }`}>
                            <div className={`p-3 rounded-[12px] bg-white border shadow-sm ${
                                tab === 'Student' ? 'text-fuchsia-500 border-fuchsia-50' : 
                                tab === 'Faculty' ? 'text-blue-500 border-blue-50' :
                                'text-amber-500 border-amber-50'
                            }`}>
                                <Ico path={I.file} size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-semibold text-slate-900">{tab} Template</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">Secure Download · XLSX</p>
                            </div>
                            <Ico path={I.arrow} size={14} cls="text-slate-300 group-hover:translate-x-1 transition-all" />
                        </button>
                    </Card>

                </div>
            </div>

            {status && (
                <Card className="p-8 border-none shadow-[0_30px_60px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom-6 duration-700 rounded-[16px]">
                    <div className="flex justify-between items-center mb-8">
                        <SectionTitle sub="Import summary report">Process Complete</SectionTitle>
                        <Pill color="green">Verified</Pill>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-6 rounded-[16px] bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Total Processed</p>
                            <p className="text-3xl font-semibold text-slate-900">{status.success + status.failed}</p>
                        </div>
                        <div className="p-6 rounded-[16px] bg-emerald-50 border border-emerald-100">
                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-2">Success Rate</p>
                            <div className="flex items-end gap-2">
                                <p className="text-3xl font-semibold text-emerald-700">{status.success}</p>
                                <p className="text-xs font-semibold text-emerald-500 mb-1.5">{tab}s Registered</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[16px] bg-rose-50 border border-rose-100">
                            <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-widest mb-2">Failed Entries</p>
                            <p className="text-3xl font-semibold text-rose-700">{status.failed}</p>
                        </div>
                    </div>

                    {status.errors?.length > 0 && (
                        <div className="mt-8 p-6 rounded-[16px] bg-rose-50/30 border border-rose-100">
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
