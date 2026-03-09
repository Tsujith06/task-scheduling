import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";

export const LoginPage = ({ onLogin }) => {
    const [showPw, setShowPw] = useState(false);
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [remember, setRemember] = useState(false);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const submit = () => {
        if (!email || !pw) { setErr("Please fill in all fields."); return; }
        setErr(""); setLoading(true);
        setTimeout(() => { setLoading(false); onLogin(); }, 1100);
    };

    const inp = "w-full py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 outline-none transition-all focus:border-fuchsia-400 focus:bg-white";

    return (
        <div className="min-h-screen flex items-center justify-center p-6"
            style={{ background: "linear-gradient(135deg,#F0F2FF 0%,#F8F9FC 50%,#EDF9F4 100%)" }}>
            <style>{`
        input::placeholder{color:#C4C9D6}
        .fu{opacity:0;transform:translateY(16px);transition:opacity .45s ease,transform .45s ease}
        .fu.in{opacity:1;transform:none}
      `}</style>

            {/* Bg orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full opacity-25"
                    style={{ background: "radial-gradient(circle,#E0B5FA,transparent)" }} />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle,#A7F3D0,transparent)" }} />
            </div>

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className={`fu ${mounted ? "in" : ""} text-center mb-8`} style={{ transitionDelay: ".05s" }}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-lg"
                        style={{ background: "linear-gradient(135deg,#6015C1,#8B2AE0)" }}>
                        <Ico path={I.star} size={20} cls="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">EduTrack</h1>
                    <p className="text-sm text-gray-400 mt-1">Student project workspace</p>
                </div>

                {/* Form card */}
                <div className={`fu ${mounted ? "in" : ""} bg-white rounded-3xl shadow-xl border border-gray-100 p-8`}
                    style={{ transitionDelay: ".12s" }}>
                    <h2 className="text-lg font-semibold text-gray-900 mb-0.5">Sign in</h2>
                    <p className="text-xs text-gray-400 mb-7">Enter your credentials to continue</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email / Register No.</label>
                            <div className="relative">
                                <Ico path={I.mail} size={15} cls="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C4C9D6" }} />
                                <input type="text" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="21CS045 or you@college.edu"
                                    className={`${inp} pl-10 pr-4`}
                                    onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(96,21,193,.1)"}
                                    onBlur={e => e.target.style.boxShadow = "none"} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
                            <div className="relative">
                                <Ico path={I.lock} size={15} cls="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C4C9D6" }} />
                                <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
                                    placeholder="••••••••"
                                    className={`${inp} pl-10 pr-10`}
                                    onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(96,21,193,.1)"}
                                    onBlur={e => e.target.style.boxShadow = "none"} />
                                <button onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                    <Ico path={showPw ? I.eyeOff : I.eye} size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <div onClick={() => setRemember(!remember)}
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${remember ? "border-fuchsia-500 bg-fuchsia-500" : "border-gray-300 bg-white"}`}>
                                    {remember && <Ico path={I.check} size={9} cls="text-white" />}
                                </div>
                                <span className="text-xs text-gray-500 select-none">Remember me</span>
                            </label>
                            <button className="text-xs font-medium text-fuchsia-500 hover:text-fuchsia-700 transition-colors">Forgot password?</button>
                        </div>

                        {err && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                <Ico path={I.alert} size={13} cls="text-red-500 flex-shrink-0" />
                                <p className="text-xs text-red-600">{err}</p>
                            </div>
                        )}

                        <button onClick={submit} disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 mt-1"
                            style={{ background: loading ? "#9E44F2" : "linear-gradient(135deg,#6015C1,#7A22E1)", boxShadow: "0 4px 14px rgba(96,21,193,.3)" }}>
                            {loading
                                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                                : <>Sign in <Ico path={I.arrow} size={15} /></>}
                        </button>
                    </div>
                </div>

                <div className={`fu ${mounted ? "in" : ""} text-center mt-5`} style={{ transitionDelay: ".2s" }}>
                    <p className="text-xs text-gray-400">
                        Need help?{" "}
                        <button className="text-fuchsia-500 font-medium hover:underline">Contact admin support</button>
                    </p>
                </div>
            </div>
        </div>
    );
};
