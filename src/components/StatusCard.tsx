import React from "react";

interface StatusCardProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
}

const StatusCard = ({ icon, title, message }: StatusCardProps) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              Pending Approval
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-center md:text-right shrink-0">
        Need changes? Click any completed step above to update.
      </div>
    </div>
  );
};

export default StatusCard;