import React from "react";

export default function AdModal({ onAdComplete }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-2">광고 시청 후 업로드 가능</h2>
        <video
          className="w-full"
          controls
          onEnded={onAdComplete}
          src="ad.mp4" // 실제 광고 영상 경로
        />
      </div>
    </div>
  );
}
