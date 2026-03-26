import { useState, useEffect } from "react";
import { Ico, I } from "../components/Icons";
import { login } from "../api";
import { Button } from "../components/ui/button";
import loginIllustration from "../assets/login-illustration.png";

export const LoginPage = ({ onLogin }) => {
    const [showPw, setShowPw] = useState(false);
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

    const submit = async () => {
        if (!email || !pw) { setErr("Please fill in all fields."); return; }
        setErr("");
        setLoading(true);

        try {
            const res = await login(email, pw);
            if (res.data.status === 'success') {
                onLogin(res.data.user);
            } else {
                setErr(res.data.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            if (!error.response) {
                setErr("Network Error: Backend server is unreachable. Please ensure it is running on port 5000.");
            } else {
                setErr(error.response?.data?.message || "Invalid credentials. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-white p-4 lg:p-10 font-['Poppins'] overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
                
                .shake { animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both; }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>

            <div className={`w-full max-w-7xl h-full max-h-[850px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[16px] overflow-hidden border border-slate-50 shadow-2xl shadow-slate-100/50 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} `}>

                {/* Visual Panel */}
                <div className="hidden lg:flex items-center justify-center p-16 bg-[#F8F9FB] relative">
                    <img
                        src={loginIllustration}
                        alt="Collaboration"
                        className="w-full h-auto max-w-lg object-contain"
                        onError={(e) => { e.target.src = "https://illustrations.popsy.co/purple/collaboration.svg"; }}
                    />
                </div>

                {/* Form Panel */}
                <div className="flex flex-col items-center justify-center p-8 lg:p-24 bg-white relative">
                    <div className="w-full max-w-sm">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-10">
                            <span className="font-semibold text-2xl text-[#6015C1] tracking-tighter">EduTrack</span>
                        </div>

                        {/* Title Section */}
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-400 text-sm font-medium">Enter your email and password to access your account</p>
                        </div>

                        {/* Form */}
                        <div className={`space-y-6 ${err ? 'shake' : ''} `}>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest pl-1">Email</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter your Email"
                                    className="w-full h-[44px] px-5 bg-slate-50 border border-slate-100 rounded-[8px] text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6015C1] focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-widest pl-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={pw}
                                        onChange={e => setPw(e.target.value)}
                                        placeholder="Enter your Password"
                                        className="w-full h-[44px] px-5 pr-14 bg-slate-50 border border-slate-100 rounded-[8px] text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#6015C1] focus:ring-4 focus:ring-purple-50 transition-all placeholder:text-slate-300"
                                    />
                                    <button
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-[#6015C1] transition-colors"
                                    >
                                        <Ico path={showPw ? I.eyeOff : I.eye} size={18} />
                                    </button>
                                </div>
                            </div>

                            {err && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-[12px] flex items-center gap-3">
                                    <Ico path={I.alert} size={16} cls="text-rose-500 flex-shrink-0" />
                                    <p className="text-xs font-semibold text-rose-600">{err}</p>
                                </div>
                            )}

                            <Button
                                onClick={submit}
                                loading={loading}
                                className="w-full h-[44px] bg-[#6015C1] hover:bg-[#4A0D97] text-white rounded-[12px] font-semibold text-sm tracking-wide transition-all shadow-xl shadow-purple-100 flex items-center justify-center"
                            >
                                {loading ? "Verifying..." : "Sign In"}
                            </Button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
