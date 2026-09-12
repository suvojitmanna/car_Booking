import React from "react";

const ActionCard = ({ icon, title, button, onClick }:any) => {
  return (
    <div className="bg-white rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
      <div className="flex items-center gap-4">
        <div className="bg-black text-white p-3 md:p-4 rounded-xl shrink-0">
          {icon}
        </div>
        <div className="text-base sm:text-lg md:text-xl font-semibold">
          {title}
        </div>
      </div>
      <button
        className="bg-black text-white px-5 py-2.5 rounded-xl text-sm sm:text-base font-medium cursor-pointer transition hover:bg-gray-700"
        onClick={onClick}
      >
        {button}
      </button>
    </div>
  );
};

export default ActionCard;
