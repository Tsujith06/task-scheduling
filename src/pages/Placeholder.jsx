import { Ico, I } from "../components/Icons";

export const Placeholder = ({ title }) => (
    <div className="flex items-center justify-center h-64 p-7">
        <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Ico path={I.star} size={22} cls="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">{title}</p>
            <p className="text-xs text-gray-300 mt-1">Coming soon</p>
        </div>
    </div>
);
