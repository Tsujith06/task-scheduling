import { Ico, I } from "./Icons";

export const Pill = ({ children, color = "accent" }) => {
    const map = {
        accent: "bg-fuchsia-50/80 text-fuchsia-700 border border-fuchsia-200 shadow-sm",
        green: "bg-emerald-50/80 text-emerald-700 border border-emerald-200 shadow-sm",
        amber: "bg-amber-50/80 text-amber-700 border border-amber-200 shadow-sm",
        red: "bg-rose-50/80 text-rose-700 border border-rose-200 shadow-sm",
        gray: "bg-slate-50 text-slate-600 border border-slate-200 shadow-sm",
        blue: "bg-blue-50/80 text-blue-700 border border-blue-200 shadow-sm",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-[10px] font-semibold tracking-wider uppercase leading-none ${map[color]}`}>
            {children}
        </span>
    );
};

export const Avatar = ({ name, size = 36 }) => {
    const palette = ["#6015C1", "#0EA5E9", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"];
    const safeName = name || "User";
    const bg = palette[safeName.charCodeAt(0) % palette.length];
    const initials = safeName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div className="rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none ring-2 ring-white/50 shadow-sm"
            style={{ width: size, height: size, background: bg, fontSize: size * 0.35, letterSpacing: "0.02em" }}>
            {initials}
        </div>
    );
};

export const Bar = ({ pct, color = "#6015C1", h = 6 }) => (
    <div className="w-full rounded-full overflow-hidden bg-slate-100/80 ring-1 ring-inset ring-slate-200/50" style={{ height: h }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})` }} />
    </div>
);

export const Card = ({ children, className = "", ...props }) => (
    <div className={`glass-card rounded-[16px] ${className} hover:fluent-shadow transition-shadow duration-300`} {...props}>
        {children}
    </div>
);

export const SectionTitle = ({ children, sub }) => (
    <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">{children}</h2>
        {sub && <p className="text-[11px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{sub}</p>}
    </div>
);
