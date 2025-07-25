// src/utils/groupByWeek.js
import { startOfWeek } from "date-fns";

/**
 * records: Array of Firestore doc data, her biri timestamp alanı barındırıyor.
 * Döndürdüğü obje: { [weekKey]: [record, record, …], … }
 * weekKey: haftanın Pazartesi başlangıcının milis değeri (local time)
 */
export function groupByWeek(records) {
    return records.reduce((acc, r) => {
        // timestamp bir Firestore Timestamp; önce Date objesine çevir
        const date = r.timestamp.toDate();
        // haftanın Pazartesi başlangıcını al (1 = Pazartesi)
        const wkStart = startOfWeek(date, { weekStartsOn: 1 });
        // key olarak yerel milis değerini kullan
        const key = wkStart.getTime().toString();

        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
    }, {});
}
