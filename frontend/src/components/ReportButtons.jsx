// src/components/ReportButtons.jsx
import React from "react";
import { exportRecordsToCsv } from "../utils/exportCsv";
import { exportTableToPdf } from "../utils/exportPdf";

export default function ReportButtons({ records, tableRef }) {
    const handlePdf = async () => {
        try {
            await exportTableToPdf(tableRef);
        } catch (err) {
            console.error("PDF export error:", err);
            alert("PDF oluşturulurken hata oluştu. Konsolu kontrol edin.");
        }
    };

    return (
        <div className="flex gap-4">
            <button
                onClick={() => exportRecordsToCsv(records)}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
            >
                CSV İndir
            </button>
            <button
                onClick={handlePdf}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
                PDF İndir
            </button>
        </div>
    );
}
