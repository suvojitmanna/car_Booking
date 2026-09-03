"use client";
import React from "react";

const DocPreview = ({ label, url }: any) => {
  const isImage = url?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPdf = url?.match(/\.pdf$/i);
  return (
    <div className="bg-gray-50 rounded-2xl border overflow-hidden shadow-sm">
      <div className="px-4 py-2 border-b text-sm font-semibold text-gray-600">
        {label}
      </div>
      <div className="h-52 flex items-center justify-center bg-white">
        {!url && (
          <span className="text-xs text-gray-400">Image Not uploaded</span>
        )}
        {isImage && <img src={url} className="w-full h-full object-cover" />}
        {isPdf && <iframe src={url} className="w-full h-full" />}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center text-xs py-2 font-medium hover:bg-gray-100"
      >
        Open Full Document
      </a>
    </div>
  );
};

export default DocPreview;
