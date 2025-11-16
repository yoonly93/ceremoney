import React from "react";

export default function TableSection({ ocrResults, setOcrResults }) {
  const handleChange = (index, field, value) => {
    const newData = [...ocrResults];
    newData[index][field] = value;
    setOcrResults(newData);
  };

  const totalAmount = ocrResults.reduce((acc, row) => acc + Number(row.축의금), 0);

  const downloadCSV = () => {
    const header = ["번호", "성명", "축의금", "식권_대인", "식권_소인"];
    const rows = ocrResults.map((r) =>
      [r.번호, r.성명, r.축의금, r.식권_대인, r.식권_소인].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `wedding_gift_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">번호</th>
            <th className="px-4 py-2 border">성명</th>
            <th className="px-4 py-2 border">축의금</th>
            <th className="px-4 py-2 border">식권_대인</th>
            <th className="px-4 py-2 border">식권_소인</th>
          </tr>
        </thead>
        <tbody>
          {ocrResults.map((row, i) => (
            <tr key={i} className="text-center">
              <td className="px-4 py-2 border">{row.번호}</td>
              <td className="px-4 py-2 border">
                <input
                  className="w-full text-center border rounded"
                  value={row.성명}
                  onChange={(e) => handleChange(i, "성명", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  className="w-full text-center border rounded"
                  value={row.축의금}
                  onChange={(e) => handleChange(i, "축의금", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  className="w-full text-center border rounded"
                  value={row.식권_대인}
                  onChange={(e) => handleChange(i, "식권_대인", e.target.value)}
                />
              </td>
              <td className="px-4 py-2 border">
                <input
                  className="w-full text-center border rounded"
                  value={row.식권_소인}
                  onChange={(e) => handleChange(i, "식권_소인", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100">
            <td className="px-4 py-2 border font-bold" colSpan={2}>
              총합
            </td>
            <td className="px-4 py-2 border font-bold">{totalAmount}</td>
            <td className="px-4 py-2 border"></td>
            <td className="px-4 py-2 border"></td>
          </tr>
        </tfoot>
      </table>
      <button
        onClick={downloadCSV}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        CSV로 다운로드
      </button>
    </div>
  );
}
