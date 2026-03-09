import { Ico, I } from "./Icons";
import { Avatar } from "./SharedComponents";

export const TopBar = ({ page }) => {
    const titles = { dashboard: "Dashboard", team: "Team & Project", tasks: "Task Board", files: "Documents", notifications: "Notifications" };
    return (
        <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-7 flex-shrink-0">
            <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-gray-900">{titles[page]}</h1>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-400">Smart Attendance System</span>
            </div>
            <div className="flex items-center gap-2">
                <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors">
                    <Ico path={I.bell} size={16} cls="text-gray-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-500" />
                </button>
                <Avatar name="Arjun Kumar" size={30} />
            </div>
        </header>
    );
};
