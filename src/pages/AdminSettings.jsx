import { useState, useEffect } from "react";
import { Card, SectionTitle } from "../components/SharedComponents";
import { getSettings, updateSettings } from "../api";

export const AdminSettings = ({ user }) => {
    const [settings, setSettings] = useState({
        maxTeamSize: 4,
        teamDeadline: '',
        mentorTeamLimit: 5,
        submissionDeadline: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getSettings();
                if (res.data) {
                    setSettings({
                        ...res.data,
                        teamDeadline: res.data.teamDeadline ? res.data.teamDeadline.split('T')[0] : '',
                        submissionDeadline: res.data.submissionDeadline ? res.data.submissionDeadline.split('T')[0] : ''
                    });
                }
            } catch (err) { console.error(err); }
        };
        fetch();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings(settings);
            alert("Settings updated successfully!");
        } catch (err) {
            alert("Failed to update settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-7 max-w-7xl mx-auto font-['Poppins']">
            {/* Hero header */}
            <div className="py-4 flex items-center justify-between mb-8">
                <div className="relative z-10 font-['Poppins']">
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 font-semibold">Good morning 👋</p>
                    <h2 className="text-black text-3xl font-semibold tracking-tight uppercase">Settings</h2>
                </div>
            </div>

            <Card className="p-8 space-y-8 border-none shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Max Team Size</label>
                        <input
                            type="number"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                            value={settings.maxTeamSize}
                            onChange={e => setSettings({ ...settings, maxTeamSize: parseInt(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mentor Team Limit</label>
                        <input
                            type="number"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                            value={settings.mentorTeamLimit}
                            onChange={e => setSettings({ ...settings, mentorTeamLimit: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <SectionTitle sub="Deadline for abstract & SRS submission">Title & Proposal Deadline</SectionTitle>
                        <input
                            type="date"
                            className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/10 transition-all"
                            value={settings.submissionDeadline}
                            onChange={e => setSettings({ ...settings, submissionDeadline: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-[#6015C1] text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#4a0fb0] transition-all disabled:opacity-50"
                >
                    {isSaving ? "Saving..." : "Save System Configurations"}
                </button>
            </Card>
        </div>
    );
};
