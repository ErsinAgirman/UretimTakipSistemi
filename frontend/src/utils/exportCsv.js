import { saveAs } from "file-saver";
import Papa from "papaparse";

export function exportRecordsToCsv(records) {
    // 1) Papaparse ile CSV string üret
    const csv = Papa.unparse(
        records.map(r => ({
            Parça: r.parca_ad,
            Adet: r.adet,
            Vardiya: r.vardiya,
            Makine: r.makine,
            Operatör: r.operator,
            Tarih: r.timestamp.toDate().toLocaleString()
        }))
    );

    // 2) Blob şeklinde paketle ve indir
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `uretim_kayitlari_${new Date().toISOString()}.csv`);
}
