import React from "react";
import Tesseract from "tesseract.js";

export default function UploadSection({ adWatched, images, setImages, setOcrResults }) {
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { data } = await Tesseract.recognize(file, "kor+eng");
      const text = data.text;

      // 단순 파싱 예시
      const nameMatch = text.match(/[가-힣A-Za-z\s]+/);
      const amountMatch = text.match(/\d+/);
      const adultMatch = text.match(/대인\s*(\d+)/);
      const childMatch = text.match(/소인\s*(\d+)/);

      results.push({
        번호: i + 1,
        성명: nameMatch ? nameMatch[0] : "확인 필요",
        축의금: amountMatch ? amountMatch[0] : 0,
        식권_대인: adultMatch ? adultMatch[1] : 0,
        식권_소인: childMatch ? childMatch[1] : 0,
      });
    }

    setOcrResults(results);
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        multiple
        accept="image/*"
        capture="camera"
        disabled={!adWatched}
        onChange={handleFiles}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50"
      />
    </div>
  );
}
