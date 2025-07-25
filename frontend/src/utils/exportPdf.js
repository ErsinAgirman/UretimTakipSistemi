// src/utils/exportPdf.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";

export async function exportTableToPdf(tableRef) {
    // 1) Tablo elemanını canvas’a çevir
    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // 2) jsPDF belgesi oluştur
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // 3) Canvas resmi PDF’e ekle
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // 4) Kaydet
    pdf.save(`uretim_kayitlari_${new Date().toISOString()}.pdf`);
}
