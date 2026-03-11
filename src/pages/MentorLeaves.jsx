import { Ico, I } from "../components/Icons";
import { Card, SectionTitle } from "../components/SharedComponents";

export const MentorLeaves = () => (
    <div className="p-7 space-y-6 max-w-7xl mx-auto">
        <div className="py-4 flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">Request Overview 🗓️</p>
                <h2 className="text-black text-3xl font-semibold tracking-tight">Leave Approvals</h2>
            </div>
        </div>

        <Card className="p-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Ico path={I.clock} size={28} cls="text-slate-200" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No Pending Requests</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">When students or team members request leave, they will appear here for your review.</p>
        </Card>
    </div>
);
