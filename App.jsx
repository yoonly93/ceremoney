import React, { useState } from "react";
import UploadSection from "./components/UploadSection";
import TableSection from "./components/TableSection";
import AdModal from "./components/AdModal";

export default function App() {
  const [adWatched, setAdWatched] = useState(false);
  const [images, setImages] = useState([]);
  const [ocrResults, setOcrResults] = useState([]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!adWatched && <AdModal onAdComplete={() => setAdWatched(true)} />}
      <h1 className="text-2xl font-bold mb-4 text-center">
        결혼/장례 방명록 자동화
      </h1>

      <UploadSection
        adWatched={adWatched}
        images={images}
        setImages={setImages}
        setOcrResults={setOcrResults}
      />

      {ocrResults.length > 0 && (
        <TableSection ocrResults={ocrResults} setOcrResults={setOcrResults} />
      )}
    </div>
  );
}
